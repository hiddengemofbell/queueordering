# 📖 Queue Calling System: System Documentation & Operating Guide

> **Document Purpose**: Comprehensive system information, operational instructions, architectural specifications, and client onboarding guide for the Queue Calling & Customer TV Display Board System.

---

## 📌 1. System Overview

The **Queue Calling & Customer Display System** is a lightweight, high-performance Progressive Web Application (PWA) designed for store cashiers, kitchens, and customer waiting areas. It enables staff to call order numbers seamlessly while broadcasting real-time visual and audio notifications to a dedicated TV display board.

### **Key Technical Highlights**
- **Architecture**: Single Page Application (SPA) built with pure HTML5, CSS3, and modern JavaScript ES6+. No backend/server required in production — the site is served as static files on Vercel.
- **Real-Time Synchronization**: Instant sync between the Staff Control Panel and Customer TV Display via cross-tab `BroadcastChannel` + `localStorage`. This assumes both screens are open in the same browser on the same computer (e.g. a TV connected as an extended/mirrored display) — it does not sync across separate physical devices.
- **Offline PWA Capability**: Web App Manifest (`manifest.json`) and Service Worker caching (`sw.js`) allowing installation on iPads, Android tablets, and PCs with full offline functionality.
- **Client-Side Storage**: Fast `localStorage` persistence with zero backend setup.
- **Voice & Chime Alerts**: Web Audio API two-tone chime plus a spoken "Order number X is now ready" announcement (Web Speech API) whenever an order becomes ready, with a manual 🔔 recall button per ready order to repeat the call.

---

## 🌐 2. Deployment Links & Access Points

