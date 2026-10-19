# Advertiser-Side Booking Request Workflow (Backend Architecture & UX Specification)

## 1. Overview & Objectives

This document defines the advertiser-side workflow in **FindBoards**, detailing how advertisers discover advertising spaces, submit booking requests, track request statuses, and receive updates when decisions are made by billboard owners. 

The design strictly aligns with the core backend architecture (`BACKEND_ARCHITECTURE.md`), ensuring security, concurrency safety, and clear separation between unconfirmed inquiries and confirmed bookings.

---

## 2. Submitting a Booking Request

### Discovery & Pre-Submission Validation
1. **Browse & Detail View**: Advertisers explore listings via `/browse` and view specific billboard attributes on `/billboards/:id`.
2. **Pricing & Availability**: Before submitting a request, the advertiser reviews:
   - Listed price and period (`price`, `price_period`, e.g., ₹50,000 / month).
   - Minimum booking duration (`min_booking_days`, e.g., 30 days).
   - Current availability slots and blackout dates.
3. **Validation Rules**:
   - The requested date range (`start_date` to `end_date`) must satisfy:
     $$\text{Duration (Days)} = (\text{end\_date} - \text{start\_date} + 1) \geq \text{min\_booking\_days}$$
   - If validation fails on the client or backend, submission is rejected with a clear error message.

### Submission Action
- The advertiser provides:
  - Campaign name (optional/default: "General Campaign").
  - Start date and end date.
  - Optional message or creative requirements for the owner.
- **Transaction/Storage**: A new record is inserted into `booking_requests` with `status = 'pending'`.
- **Important Guarantee**: Submitting a request creates an **inquiry**, not a confirmed booking. The request enters the owner's review queue.

---

## 3. Viewing Booking Requests & Request Statuses

Advertisers have a dedicated dashboard section (e.g., in their account or a dedicated `/advertiser/requests` or `/my-bookings` page) where all submitted requests are tracked.

### Request Status Model
Each request displays one of the following distinct statuses:

1. **Pending (`pending`)**:
   - Submitted and awaiting the billboard owner's decision.
   - Does not block other advertisers from submitting requests, nor does it guarantee acceptance.
2. **Accepted / Confirmed (`accepted` / Confirmed Booking)**:
   - The owner approved the request.
   - The backend atomically created a confirmed reservation in the `bookings` table.
   - The advertiser sees confirmation details, payment status, and contract terms.
3. **Rejected (`rejected`)**:
   - The owner declined the request.
   - Displays any optional `owner_response` message provided by the owner (e.g., *"This billboard is booked for those dates. Would you like to consider Billboard B?"*).
4. **No Longer Available (`superseded` / Ineligible)**:
   - The requested dates conflicted with another confirmed booking (e.g., another advertiser's competing request was accepted first).
   - The system clearly explains why the request could not be accepted without leaving the advertiser with misleading expectations.
5. **Cancelled (`cancelled`)**:
   - Withdrawn by the advertiser prior to owner review.

---

## 4. Conflict Resolution & Notification Workflow

- **Competing Requests**: If Advertiser 1 and Advertiser 2 request overlapping dates on Billboard A, both remain `pending`.
- **Owner Decision**: When the owner accepts Advertiser 1's request:
  - Advertiser 1's request transitions to `accepted`, and a confirmed booking is recorded.
  - Advertiser 2's overlapping pending request automatically transitions to `superseded` (Ineligible).
- **Advertiser Visibility**: When Advertiser 2 views their requests dashboard, they see the updated status (*"No longer available"* or *"Superseded"*), alongside any explanation or alternative suggestions from the owner.

---

## 5. Implementation & RLS Security Requirements

- **Row Level Security (RLS)**:
  - `booking_requests`: Advertisers can only insert and read rows where `advertiser_id = auth.uid()`.
  - `bookings`: Advertisers can only view confirmed bookings where `advertiser_id = auth.uid()`.
- **Client-Server Integrity**:
  - All date validations (`min_booking_days`, overlap checks) are strictly enforced on the backend.
  - Advertisers cannot manually alter request statuses or assign themselves confirmed bookings.

---

## 6. Required UI Views for Advertisers

1. **Booking Requests Dashboard (`/advertiser/requests` or equivalent)**:
   - Tabbed filtering (`All`, `Pending`, `Confirmed`, `Rejected`, `Unavailable`).
   - Request cards showing billboard image, name, location, dates, duration, campaign name, status badge, and owner notes.
2. **Request Detail Modal / Page**:
   - Complete history of the request, contact email/phone of the owner, and direct messaging/inquiry thread if applicable.
