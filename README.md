# We 4 You — Child Identification Band & Guardian Contact Service

Frontend demonstration application for **We 4 You**, a child identification wristband service designed to help caring members of the public reconnect with families through an attentive office contact center.

---

## 1. Project Overview & Architectural Boundaries

This project is a **pure frontend application** built using React, TypeScript, Tailwind CSS, and Vite.

### Important Architectural & Security Boundaries:
- **Pure Frontend Implementation**: There is no live backend server, database, SMS gateway, telecommunications PBX, or external payment processor.
- **Simulated Authentication**: The `/admin/login` page provides a simulated role persona picker to demonstrate staff dashboard navigation. It does *not* protect real production customer data or implement server-side access control.
- **Simulated Payments**: Subscription and band purchase transactions are handled via an in-memory manual-verification workflow. No credit card or banking details are ever captured or processed.
- **Draft Policies**: The Privacy Notice (`/privacy`) and Service Terms (`/terms`) are functional drafts prepared for review by the business and legal counsel; they do not represent finalized legal terms.
- **Contact Details**: All office contact details, telephone numbers, and addresses come from the centralized demonstration configuration (`src/context/fixtures.ts` and `SettingsPage.tsx`).
- **Future Backend Integration Points**: The mock service and state provider (`src/context/AppContext.tsx`) is structured so that each action (`submitPublicRegistration`, `addVendor`, `logIncident`, `verifyPayment`, etc.) can map directly to RESTful or GraphQL API endpoints in a future production backend.

---

## 2. Technology Stack & Design System

- **Framework**: React 18 / 19, TypeScript, Vite
- **Routing**: `react-router-dom` v6
- **Styling**: Tailwind CSS with approved brand design tokens:
  - **Primary Navy**: `#0D0957` (headings, primary buttons, footer, dashboard navigation)
  - **Brand Mint**: `#35F5AD` (accents, highlights, secondary buttons)
  - **Pale Mint**: `#E6FBEF` (quiet section backgrounds and badges)
  - **High-Contrast Dark Mint**: `#088F5B` / `#066842` (accessible text on light backgrounds)
  - **Soft Neutral**: `#F7FAF8` (surface alternation)
  - **Body Text**: `#334155` (Inter font family)
  - **Headings**: `#0D0957` (Poppins font family)
- **Icons**: `lucide-react`
- **Branding**: Circular embracing-hands vector SVG logo + exact wordmark "We 4 You" with light/dark variants and fallback.

---

## 3. Public Website Routes

All public routes share a responsive header with active mint indicators, an accessible mobile navigation drawer, and an all-inclusive navy footer:

| Route | Page / Feature |
|---|---|
| `/` | Spacious split hero, office assistance banner, 3-step guide, about preview, subscription summary, registration preview, and contact form |
| `/about` | "Care starts with connection.", core pillars, office role, and privacy values |
| `/how-it-works` | The 3 steps (Register, Wear, Reconnect) and detailed breakdown of what is printed on the physical band |
| `/subscriptions` | Comparison of configurable plans with provisional labels and renewal guidance |
| `/register` | 4-step guided registration wizard with inline validation, vendor dropdown, and authority confirmation |
| `/registration/confirmation` | Secure review notice, demonstration reference number, and next-steps guidance |
| `/contact` | Office support details and interactive contact form linked to the admin demonstration inbox |
| `/found-band` | Practical finder instructions, exact reference formatter, and strict public privacy protection |
| `/band/:publicCode` | Assistance guidance prefilled with the public band reference |
| `/faq` | Keyboard-accessible accordions answering key questions including explicit GPS/tracking distinction |
| `/privacy` | Structured draft privacy notice for business review |
| `/terms` | Structured draft terms of service for business review |
| `*` | Branded 404 page ("Let's get you back on track.") |

---

## 4. Administrator Demonstration Dashboard

The dashboard provides a dense, readable operational workspace for office staff:

| Route | Screen & Purpose |
|---|---|
| `/admin/login` | Clearly labeled demonstration login with staff role picker |
| `/admin` | Operations overview with KPI summary cards, band lookup shortcut, and recent activity |
| `/admin/registrations` | Review queue with search, status filters, vendor filters, and decision actions (Approve, Request Update, Reject) |
| `/admin/registrations/:id` | Full registration review detail with separate document and payment verification checks and audit timeline |
| `/admin/children` | Searchable registry of children and linked guardians in priority order |
| `/admin/children/:id` | Child profile with sensitive contact update verification protocol and linked incident history |
| `/admin/bands` | Serialized band inventory with status filtering and replacement workflow (retires old code, preserves child/sub) |
| `/admin/vendors` | Vendor shop manager with real-time public dropdown reflection, public label preview, and deactivation safeguards |
| `/admin/vendors/:id` | Vendor profile with attributed sales, commission records, and payout history |
| `/admin/plans` | Subscription plan configuration (duration, rates, provisional switch, public visibility) |
| `/admin/subscriptions` | Subscription coverage list with early and late renewal simulations |
| `/admin/payments` | Manual payment receipt matching, verification, and simulated reversals |
| `/admin/commissions` | Commission review, approval, and double-payment prevention |
| `/admin/payouts` | Batched vendor payout settlement records |
| `/admin/incidents` | Assistance incident intake log (child found vs band alone, caller intake, voluntary location) |
| `/admin/incidents/:id` | Incident detail with matched private child/guardian file, contact attempt log, and confirmed resolution |
| `/admin/enquiries` | Public website messages with status modification (New, In Progress, Resolved) |
| `/admin/reports` | Operational and financial summaries, vendor breakdown table, and demonstration CSV export |
| `/admin/settings` | Centralized office contacts, operating hours, direct sales switch, and commission defaults |
| `/admin/activity` | Chronological log of simulated administrative actions |

---

## 5. Connected Demonstration Scenarios

All demonstration records share a reactive in-memory state store (`src/context/AppContext.tsx`):
1. **Vendor Reflection**: Creating or deactivating a vendor in `/admin/vendors` immediately updates the shop selection dropdown on `/register`.
2. **Registration Lifecycle**: Submitting the 4-step registration on `/register` places a new record into `/admin/registrations` marked as *Pending Verification*.
3. **Approval & Activation**: Approving the registration assigns the band, creates the child profile in `/admin/children`, sets up active subscription coverage in `/admin/subscriptions`, and accrues a vendor commission in `/admin/commissions`.
4. **Safe Replacement**: Replacing a band in `/admin/bands` retires the old band reference from inventory while maintaining the child's registration and active subscription without interruption.
5. **Assistance Incidents**: Calling or quoting a band reference in `/admin/incidents` links to the private family contacts in the admin view while the public view (`/found-band`) strictly conceals private child information.
6. **Reset Demo Data**: The top bar of the admin dashboard contains a **Reset Demo** action that restores all fixtures to their initial state with confirmation.

---

## 6. Installation & Local Execution

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Setup Commands
```bash
# 1. Clone or navigate to the project directory
cd "d:\WE4U band"

# 2. Install dependencies
npm install

# 3. Start the local development server
npm run dev

# 4. Build for production preview
npm run build
npm run preview
```

The application will be served locally at `http://localhost:5173`.
