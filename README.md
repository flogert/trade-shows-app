# 🎪 Trade Shows Hub - Lead Retrieval App

A professional, mobile-friendly lead retrieval application for teams attending trade shows. Built with Next.js 16, Framer Motion, and AI-powered insights.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js) 
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) 
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌟 Overview

Trade Shows Hub is an all-in-one solution for retrieving, managing, and analyzing leads at trade shows and exhibitions. It features a slide-based form wizard, real-time analytics, CRM integration, and AI-powered lead scoring.

## ✨ Key Features

### 📱 Slide-Based Form Wizard
- **Mobile & Tablet Optimized** - Large touch targets, smooth swipe navigation
- **Beautiful Animations** - Powered by Framer Motion with 60fps transitions
- **Progress Indicator** - Visual step tracking with completion dots
- **Smart Validation** - Real-time field validation with helpful feedback
- **Offline Support** - Local storage persistence for unreliable network conditions

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

3. (Optional) Set up AI features:
```bash
cp .env.local.example .env.local
```
Then edit `.env.local` and add your OpenAI API key.

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_OPENAI_API_KEY` | OpenAI API key for AI insights | No |

Without the API key, the app will use built-in local insights generation.

## 📁 Project Structure

```
app/
├── components/
│   ├── slides/           # Multi-step form screens
│   ├── Dashboard.tsx     # Lead management dashboard
│   ├── FormWizard.tsx    # Main form controller
│   └── SlideWrapper.tsx  # Animation wrapper
├── store/
│   └── formStore.ts      # Zustand state management
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

- No sensitive data stored in local storage (only lead metadata)
- API keys are environment-scoped
- No `X-Powered-By` header exposed
- Input validation on all form fields

## 📄 License

MIT License - feel free to use for your own trade shows!

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

**Made with ❤️ by Flogert Bardhi**