| Component | Production URL (Vercel Cloud) | Local Server URL (Offline Mode) |
| :--- | :--- | :--- |
| **🛠️ Staff Control Panel** | [https://queueordering-4uzp2z9xa-elledev.vercel.app/](https://queueordering-4uzp2z9xa-elledev.vercel.app/) | `http://localhost:3000/index.html` |
| **📺 Customer Display Board** | [https://queueordering-4uzp2z9xa-elledev.vercel.app/customer.html](https://queueordering-4uzp2z9xa-elledev.vercel.app/customer.html) | `http://localhost:3000/customer.html` |

---

## ✨ 3. Complete Feature Breakdown

### 🛠️ **Staff Control Panel (`index.html`)**
- **Numeric Keypad & Keyboard Entry**: Input order numbers with automatic 4-digit zero-padding (e.g. `1` → `#0001`).
- **Unique Order ID Validation**: Automatically blocks duplicate order creation if an order number currently exists in active queues or the history log.
- **Interactive Card Management**:
  - Tap **"⏳ Add to Preparing"** → Places order into *Preparing Order*.
  - Tap card or **"🔔 Mark Order Ready"** → Moves order into *Order Ready*.
  - Tap ready card → Completes order (*✅ Processed Done*).
- **Audio Chime Toggle (🔔)**: Web Audio API two-tone chime notification with ON/OFF switch.
- **Live Clock**: Tabular real-time digital clock in header.

---

### 🎛️ **Dual Independent Theme Controls**
- **`🛠️ Staff: ☀️ Light / 🌙 Dark`**: Toggles theme for the Staff interface independently.
- **`📺 TV: ☀️ Light / 🌙 Dark`**: Remotely controls the Customer Display Board theme from the staff header in real time.

---

### 📺 **Customer TV Display Board (`customer.html`)**
- **Clean TV View**: Large, high-contrast columns displaying **Preparing Order** and **Order Ready**.
- **Tamper-Proof Interface**: No staff buttons or popups rendered, keeping the public TV display clean.
- **Automated Sound & Glow Animations**: Plays audio chime (🔔) and triggers green pulsing glow animation when orders become ready.

---

### 📜 **Order History Log & Analytics**
- **3 Lifecycle Categories**: Tracks *⏳ Prepared*, *🔔 Ready*, and *✅ Processed Done* with exact time and date.
- **Filter Tabs**: Quick views for `All`, `⏳ Prepared`, `🔔 Ready`, and `✅ Processed Done`.
- **Real-Time Search Bar**: Search logs instantly by order number (e.g. `0001`), action, time, or date.
- **Circular Button Pagination (`« ‹ 1 2 3 ... 18 › »`)**: Styled circular controls automatically set to 50 items per page.
- **Capacity Indicator & 200-Entry Trimming**: Live counter (`X / 200 logs`) with automatic trimming of oldest overflow logs past 200 items.
- **📥 CSV Export & Custom Modal**: 1-click CSV download for Excel/Spreadsheets and custom-styled **Clear Log** confirmation popup modal.

---

## 📱 4. Client Onboarding & Setup Instructions

> **Important**: The Staff Control Panel and Customer TV Display must run in the **same browser on the same computer** — e.g. one PC with the TV connected as an extended or mirrored second monitor. They sync via `BroadcastChannel`/`localStorage`, which only works within one browser instance, not across separate devices on the network.

### **A. Setting Up the Staff Control Panel (PC)**
1. On the PC driving both screens, open the Staff link: `https://queueordering-4uzp2z9xa-elledev.vercel.app/`
2. **Install as App (PWA)** (optional): Chrome/Edge **3 Dots** menu → **"Install App"**.
3. Use the numeric keypad to type an order number and press **"⏳ Add to Preparing"**.

### **B. Setting Up the Customer TV Display (Extended/Mirrored Screen)**
1. Connect the TV to the same PC as a second monitor (HDMI cable, wireless display adapter, or screen mirroring) and extend the desktop onto it.
2. In the same browser, open a second window on the TV link:
   `https://queueordering-4uzp2z9xa-elledev.vercel.app/customer.html`
3. Drag that window onto the TV's screen and press **F11** for fullscreen.
4. Make sure TV volume is turned on for the ready chime and voice announcement.

---

## ⚙️ 5. Technical Architecture & Communication Flow

```
┌─────────────────────────────┐                  ┌─────────────────────────────┐
│    Staff Control Panel      │                  │    Customer TV Display      │
│      (index.html)           │                  │       (customer.html)       │
│   Browser Window / Tab 1    │                  │    Browser Window / Tab 2   │
└──────────────┬──────────────┘                  └──────────────▲──────────────┘
               │                                                │
               │        Same browser, same computer             │
               ▼                                                │
┌───────────────────────────────────────────────────────────────┴─────────────┐
│                    Client-Side Sync (No Backend)                            │
│   • BroadcastChannel ('queue_channel') — instant cross-tab push             │
│   • localStorage + 'storage' event — fallback / state persistence          │
└─────────────────────────────────────────────────────────────────────────────┘
```

Because sync is entirely client-side, the app works flawlessly on Vercel's static hosting with no server component in production — `server.js` is only used for local development (`node server.js`).

### **Data Persistence Schema (`localStorage`)**
- `queueState`: `{ preparing: [{ num, timeStr }], ready: [{ num, timeStr }] }`
- `queueHistory`: `[{ id, num, stage, action, timestamp, dateStr }]` (Max 200 items)
- `staffTheme`: `'light' | 'dark'`
- `customerTheme`: `'light' | 'dark'`

---

## 🛠️ 6. Frequently Asked Questions (FAQ)

#### **Q1: Does the computer or laptop need to stay turned on?**
**No.** Vercel cloud servers host the app 24/7 for free. Your laptop can be powered off completely.

#### **Q2: Why is the history log capped at 200 entries?**
Capping at 200 records prevents browser storage quota crashes (`5 MB localStorage limit`), keeps rendering ultra-fast (< 1ms), and ensures smooth performance on low-end tablets and Smart TVs.

#### **Q3: Can order numbers be recycled (e.g. starting back at `#0001` every morning)?**
**Yes.** Once an old order number trims past the 200-entry history limit (or if history is cleared), its number is automatically freed up for your next shift or sales cycle.

#### **Q4: What happens if internet drops?**
The Progressive Web App (PWA) caches all core files locally via Service Worker (`sw.js`). Staff can continue calling orders offline, and multi-tab browser sync will continue working seamless via `BroadcastChannel`.
