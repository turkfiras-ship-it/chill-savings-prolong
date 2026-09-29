# Alignment Prompt for Second Lovable Project

## Goal
Produce a single copy-paste prompt (delivered in chat, optionally saved as a file) that the user can feed into their other Lovable account so both projects use identical figures, methodology, and data rules.

## What the prompt will contain

### 1. Locked performance KPIs (never recompute)
- 102,194 kWh avoided, 32,702 SAR direct savings (excl. VAT), 17.3% efficiency
- 613,832 kWh baseline, rolling May→Apr study period, TDE Audit 11-MAY-2026
- Indirect savings separate: R&M 10,440 + capital deferral 12,833 = 23,273 SAR; combined recurring 55,975 SAR (~3.1yr payback)
- Peak demand reduction band 33–55%

### 2. Weather normalization methodology
- Official basis: cooling season May 1–Oct 31, mean-temp delta vs 2024 baseline, ×9.7%/°C sensitivity
- Source of record: Rawdah site coordinates (24.7316, 46.7545), ERA5 via Open-Meteo archive; airport (OERK) is diagnostic only
- 2025 locked factor: 1.1262 (data-derived ~1.117 shown beside it)
- 2026 in progress: partial-window apples-to-apples delta, finalizes after Oct 31, 2026; current partial ~+1.8°C / factor ~1.18
- Sol-air adjustment (alpha=0.7, h=25) is an engineering estimate, never locked

### 3. Carbon
- Grid factor 0.651 kgCO₂/kWh (single constant)
- CO₂ avoided = 102,194 × 0.651 = 66.5 tCO₂/yr — separate from CO₂ emitted (consumption × factor)

### 4. Data tables & rules
- daily_weather_rawdah (site weather, daily sync), daily_weather (airport, diagnostic), daily_unit_readings (7 metered SCC units), sceco_monthly_bills (2024 baseline 660,895 kWh loaded), eyedro_readings, locked_factors, unit_alerts
- G8 rule: unmetered, derived = SCECO total − 7 SCC units; excluded from SCC savings comparisons, labeled "derived / uncontrolled"
- 2026 status: Jan–Aug bills 526,468 kWh, ~7.0% calendar-YTD normalized savings; April daily-reading gap; Sep/Oct bills pending

### 5. Presentation rules
- Direct vs indirect savings always separated; 2026 always labeled in-progress; equipment pricing (25k SAR/unit) never shown publicly

## Deliverable
- Write the prompt as a markdown file at `/mnt/documents/alignment-prompt.md` (Files) and also paste it in chat for easy copying.
- No code changes, no database changes, no changes to this project.
