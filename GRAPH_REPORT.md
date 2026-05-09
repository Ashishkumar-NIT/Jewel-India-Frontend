# Graph Report - .  (2026-04-29)

## Corpus Check
- Large corpus: 218 files · ~698,925 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 472 nodes · 401 edges · 24 communities detected
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 82 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Core App Routes & API Endpoints|Core App Routes & API Endpoints]]
- [[_COMMUNITY_Platform Overview & Image Pipeline|Platform Overview & Image Pipeline]]
- [[_COMMUNITY_Database Schema & Referral System|Database Schema & Referral System]]
- [[_COMMUNITY_Wholesaler Onboarding Context|Wholesaler Onboarding Context]]
- [[_COMMUNITY_Retailer Onboarding Context|Retailer Onboarding Context]]
- [[_COMMUNITY_Auth & Deployment Setup|Auth & Deployment Setup]]
- [[_COMMUNITY_Jewelry Product Cards (SVG)|Jewelry Product Cards (SVG)]]
- [[_COMMUNITY_Products API Client|Products API Client]]
- [[_COMMUNITY_Auth Callback & Design Routes|Auth Callback & Design Routes]]
- [[_COMMUNITY_Admin API Routes|Admin API Routes]]
- [[_COMMUNITY_Employee Dashboard Components|Employee Dashboard Components]]
- [[_COMMUNITY_Retailer Dashboard Components|Retailer Dashboard Components]]
- [[_COMMUNITY_Product Upload Components|Product Upload Components]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 126|Community 126]]
- [[_COMMUNITY_Community 139|Community 139]]

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 46 edges
2. `Retailer and Employee Expansion Plan` - 14 edges
3. `signIn()` - 6 edges
4. `pollForResult()` - 6 edges
5. `useOnboard()` - 5 edges
6. `useRetailerOnboard()` - 5 edges
7. `signOut()` - 5 edges
8. `Supabase Authentication` - 5 edges
9. `Products Database Table` - 5 edges
10. `Jewel India B2B Jewelry Platform` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Authentication Page Image` --conceptually_related_to--> `Supabase Authentication`  [INFERRED]
  public/image/authImg.png → AUTH_SETUP.md
- `Bangles Product Category Image` --conceptually_related_to--> `Products Database Table`  [INFERRED]
  public/image/bangles.png → imageProcess.md
- `Earrings Product Category Image` --conceptually_related_to--> `Products Database Table`  [INFERRED]
  public/image/earrings.png → imageProcess.md
- `Jewel India Logo` --conceptually_related_to--> `Jewel India B2B Jewelry Platform`  [INFERRED]
  public/jewelLogo.svg → README.md
- `Bangles Product Category Image` --conceptually_related_to--> `Jewel India B2B Jewelry Platform`  [INFERRED]
  public/image/bangles.png → README.md

## Communities

### Community 0 - "Core App Routes & API Endpoints"
Cohesion: 0.03
Nodes (45): getRetailerDestination(), getWholesalerDestination(), onboardSignOut(), roleDestination(), signIn(), signOut(), signUp(), terminalUserExit() (+37 more)

### Community 1 - "Platform Overview & Image Pipeline"
Cohesion: 0.16
Nodes (18): Bangles Product Category Image, Earrings Product Category Image, Hero Frame Background Image, AI Jewellery Image Pipeline Guide, Four AI-Generated Image Variants, Jewel India B2B Jewelry Platform, Jewel India Logo, KYC Document Verification (+10 more)

### Community 2 - "Database Schema & Referral System"
Cohesion: 0.23
Nodes (15): Employee-Wholesaler Chat System, Conversations Database Table, Employee Credentials Auto-Generation, Employee Dashboard, Employees Database Table, Retailer and Employee Expansion Plan, Messages Database Table, Referral Links Database Table (+7 more)

### Community 4 - "Wholesaler Onboarding Context"
Cohesion: 0.18
Nodes (5): useOnboard(), Step1Container(), Step2Container(), Step3Container(), Step3Footer()

### Community 5 - "Retailer Onboarding Context"
Cohesion: 0.18
Nodes (5): useRetailerOnboard(), RetailerStep1Container(), RetailerStep2Container(), RetailerStep3Container(), RetailerStep3Footer()

### Community 6 - "Auth & Deployment Setup"
Cohesion: 0.27
Nodes (10): Authentication Page Image, Authentication Setup Plan, Deployment Guide, FastAPI CORS Configuration, Google OAuth Provider, Next.js App Router Framework, Profiles Database Table, Railway Backend Hosting (+2 more)

### Community 7 - "Jewelry Product Cards (SVG)"
Cohesion: 0.4
Nodes (10): Mangalsutra Necklace Product, Mangalsutra Product Card SVG, Necklace Product, Necklace Product Card SVG, Nose Pins Product, Nose Pins Product Card SVG, Pendants Product, Pendants Product Card SVG (+2 more)

### Community 8 - "Products API Client"
Cohesion: 0.5
Nodes (7): getProduct(), pollForResult(), probeUrl(), processJewelleryImage(), reveUrl(), sleep(), uploadProduct()

### Community 9 - "Auth Callback & Design Routes"
Cohesion: 0.32
Nodes (5): GET(), proxy(), getRetailerDestination(), getWholesalerDestination(), updateSession()

### Community 10 - "Admin API Routes"
Cohesion: 0.47
Nodes (3): fmt(), fmtDate(), ProductDetailModal()

### Community 11 - "Employee Dashboard Components"
Cohesion: 0.5
Nodes (2): DELETE(), PATCH()

### Community 12 - "Retailer Dashboard Components"
Cohesion: 0.5
Nodes (3): OtpForm(), formatTime(), MessageBubble()

### Community 14 - "Product Upload Components"
Cohesion: 0.5
Nodes (1): SentryExampleAPIError

### Community 15 - "Community 15"
Cohesion: 0.67
Nodes (2): DesignCard(), formatDate()

### Community 16 - "Community 16"
Cohesion: 0.67
Nodes (2): formatWeight(), ProductCard()

### Community 17 - "Community 17"
Cohesion: 0.5
Nodes (1): SentryExampleFrontendError

### Community 18 - "Community 18"
Cohesion: 0.5
Nodes (2): ChatWindow(), useRealtimeMessages()

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (2): buildReferralCode(), POST()

### Community 22 - "Community 22"
Cohesion: 0.67
Nodes (1): OrdersPage()

### Community 23 - "Community 23"
Cohesion: 0.67
Nodes (1): Loading()

### Community 24 - "Community 24"
Cohesion: 0.67
Nodes (1): SuccessPage()

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (2): formatWeight(), ProductInfoModal()

### Community 126 - "Community 126"
Cohesion: 1.0
Nodes (2): Hero Frame Decorative Element, Hero Frame PNG Decorative Element

### Community 139 - "Community 139"
Cohesion: 1.0
Nodes (1): Vector Graphic Asset

## Knowledge Gaps
- **13 isolated node(s):** `Google OAuth Provider`, `React Hooks Optimization`, `Jewel India Logo`, `Authentication Page Image`, `Hero Frame Background Image` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Employee Dashboard Components`** (5 nodes): `route.js`, `route.js`, `route.js`, `DELETE()`, `PATCH()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Product Upload Components`** (4 nodes): `route.js`, `GET()`, `SentryExampleAPIError`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (4 nodes): `EmployeeDesignsClient.jsx`, `DesignCard()`, `EmployeeDesignsClient()`, `formatDate()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (4 nodes): `WholesalerGalleryClient.jsx`, `formatWeight()`, `ProductCard()`, `WholesalerGalleryClient()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (4 nodes): `page.jsx`, `Page()`, `SentryExampleFrontendError`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (4 nodes): `ChatWindow()`, `ChatWindow.jsx`, `useRealtimeMessages()`, `useRealtimeMessages.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (3 nodes): `route.js`, `buildReferralCode()`, `POST()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (3 nodes): `page.jsx`, `page.jsx`, `OrdersPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (3 nodes): `loading.jsx`, `loading.jsx`, `Loading()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (3 nodes): `page.jsx`, `page.jsx`, `SuccessPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (3 nodes): `ProductInfoModal.jsx`, `formatWeight()`, `ProductInfoModal()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 126`** (2 nodes): `Hero Frame Decorative Element`, `Hero Frame PNG Decorative Element`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 139`** (1 nodes): `Vector Graphic Asset`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `Core App Routes & API Endpoints` to `Auth Callback & Design Routes`, `Employee Dashboard Components`, `Community 21`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `GET()` connect `Auth Callback & Design Routes` to `Core App Routes & API Endpoints`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Are the 45 inferred relationships involving `createClient()` (e.g. with `POST()` and `POST()`) actually correct?**
  _`createClient()` has 45 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `useOnboard()` (e.g. with `Step1Container()` and `Step2Container()`) actually correct?**
  _`useOnboard()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Google OAuth Provider`, `React Hooks Optimization`, `Jewel India Logo` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Core App Routes & API Endpoints` be split into smaller, more focused modules?**
  _Cohesion score 0.03 - nodes in this community are weakly interconnected._
- **Should `Orders Client Component` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._