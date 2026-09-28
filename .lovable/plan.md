# Cooling Load Cost Impact vs Actual Savings — 2026 panel

## Verified numbers (from live data, Rawdah series + SCECO bills)

Temperature, May–Aug mean (°C): 2024 = 35.90, 2025 = 36.97 (+1.07), 2026 = 37.52 (+1.63).
Through September: 2024 = 35.48, 2026 = 37.34 → **+1.86°C** (user's 1.4°C is conservative).

Load band (9.7%/°C sensitivity): +1.63°C → ~16% expected extra cooling load (band 13–19%). User's 15% midpoint is consistent.

Money math, May–Aug 2026:
- 2024 baseline kWh: 330,234
- Expected at 15% load impact: 330,234 × 1.15 = **379,769 kWh** → expected extra cost ≈ 49,535 kWh ≈ **15,850 SAR** (at 0.32 SAR/kWh)
- At measured 16%: 382,– kWh → extra ≈ 52,200 kWh ≈ **16,700 SAR**
- Actual 2026 billed: 370,879 kWh
- So despite the heat, usage came in **~11,500–17,000 kWh below** the weather-adjusted expectation → the system is still saving ~3–4% after normalization, and absorbed most of the ~16k SAR heat penalty.

## What gets built

Add a "Cooling Load Cost Impact vs Actual Savings" card on the Savings page (next to YearOverYearNormalized):

1. **Load impact band slider/display**: shows the 2025 precedent (8–14% band at +1.3°C, 12% chosen) and the 2026 equivalent (band computed from measured delta, ~13–19%, midpoint ~15–16%).
2. **Expected Extra Cost line**: 2024 baseline kWh × chosen band % × 0.32 SAR/kWh, for the elapsed 2026 cooling months. Currently ≈ 15,800–16,700 SAR.
3. **Actual vs Expected bar**: expected-with-heat kWh vs actual billed kWh, with the gap labeled "heat absorbed by system".
4. **Net position line**: expected extra cost − actual increase = net savings still being delivered.
5. Methodology note: diagnostic estimate, in-progress until Oct 31; G8 unmetered caveat; locked 2025 KPIs untouched.

## Technical
- New component `CoolingLoadCostImpact.tsx` on SavingsPage; reads `sceco_monthly_bills` + `daily_weather_rawdah` (same queries as YearOverYearNormalized — reuse that data shape).
- Band % = measured delta × 9.7%/°C, clamped to a display band of ±3 pts around midpoint; default midpoint selectable.
- No schema changes, no data writes, no changes to locked figures.
