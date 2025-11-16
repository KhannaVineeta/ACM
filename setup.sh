#!/bin/bash

echo "🚀 MindFlow - Automated Setup Script"
echo "======================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Setup Backend
echo "📦 Setting up backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your actual credentials"
fi

echo "Installing backend dependencies..."
npm install

echo "✅ Backend setup complete!"
echo ""

# Setup Frontend
echo "📦 Setting up frontend..."
cd ../frontend

if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
fi

echo "Installing frontend dependencies..."
npm install

echo "✅ Frontend setup complete!"
echo ""

# Summary
echo "======================================"
echo "✨ Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Set up Supabase database (see SETUP.md)"
echo "2. Configure environment variables in backend/.env"
echo "3. Get API keys (OpenAI, Google, Canvas)"
echo ""
echo "To start the servers:"
echo "  Terminal 1: cd backend && npm run dev"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Then visit: http://localhost:5173"
echo ""
echo "📖 See SETUP.md for detailed instructions"
echo ""
