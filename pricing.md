# Sadza Connect — Official Platform Financial Schedule & Master Pricing List

All platform subscription rates, package fees, unlock charges, freight tariffs, and convenience fees across **Sadza Connect** are locked as static, immutable constants in `src/lib/constants/pricing.ts`.

Neither administrators nor store owners can alter or tamper with these rates through the Admin Panel or API. When Flutterwave is integrated, the gateway will charge strictly against this authoritative financial schedule.

---

## 1. Business Directory & Membership Subscriptions
*(Applicable to verified business profiles listed on Sadza Connect)*

| Subscription Tier | Monthly Rate (USD) | 30-Day Free Grace Period | Description & Inclusions |
| :--- | :---: | :---: | :--- |
| **New Business Launch Trial** | **$0.00** | **Included (Day 1 – 30)** | Zero-cost platform entry for every newly registered enterprise. Full directory listing & marketplace catalog access. |
| **Track A: Corporate / Registered Companies** | **$15.00** / mo | Yes | Pvt Ltd, Private Business Corporations (PBCs), Established Retailers & Brands. Verified badge & SEO indexing. |
| **Track B: Solo Operators & Artisans** | **$5.00** / mo | Yes | Sole proprietors, tradespeople, welders, tailors, informal traders, freelance professionals. Accessible grassroots tier. |
| **Track C: Cooperatives & Agro-Collectives** | **$10.00** / mo | Yes | Farmer unions, community trusts, manufacturing syndicates, NGOs, and women-led agro-cooperatives. |
| **Standard Active Listing Rate** | **$15.00** / mo | Yes | Baseline monthly rate for standard commercial profiles. |

### Subscription Duration Discounts (Applied at Checkout)
| Billing Duration | Discount Applied | Effective Monthly Cost (Corporate Track) | Total Billed Amount (Corporate) |
| :--- | :---: | :---: | :---: |
| **1 Month** | **0%** | $15.00 / mo | **$15.00 USD** |
| **3 Months (Quarterly)** | **10% OFF** | $13.50 / mo | **$40.50 USD** *(Save $4.50)* |
| **12 Months (Annual Plan)** | **20% OFF** | $12.00 / mo | **$144.00 USD** *(Save $36.00)* |

---

## 2. Storefront Catalog Quotas (Active Product Listings)
*(Determines how many live products an enterprise can showcase simultaneously in the Sadza Connect Marketplace)*

| Catalog Tier | Monthly Add-on / Base | Max Active Products | Best For |
| :--- | :---: | :---: | :--- |
| **Starter Storefront Tier** | **Included ($15.00/mo)** | Up to **25 products** | Boutiques, small workshops, specialty producers. |
| **Growth Storefront Tier** | **$25.00** / mo | Up to **100 products** | Mid-size retailers, hardware merchants, fashion outlets. |
| **Enterprise Wholesaler Tier** | **$50.00** / mo | Up to **300 products** | High-volume distributors, FMCG wholesalers, agricultural suppliers. |

---

## 3. Sponsored Adverts & Promotional Packages
*(High-visibility placements in the classifieds section, hero banners, and weekly promo feeds)*

| Advert Package | Rate (USD) | Post Volume & Placement | Direct WhatsApp Lead Feature |
| :--- | :---: | :--- | :---: |
| **Free Starter Trial** | **$0.00** | **2 free adverts total** lifetime starter allowance. | Included |
| **Starter Advert Tier** | **$15.00** / mo | **2 adverts/week** *(8 adverts/month total)*. | Included |
| **Growth Advert Tier** *(Most Popular)* | **$25.00** / mo | **3 adverts/week** *(12 adverts/month)* + Priority category placement + Custom promo badge. | Included |
| **Premium Pro Unlimited** *(Best Value)* | **$40.00** / mo | **Unlimited daily adverts** *(30+ adverts/month)* + Top pinned homepage placement. | Included |
| **Single Standalone Hero/Sidebar Slot** | **$20.00** / 30 days | 1 dedicated featured showcase banner on homepage / category sidebar. | Included |

---

## 4. Bundles & Cross-Selling Packs
| Package Name | Rate (USD) | Normal Value | Description |
| :--- | :---: | :---: | :--- |
| **Enterprise Duo Growth Bundle** | **$25.00** / mo | $35.00 | Combines a Verified Business Directory Listing ($15/mo) + 1 Sponsored Advert Slot ($20/mo). Saves $10/month. |

---

## 5. Properties & Rentals Micro-Fees
| Service Item | Fee (USD) | Who Pays | Model Notes |
| :--- | :---: | :---: | :--- |
| **Landlord / Agency Property Listing** | **$0.00 Free** | Property Owner / Agent | Property owners and brokers list houses, commercial bays, and rooms with zero upfront cost. |
| **Direct Landlord Contact Unlock** | **$2.00** (one-off) | Prospective Tenant / Buyer | Paid via EcoCash, InnBucks, or Card to instantly reveal verified landlord contact and WhatsApp link for a specific listing. |

---

## 6. Marketplace Logistics & Waybill Freight Tariffs
*(Calculated during checkout based on the delivery destination. Graniteside Hub self-pickup is always free)*

| Waybill Dispatch Corridor | Tariff (USD) | Coverage Details |
| :--- | :---: | :--- |
| **Graniteside Central Hub Self-Pickup** | **$0.00 Free** | Customer or merchant collects directly at the central fulfillment depot. |
| **Zone 0: Harare Metropolitan Dispatch** | **$5.00** | Greater Harare, Chitungwiza, Ruwa, Norton. |
| **Zone 1: Major Inter-City Corridors** | **$12.00** | Bulawayo, Gweru, Mutare, Masvingo, Kwekwe, Kadoma. |
| **Zone 2: Regional & Cross-Border Hubs** | **$18.00** | Beitbridge, Victoria Falls, Chinhoyi, Kariba, Zvishavane, Gwanda. |

---

## 7. Utility Bill Payments Convenience Fees
*(Automated utility bill settlement fees)*

| Utility Service Provider | Platform Convenience Fee | Notes |
| :--- | :---: | :--- |
| **ZESA Prepaid Electricity Tokens** | **1.5%** platform fee | Surcharge applied to electricity token purchases. |
| **Municipal Water Bills & DStv Subscriptions** | **0.0% (Zero platform surcharge)** | Passed through directly at face value with no markup. |

---

## 8. Statutory Taxes, Commissions & Currency Peg
| Metric | Statutory / Platform Rate | Policy Notes |
| :--- | :---: | :--- |
| **Marketplace Sales Commission** | **0.0% (Zero Commission Guarantee)** | Sadza Connect takes **0% commission** on merchant sales. Buyers pay sellers directly (EcoCash, InnBucks, Cash on Delivery, Bank Transfer). |
| **Zimbabwe Standard VAT** | **15.0%** | Standard VAT applicable to business subscription tax invoices. |
| **Platform Currency Baseline** | **USD ($)** | Primary accounting and settlement currency. |
| **Official Reference Peg** | **1 USD = 26.50 ZiG** | Reference Zimbabwe Gold rate used for dual-display price indications. |

---

## 9. Code Implementation Reference
- Constant definition: `src/lib/constants/pricing.ts` (`PLATFORM_PRICING`)
- API Protection: `src/app/api/v1/settings/route.ts` (Financial pricing update fields stripped)
- Admin Security: `src/app/admin/settings/page.tsx` (Enforced read-only financial schedule)
