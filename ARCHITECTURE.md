# Architecture Documentation
## Board Spot — Technical Architecture

**Version**: 1.0  
**Last Updated**: October 14, 2026  
**Current Phase**: Frontend Complete, Backend Pending

---

## System Overview

Board Spot is a **client-side React application** with a future backend to be determined. The current architecture prioritizes:

1. **Visual fidelity** - Exact UI replication from reference design
2. **Type safety** - Strict TypeScript throughout
3. **Component reusability** - shadcn/ui + custom components
4. **Backend flexibility** - Mock data layer ready to swap

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React Application (SPA)                  │  │
│  │                                                       │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │  │
│  │  │   Routes    │  │  Components  │  │   Hooks    │ │  │
│  │  │             │  │              │  │            │ │  │
│  │  │ - HomePage  │  │ - Header     │  │ - useAuth  │ │  │
│  │  │ - Browse    │  │ - Cards      │  │ - useMobile│ │  │
│  │  │ - Detail    │  │ - Filters    │  │            │ │  │
│  │  └─────────────┘  └──────────────┘  └────────────┘ │  │
│  │                                                       │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │           Data Layer (Mock)                    │ │  │
│  │  │                                                │ │  │
│  │  │  src/lib/mock-data.ts                         │ │  │
│  │  │  - fetchPublicBillboards()                    │ │  │
│  │  │  - fetchBillboardDetail()                     │ │  │
│  │  │  - fetchFeaturedBillboards()                  │ │  │
│  │  │                                                │ │  │
│  │  │  ⚠️  Replace with real API calls              │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ (Future: HTTP/WebSocket)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (To Be Built)                     │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   API       │  │  Database    │  │  File Storage   │   │
│  │             │  │              │  │                 │   │
│  │ - REST/     │  │ - PostgreSQL │  │ - S3 / R2      │   │
│  │   GraphQL   │  │ - MongoDB    │  │ - Supabase     │   │
│  │             │  │ - Supabase   │  │   Storage      │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │             External Services                        │  │
│  │  - Auth Provider (Supabase/Auth0/Clerk)            │  │
│  │  - Email (SendGrid/Resend)                         │  │
│  │  - Payment (Razorpay/Stripe)                       │  │
│  │  - Maps (Google Maps API)                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | React | 19.1.0 | UI library |
| **Router** | React Router | 7.6.1 | Client-side routing |
| **Language** | TypeScript | 5.8.3 | Type safety |
| **Build Tool** | Vite | 6.3.5 | Dev server + bundler |
| **Styling** | Tailwind CSS | 4.2.1 | Utility-first CSS |
| **UI Components** | Radix UI | Various | Accessible primitives |
| **Icons** | Lucide React | 0.575.0 | Icon library |
| **Notifications** | Sonner | 2.0.7 | Toast messages |
| **Utilities** | clsx, tailwind-merge | - | Class management |

### Directory Structure

```
src/
├── components/
│   ├── auth/
│   │   └── AuthModal.tsx              # Auth prompt dialog
│   ├── marketplace/
│   │   ├── BillboardCard.tsx          # Billboard card component
│   │   ├── FilterPanel.tsx            # Browse filters sidebar
│   │   ├── SaveButton.tsx             # Favorite/save button
│   │   ├── SearchBar.tsx              # Homepage search
│   │   └── SiteHeader.tsx             # Header + Footer
│   └── ui/                             # shadcn/ui primitives
│       ├── button.tsx
│       ├── input.tsx
│       ├── dialog.tsx
│       ├── sheet.tsx
│       ├── alert-dialog.tsx
│       ├── label.tsx
│       ├── textarea.tsx
│       ├── switch.tsx
│       └── sonner.tsx
├── pages/                              # Route components
│   ├── HomePage.tsx
│   ├── BrowsePage.tsx
│   ├── BillboardDetailPage.tsx
│   ├── AuthPage.tsx
│   ├── DashboardPage.tsx
│   ├── MyBillboardsPage.tsx
│   ├── SavedPage.tsx
│   ├── AccountPage.tsx
│   ├── ProfilePage.tsx
│   └── NotFoundPage.tsx
├── lib/
│   ├── auth.tsx                        # Auth context (stub)
│   ├── domain.ts                       # Types + business logic
│   ├── format.ts                       # Formatting utilities
│   ├── mock-data.ts                    # 🚧 Development fixtures
│   └── utils.ts                        # cn() utility
├── hooks/
│   └── use-mobile.tsx                  # Mobile breakpoint hook
├── main.tsx                            # App entry point
├── styles.css                          # Tailwind + design tokens
└── vite-env.d.ts                       # Vite types
```

### Component Architecture

**Pattern**: Functional components with hooks

```typescript
// Example: BillboardCard.tsx
export function BillboardCard({ billboard }: { billboard: BillboardWithImages }) {
  const image = coverImage(billboard);
  const available = billboard.availability === "available";

  return (
    <article className="...">
      {/* Image */}
      {/* Badge */}
      {/* Save button */}
      {/* Details */}
      {/* Pricing */}
    </article>
  );
}
```

