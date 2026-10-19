#!/bin/bash
# Supabase Setup Script for Board Spot
# This script helps you set up the Supabase backend step by step

set -e

echo "======================================"
echo "Board Spot - Supabase Setup Wizard"
echo "======================================"
echo ""

# Check if .env file exists
if [ -f .env ]; then
  echo "⚠️  Warning: .env file already exists!"
  read -p "Do you want to overwrite it? (y/n): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled. Please update .env manually."
    exit 0
  fi
fi

echo "Step 1: Supabase Project Credentials"
echo "--------------------------------------"
echo ""
echo "Please create a Supabase project at https://supabase.com"
echo "Then go to Settings → API to get your credentials."
echo ""

read -p "Enter your Supabase Project URL: " SUPABASE_URL
read -p "Enter your Supabase Anon Key: " SUPABASE_ANON_KEY

# Validate inputs
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "❌ Error: Both URL and Anon Key are required!"
  exit 1
fi

# Create .env file
cat > .env << EOF
# Supabase Configuration
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# Optional: Google Maps API (for map displays)
# VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
EOF

echo ""
echo "✅ .env file created successfully!"
echo ""

echo "Step 2: Database Migrations"
echo "----------------------------"
echo ""
echo "You need to run the database migrations in your Supabase project."
echo ""
echo "Option A (Recommended):"
echo "1. Go to your Supabase dashboard → SQL Editor"
echo "2. Copy and paste the contents of these files in order:"
echo "   - supabase/migrations/20261015_initial_schema.sql"
echo "   - supabase/migrations/20261015_rls_policies.sql"
echo "3. Click 'Run' for each file"
echo ""
echo "Option B (CLI):"
echo "1. Install Supabase CLI: npm install -g supabase"
echo "2. Link project: supabase link --project-ref <your-project-id>"
echo "3. Push migrations: supabase db push"
echo ""
read -p "Press Enter when you've completed the migrations..."

echo ""
echo "Step 3: Storage Setup"
echo "---------------------"
echo ""
echo "Create a storage bucket for billboard images:"
echo "1. Go to Storage in your Supabase dashboard"
echo "2. Click 'Create a new bucket'"
echo "3. Name: billboard-images"
echo "4. Public: Yes (checked)"
echo "5. Click 'Create bucket'"
echo ""
echo "Then set storage policies (see BACKEND_SETUP.md for SQL)"
echo ""
read -p "Press Enter when storage is configured..."

echo ""
echo "Step 4: Authentication Setup"
echo "----------------------------"
echo ""
echo "Configure authentication settings:"
echo "1. Go to Authentication → Providers"
echo "2. Email is enabled by default"
echo "3. Go to Authentication → URL Configuration"
echo "4. Add Site URL: http://localhost:5173"
echo "5. Add Redirect URL: http://localhost:5173/**"
echo ""
read -p "Press Enter when auth is configured..."

echo ""
echo "======================================"
echo "🎉 Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Start the dev server: npm run dev"
echo "2. Open http://localhost:5173"
echo "3. Go to /auth to create your first account"
echo "4. Check BACKEND_SETUP.md for detailed documentation"
echo ""
echo "To add sample data, see the 'Seed Sample Data' section in BACKEND_SETUP.md"
echo ""
