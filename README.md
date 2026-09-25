# CityPulse — Live Civic Health Dashboard

> **One real-time reading for how your neighborhood is doing.**  
> CityPulse synthesizes live weather, air quality, rainfall, transit delay, and community reports into a unified 0–100 **Civic Health Score** for every neighborhood.

---

## 📋 Overview

During extreme weather events, pollution spikes, or local infrastructure failures, residents often find out about hazardous conditions only after encountering them. **CityPulse** bridges this gap by aggregating multiple disparate telemetry feeds into a single, intuitive interface. 

It calculates an active **City Pulse** and **Heartbeat (BPM)** that accelerates as civic strain increases, performs real-time **Z-score anomaly detection** to flag unusual local conditions, and auto-generates plain-language daily briefings for residents and officials alike.

---

## ✨ Key Features

* **Unified Civic Health Score (0–100):** Normalizes incommensurable metrics (AQI, temperature, rainfall, traffic delay, complaint rates) into a single actionable strain index per zone.
* **Dynamic City Heartbeat:** Visualizes city strain through a real-time animated ECG canvas and color gradient that responds dynamically to overall city stress.
* **48-Hour Historical Scrubber & Replay:** Drag to inspect multi-feed correlations, replay historical strain trends, and pinpoint multi-feed spikes over the last two days.
* **Automated Daily Briefings:** Auto-generates plain-language bulletins highlighting the most strained zones, multi-feed coincidences, and recommended resident actions.
* **Interactive GIS Map:** Built with Leaflet, featuring satellite/street view toggling, dark/light themes, and animated GPU-composited pulse markers indicating zone strain.
* **Crowdsourced Community Feeds:** Localized hazard reporting (open sewers, stagnant water, safety advisories) with client-side image compression and local storage support.
* **Custom Threshold Alerts & CSV Export:** Configure custom parameters for AQI, rainfall, and heat to receive browser notifications or export zone telemetry for municipal research.
* **Multi-City Support & Geocoding:** Live weather/air quality fetching for default supported cities or any globally geocoded location.

---

## 🛠️ Tech Stack & Architecture

CityPulse is built as a **serverless, client-side application** designed for maximum availability and zero backend maintenance during emergencies.

* **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+)
* **Mapping & GIS:** [Leaflet.js](https://leafletjs.com/) with CARTO Basemaps & Esri World Imagery
* **Live Environmental Feeds:** [Open-Meteo API](https://open-meteo.com/) (Forecast & Air Quality APIs)
* **Data Persistence:** Client-side `localStorage` (Privacy-first; zero user tracking or backend database required)

---

## 🔬 How the Pipeline Works
