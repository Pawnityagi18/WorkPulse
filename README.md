<div align="center">

# ⚡ WorkPulse
### Next-Gen Autonomous Freelance Marketplace & Escrow Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-workpulse--force.vercel.app-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://workpulse-force.vercel.app)
[![Backend Status](https://img.shields.io/badge/Render%20Backend-Active-10b981?style=for-the-badge&logo=render&logoColor=white)](https://workpulse-z287.onrender.com/api/health)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)

<p align="center">
  A production-grade, full-stack freelance platform connecting businesses with top engineering, design, and AI talent worldwide. Features dual-sided Google Gemini 3.6 Flash integration, 100% milestone-based escrow payment architecture, and reverse-proxy cloud routing.
</p>

[Explore Live Demo ➔](https://workpulse-force.vercel.app) · [Report Bug](https://github.com/Pawnityagi18/WorkPulse/issues) · [Request Feature](https://github.com/Pawnityagi18/WorkPulse/issues)

---

</div>

## 🌟 Key Highlights & Core Capabilities

- **🤖 Dual-Engine Generative AI (Google Gemini 3.6 Flash):**
  - **Client-Side:** Instant structured project brief generator (Problem Statement, Solution Scope, Tech Stack, Milestones). Built with custom prompt engineering to eliminate markdown artifacts in plain textareas.
  - **Freelancer-Side:** Context-aware pitch & proposal drafter tailored to the project's exact skill requirements and budget constraints.
- **🛡️ 100% Milestone-Based Escrow Engine:**
  - Automated state machine: `Pending Deposit` ➔ `Funded in Escrow` ➔ `Work Submitted` ➔ `Approved & Released`.
  - Integrated with **Razorpay Checkout** and cryptographically verified webhook signatures.
- **⚡ Dynamic Real-Time Category Aggregations:**
  - Live category job counters calculated on the fly without database table locks.
  - Interactive category cards with smooth auto-scroll to filtered listings.
- **📄 Clean 10-Jobs-Per-Page Pagination:**
  - Client-side slice pagination with active state preservation across category, urgency, and budget filters.
- **🔒 Demo Preview Protection Guardrails:**
  - Dedicated safeguards for demo accounts (1-job post limit, 1-bid limit, and strict delete protections) to preserve showcase integrity for public visitors.

---

## 🏗️ System Architecture & Data Flow

```mermaid
graph TD
    User([User / Browser Client]) -->|HTTPS Traffic| Vercel[Vercel Edge Network - Frontend CDN]
    
    subgraph Frontend [Client Layer - React 19 + Vite]
        Vercel -->|SPA Routing / (.*)| Index[index.html & React Bundle]
        Vercel -->|Proxy Rewrite /api/*| Render[Render Web Service - Node/Express 5]
    end

    subgraph Backend [Server & Microservices Layer]
        Render -->|Reverse Proxy Trust| Auth[JWT Auth & Rate Limiter]
        Render -->|ODM Modeling| Mongo[(MongoDB Atlas Cloud Cluster)]
        Render -->|Native REST Fetch| Gemini[Google AI Studio - Gemini 3.6 Flash]
        Render -->|Order ID & Verification| Razorpay[Razorpay Payments Gateway]
    end

    Auth -->|State Sync| Mongo