# CityPulse

Live civic health dashboard. Static site: `index.html`, `extras.css`, `extras.js`. No build step, no keys.

## Deploy on GitHub Pages
1. Create a public repo and upload all three files (plus this README) to the root.
2. Settings > Pages > Source: "Deploy from a branch", branch `main`, folder `/ (root)`. Save.
3. Wait about a minute. Your site is at `https://YOUR-USERNAME.github.io/REPO-NAME/`.

## Guided walkthrough (built in)
Sidebar > **Take the tour** (untimed, for visitors) or **Timed demo** (presenter mode).
It follows the presentation slide by slide. Each step highlights the part of the app that slide is about, says what you are looking at, explains how it is coded ("Under the hood"), and shows a **live worked example** computed from the data on screen. "Try it" buttons perform the demo action and undo it when you move on. Keys: `→` next, `←` back, `Esc` close.

| Step | Slide | Where it goes | Try it |
|---|---|---|---|
| 1 | 2 Architecture | Method > pipeline | (shows hosts contacted and what is in localStorage) |
| 2 | 3 Live ingestion | Dashboard header, badge | (shows live / modelled / simulated feeds) |
| 3 | 4 Fault tolerance | Feed outage buttons | Switch off Air quality |
| 4 | 5 Normalisation and score | Map layer buttons | Colour map by Air / Rain (worked score example) |
| 5 | 6 Z-score anomalies | Zone Telemetry | Jump to the biggest spike |
| 6 | 7 Global reach | Cities search | Search "Oslo", open it |
| 7 | 8 Heartbeat | Hero card | Calmest / most stressed moment (pulse to bpm to colour) |
| 8 | 9 Animation and Leaflet | Map | Satellite, dark theme |
| 9 | 10 48-hour scrubber | Timeline | Jump to worst moment, play |
| 10 | 11 Community (reports) | Hygiene reports | Filter, top voted |
| 11 | 11 Community (check-ins) | Community | Check in, share pulse card |
| 12 | 12 Live desk | Live desk | (shows which of the 5 feeds responded) |
| 13 | 13 Briefing | Briefing | Copy briefing |
| 14 | 13 Alerts and CSV | Alerts | Tighten AQI alert, download CSV |

**Timed demo:** the clock starts when you press "Start the clock" and shows elapsed time against the plan for each step ("on pace", "0:20 behind"). Choose a 7 or 8 minute slot on the first screen. To change the default, edit `TALK0` (seconds) in `index.html`; per-step budgets are the `w` weights on each step and are scaled to fit.

## 60-second demo path (without the walkthrough)
Dashboard (heartbeat, drag the 48h scrubber) > Cities (live ranking, search your own city) > Live desk > Community (check in, share card).
