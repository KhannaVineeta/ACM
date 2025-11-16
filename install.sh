#!/bin/bash

# MindFlow - Complete Installation Script with Dependency Checking
# This script checks all prerequisites and sets up the project

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Header
echo ""
echo "╔════════════════════════════════════════════╗"
echo "║                                            ║"
echo "║       🧠 MindFlow Installation 🧠          ║"
echo "║   AI-Powered Student Planner for SDSU      ║"
echo "║                                            ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Check Node.js
print_info "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    echo "Please install Node.js 18+ from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
print_success "Node.js $NODE_VERSION installed"

# Check npm
print_info "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

NPM_VERSION=$(npm --version)
print_success "npm $NPM_VERSION installed"

echo ""
print_info "Prerequisites check passed!"
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "This script must be run from the mindflow root directory"
    exit 1
fi

# Setup Backend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_info "Setting up Backend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd backend

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    print_info "Creating backend .env file..."
    cp .env.example .env
    print_warning "Please edit backend/.env with your actual credentials!"
    print_info "Required: SUPABASE_URL, OPENAI_API_KEY, GOOGLE_CLIENT_ID, etc."
else
    print_success "Backend .env file already exists"
fi

# Install backend dependencies
print_info "Installing backend dependencies..."
npm install

print_success "Backend setup complete!"
echo ""

# Setup Frontend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_info "Setting up Frontend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd ../frontend

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    print_info "Creating frontend .env file..."
    cp .env.example .env
    print_success "Created frontend .env file"
else
    print_success "Frontend .env file already exists"
fi

# Install frontend dependencies
print_info "Installing frontend dependencies..."
npm install

print_success "Frontend setup complete!"
echo ""

cd ..

# Final Instructions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Installation Complete! ✨"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

print_success "All dependencies installed successfully!"
echo ""

print_info "Next Steps:"
echo ""
echo "1️⃣  Set up Supabase Database:"
echo "   • Create account at https://supabase.com"
echo "   • Create new project"
echo "   • Run SQL from database-schema.sql"
echo "   • Copy credentials to backend/.env"
echo ""

echo "2️⃣  Get API Keys:"
echo "   • OpenAI: https://platform.openai.com"
echo "   • Google: https://console.cloud.google.com"
echo "   • Canvas: https://sdsu.instructure.com"
echo ""

echo "3️⃣  Configure Environment Variables:"
echo "   • Edit backend/.env with your keys"
echo "   • SUPABASE_URL, OPENAI_API_KEY, etc."
echo ""

echo "4️⃣  Start Development Servers:"
echo ""
echo "   ${GREEN}Terminal 1 - Backend:${NC}"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "   ${GREEN}Terminal 2 - Frontend:${NC}"
echo "   cd frontend"
echo "   npm run dev"
echo ""

echo "5️⃣  Visit http://localhost:5173 🎉"
echo ""

print_info "Documentation:"
echo "   • SETUP.md - Detailed setup guide"
echo "   • QUICKSTART.md - Quick reference"
echo "   • ARCHITECTURE.md - System architecture"
echo ""

print_warning "Important: Make sure to configure all API keys before starting!"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Need help? Check the documentation or open an issue."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

print_success "Happy coding with MindFlow! 🧠✨"
echo ""
