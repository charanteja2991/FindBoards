# CLAUDE.md — FindBoards Development Guide

## Project Overview

**FindBoards** is a billboard advertising marketplace that connects advertisers with billboard owners. This is a UI-complete frontend application with mock data, ready for backend integration.

> **Note for Future Sessions**: Before making product, booking, or role-related changes, please read `ADSPOT_PRODUCT_CONTEXT.md` for complete product context, user roles, business rules, and security expectations.

**Current State**: Production-ready UI with development fixtures  
**Next Phase**: Backend integration (database + auth to be chosen)

---

## Architecture

- **Framework**: React 19 + React Router v7
- **Build**: Vite 6
- **Language**: TypeScript 5.8 (strict mode)
- **Styling**: Tailwind CSS v4 with design tokens
- **UI Components**: shadcn/ui (Radix UI primitives)

See `ARCHITECTURE.md` for detailed technical architecture.

---

## Project Structure

```
src/
├── components/
│   ├── auth/              # Authentication UI
│   ├── marketplace/       # Public browsing components
│   └── ui/                # shadcn/ui primitives
├── pages/                 # Route components (11 pages)
├── lib/
│   ├── auth.tsx           # Auth context (stub)
│   ├── domain.ts          # Types and business logic
│   ├── format.ts          # Formatting utilities
│   ├── mock-data.ts       # 🚧 Development fixtures (replace with real API)
│   └── utils.ts           # Utility functions
├── hooks/                 # Custom React hooks
└── main.tsx               # App entry point
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev              # → http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

---

## Key Files to Know

### Data Layer (Mock → Real)
- **`src/lib/mock-data.ts`** - Replace these functions with real API calls
  - `fetchPublicBillboards(filters)` → GET /api/billboards
  - `fetchBillboardDetail(id)` → GET /api/billboards/:id
  - `fetchFeaturedBillboards(limit)` → GET /api/billboards/featured
  - `fetchPopularCities()` → GET /api/cities/popular

### Authentication
- **`src/lib/auth.tsx`** - Auth context provider (currently a stub)
  - Replace `AuthProvider` with real auth (Supabase/Firebase/Auth0)
  - Update `useAuth()` hook to return real user data

### Types
- **`src/lib/domain.ts`** - Core domain types
  - `BillboardRow`, `BillboardWithImages`, `ProfileRow`
  - Enums: `BillboardType`, `AvailabilityStatus`, `ListingStatus`

---

## Routes

| Route | Component | Auth | Description |
|---|---|---|---|
| `/` | `HomePage` | Public | Hero, search, featured billboards |
| `/browse` | `BrowsePage` | Public | Browse with filters |
| `/billboards/:id` | `BillboardDetailPage` | Public | Billboard detail |
| `/auth` | `AuthPage` | Public | Sign in/up placeholder |
| `/dashboard` | `DashboardPage` | Owner | Owner stats dashboard |
| `/my-billboards` | `MyBillboardsPage` | Owner | Manage listings |
| `/saved` | `SavedPage` | Advertiser | Saved billboards |
| `/account` | `AccountPage` | Advertiser | Advertiser dashboard |
| `/profile` | `ProfilePage` | Advertiser | Profile settings |

---

## Design System

### Colors
```css
--brand: #0e8578;        /* Primary teal */
--brand-dark: #0a5a51;   /* Dark teal */
--accent: #f5a524;       /* Golden yellow */
--background: #f7f8f7;   /* Light gray */
--foreground: #16231f;   /* Dark gray-green */
```

### Typography
- **Body**: Inter (400, 500, 600, 700)
- **Display**: Space Grotesk (500, 600, 700)

### Key Patterns
- Border radius: `0.625rem` (10px)
- Shadows: Custom card and panel shadows
- Responsive: Mobile-first with `sm:`, `lg:`, `xl:` breakpoints

---

## Backend Integration Guide

### Step 1: Choose Backend
Options:
- **Supabase** (recommended) - PostgreSQL + auth + storage
- **Firebase** - NoSQL + auth + storage
- **Custom API** - Your own backend

### Step 2: Replace Mock Data
Update `src/lib/mock-data.ts`:
```typescript
// Before
export function fetchPublicBillboards(filters: BrowseFilters) {
  return MOCK_BILLBOARDS.filter(...);
}

