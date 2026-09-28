# 2026 vs 2025 weather-normalized savings check

## Answer (from the stored bills and Rawdah temperatures)
Summer months (May–Aug) compared with the 2024 baseline, before the system was installed:

| | 2024 baseline | 2025 | 2026 |
|---|---|---|---|
| Avg summer temp (May–Aug) | 35.9°C | 37.1°C (+1.2) | 37.5°C (+1.6) |
| Weather factor | 1.000 | 1.126 (locked) | ~1.158 |
| Expected kWh (2024 × factor) | 330,234 | ~371,900 | ~382,400 |
| Actual SCECO kWh | 330,234 | 315,325 | 370,879 |
| Weather-normalized saving | 0 | ~56,600 kWh (15%) | ~11,500 kWh (3%) |

Month by month in 2026: May saved ~7,500 kWh and August saved ~14,700. June and July came in about 5,000–6,000 kWh **above** what the weather explains.

**Yes, 2026 is still saving after the weather adjustment, but much less than 2025** (about 3% compared with 15%). Heat explains most of the increase in 2026, but not all of it. The leftover increase in June and July points to the unmetered G8 panel (10,000–11,400 kWh a month) and possible unit issues, not the weather.

## What gets added to the app
1. A "2026 vs 2025 weather-normalized" card on the Savings page with the table above. It updates by itself as new bills and temperatures arrive.
2. A month-by-month bar for each year showing saved vs over. Months where usage is above the weather-adjusted expectation are flagged.
3. A note that September and October 2026 are still to come, and that G8 is unmetered and not controlled by the system.

Locked 2025 figures (102,194 kWh / 32,702 SAR / 17.3%) do not change.

## Technical
- New component reads sceco_monthly_bills plus a per-month factor from daily_weather_rawdah: 1 + (month mean − 2024 month mean) × 0.097. Mounted on SavingsPage next to ExpectedVsActualChart.
- No schema changes and no data writes.
