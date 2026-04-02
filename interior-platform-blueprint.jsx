import { useState } from "react";

const sections = [
  {
    id: "prompt",
    title: "AI Agent Prompt",
    icon: "⚡",
    content: `**Copy-paste this prompt into your VS Code AI agent (Cursor / Copilot / Claude Code):**

---

Build a full-stack interior design marketplace web application called "DesignNest" with the following specifications:

**Tech Stack:** React 18 + Vite frontend, Node.js + Express backend, PostgreSQL database, Prisma ORM, Cloudinary for image hosting, Razorpay for payments, Socket.io for real-time chat, JWT authentication, Tailwind CSS for styling.

**Two user roles:** Customer and Interior Designer. Each has separate registration, login, dashboard, and profile flows.

**Customer features:**
- Browse all interior designers with sort/filter by area served, rating (1–5 stars), and pricing tier (Budget / Mid-range / Premium)
- View designer profiles with project portfolios (up to 5 projects, 10 photos each, max 5 MB per photo)
- "Chat with Designer" button visible ONLY if the customer has an active premium membership AND the designer also has premium enabled
- Premium membership: ₹1,000/month or ₹9,000/year via Razorpay
- Rate and review designers after project completion
- Manage profile: name, email, phone, city, profile photo

**Interior Designer features:**
- Portfolio management: create up to 5 projects, each with title, description, budget range, area, style tags, and up to 10 photos (max 5 MB each, validated client-side and server-side)
- Profile: name, firm name, experience years, areas served (multi-select cities), pricing tier, bio, profile photo, certifications
- Premium membership: ₹200/month or ₹1,800/year via Razorpay — required to receive chat messages
- Dashboard: view profile visits, chat requests, reviews received
- Cannot browse or see customer accounts — designers only interact when a customer initiates chat

**Chat system:**
- Real-time via Socket.io
- Customer initiates → designer receives notification
- Chat only works when BOTH parties have active premium
- Message persistence in database
- Online/offline status indicators

**Payment system:**
- Razorpay integration for subscriptions
- Webhook handler for payment confirmation, renewal, and failure
- Subscription status tracked per user with expiry dates
- Grace period: 3 days after expiry before disabling premium features

**API structure:** RESTful with these route groups:
- /api/auth (register, login, refresh, logout, forgot-password)
- /api/customers (profile CRUD, designer listing with filters)
- /api/designers (profile CRUD, portfolio CRUD, image upload)
- /api/subscriptions (plans, checkout, webhook, status)
- /api/chat (conversations, messages, read-receipts)
- /api/reviews (create, list by designer)
- /api/admin (user management, subscription oversight, reports)

**Database tables:** users, customer_profiles, designer_profiles, projects, project_images, subscriptions, conversations, messages, reviews, payments

**Security:** bcrypt password hashing, JWT access + refresh tokens, rate limiting, input sanitization, CORS config, Helmet.js, image type validation (JPEG/PNG/WebP only), file size enforcement.

**Deployment-ready:** Dockerfiles for frontend and backend, docker-compose.yml with PostgreSQL, environment variable templates (.env.example).

Build this step-by-step: database schema first, then auth, then profiles, then portfolio/images, then subscriptions/payments, then chat, then admin. Include seed data with 5 sample designers and 3 sample customers.

---`,
  },
  {
    id: "user-onboarding",
    title: "User Onboarding Logic",
    icon: "👤",
    content: `**Registration Flow — Customer:**
1. User lands on homepage → clicks "Sign Up"
2. Selects role: "I need a designer" (Customer)
3. Form fields: Full Name, Email, Phone, Password, City
4. Email verification via OTP (6-digit, 10-min expiry)
5. On verification → account created with \`role: CUSTOMER\`, \`subscription: FREE\`
6. Redirected to Customer Dashboard with an onboarding tooltip tour

**Registration Flow — Designer:**
1. User clicks "Sign Up" → selects "I am a designer"
2. Step 1: Full Name, Email, Phone, Password
3. Step 2: Firm Name (optional), Experience (years), Areas Served (multi-city), Pricing Tier, Bio
4. Step 3: Upload profile photo + at least 1 project with 3+ photos
5. Email verification via OTP
6. Account created with \`role: DESIGNER\`, \`subscription: FREE\`, \`status: PENDING_REVIEW\`
7. Admin reviews profile → approves → designer goes live on listing
8. Rejection sends email with reason; designer can re-submit

**Login Flow (both roles):**
1. Email + Password → server validates → returns JWT access token (15 min) + refresh token (7 days)
2. Refresh token stored in httpOnly cookie
3. On each API call, middleware checks token → role → routes to correct dashboard
4. "Forgot Password" → email link with time-limited reset token (1 hour)

**Profile Completion Score:**
- Customers: name ✓, photo ✓, city ✓, phone verified ✓ → 100%
- Designers: all fields + at least 3 projects + premium → 100%
- Score shown on dashboard as a progress bar to encourage completion`,
  },
  {
    id: "profile",
    title: "Profile Logic",
    icon: "🪪",
    content: `**Customer Profile:**
- Fields: name, email (verified), phone (verified), city, profile_photo, created_at
- Editable anytime from Settings
- Profile photo: max 2 MB, JPEG/PNG/WebP, stored on Cloudinary
- Customers have a private profile — NOT visible to designers or other customers
- Customers can save/bookmark designers to a "Favorites" list

**Designer Profile (public-facing):**
- Fields: name, firm_name, experience_years, bio, areas_served[], pricing_tier (Budget / Mid-range / Premium), profile_photo, certifications[], avg_rating, total_reviews, is_premium, created_at
- Public URL: /designers/:slug (auto-generated from name + ID)
- Profile visible to all customers (even free-tier)
- Editable from Designer Dashboard → "Edit Profile"
- Profile photo: max 2 MB, JPEG/PNG/WebP
- Areas served: multi-select from predefined city list (expandable by admin)
- Pricing tier: self-declared, helps customers filter

**Designer Profile Page (what customers see):**
- Header: photo, name, firm, rating stars, review count, pricing badge, areas served
- "Chat with Designer" button (conditionally rendered — see Chat Logic)
- Portfolio section: project cards in grid layout
- Reviews section: paginated, sorted by most recent
- "Report Designer" link (sends report to admin)

**Profile Deactivation:**
- Either role can deactivate account from Settings
- Deactivation hides profile from listing, pauses subscription billing
- Data retained for 90 days, then permanently deleted
- Reactivation possible within 90 days via login`,
  },
  {
    id: "listing",
    title: "Listing & Discovery Logic",
    icon: "🔍",
    content: `**Designer Listing Page (Customer View):**
- Default: all approved designers sorted by rating (highest first)
- Each card shows: photo, name, rating, pricing tier, areas served, project count, premium badge

**Sort Options:**
- Rating: High → Low (default)
- Rating: Low → High
- Price Tier: Budget → Premium
- Price Tier: Premium → Budget
- Experience: Most → Least
- Newest First

**Filter Options:**
- Area/City: dropdown multi-select (e.g., Hyderabad, Mumbai, Bangalore)
- Pricing Tier: checkboxes (Budget, Mid-range, Premium)
- Minimum Rating: slider (1–5 stars)
- Premium Designers Only: toggle
- Experience: range slider (0–30 years)

**Search:**
- Text search across designer name, firm name, bio, project titles
- Debounced input (300ms) → API call with query param

**Pagination:**
- 12 designers per page
- Infinite scroll OR numbered pagination (configurable)

**API Endpoint:**
GET /api/designers?sort=rating_desc&area=hyderabad&tier=budget,mid&min_rating=4&page=1&limit=12

**Caching:**
- Designer listing cached in Redis for 5 minutes
- Cache invalidated on profile update, new review, or subscription change`,
  },
  {
    id: "portfolio",
    title: "Portfolio & Project Logic",
    icon: "🖼️",
    content: `**Project Creation (Designer):**
1. Designer navigates to Dashboard → "My Projects" → "Add Project"
2. Form fields: Title, Description, Budget Range (₹), Area/City, Style Tags (Modern, Traditional, Minimalist, etc.), Completion Date
3. Photo upload: drag-and-drop zone, up to 10 photos per project
4. Validation rules (enforced client + server):
   - Max 5 projects per designer account
   - Max 10 photos per project
   - Max 5 MB per photo
   - Accepted formats: JPEG, PNG, WebP
   - Minimum resolution: 800×600 px
5. Photos uploaded to Cloudinary with transformations: auto-quality, auto-format, max-width 1920px
6. Thumbnail generated automatically (400×300 crop)
7. Project saved with status: PUBLISHED (visible on profile)

**Project Editing:**
- Designer can edit title, description, tags, budget anytime
- Can add/remove/reorder photos within the 10-photo limit
- Deleting a photo removes it from Cloudinary too

**Project Deletion:**
- Soft delete: project hidden from public, retained in DB for 30 days
- Hard delete after 30 days (admin or cron job)

**Photo Storage Structure (Cloudinary):**
/designnest/designers/{designer_id}/projects/{project_id}/{image_id}.webp

**Portfolio Display (Public):**
- Grid of project cards on designer profile
- Click → full project page with photo gallery (lightbox with swipe), description, tags, budget
- Lazy-loaded images with blur-up placeholder`,
  },
  {
    id: "subscription",
    title: "Subscription & Payment Logic",
    icon: "💳",
    content: `**Subscription Plans:**

| Plan | Role | Monthly | Yearly | Savings |
|------|------|---------|--------|---------|
| Designer Premium | Designer | ₹200/mo | ₹1,800/yr | ₹600/yr (25%) |
| Customer Premium | Customer | ₹1,000/mo | ₹9,000/yr | ₹3,000/yr (25%) |

**What Premium Unlocks:**
- Designer: ability to receive and respond to customer chat messages, "Premium" badge on profile, priority in listing sort
- Customer: "Chat with Designer" button becomes visible and functional, ability to contact unlimited designers

**Subscription Purchase Flow:**
1. User clicks "Upgrade to Premium" from dashboard
2. Selects plan: Monthly or Yearly
3. Redirected to Razorpay checkout (hosted or embedded)
4. On successful payment → Razorpay sends webhook to /api/subscriptions/webhook
5. Server verifies webhook signature → creates subscription record:
   - user_id, plan_type, amount_paid, currency, razorpay_subscription_id, starts_at, expires_at, status: ACTIVE
6. User's is_premium flag set to TRUE
7. Confirmation email sent with invoice

**Subscription Renewal:**
- Razorpay handles auto-renewal for recurring subscriptions
- Webhook fires on successful renewal → server extends expires_at
- On failed renewal → webhook fires → server sets status: PAST_DUE
- Grace period: 3 days after expiry — features still work
- After grace period: status → EXPIRED, is_premium → FALSE, chat disabled

**Cancellation:**
- User can cancel anytime from Settings → Subscription
- Cancellation takes effect at end of current billing cycle
- No refunds for partial months/years
- status → CANCELLED, features remain until expires_at

**Payment Records Table:**
user_id, amount, currency, razorpay_payment_id, razorpay_order_id, status (SUCCESS/FAILED/REFUNDED), created_at`,
  },
  {
    id: "chat",
    title: "Chat System Logic",
    icon: "💬",
    content: `**Chat Visibility Rules (CRITICAL):**

The "Chat with Designer" button on a designer's profile is ONLY visible when ALL of these are true:
1. The customer viewing the profile has an ACTIVE premium subscription
2. The designer being viewed has an ACTIVE premium subscription
3. Neither account is deactivated or suspended

If either party's subscription expires, the chat button disappears and existing conversations show a "Subscription required to continue chatting" banner.

**Chat Initiation Flow:**
1. Customer clicks "Chat with Designer" on a designer's profile page
2. System checks both subscriptions → if valid, creates a conversation record
3. Customer types first message → sent via Socket.io → stored in messages table
4. Designer receives real-time notification (in-app bell icon + optional email)
5. Designer opens chat from Dashboard → "Messages" tab

**Message Schema:**
conversation_id, sender_id, sender_role, content (text, max 2000 chars), is_read, created_at

**Conversation Schema:**
id, customer_id, designer_id, last_message_at, customer_unread_count, designer_unread_count, status (ACTIVE/ARCHIVED)

**Real-time Features (Socket.io):**
- Typing indicators ("Designer is typing...")
- Read receipts (double-tick)
- Online/offline status (green/grey dot)
- Reconnection handling with message sync

**Chat Restrictions:**
- Text-only messages (no file sharing in v1)
- Max 2000 characters per message
- Rate limit: max 30 messages per minute per user
- No message editing or deletion in v1
- Designer CANNOT initiate conversations — only respond

**Notification Flow:**
- New message → in-app notification badge (real-time)
- If recipient is offline for 5+ minutes → email notification (batched, max 1 per hour)`,
  },
  {
    id: "revenue",
    title: "Revenue & Profit Logic",
    icon: "📊",
    content: `**Revenue Streams:**

1. **Designer Premium Subscriptions**
   - ₹200/month or ₹1,800/year per designer
   - Target: 500 designers in Year 1
   - Projected: ₹200 × 500 × 12 = ₹12,00,000/year (if all monthly)

2. **Customer Premium Subscriptions**
   - ₹1,000/month or ₹9,000/year per customer
   - Target: 2,000 customers in Year 1
   - Projected: ₹1,000 × 2,000 × 12 = ₹2,40,00,000/year (if all monthly)

3. **Future Revenue (v2+)**
   - Featured listing for designers: ₹500/month (top of search)
   - Commission on confirmed bookings: 5–10% of project value
   - Lead generation packages for designers
   - Sponsored project showcases

**Cost Structure:**
- Razorpay payment gateway fee: 2% per transaction
- Cloudinary (images): ~₹5,000/month at scale
- Server hosting (AWS/DigitalOcean): ~₹10,000–30,000/month
- Domain + SSL: ~₹3,000/year
- Email service (SendGrid/SES): ~₹2,000/month
- SMS OTP (MSG91): ~₹0.20 per OTP

**Profit Flow:**
Revenue In → Razorpay collects → settles to bank (T+2 days) → minus gateway fees → minus infrastructure costs → net profit

**Key Metrics to Track (Admin Dashboard):**
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- Churn rate (monthly subscription cancellations / total active)
- ARPU (Average Revenue Per User)
- Customer Acquisition Cost
- Lifetime Value
- Conversion rate: free → premium (both roles)
- Active chat conversations per month`,
  },
  {
    id: "website",
    title: "Website & Page Logic",
    icon: "🌐",
    content: `**Public Pages (no auth required):**
- / → Landing page with hero, featured designers, how-it-works, testimonials, CTA
- /designers → Browse all designers (filters, sort, search)
- /designers/:slug → Individual designer profile + portfolio
- /pricing → Subscription plans for both roles
- /about → About the platform
- /contact → Contact form
- /login → Login page (tabbed: Customer / Designer)
- /register → Registration (tabbed: Customer / Designer)
- /forgot-password → Password reset flow

**Customer Dashboard (auth required, role: CUSTOMER):**
- /dashboard → Overview: saved designers, recent chats, subscription status
- /dashboard/designers → Browse designers (same as public but with chat buttons)
- /dashboard/messages → Chat inbox
- /dashboard/favorites → Bookmarked designers
- /dashboard/subscription → Current plan, upgrade/cancel
- /dashboard/settings → Edit profile, change password, deactivate
- /dashboard/reviews → Reviews I've written

**Designer Dashboard (auth required, role: DESIGNER):**
- /dashboard → Overview: profile visits, messages, reviews, subscription status
- /dashboard/projects → Manage portfolio (CRUD)
- /dashboard/messages → Chat inbox (only conversations initiated by customers)
- /dashboard/reviews → Reviews received
- /dashboard/subscription → Current plan, upgrade/cancel
- /dashboard/settings → Edit profile, change password, deactivate

**Admin Panel (auth required, role: ADMIN):**
- /admin → Dashboard with KPIs: total users, revenue, active subscriptions
- /admin/users → User management (search, filter, suspend, delete)
- /admin/designers/pending → Approve/reject new designer registrations
- /admin/subscriptions → Subscription overview, refund management
- /admin/reports → User-submitted reports (designer reports)
- /admin/content → Manage city list, style tags, pricing tiers

**Responsive Breakpoints:**
- Mobile: 320px–767px (single column, bottom nav)
- Tablet: 768px–1023px (2-column grid)
- Desktop: 1024px+ (3–4 column grid, sidebar nav)`,
  },
  {
    id: "database",
    title: "Database Schema",
    icon: "🗄️",
    content: `**Core Tables:**

**users** — id, email, phone, password_hash, role (CUSTOMER|DESIGNER|ADMIN), is_email_verified, is_phone_verified, is_premium, is_active, created_at, updated_at

**customer_profiles** — id, user_id (FK), name, city, profile_photo_url, favorites[] (designer IDs), profile_completion_score

**designer_profiles** — id, user_id (FK), name, firm_name, bio, experience_years, areas_served[], pricing_tier (BUDGET|MID|PREMIUM), profile_photo_url, certifications[], avg_rating, total_reviews, slug, status (PENDING|APPROVED|REJECTED), rejection_reason, profile_completion_score

**projects** — id, designer_id (FK), title, description, budget_min, budget_max, area, style_tags[], completion_date, status (PUBLISHED|DRAFT|DELETED), created_at

**project_images** — id, project_id (FK), image_url, thumbnail_url, cloudinary_public_id, sort_order, file_size_bytes, created_at

**subscriptions** — id, user_id (FK), plan_type (MONTHLY|YEARLY), role_plan (DESIGNER_PREMIUM|CUSTOMER_PREMIUM), amount, currency, razorpay_subscription_id, starts_at, expires_at, grace_ends_at, status (ACTIVE|PAST_DUE|EXPIRED|CANCELLED), created_at

**payments** — id, user_id (FK), subscription_id (FK), amount, currency, razorpay_payment_id, razorpay_order_id, status (SUCCESS|FAILED|REFUNDED), created_at

**conversations** — id, customer_id (FK), designer_id (FK), last_message_at, customer_unread, designer_unread, status (ACTIVE|ARCHIVED)

**messages** — id, conversation_id (FK), sender_id (FK), sender_role, content, is_read, created_at

**reviews** — id, customer_id (FK), designer_id (FK), rating (1–5), comment, created_at

**Indexes:**
- designer_profiles: areas_served (GIN), pricing_tier, avg_rating, status
- projects: designer_id, status
- messages: conversation_id, created_at
- subscriptions: user_id, status, expires_at`,
  },
  {
    id: "security",
    title: "Security & Edge Cases",
    icon: "🔒",
    content: `**Authentication Security:**
- Passwords: bcrypt with salt rounds = 12
- JWT access tokens: 15-minute expiry, stored in memory (not localStorage)
- Refresh tokens: 7-day expiry, httpOnly secure cookie
- Rate limiting: 5 login attempts per 15 minutes per IP
- Account lockout after 10 failed attempts → unlock via email

**API Security:**
- Helmet.js for HTTP headers
- CORS: whitelist only frontend domain
- Input sanitization: express-validator on all endpoints
- SQL injection protection: Prisma parameterized queries
- XSS protection: DOMPurify on any user-generated content rendered in frontend
- File upload validation: magic bytes check (not just extension), size limit, type whitelist

**Authorization Middleware:**
- Every protected route checks: (1) valid JWT, (2) correct role, (3) resource ownership
- Customer cannot access /api/designers/dashboard routes
- Designer cannot access customer listing or profile data
- Admin routes require ADMIN role

**Edge Cases Handled:**
- User uploads 6th project → server returns 400 with clear error
- User uploads 11th photo to a project → rejected
- Photo > 5 MB → rejected client-side before upload, also server-side
- Both subscriptions expire mid-conversation → chat shows upgrade banner, messages still stored but sending disabled
- User tries to rate a designer they haven't chatted with → rejected
- Duplicate email registration → "Email already registered"
- Razorpay webhook replay → idempotency check via razorpay_payment_id
- Concurrent chat messages → Socket.io room per conversation, messages ordered by server timestamp
- Designer not approved yet → profile not shown in listing, chat impossible`,
  },
];