// After (example with fetch)
export async function fetchPublicBillboards(filters: BrowseFilters) {
  const params = new URLSearchParams(filters as any);
  const response = await fetch(`/api/billboards?${params}`);
  if (!response.ok) throw new Error('Failed to fetch billboards');
  return response.json();
}
```

### Step 3: Implement Auth
Update `src/lib/auth.tsx`:
```typescript
// Replace stub with real auth provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  // Add real auth logic here
  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = yourAuthService.onAuthStateChange(setUser);
    return unsubscribe;
  }, []);
  
  // ... rest of implementation
}
```

### Step 4: Add Missing Features
See `TODO.md` for complete list of features to implement.

---

## Database Schema

See `DATABASE.md` for complete schema design.

**Core tables**:
- `billboards` - Billboard listings
- `billboard_images` - Photos
- `billboard_availability` - Date ranges
- `profiles` - User profiles
- `user_roles` - Role assignments (owner/advertiser/admin)
- `saved_billboards` - User favorites
- `booking_requests` - Booking inquiries
- `bookings` - Confirmed bookings

---

## Testing Strategy

### Current State
- No tests implemented yet
- TypeScript provides compile-time safety
- Manual testing via dev server

### Recommended Testing Approach
1. **Unit Tests**: Vitest for utilities and hooks
2. **Component Tests**: React Testing Library
3. **E2E Tests**: Playwright for critical flows
4. **Visual Regression**: Chromatic or Percy

---

## Deployment

### Build Output
```bash
npm run build
```
Generates `dist/` folder with:
- `index.html` - Entry point
- `assets/` - JS and CSS bundles (gzipped)

### Hosting Options
- **Vercel** - Zero config, automatic deployments
- **Netlify** - Similar to Vercel
- **Cloudflare Pages** - Fast edge hosting
- **AWS S3 + CloudFront** - Traditional CDN
- **Self-hosted** - Any static file server

---

## Environment Variables

Currently none required (mock data).

**After backend integration**, add `.env`:
```bash
# Supabase example
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your-api-key

# API endpoints (if custom backend)
VITE_API_BASE_URL=https://api.boardspot.com
```

---

## Common Tasks

### Adding a New Page
1. Create component in `src/pages/NewPage.tsx`
2. Add route in `src/main.tsx`
3. Update navigation in `src/components/marketplace/SiteHeader.tsx`

### Adding a New UI Component
Use shadcn/ui CLI:
```bash
npx shadcn@latest add [component-name]
```

### Modifying Design Tokens
Edit `src/styles.css` `:root` section.

### Adding Mock Data
Edit `src/lib/mock-data.ts` - add to `MOCK_BILLBOARDS` array.

---

## Known Limitations

1. **No authentication** - Stub shows "not configured" message
2. **Mock data only** - 6 hardcoded billboards
3. **No Google Maps** - Requires API key (shows placeholder)
4. **No file uploads** - Would need storage backend
5. **No billboard wizard** - Owner form not implemented
6. **No booking flow** - Requires backend

---

## Getting Help

- **PRD**: See `PRD.md` for product requirements
- **Architecture**: See `ARCHITECTURE.md` for technical details
- **Database**: See `DATABASE.md` for schema design
- **TODO**: See `TODO.md` for implementation roadmap

---

## Code Style

- **TypeScript**: Strict mode, no `any` types
- **React**: Functional components with hooks
- **Naming**: camelCase for functions, PascalCase for components
- **Formatting**: 2-space indent, semicolons, trailing commas
- **Imports**: Absolute imports via `@/` alias

---

**Last Updated**: October 14, 2026  
**Version**: 1.0.0 (UI Complete)
