# ChronoBody - Interactive Health Future Simulator

ChronoBody is a Progressive Web Application (PWA) built on top of the **Ontomorph Platform**, serving as an interactive "Google Maps for your future health." Rather than looking back at historical clinical records, ChronoBody utilizes Ontomorph's Digital Twin Platform (DTP) and HOLON clinical-knowledge engine to generate predictive, multi-variable simulations of user health outcomes over a 10-year timeline.

---

## 🚀 Key Features

* **AI Onboarding Health Interview:** A conversational intake assistant that extracts medical conditions and prescriptions, querying the HOLON API to map clinical concept entities in real time.
* **Procedural 3D Mannequin Viewer:** An interactive, light-weight 3D model coded with React Three Fiber, highlighting warning organ nodes (Heart, Lungs, Liver, Kidneys, Brain) with pulsating alert glows reflecting physiological health index scores.
* **10-Year Timeline Scrubber:** Snap range controls (Today, 1Y, 3Y, 5Y, 10Y) allowing users to fast-forward biomarker changes.
* **Multi-Variable Scenario Configurator:** Adjust parameters (smoking telemetry, dietary profiles, active indices) to simulate custom biochemical trajectories (`ldl_trajectory`, `hba1c_trajectory`).
* **Side-by-Side Scenario Comparison:** Compare Scenario A (intervention path) vs. Scenario B (risk path) with Recharts trajectory lines, delta counter badges, and comparative delta warnings.
* **Medical SOAP Summaries:** Generates print-ready diagnostic SOAP notes formatted to A4 ratios for clinical audit sign-offs.
* **PWA Caching & Offline Fallbacks:** Background service worker caching for 3D renderers, asset packages, and index structures, with local simulation calculations if offline.

---

## 🛠️ Technology Stack

* **Core Platform:** React 19 + Vite 8 + TypeScript
* **State Management:** Zustand (ephemeral telemetry & chat state) + TanStack React Query (clinical caching)
* **Clinical APIs:** `@ontomorph/holon-client` + client-side `@ontomorph/dtp-sdk` mock engine
* **Database & Auth:** `@supabase/supabase-js` (direct client-side sync)
* **3D Presentations:** `@react-three/fiber` + `@react-three/drei` + `three.js`
* **Animations:** Framer Motion (page transitions, sidebar slides, alert pulses)
* **Visual Telemetry:** Recharts (responsive line charts)
* **CSS Framework:** Tailwind CSS v4 (using `@tailwindcss/vite`)

---

## 📐 System Architecture & Data Layer

```
                        +---------------------------------------+
                        |       React 19 PWA Client (Vite)      |
                        +---------------------------------------+
                                   /                 \
                     (Direct DB Queries)        (Direct API Calls)
                                 /                     \
      +-----------------------------+               +------------------------------+
      |       Supabase Cloud        |               |       Ontomorph HOLON        |
      |   (Users, Twins, Scenarios) |               |  (Concept Mappings, Ranges)  |
      +-----------------------------+               +------------------------------+
```

### Dynamic Syncer (Mock / Live Toggle)
ChronoBody includes a database configuration syncer:
1. **Mock Mode (Default):** Runs the application entirely client-side, persisting data to `localStorage` and running the trajectory simulator locally. This allows you to explore the console immediately with zero configuration.
2. **Live Mode:** Connects directly to the provided Supabase DB URL and publishes clinical entries to the cloud.
*You can easily toggle this database mode inside the **Settings** menu at the top-right of the dashboard.*

---

## 🎨 Design Tokens & Visuals
Aligning with Vercel and Apple Health minimalism, the visual tokens are built around a near-black palette with glowing neon elements:

* **Primary Action:** `hsl(217, 91%, 60%)` (Stripe Blue)
* **Digital Twin Telemetry:** `hsl(188, 86%, 53%)` (Neon Cyan)
* **AI Cognitive Reasoning:** `hsl(250, 95%, 65%)` (Glowing Indigo)
* **Dark Background Canvas:** `hsl(222, 47%, 6%)` (Near-Black)
* **Light Background Canvas:** `hsl(210, 20%, 98%)` (Off-white)

---

## 📦 Installation & Setup

### 1. Clone & Set Environment variables
Create a `.env` file in the root directory and copy the contents from `.env.example`:
```bash
cp .env.example .env
```
Ensure your `VITE_HOLON_API_KEY` is loaded (we have pre-seeded it with a valid test key).

### 2. Install Packages
Install packages using a local cache path to bypass system cache permission errors:
```bash
npm install --cache ./npm-cache
```

### 3. Spin up Development Server
Run the local Vite server:
```bash
npm run dev
```
Open `http://localhost:5173` to interact with the Digital Twin.