export default function InteriorPlatformBlueprint() {
  const [activeSection, setActiveSection] = useState("prompt");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const active = sections.find((s) => s.id === activeSection);

  const renderContent = (text) => {
    return text.split("\n").map((line, i) => {
      const trimmed = line;

      if (trimmed.startsWith("---") && trimmed.endsWith("---") && trimmed.length > 5) {
        return <hr key={i} className="border-t border-gray-600 my-4" />;
      }

      if (trimmed.startsWith("| ") && trimmed.includes("|")) {
        const cells = trimmed
          .split("|")
          .filter((c) => c.trim() !== "");
        const isHeader = i > 0 && text.split("\n")[i + 1]?.includes("---");
        const isSeparator = trimmed.includes("---");
        if (isSeparator && !cells.some((c) => !c.includes("-"))) return null;

        return (
          <div
            key={i}
            className="grid gap-1 py-1 px-2 text-sm"
            style={{
              gridTemplateColumns: `repeat(${cells.length}, 1fr)`,
              background: isHeader ? "rgba(168,131,98,0.15)" : "transparent",
              borderBottom: "1px solid rgba(168,131,98,0.2)",
              fontWeight: isHeader ? 600 : 400,
            }}
          >
            {cells.map((cell, j) => (
              <span key={j} className="px-1">
                {cell.trim()}
              </span>
            ))}
          </div>
        );
      }

      if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
        return (
          <h3
            key={i}
            className="text-base font-semibold mt-5 mb-2"
            style={{ color: "#A88362" }}
          >
            {trimmed.replace(/\*\*/g, "")}
          </h3>
        );
      }

      if (/^\d+\.\s/.test(trimmed)) {
        const content = trimmed.replace(/^\d+\.\s/, "");
        const num = trimmed.match(/^(\d+)\./)[1];
        return (
          <div key={i} className="flex gap-3 py-1 pl-2">
            <span
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "rgba(168,131,98,0.2)", color: "#A88362" }}
            >
              {num}
            </span>
            <span className="text-sm leading-relaxed opacity-90">
              {renderInline(content)}
            </span>
          </div>
        );
      }

      if (trimmed.startsWith("- ")) {
        return (
          <div key={i} className="flex gap-2 py-0.5 pl-4">
            <span style={{ color: "#A88362" }}>•</span>
            <span className="text-sm leading-relaxed opacity-90">
              {renderInline(trimmed.slice(2))}
            </span>
          </div>
        );
      }

      if (trimmed === "") return <div key={i} className="h-2" />;

      return (
        <p key={i} className="text-sm leading-relaxed opacity-90 py-0.5">
          {renderInline(trimmed)}
        </p>
      );
    });
  };

  const renderInline = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} style={{ color: "#C9A87C" }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded text-xs"
            style={{
              background: "rgba(168,131,98,0.15)",
              color: "#D4B896",
              fontFamily: "monospace",
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: "#1A1612",
        color: "#E8DDD0",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Sidebar */}
      <div
        className={`flex-shrink-0 transition-all duration-300 overflow-y-auto border-r ${sidebarOpen ? "w-64" : "w-0 overflow-hidden"}`}
        style={{ borderColor: "rgba(168,131,98,0.2)", background: "#151210" }}
      >
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: "#A88362", color: "#1A1612" }}
            >
              DN
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: "#C9A87C" }}>
                DesignNest
              </div>
              <div className="text-xs opacity-50">Platform Blueprint</div>
            </div>
          </div>

          <div className="space-y-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2.5 transition-all duration-200"
                style={{
                  background:
                    activeSection === s.id
                      ? "rgba(168,131,98,0.15)"
                      : "transparent",
                  color: activeSection === s.id ? "#C9A87C" : "#E8DDD0",
                  opacity: activeSection === s.id ? 1 : 0.7,
                  borderLeft:
                    activeSection === s.id
                      ? "2px solid #A88362"
                      : "2px solid transparent",
                }}
              >
                <span>{s.icon}</span>
                <span>{s.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div
          className="flex items-center gap-3 px-6 py-3 border-b flex-shrink-0"
          style={{
            borderColor: "rgba(168,131,98,0.15)",
            background: "rgba(21,18,16,0.8)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md hover:opacity-80"
            style={{ color: "#A88362" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <span className="text-lg font-semibold" style={{ color: "#C9A87C" }}>
            {active?.icon} {active?.title}
          </span>
          <div className="flex-1" />
          <span className="text-xs opacity-40">
            {sections.findIndex((s) => s.id === activeSection) + 1} of{" "}
            {sections.length} sections
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-3xl">{active && renderContent(active.content)}</div>

          {/* Nav buttons */}
          <div className="flex gap-3 mt-10 max-w-3xl">
            {sections.findIndex((s) => s.id === activeSection) > 0 && (
              <button
                onClick={() => {
                  const idx = sections.findIndex(
                    (s) => s.id === activeSection
                  );
                  setActiveSection(sections[idx - 1].id);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  border: "1px solid rgba(168,131,98,0.3)",
                  color: "#A88362",
                }}
              >
                ← Previous
              </button>
            )}
            {sections.findIndex((s) => s.id === activeSection) <
              sections.length - 1 && (
              <button
                onClick={() => {
                  const idx = sections.findIndex(
                    (s) => s.id === activeSection
                  );
                  setActiveSection(sections[idx + 1].id);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: "#A88362", color: "#1A1612" }}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
