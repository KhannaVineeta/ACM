import bcrypt from 'bcryptjs';

const password = 'demo123';
const hash = bcrypt.hashSync(password, 10);
console.log('Password hash:', hash);
