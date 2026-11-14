# ShopPulse — AI Voice Receptionist & Hyper-Local Geofence Promo Radar

> **Built at Hack The Nest (Eastern Michigan University)**  
> Turning missed phone calls and drive-by foot traffic into instant revenue for local brick-and-mortar businesses.

---

## 🔗 Quick Project Links
* **CS Teammate Builder Guide (Geofence Radar & Pulse Engine):** [Open Google Doc](https://docs.google.com/document/d/1o1BuYxkgCvHouZmY6uvg5HyTJr_-4ebZ_-66Itc8DE0/edit)
* **Team Sprint & Task Tracker:** [Open Google Sheet](https://docs.google.com/spreadsheets/d/1kPJnacgZfabObXnEmCGb8-SYCHCbKzEwwQ-ta8etoo/edit?usp=sharing)
* **Live Merchant App (Base44):** `[Add Base44 Public URL After Kickoff]`
* **Live Consumer Radar (`/radar`):** `[Add Live Radar URL After Kickoff]`

---

## 💡 What Is ShopPulse?
Local service businesses—like independent auto repair shops, cafés, and salons—lose thousands of dollars every month from **missed phone calls while staff are busy** and **slow afternoon hours with empty bays or tables**. 

**ShopPulse** is an all-in-one B2B revenue recovery and hyper-local customer acquisition hub that works in three synchronized steps:
1. **AI Voice Receptionist & Countertop Dispatch (Tab 1):** When a customer calls while the shop is busy, a natural-sounding AI voice agent answers immediately, diagnoses the issue, books the appointment, and pushes a structured **Technician Brief Card** with an audible chime onto the shop's dashboard.
2. **Dynamic GPS Drive-By Geofence Radar (Tab 2 & `/radar`):** During slow hours, the shop owner drags a radius slider (`1–15 miles`), types a flash promo, and hits **Activate Pulse**—lighting up a live GPS geofence ring on nearby drivers' phones and blasting an instant SMS offer to past walk-in subscribers.
3. **Customizable Counter VIP Pass (Tab 3 & `/redeem`):** A countertop QR code lets walk-in customers opt into live service text updates or zero-margin perks (such as free fluid top-offs or priority wait-list alerts) without forcing the shop owner to discount their services.

---

## ⚙️ System Architecture & Tech Stack

| Layer | Technology | Role in ShopPulse |
| :--- | :--- | :--- |
| **Merchant Hub & UI** | **Base44** | Hosts the 3-tab merchant dashboard (*Answered Calls*, *Pulse Radar*, *Counter QR*) and live campaign state. |
| **Conversational Voice AI** | **Vapi + ElevenLabs** | Handles inbound customer phone calls with low-latency, human-like speech synthesis and structured data extraction. |
| **Automation & Webhooks** | **Make.com + Twilio** | Routes call summaries into Base44 in real time and dispatches automated Twilio SMS flash alerts when a Pulse is triggered. |
| **Interactive Geofence Map** | **Leaflet.js / Mapbox GL JS** | Renders the live consumer `/radar` map, dynamic mile-radius circle, distance detection, and one-tap Google Maps directions. |
| **Live State Sync** | **Base44 DB / Supabase** | Synchronizes `is_active`, `radius_miles`, and `offer_text` between the shop dashboard and mobile `/radar` clients. |

---

## 🧩 Shared JSON Data Contract (For Teammates)
To keep the merchant dashboard and the consumer `/radar` frontend cleanly decoupled, all components read and write this shared state payload:

```json
{
  "shop_name": "Apex Auto Care",
  "shop_lat": 42.2492,
  "shop_lng": -83.6144,
  "is_active": true,
  "radius_miles": 3.0,
  "offer_text": "\$15 Off Synthetic Oil Change — Valid Next 2 Hours"
}
