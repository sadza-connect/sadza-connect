# Sadza Connect — Zimbabwe's National Digital Discovery & Commerce Platform

**Tagline:** *Connecting People, Businesses and Opportunities*  
**Client:** Africdominion Group (Pvt) Ltd  
**Version:** 1.0 Production Frontend

---

## 🇿🇼 Overview

**Sadza Connect** (Sadza Connect) is Zimbabwe's premier commercial directory, marketplace, and utility settlement engine. Built strictly adhering to the **Sadza Connect Product Requirements Document (PRD)** and **System Architecture Blueprint**, this frontend application delivers a high-performance, accessible (WCAG 2.2 AA), and visually distinctive experience designed for both Zimbabwean locals and the diaspora.

---

## 🚀 Key Highlights & Modules

### 1. Landing Page (`/`)
- **Multilingual Announcement Bar**: Official welcoming in Shona (*Titambire*), Ndebele (*Samukele*), and English with indicative live USD / ZiG exchange rate and WhatsApp emergency helpline.
- **Brand Navbar**: Embeds the official provided Sadza Connect logo with light/dark contrast preservation, fast navigation, interactive theme switch, and prominent "Register Business" CTA.
- **Hero & Unified Search Console**:
  - Live autocomplete search suggestions for Zimbabwean enterprises, solar packages, sadza restaurants, and utilities.
  - Location filtering across all **10 Provinces of Zimbabwe** (Harare, Bulawayo, Midlands, Manicaland, Matabeleland North/South, Masvingo, Mashonaland East/West/Central).
  - Quick-tag search shortcuts.
  - Trust metric indicators (ZIMRA & CR14 verification, direct WhatsApp click-to-chat).
- **Core Industry Sectors Grid**: 8 major Zimbabwean industry sectors with active listing badges.
- **Interactive Split Map Directory**:
  - Scrollable business feed with ratings, specialty items, and instant WhatsApp deeplinks.
  - Live OpenStreetMap / Leaflet visual simulation canvas with interactive GPS marker pins, map style switcher (Street, Satellite, Terrain), and live coordinate popups.
- **Featured Verified Enterprises**: Highlighting top Zimbabwean businesses (*Gava's Traditional Restaurant*, *Midlands Solar & Power Systems*, *Victoria Falls Safari Lodge*, *Batanai Building & Hardware*).
- **Marketplace & Jobs Dual Preview**:
  - Online Marketplace with dual pricing (**USD $** & **ZiG**) and direct seller WhatsApp inquiries.
  - Career Opportunities board with salary ranges and interactive "Quick Apply" modal with CV upload simulator.
- **ZESA & Utility Bill Settlements**:
  - Interactive prepaid electricity token generator simulator (enter meter number and USD/ZiG amount to receive an instant official 20-digit token demo with copy-to-clipboard functionality!).
  - Council water and DSTV subscription renewal indicators.
  - Accepted Zimbabwean payment rails (EcoCash USD, EcoCash ZiG, InnBucks, Zipit, Cash USD).
- **Sadza AI Discovery Engine ("Ask Sadza AI")**:
  - Interactive local chatbot with natural language understanding of Zimbabwean terminology (*Sadza rezviyo, ZESA tokens, borehole solar pumps*).
  - Sample query triggers and verified listing card responses.
- **Provincial Economic Hubs Spotlight**: Breakdown of Zimbabwe's 10 provinces and key GDP drivers.
- **Two-Tier Verification Blueprint**: Clear guide to Tier 1 (Identity Verified Artisan / Sole Trader) vs. Tier 2 (CR14 Certified Corporate Enterprise with ZIMRA ITF263).
- **Mobile Low-Data Optimization Banner**: Highlighting offline PWA caching for Econet and NetOne mobile networks.
- **Comprehensive Footer**: Full PRD sitemap, legal notices, and multilingual farewell (*Maita Basa • Siyabonga*).

### 2. Registration Page (`/signup` & `/register`)
- **Role Switcher Tabs**:
  - **Business / Merchant**: Business Name, Primary Director / Authorized Contact, Business Sector, Verification Tier (CR14 Corporate vs. Artisan), Email, WhatsApp (+263), Operating Province, Password with real-time strength meter.
  - **Personal / Shopper**: Full Name, Email, Phone (+263), Province, Password with real-time strength meter.
- **Real-Time Password Strength Meter**: Minimum 8 characters, uppercase, number, and special character evaluation.
- **1-Click Presentation Auto-Fill**:
  - `🏢 Fill Demo Business` (`Midlands Solar & Agro Solutions`)
  - `👤 Fill Demo Shopper` (`Tinashe Sibanda`)
- **Interactive Success State**: Dispatches confirmation and outlines next onboarding steps.
- **Built-in ThemeToggle** and Back-to-Explorer navigation.

### 3. Login Page (`/login`)
- **Flexible Identifier**: Supports email addresses and Zimbabwean mobile numbers (+263 Econet, NetOne).
- **Password with Visibility Toggle**: Eye icon show/hide.
- **Remember Me**: 30-day device persistence option.
- **Forgot Password Modal**: Multi-channel recovery via WhatsApp OTP, SMS, or Email.
- **1-Click Presentation Auto-Fill**:
  - `🏢 Verified Merchant Demo`
  - `👤 Consumer / Shopper Demo`
- **Branded Desktop Showcase Sidebar**: Highlights CR14 verification, WhatsApp commerce, and national coverage.

### 4. Intentional Dark Mode & Light Mode
- Custom zero-flicker `ThemeProvider` (`light` | `dark` | `system`) with anti-flash inline script.
- The official Sadza Connect logo is housed in a clean, high-contrast capsule so the black lettering (*SADZA*) and black magnifying glass circle remain 100% crisp and readable in both modes.
- Dark theme leverages rich Obsidian Ink (`#090d16`), deep slate cards (`#111827`), subtle 1px borders, and Zimbabwean Savannah Green and Heritage Gold glow accents.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript 5.5+
- **Styling**: Tailwind CSS 3.4+
- **Icons**: Lucide React
- **Motion**: Framer Motion 11
- **Design Tokens**: Zimbabwe Savannah Green (`#007a3d`), Heritage Gold (`#f6ac02`), Ruby Red (`#d40000`), Obsidian Ink (`#090d16`)

---

## 🏃 Getting Started

Inside the `landing-option-1` (or `sadza-connect`) directory:

```bash
# Development server (runs on port 3000 or specified port)
npm run dev

# Production build
npm run build

# Start production server
npm run start -p 3050
```