**Key Patterns**:
- **Composition** over inheritance
- **Props** for configuration
- **Children** for content projection
- **Hooks** for state and side effects
- **Context** for global state (auth)

---

## Data Flow

### Current (Mock Data)

```
┌─────────────┐
│   Page      │
│  Component  │
└──────┬──────┘
       │
       │ import { fetchPublicBillboards } from '@/lib/mock-data'
       │
       ▼
┌─────────────────────┐
│  mock-data.ts       │
│                     │
│  MOCK_BILLBOARDS    │ ◄── Hardcoded array
│  .filter(...)       │
└─────────────────────┘
```

### Future (Real Backend)

```
┌─────────────┐
│   Page      │
│  Component  │
└──────┬──────┘
       │
       │ import { fetchPublicBillboards } from '@/lib/api'
       │
       ▼
┌─────────────────────┐
│  api.ts             │
│                     │
│  fetch('/api/...')  │ ───────► Backend API
│  .then(...)         │          (Supabase/Custom)
└─────────────────────┘
```

---

## Routing

**Library**: React Router v7 (client-side routing)

**Route Structure**:
```typescript
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/browse" element={<BrowsePage />} />
  <Route path="/billboards/:id" element={<BillboardDetailPage />} />
  <Route path="/auth" element={<AuthPage />} />
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/my-billboards" element={<MyBillboardsPage />} />
  <Route path="/saved" element={<SavedPage />} />
  <Route path="/account" element={<AccountPage />} />
  <Route path="/profile" element={<ProfilePage />} />
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

**Route Guards**: Currently stub (all pages accessible)

**Future**: Wrap protected routes with auth guard:
```typescript
<Route path="/dashboard" element={
  <OwnerGuard>
    <DashboardPage />
  </OwnerGuard>
} />
```

---

## State Management

### Current Approach: Local State + Context

**Local State** (useState):
- Component-specific UI state
- Form inputs
- Modal open/closed
- Filter selections

**Context API** (useContext):
- `AuthContext` - User session (stub)

**No Global State Library**: Not needed yet (mock data is static)

### Future: Consider Adding

**React Query** (TanStack Query):
- Server state caching
- Automatic refetching
- Optimistic updates
- Request deduplication

**Zustand** (if needed):
- Client-side global state
- Persisted preferences
- UI state across routes

---

## Styling Architecture

### Tailwind CSS v4 + Design Tokens

**Approach**: Utility-first with semantic CSS variables

**Design System** (`src/styles.css`):
```css
:root {
  --brand: #0e8578;          /* Teal primary */
  --brand-dark: #0a5a51;     /* Dark teal */
  --accent: #f5a524;         /* Golden yellow */
  --background: #f7f8f7;
  --foreground: #16231f;
  /* ... 30+ more tokens */
}
```

**Component Styling**:
```tsx
<button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:brightness-95">
  Search
</button>
```

**Responsive Design**:
- Mobile-first breakpoints
- `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px)

**Dark Mode**:
- `.dark` class on `<html>`
- CSS variables overridden for dark theme

---

## Type System

### TypeScript Configuration

**Mode**: Strict
- `strict: true`
- `noUncheckedIndexedAccess: true`
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`

### Key Types (`src/lib/domain.ts`)

```typescript
// Core domain types
export type BillboardType = "highway" | "digital" | "roadside" | ...;
export type PricePeriod = "daily" | "weekly" | "monthly" | "yearly";
export type AvailabilityStatus = "available" | "booked" | "unavailable";
export type ListingStatus = "draft" | "published" | "pending" | "rejected" | "suspended";

// Database row types
export type BillboardRow = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  billboard_type: BillboardType;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  width: number;
  height: number;
  price: number;
  currency: string;
  price_period: PricePeriod;
  availability: AvailabilityStatus;
  status: ListingStatus;
  // ... more fields
};

