# Sadza Connect — Client Discovery Questionnaire
**Client:** Africdominion Group (Pvt) Ltd  
**Representative:** Tinowonga Ngozi (Gweru, Zimbabwe)  
**Lead Developer:** Ugwoke Levi  
**Project:** Sadza Connect Web Platform  
**Date:** September 2026  

---

## Purpose of this Document
This questionnaire is designed to formalize all business rules, operational workflows, and functional requirements for the **Sadza Connect** platform prior to full engineering implementation. The answers provided will directly guide the database schema, administrative controls, and user flows.

---

### Section 1: Business Directory, Onboarding & Trust Verification

#### 1.1 Business Profile Approval Workflow
*When a business owner creates an account and submits their business profile, how should it be handled?*
- [ ] **Option A (Admin Approval Required)**: The business remains private/hidden until an administrator reviews their details and approves the listing.
- [ ] **Option B (Instant Publication with Verification Flag)**: The business goes live immediately marked as *"Unverified"*, and only receives the official green *"Verified"* badge after an admin reviews their KYC documents.
- [ ] **Other / Notes**: _________________________________________________

#### 1.2 Required Verification (KYC) Documents
*What official documents must a Zimbabwean company submit to earn the "Verified Business" badge?*
- [ ] Certificate of Incorporation
- [ ] CR14 / CR6 (Company Directors List)
- [ ] ZIMRA Tax Clearance Certificate (ITF263)
- [ ] National Identity Card / Passport of Primary Director
- [ ] Proof of Trading Address (e.g., Council utility bill or lease agreement)
- [ ] Other: ___________________________________________________________

#### 1.3 Priority Launch Categories
*Which business sectors should be prominently featured on the homepage at launch?*
- [ ] Restaurants, Traditional Dining & Fast Food
- [ ] Solar & Clean Energy Providers
- [ ] Agriculture, Seed, Fertilizer & Farm Inputs
- [ ] Hotels, Tourism Lodges & Safari Tours
- [ ] Hardware, Cement & Construction Supplies
- [ ] Healthcare, Clinics & Pharmacies
- [ ] Professional Services (Accounting, Legal, IT)
- [ ] Automotive, Mechanics & Spare Parts
- [ ] Other: ___________________________________________________________

#### 1.4 Business Monetization & Listing Tiers
*Will all business listings be free at launch, or will there be paid tiers?*
- [ ] **Free Tier Only**: All businesses get a standard profile at launch.
- [ ] **Paid Featured Slots**: Free basic listings, but businesses can pay to be pinned at the top of search results and category pages.
- [ ] **Subscription Model**: Monthly or annual fee for premium profiles with extended galleries and product catalogs.

#### 1.5 Sole Proprietors / Artisans vs. Registered Corporations
*In Zimbabwe, requiring CR14 (incorporation) and ITF263 (ZIMRA tax clearance) at registration will lock out informal traders, carpenters, solar technicians, and small shops who drive over 60% of daily transactions.*
- [ ] **Option A (Strict Corporate Only)**: Only formal companies with CR14 / Certificate of Incorporation can create a business profile.
- [ ] **Option B (Two-Tier Verification System - Recommended)**:
  - **Tier 1 (Sole Trader / Artisan)**: Registers with just a National ID card + WhatsApp business number. Receives a blue/silver *"Identity Verified"* badge.
  - **Tier 2 (Corporate Enterprise)**: Submits CR14 + ZIMRA ITF263 tax clearance. Receives the official green *"CR14 Certified Corporate"* badge.
- [ ] **Other / Notes**: _________________________________________________

#### 1.6 Multi-Branch & Multi-Location Architecture
*Major Zimbabwean companies (e.g., PPC Cement, Halsted, Bakers Inn, Solarpro) have branches in Harare, Bulawayo, Gweru, and Mutare.*
- [ ] **Option A (Single Head Office Master Account)**: One corporate account can add multiple branch locations under one login, each pinned separately on the Map with local phone numbers.
- [ ] **Option B (Independent Branch Profiles)**: Each physical branch creates its own separate account and profile.
- [ ] **Other / Notes**: _________________________________________________

