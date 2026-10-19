# Adspot Product Context & Knowledge Transfer

## 1. Product Purpose and Scope
**Adspot** is a real-world marketplace connecting outdoor advertising space owners with advertisers and businesses that want to advertise. It is initially targeted at the Indian market, with pricing displayed in Indian Rupees (INR).

The marketplace covers outdoor advertising inventory broadly:
- Traditional billboards and hoardings
- Digital and LED advertising screens
- Bus shelter advertisements
- Wall advertisements
- Transit advertising
- Other comparable out-of-home (OOH) advertising spaces

The core value proposition is to help advertisers discover suitable advertising spaces, compare listing details, contact owners, and request bookings. Owners can list their inventory, set prices, manage availability, and accept or reject booking requests. Public browsing requires no account, while account-specific actions (such as saving billboards and submitting booking requests) require authentication.

---

## 2. User Roles and Permissions

### A. Billboard Owner
- **Definition**: Individual, company, or operator controlling a billboard/advertising space.
- **Capabilities**:
  1. Register/sign in.
  2. Access real-database-backed owner dashboard.
  3. Create multiple billboard listings via a 7-step wizard.
  4. Save drafts, publish, or unpublish listings.
  5. Edit and delete their own listings.
  6. Upload, reorder, preview, and remove listing images stored privately/publicly in Supabase Storage.
  7. Set location, dimensions, advertising format, lighting info, pricing, etc.
  8. Manage available and blocked date ranges.
  9. Configure per-billboard minimum booking duration (1 to 3650 days).
  10. View incoming booking requests, accept or reject requests (with optional rejection message).
  11. Cancel confirmed bookings (with optional cancellation message).
- **Constraints**: Owners can never modify another owner's listings, bookings, files, or privileges. Owner pricing is controlled entirely by the owner (no platform commission rules).

### B. Advertiser
- **Definition**: Business or person looking for outdoor advertising space.
- **Capabilities**:
  1. Browse published billboards without signing in.
  2. Search, filter, and sort inventory.
  3. View detailed public listing page (photos, dimensions, location, format, lighting, pricing, min booking duration, availability, confirmed booked dates, owner contact).
  4. Save and remove shortlisted billboards (requires auth).
  5. Manage advertiser profile.
  6. Submit booking requests with requested date ranges, campaign details, and optional PDF artwork (up to 10 MB).
  7. View booking requests and status history.
  8. Edit or cancel pending requests.
  9. View rejection messages and cancellation info.
  10. Cancel confirmed bookings with an optional message.
  11. Access private artwork files securely.
  12. View suitable alternative billboard suggestions upon request rejection or booking cancellation.
- **Constraints**: Advertisers cannot create/modify billboards, change their account role, edit another advertiser's requests, or access other users' private files.

### C. Site Admin
- **Definition**: Platform operator with full platform-level administrative authority.
- **Capabilities**:
  - View and manage user accounts and roles.
  - Suspend or reinstate accounts.
  - Review and manage billboard listings (removing inappropriate/suspicious listings).
  - Oversee booking records and platform activity.
- **Constraints**: Enforced by trusted backend permissions.

---

## 3. Availability and Booking Rules

### Availability Rules
1. Available ranges for the same billboard must not overlap one another.
2. Blocked ranges for the same billboard must not overlap one another.
3. A blocked range may overlap an available range or exist outside an available range.
4. Blocked dates take precedence over available dates.
5. A booking request must fit entirely within one available range.
6. A booking request must not include any blocked date.
7. A booking request must meet the per-billboard minimum duration configured.
8. A booking request must not overlap an already confirmed booking.
9. Pending requests do not reserve dates.

### Booking Lifecycle
- **Pending Request**: Proposal from an advertiser. Does not reserve dates.
- **Acceptance**: When an owner accepts a request, it becomes confirmed/accepted, a confirmed booking is recorded, and overlapping pending requests for the same billboard are automatically rejected with the message: *"This billboard is no longer available for the dates you requested."*
- **Rejection**: Owner rejects a request with an optional message. Dates remain unreserved.
- **Cancellation**: Either party can cancel a confirmed booking with an optional message. History is preserved.

---

## 4. Security and Data Protection
- **Backend Authorization**: Row Level Security (RLS) in Supabase enforces strict access control.
- **File Security**: Artwork uploaded with booking requests is stored privately and accessible only by the submitting advertiser, the billboard owner, and authorized admins.
- **Data Isolation**: Users can only access records they are authorized to view or modify.

---

## 5. Future Scope & Explicitly Out of Scope
- **Out of Scope (For Now)**:
  - Payments / online payment gateways.
  - Platform commission or automatic price adjustments.
  - Refunds, penalties, cancellation fees.
  - Mandatory owner verification before listing.
  - In-app real-time chat.
  - Reviews or ratings.
  - AI recommendations.
  - Advanced analytics.
