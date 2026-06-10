# My Nest – Real Estate Portal (Monorepo Guide)

A premium client portal and internal management tool for the **"My Nest"** luxury residential project by **Baheti Housing**. 

This monorepo is split into two primary components:
1. **Frontend**: A high-end React 19 (TypeScript, Vite) dashboard application featuring Firebase Auth, Firestore database hooks, and the Gemini AI API.
2. **Backend**: A NestJS REST API using Prisma ORM and PostgreSQL (Neon DB) to manage structured CRM and inventory data.

---

## Table of Contents
1. [Monorepo Directory Structure](#monorepo-directory-structure)
2. [Getting Started (Local Development)](#getting-started-local-development)
   - [Prerequisites](#prerequisites)
   - [1. Backend Setup (NestJS & PostgreSQL)](#1-backend-setup-nestjs--postgresql)
   - [2. Frontend Setup (React & Firebase)](#2-frontend-setup-react--firebase)
3. [Admin Login & Auto-Provisioning Mechanics](#admin-login--auto-provisioning-mechanics)
   - [Pre-approved Admin Emails](#pre-approved-admin-emails)
   - [How Auto-Provisioning Works](#how-auto-provisioning-works)
4. [Frontend React Hooks & Firestore Data Operations](#frontend-react-hooks--firestore-data-operations)
   - [Auth & Profile Listeners](#auth--profile-listeners)
   - [Real-time Firestore Subscriptions](#real-time-firestore-subscriptions)
   - [Write & Update Operations](#write--update-operations)
5. [Connecting Frontend to Backend (NestJS REST API Mapping)](#connecting-frontend-to-backend-nestjs-rest-api-mapping)
   - [Database Structure Alignment](#database-structure-alignment)
   - [API Endpoint Integration Matrix](#api-endpoint-integration-matrix)
   - [Transitioning Frontend to NestJS API](#transitioning-frontend-to-nestjs-api)
6. [Project Specifications & Construction Milestones](#project-specifications--construction-milestones)

---

## Monorepo Directory Structure

```
nest_bahaeti/
├── Backend/                    # NestJS REST API Project
│   ├── prisma/
│   │   └── schema.prisma       # Prisma DB schema for PostgreSQL
│   ├── src/
│   │   ├── users/              # User controllers & services
│   │   ├── leads/              # Lead & CRM controllers & services
│   │   ├── units/              # Real-estate inventory controllers & services
│   │   ├── budget/             # Project finance & budget controllers
│   │   └── main.ts             # Entry point (port 5000)
│   └── package.json
│
├── Frontend/                   # React (Vite) Client Application
│   ├── src/
│   │   ├── components/         # Reusable modals & CRM lists
│   │   ├── services/           # Gemini AI integrations
│   │   ├── firebase.ts         # Firebase initialization & error handlers
│   │   ├── App.tsx             # Main router, landing page, auth state
│   │   ├── Dashboard.tsx       # Core dashboard state & Firestore listeners
│   │   └── data.ts             # Static metadata, config, types
│   └── package.json
│
└── README.md                   # This unified document
```

---

## Getting Started (Local Development)

### Prerequisites
* **Node.js** (v18 or higher)
* **npm** (v9 or higher)
* **PostgreSQL Database** instance (or serverless database like Neon DB)

---

### 1. Backend Setup (NestJS & PostgreSQL)

1. **Navigate to the Backend folder:**
   ```bash
   cd Backend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env` file in the `/Backend` directory and define your database connection string:
   ```env
   DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<dbname>?sslmode=require"
   ```
4. **Push database schemas:**
   Generate the Prisma Client and push models to your PostgreSQL instance:
   ```bash
   npx prisma db push
   ```
5. **Start the development server:**
   The backend runs on `http://localhost:5000` by default:
   ```bash
   npm run start:dev
   ```

---

### 2. Frontend Setup (React & Firebase)

1. **Navigate to the Frontend folder:**
   ```bash
   cd ../Frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env` file in the `/Frontend` directory containing your Gemini API key:
   ```env
   GEMINI_API_KEY=AIzaSy...your_gemini_api_key...
   ```
4. **Start the Vite dev server:**
   The frontend runs on `http://localhost:3000` by default:
   ```bash
   npm run dev
   ```
5. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## Admin Login & Auto-Provisioning Mechanics

To ease local development, testing, and sandbox exploration, the frontend is equipped with **automatic role provisioning** for specific administrative email patterns.

### Pre-approved Admin Emails
If you sign up or log in using any of the following email addresses, the system automatically tags you with the **Admin** role (`r_admin` in frontend mapping, `admin` in database records):
* `admin@nest.com` *(Recommended default test user)*
* `admin@nestbahaeti.com`
* `admin@test.com`
* `admin@tuljaigroup.com`
* `karanph@tuljaigroup.com`

### How Auto-Provisioning Works

1. **Email / Password Sign-In Flow:**
   * Enter a pre-approved admin email (e.g. `admin@nest.com`) and **any password**.
   * If your password is shorter than 6 characters, the frontend automatically pads it with trailing zeros (e.g., `123` becomes `123000`) to satisfy Firebase's 6-character password constraint.
   * If the account **does not exist yet** in Firebase Authentication, the login interface triggers an automatic signup sequence:
     1. Creates the user profile via `createUserWithEmailAndPassword`.
     2. Sets the display name to `"Admin User"`.
     3. Creates a matching database document in the Firestore `users` collection:
        ```json
        {
          "uid": "FIREBASE_UID",
          "email": "admin@nest.com",
          "displayName": "Admin User",
          "role": "admin",
          "createdAt": "SERVER_TIMESTAMP"
        }
        ```
     4. Logs you in immediately.
   * If the account **already exists**, it logs you in using the password specified during your initial login attempt.

2. **Google Single Sign-On (SSO) Flow:**
   * Signing in with Google checks if a document exists in the `users` Firestore collection for that UID.
   * If no document exists, the email address is scanned against the pre-approved list. If matched, it sets the role field to `admin` in Firestore, provisioning admin privileges instantly.

---

## Frontend React Hooks & Firestore Data Operations

The frontend utilizes standard React hooks (`useState`, `useEffect`) and references Firestore SDK real-time listeners and writes to control user dashboards, active deals, inventory plans, and budgeting systems.

### Auth & Profile Listeners

* **Auth State Synchronizer (`App.tsx`):**
  * Uses `useEffect` with Firebase Auth's `onAuthStateChanged` to restore client sessions.
  * When logged in, it retrieves the user doc from Firestore (`users` collection) to map roles:
    * `admin` $\rightarrow$ `r_admin` (Admin)
    * `director` $\rightarrow$ `r_dir` (Director)
    * `advisor` $\rightarrow$ `r_adv` (Sales Advisor)
    * `developer` $\rightarrow$ `r_developer` (Developer)
    * `buyer` $\rightarrow$ `r_buyer` (Buyer)

### Real-time Firestore Subscriptions

All dashboards listen to database collections using Firestore's `onSnapshot` inside `useEffect` blocks:

| Hook / Component File | Firestore Target | Local React State | Description |
| :--- | :--- | :--- | :--- |
| `Dashboard.tsx` | `collection(db, 'users')` | `localUsers` | Syncs full team directory & roles in real-time. |
| `Dashboard.tsx` | `collection(db, 'units')` | `firebaseUnits` | Syncs real-estate inventory layout and bookings. |
| `Dashboard.tsx` | `collection(db, 'leads')` | `localDeals` | Updates active client pipelines, temperatures, and closing probabilities. |
| `DirectorBudgetROI.tsx` | `doc(db, 'project_budgets', selectedProjectId)` | `budget` | Displays construction & finance caps. |
| `DirectorBudgetROI.tsx` | `collection(db, 'expenses')` *filtered* | `expenses` | Pulls expense records for the active project. |
| `DirectorBudgetROI.tsx` | `collection(db, 'budget_history')` *filtered* | `history` | Logs updates made to project budget categories. |
| `InventoryStackPlan.tsx` | `collection(db, 'units')` | `unitsMap` | populates the visual interactive floor-by-floor matrix. |
| `components/MyLeads.tsx` | `collection(db, 'leads')` | `leads` | Filters leads based on roles (all for directors/admins, assigned-only for advisors). |

### Write & Update Operations

User inputs trigger direct Firestore document updates using `setDoc`, `updateDoc`, and `addDoc`:

* **Drag-and-Drop Lead Progression (`Dashboard.tsx`):**
  Updates the lead state in Firestore when moved between pipeline categories (`Lead` $\rightarrow$ `Site Visit` $\rightarrow$ `Negotiation` $\rightarrow$ `Booked` $\rightarrow$ `Lost`).
* **Lead Automations (`Dashboard.tsx`):**
  * Auto-updates probability and sets next actions based on stages.
  * If a deal is moved to `Booked`, it triggers `updateDoc` on the respective unit in the `units` collection to change its status to `"Booked"`.
  * If a deal is marked `Lost`, it releases the linked unit by resetting its status back to `"Available"`.
* **Activity & Notes Logging (`Dashboard.tsx`):**
  Appends new activity entries, timestamps, and author name to the lead's history array in the `leads` collection.
* **Lead Creation Wizard (`components/AddLeadModal.tsx` & `Dashboard.tsx`):**
  Triggers `addDoc` to create a new lead document. Automatically scores leads based on lead source, amount, and purchasing timeline.
* **Inventory Management (`components/UpdateUnitModal.tsx` & `InventoryStackPlan.tsx`):**
  Runs `updateDoc` on `units` to edit base price, facing direction, booking date, token amounts, or assign agents and buyers.
* **Project Budget Control (`DirectorBudgetROI.tsx`):**
  * `setDoc` on `project_budgets` to set or adjust category limits.
  * `addDoc` on `expenses` to record a new payment entry.
  * `addDoc` on `budget_history` to log revision audits.

---

## Connecting Frontend to Backend (NestJS REST API Mapping)

Although the frontend is built to write directly to Firestore for real-time reactivity, the **NestJS Backend** mirrors this schema exactly inside a relational PostgreSQL database. This allows for a clean transition to a centralized SQL-backed REST API.

### Database Structure Alignment

The PostgreSQL database models (defined via Prisma in `Backend/prisma/schema.prisma`) correlate directly to the frontend Firestore models:

* **Firestore `users`** $\leftrightarrow$ **Prisma `User` (`users` table)**
* **Firestore `units`** $\leftrightarrow$ **Prisma `Unit` (`units` table)**
* **Firestore `leads`** $\leftrightarrow$ **Prisma `Lead` (`leads` table)**
* **Firestore `leads/{leadId}/history`** $\leftrightarrow$ **Prisma `LeadHistory` (`lead_history` table)**
* **Firestore `leads/{leadId}/documents`** $\leftrightarrow$ **Prisma `LeadDocument` (`lead_documents` table)**
* **Firestore `project_budgets`** $\leftrightarrow$ **Prisma `ProjectBudget` (`project_budgets` table)** & **`BudgetCategory`**
* **Firestore `expenses`** $\leftrightarrow$ **Prisma `Expense` (`expenses` table)**
* **Firestore `budget_history`** $\leftrightarrow$ **Prisma `BudgetHistory` (`budget_history` table)**

---

### API Endpoint Integration Matrix

The following matrix maps frontend Firestore data calls directly to the NestJS Controller endpoints:

| Frontend Firestore Collection | Frontend Action | Equivalent NestJS Route | Request Body / Payload |
| :--- | :--- | :--- | :--- |
| `users` | Fetch all users | `GET /users` | *None* |
| `users` | Fetch single profile | `GET /users/:id` | *None* |
| `users` | Create user profile | `POST /users` | `{ id, name, email, role, status?, avatar?, assignedAgentId?, reportsTo? }` |
| `users` | Update profile / role | `PUT /users/:id` | `{ name?, email?, role?, status?, assignedAgentId?, reportsTo? }` |
| `users` | Delete user | `DELETE /users/:id` | *None* |
| `leads` | Fetch pipeline leads | `GET /leads` or `GET /leads?assignedTo=:id` | *Optional query filter* |
| `leads` | Fetch lead details | `GET /leads/:id` | *None* |
| `leads` | Add a new CRM lead | `POST /leads` | `{ name, phone?, email?, source?, status?, assignedTo, budget, notes?, temperature?, timeline?, projectId?, unitId?, unitName? }` |
| `leads` | Edit lead status / drag-drop | `PUT /leads/:id` | `{ status?, budget?, temperature?, probability?, nextAction?, timeline?, unitId?, amount? }` |
| `leads` (history array) | Add timeline note | `POST /leads/:id/history` | `{ date, note, author }` |
| `leads` (documents array) | Edit deal document | `POST /leads/:id/documents` | `{ id?, name, type, status, updatedAt, required }` |
| `units` | Fetch interactive matrix | `GET /units` | *None* |
| `units` | Update unit status / price | `PUT /units/:id` | `{ status, price?, bookedBy?, advisorId?, bookedAt?, tokenAmount?, linkedLeadId? }` |
| `project_budgets` | Fetch active budget caps | `GET /budget/project/:projectId` | *None* |
| `project_budgets` | Set category allocations | `POST /budget/project` | `{ projectId, totalCap, categories: [{ name, allocated, color }] }` |
| `expenses` | Fetch log history | `GET /budget/expenses/:projectId` | *None* |
| `expenses` | Log a vendor expense | `POST /budget/expenses` | `{ projectId, categoryId, amount, date, vendor, notes?, status, loggedBy }` |
| `budget_history` | Fetch budget revisions | `GET /budget/history/:projectId` | *None* |
| `budget_history` | Log budget revision | `POST /budget/history` | `{ projectId, action, description, performedBy, previousTotal?, newTotal? }` |

---

### Transitioning Frontend to NestJS API

To disconnect from Firestore and route data operations through the NestJS REST API, follow this pattern:

1. **Install an HTTP Client (optional):**
   ```bash
   npm install axios
   ```
2. **Define a Client-Side API Service (e.g. `src/services/apiService.ts`):**
   Create standard asynchronous fetches pointing to `http://localhost:5000`:
   ```typescript
   import axios from 'axios';

   const API = axios.create({
     baseURL: 'http://localhost:5000',
   });

   export const fetchLeads = async (agentId?: string) => {
     const response = await API.get('/leads', { params: { assignedTo: agentId } });
     return response.data;
   };

   export const updateLeadStatus = async (leadId: string, payload: any) => {
     const response = await API.put(`/leads/${leadId}`, payload);
     return response.data;
   };

   export const updateUnitStatus = async (unitId: string, payload: any) => {
     const response = await API.put(`/units/${unitId}`, payload);
     return response.data;
   };
   ```
3. **Swap Firestore hooks with API queries:**
   Replace the realtime listeners with `useEffect` fetches and trigger API updates:
   ```typescript
   // Inside Dashboard.tsx
   useEffect(() => {
     const loadData = async () => {
       try {
         const data = await fetchLeads(user.roleId === 'r_adv' ? user.id : undefined);
         setLocalDeals(data);
       } catch (err) {
         console.error("Failed to load deals:", err);
       }
     };
     loadData();
   }, [user]);

   // Inside Drop handler
   const handleDrop = async (dealId: string, newStatus: string) => {
     await updateLeadStatus(dealId, { status: newStatus });
     // Re-fetch pipeline...
   };
   ```

---

## Project Specifications & Construction Milestones

The following project information is used by the dashboards and the Gemini AI system to evaluate leads and simulate budget/ROI forecasts:

### Quick Facts
* **Project Name**: My Nest
* **Developer**: Baheti Housing
* **Location**: Beed Bypass Road, near MIT College, Chhatrapati Sambhaji Nagar
* **Total Inventory**: 136 Residences
  * **2 BHK (Premium Space)**: 68 units | 850 sq.ft carpet | Base Price: ₹50 L
  * **3 BHK (Ultra Luxury)**: 68 units | 1200 sq.ft carpet | Base Price: ₹75 L

### Construction Milestones
* **Booking & Plinth**: 25% due (Completed - Dec 2025)
* **Slab 1**: 10% due (Completed - Feb 2026)
* **Slab 6**: 10% due (In Progress - Apr 2026)
* **Slab 12**: 10% due (Pending - Aug 2026)
* **Brickwork**: 15% due (Pending - Nov 2026)
* **Flooring & Finishing**: 20% due (Pending - Feb 2027)
* **Possession**: 10% due (Pending - Jun 2027)

### Amenities Wheel Categories
1. **Recreation & Wellness**: Fitness Center, Yoga & Meditation Deck, Landscaped Gardens.
2. **Modern Convenience**: EV Charging Stations, Co-working Lounge, Dedicated Parking.
3. **Building Facilities**: Premium Grand Lobby, Multi-tier Security, CCTV Surveillance.
4. **Premium Infrastructure**: 100% Power Backup, High-speed Elevators, Rainwater Harvesting.
