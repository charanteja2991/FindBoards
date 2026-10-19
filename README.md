# FindBoards

A billboard advertising marketplace built with React, TypeScript, and Tailwind CSS. This project faithfully replicates the UI of an existing billboard marketplace application.

## Technology Stack

### Frontend
- **Framework**: React 19 with React Router v7
- **Build Tool**: Vite 6
- **Language**: TypeScript 5.8 (strict mode)
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Notifications**: Sonner (toast notifications)

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **API**: Supabase Client with auto-generated types

## Design System

The project uses a "Crisp Teal Commerce" design system with:

- **Brand Color**: `#0e8578` (teal primary)
- **Accent Color**: `#f5a524` (golden yellow)
- **Typography**: Inter (body), Space Grotesk (headings)
- **Border Radius**: 0.625rem base
- **Full dark mode support**

## Features Implemented

### Public Pages (No Authentication Required)
- **Homepage** (`/`) - Hero section, search bar, featured billboards, popular cities
- **Browse** (`/browse`) - Searchable billboard grid with advanced filters (price, size, type, availability, illumination)
- **Billboard Detail** (`/billboards/:id`) - Full billboard details, photo gallery, pricing, availability calendar, owner info

### Authenticated Pages (Placeholders)
- **Dashboard** (`/dashboard`) - Owner dashboard with statistics
- **My Billboards** (`/my-billboards`) - Billboard management for owners
- **Saved** (`/saved`) - Saved billboards for advertisers
- **Account** (`/account`) - Advertiser dashboard
- **Profile** (`/profile`) - User profile management
- **Auth** (`/auth`) - Authentication page

### Components
- Fully responsive header with mobile menu (Sheet component)
- Billboard cards with hover effects
- Advanced filter panel
- Search bar with city and price inputs
- Save/heart button (triggers auth prompt)
- Toast notifications

## Development Data

The application uses mock data fixtures in `src/lib/mock-data.ts`:
- 6 sample billboards across multiple Indian cities (Hyderabad, Mumbai, Bangalore, Delhi)
- Billboard types: highway, digital, roadside, transit, rooftop, wall wrap
- Placeholder images from Unsplash
- Availability calendar data

## Backend Integration (Supabase Ready)

The project includes complete **Supabase backend integration**, ready to use:

- ✅ **Authentication**: Email/password with Supabase Auth
- ✅ **Database**: PostgreSQL schema with migrations
- ✅ **Storage**: Billboard image uploads
- ✅ **Row-Level Security**: Full RLS policies implemented
- ✅ **API Layer**: Type-safe Supabase client with helper functions

### Quick Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the setup wizard:
   ```bash
   ./setup-backend.sh
   ```
3. Or follow the detailed guide in [BACKEND_SETUP.md](BACKEND_SETUP.md)

See [BACKEND_SETUP.md](BACKEND_SETUP.md) for complete setup instructions.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Backend (First Time Only)
```bash
# Option A: Interactive setup wizard
./setup-backend.sh

# Option B: Manual setup
# 1. Create a Supabase project
# 2. Copy .env.example to .env
# 3. Add your Supabase credentials
# 4. Run migrations in Supabase SQL Editor
```

See [BACKEND_SETUP.md](BACKEND_SETUP.md) for detailed instructions.

### 3. Start Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── auth/              # Auth modal
│   ├── marketplace/       # Billboard cards, filters, search, header/footer
│   └── ui/                # shadcn/ui primitives (button, input, dialog, etc.)
├── hooks/                 # Custom React hooks
│   ├── use-mobile.tsx     # Mobile detection hook
│   └── useSavedBillboard.ts  # Saved billboard state management
├── lib/
│   ├── api.ts             # Supabase API functions
│   ├── auth.tsx           # Auth context with Supabase
│   ├── database.types.ts  # TypeScript types for database schema
│   ├── domain.ts          # Type definitions and domain logic
│   ├── format.ts          # Formatting utilities (money, dates)
│   ├── mock-data.ts       # Development fixtures (legacy)
│   ├── supabase.ts        # Supabase client initialization
│   └── utils.ts           # Utility functions (cn)
├── pages/                 # Route pages
├── main.tsx               # App entry point
└── styles.css             # Tailwind + design tokens

supabase/
├── migrations/            # Database migrations
│   ├── 20261015_initial_schema.sql
│   └── 20261015_rls_policies.sql
└── seed.sql               # Sample data for testing
```

## Visual Fidelity

This project prioritizes **visual accuracy** over functionality. The UI matches the reference design including:
- Exact color palette and design tokens
- Typography (fonts, weights, sizes)
- Spacing, borders, shadows, and rounded corners
- Component layouts and responsive behavior
- Hover, focus, and active states
- Loading and empty states

## Routes

| Route | Description |
|---|---|
| `/` | Homepage with hero, search, and featured billboards |
| `/browse` | Browse/filter billboards |
| `/billboards/:id` | Billboard detail page |
| `/auth` | Authentication (placeholder) |
| `/dashboard` | Owner dashboard (requires auth) |
| `/my-billboards` | Owner billboard management (requires auth) |
| `/saved` | Saved billboards (requires auth) |
| `/account` | Advertiser dashboard (requires auth) |
| `/profile` | User profile (requires auth) |

## Notes

- The reference project used TanStack Start (SSR framework) with a proprietary Lovable vite plugin. This project uses standard Vite + React Router for simplicity and portability.
- Google Maps integration shows fallback states (requires API key for full functionality).
- All Lovable/platform-specific references have been removed.
- The app is fully functional for browsing and viewing billboard listings using mock data.

## Documentation

- **[BACKEND_SETUP.md](BACKEND_SETUP.md)** - Complete Supabase setup guide
- **[DATABASE.md](DATABASE.md)** - Database schema design
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture
- **[PRD.md](PRD.md)** - Product requirements
- **[TODO.md](TODO.md)** - Implementation roadmap
- **[CLAUDE.md](CLAUDE.md)** - Development guide for AI assistants

## Current Status

✅ **Completed**
- Frontend UI (all pages)
- Supabase backend integration
- Authentication (sign up/sign in)
- Database schema with RLS policies
- Public billboard browsing
- User profiles and roles

🚧 **In Progress / TODO**
- Billboard owner wizard (add/edit billboards)
- Booking request flow
- Payment integration
- Email notifications
- Admin dashboard
- Real-time features

See [TODO.md](TODO.md) for the complete roadmap.

## Deployment

### Frontend
```bash
npm run build
```
Deploy the `dist/` folder to:
- Vercel (recommended)
- Netlify
- Cloudflare Pages
- Any static hosting

### Backend
- Supabase handles hosting automatically
- Configure production URLs in Supabase dashboard
- Set up custom domain (optional)

---

**Built with React, TypeScript, Tailwind CSS, shadcn/ui, and Supabase.**
