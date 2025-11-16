// Demo in-memory database for testing without Supabase
class DemoDatabase {
  constructor() {
    this.users = [];
    this.tasks = [];
    this.events = [];
    this.chatMessages = [];
    this.courses = [];
    this.progress = [];
    this.reminders = [];
  }

  // Simulate Supabase client methods
  from(table) {
    // Map snake_case to camelCase for demo database
    const tableMap = {
      'chat_messages': 'chatMessages',
      'users': 'users',
      'tasks': 'tasks',
      'events': 'events',
      'courses': 'courses',
      'progress': 'progress',
      'reminders': 'reminders'
    };
    const mappedTable = tableMap[table] || table;
    return new DemoQuery(this, mappedTable);
  }
}

class DemoQuery {
  constructor(db, table) {
    this.db = db;
    this.table = table;
    this.filters = [];
    this.selectedFields = '*';
    this.orderField = null;
    this.orderAscending = true;
    this.limitValue = null;
    this.singleResult = false;
    this.updateData = null;
    this.deleteFlag = false;
  }

  select(fields = '*') {
    this.selectedFields = fields;
    return this;
  }

  insert(data) {
    const newRecord = {
      id: `${this.table}_${Date.now()}_${Math.random()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data
    };
    this.db[this.table].push(newRecord);
    
    return Promise.resolve({
      select: () => ({
        single: () => Promise.resolve({ data: newRecord, error: null })
      }),
      data: newRecord,
      error: null
    });
  }

  update(data) {
    this.updateData = data;
    return this;
  }

  upsert(data, options) {
    // Check if record exists based on onConflict field or filters
    let existing = null;
    
    if (options && options.onConflict) {
      // Find by unique constraint field
      const conflictField = options.onConflict;
      existing = this.db[this.table].find(record => {
        return record[conflictField] === data[conflictField];
      });
    } else {
      // Check based on filters
      existing = this.db[this.table].find(record => {
        return this.filters.every(filter => {
          if (filter.type === 'eq') {
            return record[filter.field] === filter.value;
          }
          return true;
        });
      });
    }

    if (existing) {
      // Update existing record
      Object.assign(existing, data, { updated_at: new Date().toISOString() });
      return Promise.resolve({
        data: existing,
        error: null
      });
    } else {
      // Insert new record
      return this.insert(data);
    }
  }

  delete() {
    this.deleteFlag = true;
    return this;
  }

  eq(field, value) {
    this.filters.push({ type: 'eq', field, value });
    return this;
  }

  neq(field, value) {
    this.filters.push({ type: 'neq', field, value });
    return this;
  }

  gt(field, value) {
    this.filters.push({ type: 'gt', field, value });
    return this;
  }

  gte(field, value) {
    this.filters.push({ type: 'gte', field, value });
    return this;
  }

  lt(field, value) {
    this.filters.push({ type: 'lt', field, value });
    return this;
  }

  lte(field, value) {
    this.filters.push({ type: 'lte', field, value });
    return this;
  }

  ilike(field, pattern) {
    this.filters.push({ type: 'ilike', field, pattern });
    return this;
  }

  not(field, operator, value) {
    this.filters.push({ type: 'not', field, operator, value });
    return this;
  }

  order(field, options = {}) {
    this.orderField = field;
    this.orderAscending = options.ascending !== false;
    return this;
  }

  limit(value) {
    this.limitValue = value;
    return this;
  }

  single() {
    this.singleResult = true;
    return this.executeQuery();
  }

  async executeQuery() {
    // Handle updates
    if (this.updateData) {
      const results = [];
      for (let i = 0; i < this.db[this.table].length; i++) {
        const record = this.db[this.table][i];
        const matches = this.filters.every(filter => {
          const fieldValue = record[filter.field];
          switch (filter.type) {
            case 'eq': return fieldValue === filter.value;
            case 'neq': return fieldValue !== filter.value;
            case 'gt': return fieldValue > filter.value;
            case 'gte': return fieldValue >= filter.value;
            case 'lt': return fieldValue < filter.value;
            case 'lte': return fieldValue <= filter.value;
            default: return true;
          }
        });
        
        if (matches) {
          Object.assign(record, this.updateData, { updated_at: new Date().toISOString() });
          results.push(record);
        }
      }
      
      if (this.singleResult) {
        return Promise.resolve({
          data: results[0] || null,
          error: results[0] ? null : { message: 'No rows found' }
        });
      }
      return Promise.resolve({ data: results, error: null });
    }

    // Handle deletes
    if (this.deleteFlag) {
      const initialLength = this.db[this.table].length;
      this.db[this.table] = this.db[this.table].filter(record => {
        return !this.filters.every(filter => {
          const fieldValue = record[filter.field];
          switch (filter.type) {
            case 'eq': return fieldValue === filter.value;
            case 'neq': return fieldValue !== filter.value;
            case 'gt': return fieldValue > filter.value;
            case 'gte': return fieldValue >= filter.value;
            case 'lt': return fieldValue < filter.value;
            case 'lte': return fieldValue <= filter.value;
            default: return true;
          }
        });
      });
      
      const deletedCount = initialLength - this.db[this.table].length;
      return Promise.resolve({ 
        data: null, 
        error: null, 
        count: deletedCount 
      });
    }

    // Handle selects
    let results = [...this.db[this.table]];

    // Apply filters
    for (const filter of this.filters) {
      results = results.filter(record => {
        const fieldValue = record[filter.field];
        
        switch (filter.type) {
          case 'eq':
            return fieldValue === filter.value;
          case 'neq':
            return fieldValue !== filter.value;
          case 'gt':
            return fieldValue > filter.value;
          case 'gte':
            return fieldValue >= filter.value;
          case 'lt':
            return fieldValue < filter.value;
          case 'lte':
            return fieldValue <= filter.value;
          case 'ilike':
            const pattern = filter.pattern.replace(/%/g, '.*').toLowerCase();
            return new RegExp(pattern).test(String(fieldValue).toLowerCase());
          case 'not':
            return fieldValue !== filter.value;
          default:
            return true;
        }
      });
    }

    // Apply ordering
    if (this.orderField) {
      results.sort((a, b) => {
        const aVal = a[this.orderField];
        const bVal = b[this.orderField];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return this.orderAscending ? comparison : -comparison;
      });
    }

    // Apply limit
    if (this.limitValue) {
      results = results.slice(0, this.limitValue);
    }

    // Return single or array
    if (this.singleResult) {
      return Promise.resolve({
        data: results[0] || null,
        error: results[0] ? null : { message: 'No rows found' }
      });
    }

    return Promise.resolve({ data: results, error: null });
  }

  // Alias for executeQuery
  then(resolve, reject) {
    return this.executeQuery().then(resolve, reject);
  }
}

// Create and export demo database instance
const demoDb = new DemoDatabase();

// Add a demo user with easy login credentials
demoDb.users.push({
  id: 'demo-user-1',
  email: 'demo@sdsu.edu',
  name: 'Demo Student',
  // Password is: demo123
  password_hash: '$2a$10$Rrj314uS932aSaDSNt5fv.vqc7z5HSk6x8aD.zWv46MdGuBofF5rW',
  preferences: {
    task_style: 'chunks',
    daily_task_limit: 5,
    preferred_study_start: '09:00',
    preferred_study_end: '17:00',
    break_duration: 15
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

console.log('\n✅ Demo user created:');
console.log('   📧 Email: demo@sdsu.edu');
console.log('   🔑 Password: demo123\n');

// Add demo tasks
const demoTasks = [
  {
    id: 'task-1',
    user_id: 'demo-user-1',
    title: 'Complete CS 570 Homework 3',
    description: 'Dynamic programming problems',
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_duration: 120,
    priority: 'high',
    difficulty: 'hard',
    status: 'pending',
    course_code: 'CS 570',
    source: 'canvas',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'task-2',
    user_id: 'demo-user-1',
    title: 'Study for MATH 254 Midterm',
    description: 'Chapters 4-6',
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_duration: 180,
    priority: 'high',
    difficulty: 'medium',
    status: 'pending',
    course_code: 'MATH 254',
    source: 'manual',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'task-3',
    user_id: 'demo-user-1',
    title: 'Read ENG 287 Articles',
    description: 'Read assigned articles for discussion',
    due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_duration: 60,
    priority: 'medium',
    difficulty: 'low',
    status: 'pending',
    course_code: 'ENG 287',
    source: 'canvas',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

demoTasks.forEach(task => demoDb.tasks.push(task));

// Add demo events
const demoEvents = [
  {
    id: 'event-1',
    user_id: 'demo-user-1',
    title: 'CS 570 - Operating Systems',
    description: 'Lecture on process scheduling',
    start_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
    end_time: new Date(Date.now() + 4.5 * 60 * 60 * 1000).toISOString(),
    location: 'GMCS 333',
    event_type: 'class',
    color: '#3b82f6',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'event-2',
    user_id: 'demo-user-1',
    title: 'MATH 254 - Calculus III',
    description: 'Vector calculus',
    start_time: new Date(Date.now() + 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(), // Tomorrow at 9 AM
    end_time: new Date(Date.now() + 24 * 60 * 60 * 1000 + 10.5 * 60 * 60 * 1000).toISOString(),
    location: 'PSFA 101',
    event_type: 'class',
    color: '#3b82f6',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

demoEvents.forEach(event => demoDb.events.push(event));

// Add demo courses
const demoCourses = [
  {
    id: 'course-1',
    user_id: 'demo-user-1',
    course_code: 'CS 570',
    course_name: 'Operating Systems',
    color: '#3b82f6',
    created_at: new Date().toISOString()
  },
  {
    id: 'course-2',
    user_id: 'demo-user-1',
    course_code: 'MATH 254',
    course_name: 'Calculus III',
    color: '#10b981',
    created_at: new Date().toISOString()
  },
  {
    id: 'course-3',
    user_id: 'demo-user-1',
    course_code: 'ENG 287',
    course_name: 'Technical Writing',
    color: '#f59e0b',
    created_at: new Date().toISOString()
  }
];

demoCourses.forEach(course => demoDb.courses.push(course));

console.log('✅ Demo data populated: 3 tasks, 2 events, 3 courses\n');

export const supabase = demoDb;
export const initializeDatabase = () => {
  console.log('✅ Demo database initialized (in-memory mode)');
  return Promise.resolve();
};
