# Flight Tracker Web App

A lightweight, clean flight-tracking web dashboard built with Next.js, React, Tailwind CSS, and Leaflet. Designed as a free, web-based alternative to apps like Flighty and Flightradar24, allowing users to track single or multiple active flights in real-time.

---

## 🚀 Features

- **Multi-Flight Tracking:** Search and track multiple flights simultaneously.
- **Interactive Map:** Displays current positions of all tracked aircraft (active flight highlighted in blue, inactive in slate gray).
- **Flight Path & Airports:** Automatically fetches departure and arrival airport coordinates to draw active flight paths and airport markers.
- **Live Flight Metrics:** Displays altitude, ground speed, squawk code, aircraft model, scheduled/actual timestamps, terminal/gate info, and baggage belts.
- **LocalStorage Persistence:** Saved flight numbers persist across browser reloads and refresh live status data automatically.
- **Map Interaction:** Click any aircraft directly on the map to switch context to that flight.
- **Secure API Proxy:** API keys are hidden behind a Next.js backend route to prevent client-side exposure.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Styling:** Tailwind CSS, shadcn/ui
- **Mapping:** Leaflet, React-Leaflet, CartoDB Voyager tiles
- **Icons:** Lucide React
- **Data Provider:** AirLabs API (Flight & Airport endpoints)

---

## 📂 Project Structure

```text
├── app/
│   ├── api/
│   │   └── flight/
│   │       └── route.ts       # Server-side API proxy (hides API key, fetches airport coords)
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main Dashboard (handles flight state, localStorage & UI)
├── components/
│   ├── FlightSidebar.tsx      # Flight details sidebar widget (speeds, gates, progress)
│   ├── Map.tsx                # Client-rendered Leaflet map with plane icons & path lines
│   └── ui/                    # shadcn/ui components (Card, Input, Button)
├── .env.local                 # Local environment variables (DO NOT COMMIT)
└── README.md

```

---

## 🔑 Environment Variables Setup

Create a `.env.local` file in the root directory:

```env
AIRLABS_API_KEY=your_airlabs_api_key_here

```

> **Note:** Do NOT prefix this key with `NEXT_PUBLIC_`. Keeping it un-prefixed ensures it stays strictly server-side inside `app/api/flight/route.ts` and never leaks to the browser.

---

## 🏃 Local Development

1. **Install dependencies:**
```bash
npm install

```


2. **Required peer dependencies for mapping:**
If installing manually, ensure you have:
```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet

```


3. **Run the development server:**
```bash
npm run dev

```


4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💡 Key Architectural Notes

### 1. Leaflet & Next.js Server-Side Rendering (SSR)

Leaflet relies on the browser's `window` object. To prevent build errors or SSR crashes, the `Map` component **must** be loaded dynamically on the client side inside `app/page.tsx`:

```tsx
const Map = dynamic(() => import("@/components/Map"), { ssr: false })

```

### 2. How Flight Path Lines Work

AirLabs' live `/flight` endpoint only returns airport IATA codes (e.g., `JFK`, `LHR`), not their latitude/longitude.

To fix this, `app/api/flight/route.ts` intercepts the request and performs two secondary parallel requests to `/airports` to retrieve origin and destination coordinates. This enables the map to construct the complete `[dep -> plane -> arr]` polyline and auto-fit map bounds.

### 3. LocalStorage Key

Tracked flights are stored in the browser under the key:

* `tracked_flight_numbers`

---

## ☁️ Deployment (Netlify)

1. **Push code to GitHub.** Ensure `.env.local` is in your `.gitignore`.
2. **Import repository into Netlify.**
3. **Configure Build Settings:**
* **Build Command:** `npm run build`
* **Publish Directory:** `.next`


4. **Set Environment Variable:**
* Go to **Site Configuration > Environment variables**.
* Add `AIRLABS_API_KEY` with your secret key value.


5. **Deploy.** Netlify's Next.js plugin will automatically host the API proxy route as a serverless function.

---

## 🔮 Future Roadmap Ideas

* **PWA Configuration:** Add a `manifest.json` so the app can be saved to an iOS Home Screen for a native-like experience.
* **In-Flight Offline Estimation Mode:** Cache scheduled departure/arrival times in `localStorage` and calculate predicted flight progress using local device timestamps when offline without Wi-Fi.
* **iOS Shortcuts Integration:** Bridge flight stats to iOS Lock Screen wallpapers using automated HTTP requests.


