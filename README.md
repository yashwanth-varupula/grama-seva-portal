# 🏛️ Grama Seva Portal (గ్రామ సేవ)

> **Official Citizen Governance & Grievance Redressal Platform**  
> Puttagunta Grama Panchayat, Andhra Pradesh

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyashwanth-varupula%2Fgrama-seva-portal)

---

## 🌟 Overview

The **Grama Seva Portal** is a production-grade, citizen-first governance platform optimized for smartphones and handheld devices. It bridges village residents with the Grama Panchayat administration through real-time grievance submission, end-to-end SLA tracking, coordinator task delegation, and transparent public analytics.

---

## 🚀 Key Features

* **📱 Mobile-First ("Phone-Only") UX**: Sticky thumb navigation bar, native complaint cards, auto-zoom prevention for iOS/Android, and 1-tap emergency helplines (1902).
* **🌐 Bilingual Support (English ⇄ తెలుగు)**: Full instant toggle with localized headings, labels, and status badges.
* **🔍 Instant Hero Grievance Tracker**: Citizens can track any grievance without logging in directly from the homepage.
* **📄 Official Stamped PDF Receipts**: Generates authentic Acknowledgment Slips with tracking code, citizen info, timestamp, and SLA commitment via jsPDF.
* **📊 Public Transparency Dashboard**: Real-time KPI counters, department resolution charts, and budget utilization data.
* **🛡️ Role-Based Access Control**:
  * **Super Admin**: System governance, department management, escalation overviews, coordinator assignments.
  * **Department Coordinators** (Welfare, Public Works, Regulation): Status updates, inspection notes, resolution evidence.
  * **Citizens**: File grievances, track status, download PDF receipts, rate resolution quality.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Super Admin** | yashwanthvarupula@gmail.com | dmin123 |
| **Citizen (Likitha Peddireddy)** | peddireddylikitha321@gmail.com | yashwanth |
| **Citizen (Asha Devi)** | sha.devi@grameseva.local | citizen123 |
| **Welfare Coordinator** | welfare.coord@grameseva.local | coord123 |
| **Development Coordinator** | dev.coord@grameseva.local | coord123 |
| **Regulation Coordinator** | eg.coord@grameseva.local | coord123 |

*Note: All roles also have convenient 1-Click Quick Demo buttons directly on the /auth page.*

---

## 🛠️ Tech Stack

- **Framework**: TanStack Start (SSR) + TanStack React Router
- **Build Tool**: Vite 8 + Nitro (Vercel Output Preset)
- **Styling**: Tailwind CSS v4 + Radix UI + Lucide Icons
- **Charts**: Recharts
- **PDF Generation**: jsPDF + jsPDF-AutoTable
- **Database/Auth**: Local Supabase Engine + PostgreSQL schema migrations

---

## ⚡ Local Development

`ash
# Clone the repository
git clone https://github.com/yashwanth-varupula/grama-seva-portal.git
cd grama-seva-portal

# Install dependencies
npm install

# Start development server (Port 3000)
npm run start

# Build for production
npm run build
`

---

## 🌐 Deploy to Vercel

1. Click the **[Deploy with Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyashwanth-varupula%2Fgrama-seva-portal)** button.
2. Connect your GitHub account and import grama-seva-portal.
3. In the Build & Output Settings:
   - **Framework Preset**: Other
   - **Build Command**: 
pm run build
   - **Output Directory**: .vercel/output
4. Click **Deploy**.
