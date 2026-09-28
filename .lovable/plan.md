# Import latest consumption workbook + recheck 2026 savings

Locked KPIs (102,194 kWh / 32,702 SAR / 17.3%), locked_factors, weather factor and Carbon Intel stay unchanged.

## 1. Import
- Read the "CONSUMPTION 2025", "CONSUMPTION 2026" and monthly tabs (May 2025 → September 2026) of the new workbook.
- Per-unit monthly kWh (G1–G7, FF units; G8 kept as derived) and SCECO monthly bill kWh/SAR.
- Compare with what the app already holds; update only months that are new or corrected (upsert by year+month / unit+date). Fill the April 2026 gap if the workbook covers it.
- List every changed number in the reply.

## 2. Recheck savings
- Recompute 2026 in-progress cooling-season factor (May 1 → latest weather day vs same 2024 window).
- Expected 2026 = 2024 monthly kWh × in-progress factor; compare with actual 2026 SCECO kWh through September.
- Report: 2026 year-to-date expected vs actual kWh, weather-normalized kWh and SAR saved, and a full-year projection range (direct + 23,273 SAR indirect).

## 3. App
- Savings "Expected vs Actual" chart and unit history sidebar pick up the new months automatically (they read the same tables); verify visually.

## Technical
- Data writes via SQL upserts into sceco_monthly_bills and daily_unit_readings (monthly rows tagged in notes as "workbook import"), no schema change.