// With relations
export type BillboardWithImages = BillboardRow & {
  billboard_images: BillboardImageRow[];
};
```

---

## Build & Deployment

### Build Process

```bash
npm run build
```

**Steps**:
1. TypeScript compilation (`tsc -b`)
2. Vite bundling
3. Asset optimization (minify, gzip)
4. Output to `dist/`

**Output**:
```
dist/
├── index.html              # Entry point
├── assets/
│   ├── index-[hash].js     # App bundle (434 KB → 133 KB gzipped)
│   └── index-[hash].css    # Styles (36 KB → 7 KB gzipped)
└── favicon.ico
```

### Performance Optimizations

**Current**:
- ✅ Code splitting (React Router lazy loading ready)
- ✅ CSS purging (Tailwind removes unused classes)
- ✅ Asset minification
- ✅ Gzip compression

**To Add**:
- [ ] Image optimization (WebP, responsive images)
- [ ] Route-based code splitting
- [ ] CDN for static assets
- [ ] Service worker (PWA)

---

## Security Considerations

### Current State (Public Only)
- No authentication → No auth vulnerabilities
- No user input persistence → No injection risks
- Static assets only → Low attack surface

### Future (After Backend)

**Must Implement**:
1. **Authentication**:
   - Secure session management
   - HTTPS only
   - CSRF protection
   - Rate limiting

2. **Authorization**:
   - Role-based access control (RBAC)
   - Resource ownership checks
   - API endpoint guards

3. **Data Validation**:
   - Input sanitization (XSS prevention)
   - SQL injection prevention (parameterized queries)
   - File upload validation (type, size, content)

4. **Content Security**:
   - Content Security Policy (CSP) headers
   - X-Frame-Options, X-Content-Type-Options
   - Secure cookies (httpOnly, secure, sameSite)

---

## Testing Strategy

### Current: None (To Be Added)

### Recommended Approach

**Unit Tests** (Vitest):
- Utilities (`src/lib/format.ts`, `src/lib/domain.ts`)
- Pure functions
- Business logic

**Component Tests** (React Testing Library):
- Component rendering
- User interactions
- Accessibility

**Integration Tests** (Playwright):
- User flows (browse → detail → save)
- Form submissions
- Responsive behavior

**Visual Regression** (Chromatic/Percy):
- UI consistency
- Component variations
- Responsive snapshots

---

## Performance Metrics

### Current Build
- **Bundle Size**: 434 KB JS (133 KB gzipped)
- **CSS Size**: 36 KB (7 KB gzipped)
- **Build Time**: ~3.4 seconds
- **Dependencies**: 147 packages

### Target Metrics (Production)
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTI** (Time to Interactive): < 3.5s

---

## Accessibility

### Current Implementation
- ✅ Semantic HTML
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation (Radix UI primitives)
- ✅ Focus visible states
- ✅ Color contrast meets WCAG AA

### To Verify
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] Keyboard-only navigation flow
- [ ] Skip links for main content
- [ ] Form error announcements

---

## Internationalization (i18n)

### Current: English Only

### Future: Multi-Language Support
- **Target Languages**: Hindi, Tamil, Telugu, Marathi
- **Approach**: React i18next or next-intl
- **Scope**: UI text, error messages, email templates
- **Currency**: INR (₹) primary, support USD, EUR

---

## Monitoring & Observability

### To Add (Post-Launch)
- **Error Tracking**: Sentry or Rollbar
- **Analytics**: Google Analytics or Plausible
- **Performance Monitoring**: Vercel Analytics or Lighthouse CI
- **User Behavior**: PostHog or Mixpanel

---

## Migration Path (Mock → Real Backend)

### Step 1: Choose Backend Stack
Options:
- **Supabase** (PostgreSQL + Auth + Storage + Realtime)
- **Firebase** (Firestore + Auth + Storage)
- **Custom API** (Express/Fastify + PostgreSQL + JWT)

### Step 2: Replace Mock Data Functions
**Before** (`src/lib/mock-data.ts`):
```typescript
export function fetchPublicBillboards(filters: BrowseFilters) {
  return MOCK_BILLBOARDS.filter(...);
}
```

**After** (`src/lib/api.ts`):
```typescript
export async function fetchPublicBillboards(filters: BrowseFilters) {
  const response = await fetch('/api/billboards?' + new URLSearchParams(filters));
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}
```

### Step 3: Update Imports
Search and replace in all pages:
```typescript
// Before
import { fetchPublicBillboards } from '@/lib/mock-data';

// After
import { fetchPublicBillboards } from '@/lib/api';
```

### Step 4: Add State Management
Install React Query:
```typescript
const query = useQuery({
  queryKey: ['billboards', filters],
  queryFn: () => fetchPublicBillboards(filters)
});
```

---

## API Design (Future)

### REST Endpoints (Recommended)

```
GET    /api/billboards              # List billboards (with filters)
GET    /api/billboards/:id          # Get billboard detail
POST   /api/billboards              # Create billboard (owner)
PATCH  /api/billboards/:id          # Update billboard (owner)
DELETE /api/billboards/:id          # Delete billboard (owner)

GET    /api/billboards/:id/availability    # Get availability
POST   /api/billboards/:id/availability    # Add date range (owner)

GET    /api/saved                   # List saved billboards (advertiser)
POST   /api/saved                   # Save billboard (advertiser)
DELETE /api/saved/:id               # Remove from saved (advertiser)

GET    /api/profile                 # Get user profile
PATCH  /api/profile                 # Update profile

POST   /api/booking-requests        # Create booking request
GET    /api/booking-requests        # List requests (with role filter)
PATCH  /api/booking-requests/:id    # Accept/decline (owner)
```

---

## Conclusion

Board Spot's frontend architecture prioritizes **type safety**, **component reusability**, and **visual fidelity**. The current implementation is production-ready for browsing flows. The next phase (backend integration) requires:

1. **Backend stack selection**
2. **API implementation**
3. **Authentication integration**
4. **Data persistence**
5. **File storage**

All architectural decisions preserve flexibility for these future implementations.

---

**Next Steps**: See `TODO.md` for implementation roadmap.