#### 1.7 Physical Walk-in Address vs. Mobile / Delivery-Only Services
*Many Zimbabwean service providers (borehole drillers, mobile auto mechanics, caterers, solar installers, truckers) do not have a walk-in retail storefront.*
- [ ] **Option A (Physical Commercial Address Mandatory)**: Every business must provide a physical street address and coordinates for the public Map.
- [ ] **Option B (Support Service-Radius / Mobile Providers)**: Businesses can register as *"Mobile / Delivery Service"*, selecting the cities/provinces they cover without exposing a personal home address on the public map.
- [ ] **Other / Notes**: _________________________________________________

#### 1.8 Accepted Currencies & Payment Methods Badging
*Zimbabwean customers always want to know what currency and payment channels a merchant accepts before calling.*
*Which payment method badges should businesses be able to check off during registration?*
- [ ] Cash USD ($)
- [ ] EcoCash USD
- [ ] EcoCash ZWG / ZiG
- [ ] InnBucks
- [ ] Bank Transfer / Zipit (CBZ, CABS, Stanbic, FBC, Nedbank, etc.)
- [ ] Card Swipe / POS Machine
- [ ] Other: ___________________________________________________________

#### 1.9 Pre-Seeded Profiles & "Claim My Business" Workflow
*To avoid launching with an empty directory, Africdominion Group will likely pre-populate the directory with 500–1,000 prominent Zimbabwean companies.*
*When a real business owner arrives on the platform, how do they "Claim" their pre-listed profile?*
- [ ] **Option A (Manual Admin Review)**: Owner clicks *"Claim This Business"*, submits proof of identity/utility bill, and platform admin manually verifies.
- [ ] **Option B (Automated OTP Verification)**: System sends an automated WhatsApp or SMS verification code to the official phone number listed on that business profile.
- [ ] **Other / Notes**: _________________________________________________

#### 1.10 Product & Media Upload Limits at Registration
*High-resolution photos from hundreds of businesses consume storage and bandwidth.*
*What initial upload quotas should apply during registration?*
- [ ] **Free Tier Limit**: Maximum of ______ product/service photos (Recommended: 3 to 5 items).
- [ ] **Downloadable Catalog**: Can businesses upload a downloadable PDF product price list / company profile? (Yes / No)
- [ ] **Video Demos**: Can businesses link a YouTube or TikTok demonstration video? (Yes / No)

#### 1.11 Operating Hours & "Backup Power" Status (Solar / Generator)
*Load shedding (power outages) is a daily factor in Zimbabwe. Customers need to know if a business is open and powered.*
*Should businesses be able to declare their backup power status during onboarding?*
- [ ] **Yes**: Include optional power badges (`☀️ 100% Solar Powered`, `⚡ Standby Generator`, `🔌 Grid Only`) to assure customers they are operational during power outages.
- [ ] **No**: Keep onboarding focused strictly on opening hours.

#### 1.12 Inactivity & "Ghost Listing" Protection Policy
*Many African directories suffer from dead listings with disconnected phone numbers after 6–12 months.*
*How should Sadza Connect maintain listing accuracy over time?*
- [ ] **Automated WhatsApp Pulse Check**: System sends an automated WhatsApp message every 90 days: *"Reply 1 to confirm your business is still operational at this number."*
- [ ] **Unverified Downgrade**: If a business owner does not log in or confirm activity within 180 days, their listing loses its "Verified" badge or is temporarily unlisted.
- [ ] **Other / Notes**: _________________________________________________

---

### Section 2: Online Marketplace (Buying & Selling)

