# 🎪 Trade Shows Hub - Lead Retrieval App

A professional, mobile-friendly lead retrieval application for teams attending trade shows. Built with Next.js 16, Framer Motion, and AI-powered insights.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js) 
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) 
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌟 Overview

Trade Shows Hub is an all-in-one solution for retrieving, managing, and analyzing leads at trade shows and exhibitions. It features a slide-based form wizard, real-time analytics, CRM integration, AI-powered lead scoring, and Supabase-backed user accounts with role-based access.

## ✨ Key Features

### 📱 Slide-Based Form Wizard
- **Mobile & Tablet Optimized** - Large touch targets, smooth swipe navigation
- **Beautiful Animations** - Powered by Framer Motion with 60fps transitions
- **Progress Indicator** - Visual step tracking with completion dots
- **Smart Validation** - Real-time field validation with helpful feedback
- **Online Sync** - Leads and foot traffic now persist to Supabase so the team shares one live dataset

### 🔐 Supabase Accounts & Roles
- **Password Login** - Authorized staff sign in with a Supabase email and password
- **Selected User Access** - Only pre-approved emails in `salesperson_profiles` can open the app
- **Role-Based Permissions** - `salesperson`, `manager`, and `admin` roles control data visibility and destructive actions
- **Salesperson Locking** - The logged-in user becomes the lead owner automatically during collection
- **Server-Only Admin Support** - Optional service-role configuration supports password resets and other admin workflows from trusted server code

### 🤖 AI-Powered Features
- **Personalized Insights** - AI analyzes each lead's context and engagement signals
- **Lead Scoring** - Automatic A/B/C/D grading based on engagement signals
- **Smart Recommendations** - Follow-up suggestions
- **Bulk Analysis** - Generate comprehensive reports on all collected leads

### 📊 Analytics Dashboard
- **Real-time Metrics** - Live visitor counts, conversion rates, dwell times
- **Visual Charts** - Interactive graphs powered by Recharts
- **Lead Segmentation** - Hot/Warm/Cold lead classification
- **Export Reports** - Download analytics as XLSX or PDF

### 🔗 CRM Integration
- **Multi-Platform Support** - HubSpot, Salesforce, Salesgent
- **Auto-Sync** - Real-time lead synchronization
- **Data Enrichment** - Automatic company and contact enrichment
- **Duplicate Detection** - Smart matching to prevent duplicates

### 📥 Export Options
- **XLSX Export** - Full Excel spreadsheet with all data and formatting
- **CSV Export** - Simple comma-separated for any system
- **Email Copy** - Formatted text ready to paste into emails
- **API Access** - RESTful endpoints for custom integrations

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+ (LTS recommended)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd trade-shows-app
```

2. Install dependencies:
```bash
npm install
```

3. Create your environment file:
```bash
copy .env.local.example .env.local
```

4. Set up Supabase:
- Create a Supabase project
- Copy your project URL, anon key, and optional service-role key into `.env.local`
- Open the SQL editor in Supabase and run `supabase/schema.sql`
- Update the seeded emails in `salesperson_profiles` so they match your real sales team
- In Supabase Auth, enable email/password sign-in for the authorized team emails

5. (Optional) Add AI features by setting `NEXT_PUBLIC_OPENAI_API_KEY`.

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only admin key for password resets and other auth-admin actions | No |
| `NEXT_PUBLIC_OPENAI_API_KEY` | OpenAI API key for AI insights | No |

Without the OpenAI key, the app will use built-in local insights generation.

The service-role key must stay server-side only. Never expose it in client components or browser bundles.

### Admin Password Resets

After adding `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`, you can run:

```bash
npm run supabase:reset-password -- flogert@rocketmail.com TempPassword123!
```

This uses the server-side script in `scripts/reset-supabase-password.mjs` to look up the auth user and set a temporary password.

## 🗄️ Supabase Data Model

The app now expects these Supabase tables and policies:

- `salesperson_profiles`: authorized users, mapped email address, salesperson label, and role
- `leads`: JSON payload for each collected lead, linked to the salesperson profile
- `foot_traffic_entries`: JSON payload for each traffic event, linked to the salesperson profile

The full schema, RLS policies, and seed examples live in `supabase/schema.sql`.

### Default Role Behavior

- `salesperson` can sign in and work with their own leads and foot-traffic records
- `manager` can view all shared data and clear team data when needed
- `admin` has the same visibility as manager and is intended for full booth ownership

## 📁 Project Structure

```
app/
├── components/
│   ├── slides/           # Multi-step form screens
│   ├── Dashboard.tsx     # Lead management dashboard
│   ├── FormWizard.tsx    # Main form controller
│   ├── AuthScreen.tsx    # Supabase sign-in and password-setup screen
│   └── SlideWrapper.tsx  # Animation wrapper
├── lib/
│   ├── database.ts       # Supabase row mapping helpers
│   └── supabase.ts       # Browser client and env checks
├── store/
│   └── formStore.ts      # Zustand state + Supabase sync/auth methods
├── types/
│   └── index.ts          # TypeScript definitions
├── utils/
│   ├── ai.ts             # AI insights generation
│   └── export.ts         # XLSX & email export
├── globals.css           # Global styles
├── layout.tsx            # Root layout
└── page.tsx              # Main page
```

## 🎨 Customization

### Updating Form Options
Edit `app/types/index.ts` to adjust selectable options used by the form and dashboard views.

## 📱 Usage

1. **Welcome Screen** - Tap "Get Started"
2. **Business Type** - Select Wholesale or Retail
3. **Contact Info** - Enter customer details
4. **Interest Details** - Capture lead interest details
5. **Contact Preferences** - Choose how to reach out
6. **Timing Preferences** - Capture best follow-up timing
7. **Notes** - Add any additional information
8. **Success** - View summary and AI insights

### Dashboard Features
- **Export XLSX** - Download all leads as Excel file
- **Copy for Email** - Copy formatted summary to clipboard
- **Generate Analysis** - Get AI insights on all leads
- **View Details** - Click any lead for full information

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.6 | React framework with App Router |
| **React** | 19.2.3 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **Framer Motion** | 12.x | Animations |
| **Zustand** | 5.x | State management |
| **Recharts** | 3.x | Data visualization |
| **SheetJS / xlsx-js-style** | 0.18 / 1.x | Excel export |
| **OpenAI** | 6.x | AI insights (optional) |

## ⚡ Performance Optimizations

- **React Strict Mode** - Catches common bugs early
- **Image Optimization** - AVIF/WebP formats with responsive sizing
- **CSS Optimization** - Automatic CSS splitting and minification
- **Font Loading** - `display: swap` for better LCP
- **Compression** - Gzip/Brotli enabled
- **Hydration** - `suppressHydrationWarning` for cleaner hydration

## 🔒 Security

- Supabase Auth protects access with email magic links
- Row-level security limits each salesperson to the correct records
- Only form progress and draft state stay in local storage; live data is remote
- API keys are environment-scoped
- No `X-Powered-By` header exposed
- Input validation on all form fields

## 📄 License

MIT License - feel free to use for your own trade shows!

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

**Made with ❤️ by Flogert Bardhi**