#### 2.1 Order & Purchase Workflow
*How should a customer interact with a product they wish to purchase?*
- [ ] **Direct WhatsApp Inquiry (Recommended for V1.0)**: Clicking *"Buy"* opens a pre-filled WhatsApp chat with the seller containing the product name, price, and inquiry message.
- [ ] **In-Platform Order Placement**: The buyer submits an order form inside Sadza Connect, creating an order record in both the buyer's and seller's dashboards.
- [ ] **Other / Notes**: _________________________________________________

#### 2.2 Seller Rights & Restrictions
*Who is eligible to list products on the marketplace?*
- [ ] Only businesses with approved/verified profiles.
- [ ] Any registered business owner (verified or unverified).
- [ ] Everyday registered users (like general classifieds / secondhand goods).

---

### Section 3: Jobs Board & Career Opportunities

#### 3.1 Job Posting Permissions
*Who is permitted to post job vacancies on the platform?*
- [ ] Only verified business accounts.
- [ ] Any registered business account.
- [ ] Sadza Connect Admin team only (curated vacancies).

#### 3.2 Job Application Workflow
*When an applicant applies for a job listing with their CV/Resume:*
- [ ] **Dashboard Storage**: The applicant's CV and cover letter are saved directly to the employer's Sadza Connect dashboard for review.
- [ ] **WhatsApp Alert**: The employer receives a direct WhatsApp notification containing the applicant's contact details and CV link.
- [ ] **Both**: Saved in the dashboard AND sent via WhatsApp link.

---

### Section 4: Utility Bill Payments (ZESA, DSTV, Municipal Water)

#### 4.1 Launch Functionality for Version 1.0
*What should the bill payments user experience deliver in the initial launch?*
- [ ] **Interactive Self-Service Flow**: The user selects their utility (ZESA, DSTV, Harare Water, Bulawayo Water), enters their meter/account number, selects USD or ZWL, and receives an order reference/instructions screen to complete payment.
- [ ] **Live Payment Gateway Integration**: The platform immediately connects to a live payment gateway (e.g., Paynow Zimbabwe, EcoCash, or Innbucks) to process debit/mobile money transactions in real time.
- [ ] *If Live Gateway*: Do you already have a registered merchant account with Paynow, EcoCash, or Innbucks? (Yes / No)

#### 4.2 Utility Convenience Fee
*Will Sadza Connect charge a nominal convenience fee on bill settlements?*
- [ ] **Yes**: Flat fee (e.g., US$0.50 per transaction or percentage markup).
- [ ] **No**: Zero fee to encourage platform adoption.

---

### Section 5: Currency, Pricing & Financial Rules

#### 5.1 Dual Currency Management (USD & ZWL)
*The platform supports both US Dollars (USD) and Zimbabwean Dollars (ZWL).*
- [ ] **Central Admin Exchange Rate**: The platform Administrator updates the official USD/ZWL conversion rate inside the Admin Panel, and the system automatically calculates ZWL prices across all listings.
- [ ] **Seller-Specified Prices**: Individual business owners enter both the USD price and the ZWL price manually for their products and services.

---

### Section 6: Language & Localization

#### 6.1 Multilingual Support
*The PRD mentions support for English, Shona, and Ndebele.*
- [ ] **Phase 1 English-First**: Launch fully in English, with key greetings and category terms available in Shona and Ndebele.
- [ ] **Full Multi-Language Switcher**: Provide a top navigation toggle allowing visitors to switch interface text between English, Shona, and Ndebele from Day 1.

#### 6.2 Key Launch Cities & Provinces
*Please confirm the primary launch target cities for initial marketing and onboarding:*
1. Harare (Harare Province)
2. Bulawayo (Bulawayo Province)
3. Gweru & Kwekwe (Midlands Province)
4. Mutare (Manicaland)
5. Victoria Falls & Hwange (Matabeleland North)
6. Masvingo (Masvingo Province)
7. Other: ___________________________________________________________

---

