import React, { createContext, useContext, useState, ReactNode } from "react";
import { energyCostSummary } from "@/data/rawdahAnalysis";
import { systemConfig, energySavings, downtimeSavings, maintenanceSavings } from "@/data/roiCalculations";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EditableBills {
  totalBill2023: number;
  totalBill2024: number;
  totalBill2025: number;
}

export interface EditableSystemConfig {
  numberOfUnits: number;
  costPerUnit: number;   // selling price
  internalCost: number;
  normalLifespan: number;
  extendedLifespan: number;
  roiTargetYears: number;
}

export interface EditableEnergySavings {
  annualSavingsRawdah: number; // direct YoY SAR (6,649)
  rawdahVsRubenSavings: number;
  rawdahVsRubenPercent: number;
}

export interface EditableMaintenanceItem {
  category: string;
  withoutSystem: number;
  withSystem: number;
  annualSavings: number;
}

export interface EditableDowntime {
  hoursWithout: number;
  hoursWith: number;
  hourlyRevenueLoss: number;
}

export interface EditableACReplacement {
  minCostPerUnit: number;
  maxCostPerUnit: number;
  avgCostPerUnit: number;
}

export interface EditableDataState {
  bills: EditableBills;
  systemCfg: EditableSystemConfig;
  energySav: EditableEnergySavings;
  maintenanceItems: EditableMaintenanceItem[];
  downtime: EditableDowntime;
  acReplacement: EditableACReplacement;
  trueSavings: number; // weather-adjusted (ROI 2)
  expectedBill2025: number; // weather-normalized baseline
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface EditableDataContextValue {
  data: EditableDataState;
  update: <K extends keyof EditableDataState>(key: K, value: EditableDataState[K]) => void;
  updateNested: <K extends keyof EditableDataState, NK extends keyof EditableDataState[K]>(
    key: K, nestedKey: NK, value: EditableDataState[K][NK]
  ) => void;
  updateMaintenanceItem: (index: number, field: keyof EditableMaintenanceItem, value: number) => void;
  isEditMode: boolean;
  toggleEditMode: () => void;
  // Derived calculations
  derived: ReturnType<typeof computeDerived>;
}

const EditableDataContext = createContext<EditableDataContextValue | null>(null);

// ─── Derived Calculations ────────────────────────────────────────────────────

function computeDerived(data: EditableDataState) {
  const { bills, systemCfg, energySav, maintenanceItems, downtime, acReplacement } = data;

  const totalSystemCost = systemCfg.numberOfUnits * systemCfg.costPerUnit;
  const totalInternalCost = systemCfg.numberOfUnits * systemCfg.internalCost;
  const totalProfit = totalSystemCost - totalInternalCost;
  const grossMarginPct = ((systemCfg.costPerUnit - systemCfg.internalCost) / systemCfg.costPerUnit) * 100;

  const maintenanceTotal = maintenanceItems.reduce((s, i) => s + i.annualSavings, 0);
  const downtimeSavingsAnnual = (downtime.hoursWithout - downtime.hoursWith) * downtime.hourlyRevenueLoss;

  const annualOperationalSavings = energySav.annualSavingsRawdah + maintenanceTotal + downtimeSavingsAnnual;

  // Payback calculated ONLY from Direct Energy Performance Savings
  const energyOnlySavings = energySav.annualSavingsRawdah;
  const paybackYears = energyOnlySavings > 0 ? totalSystemCost / energyOnlySavings : 0;
  const paybackMonths = paybackYears * 12;

  // Replacement savings
  const replacementAvg = systemCfg.numberOfUnits * acReplacement.avgCostPerUnit;
  const replacementMin = systemCfg.numberOfUnits * acReplacement.minCostPerUnit;
  const replacementMax = systemCfg.numberOfUnits * acReplacement.maxCostPerUnit;
  const replacementAnnualized = replacementAvg / 30;
  const replacementFiveYearProrated = replacementAvg * 0.5;

  const fiveYearOp = annualOperationalSavings * systemCfg.roiTargetYears;
  const fiveYearTotal = fiveYearOp + replacementFiveYearProrated;
  const fiveYearNet = fiveYearTotal - totalSystemCost;
  const fiveYearROI = ((fiveYearTotal - totalSystemCost) / totalSystemCost) * 100;

  const tenYearOp = annualOperationalSavings * 10;
  const tenYearTotal = tenYearOp + replacementAvg;
  const tenYearNet = tenYearTotal - totalSystemCost;
  const tenYearROI = ((tenYearTotal - totalSystemCost) / totalSystemCost) * 100;

  // YoY bill
  const yoyChangeSAR = bills.totalBill2024 - bills.totalBill2025;
  const yoyChangePct = bills.totalBill2024 > 0 ? (yoyChangeSAR / bills.totalBill2024) * 100 : 0;
  const yoy2024ChangeSAR = bills.totalBill2024 - bills.totalBill2023;
  const yoy2024ChangePct = bills.totalBill2023 > 0 ? (yoy2024ChangeSAR / bills.totalBill2023) * 100 : 0;

  return {
    totalSystemCost,
    totalInternalCost,
    totalProfit,
    grossMarginPct,
    maintenanceTotal,
    downtimeSavingsAnnual,
    annualOperationalSavings,
    paybackYears,
    paybackMonths,
    replacementAvg,
    replacementMin,
    replacementMax,
    replacementAnnualized,
    replacementFiveYearProrated,
    fiveYearOp,
    fiveYearTotal,
    fiveYearNet,
    fiveYearROI,
    tenYearOp,
    tenYearTotal,
    tenYearNet,
    tenYearROI,
    yoyChangeSAR,
    yoyChangePct,
    yoy2024ChangeSAR,
    yoy2024ChangePct,
    monthlyOperationalSavings: annualOperationalSavings / 12,
    totalAnnualSavingsWithReplacement: annualOperationalSavings + replacementAnnualized,
  };
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: EditableDataState = {
  bills: {
    totalBill2023: energyCostSummary.totalBill2023,
    totalBill2024: energyCostSummary.totalBill2024,
    totalBill2025: energyCostSummary.totalBill2025,
  },
  systemCfg: {
    numberOfUnits: systemConfig.numberOfUnits,
    costPerUnit: systemConfig.sellingPrice,
    internalCost: systemConfig.internalCost,
    normalLifespan: 10,
    extendedLifespan: 15,
    roiTargetYears: systemConfig.roiTargetYears,
  },
  energySav: {
    annualSavingsRawdah: energySav_init(),
    rawdahVsRubenSavings: energySavings.rawdahVsRubenSavings,
    rawdahVsRubenPercent: energySavings.rawdahVsRubenPercent,
  },
  maintenanceItems: maintenanceSavings.map(m => ({
    category: m.category,
    withoutSystem: m.withoutSystem,
    withSystem: m.withSystem,
    annualSavings: m.annualSavings,
  })),
  downtime: {
    hoursWithout: downtimeSavings.averageDowntimeHoursWithout,
    hoursWith: downtimeSavings.averageDowntimeHoursWith,
    hourlyRevenueLoss: downtimeSavings.hourlyRevenueLoss,
  },
  acReplacement: {
    minCostPerUnit: 45000,
    maxCostPerUnit: 65000,
    avgCostPerUnit: 55000,
  },
  trueSavings: 35457,
  expectedBill2025: 246431,
};

function energySav_init() {
  // True adjusted savings: 35,457 SAR (conservative presentation, bill-verified + weather-adjusted)
  // This is the correct energy savings basis for ROI calculations
  return energySavings.annualSavingsRawdah; // 35,457 SAR
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function EditableDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<EditableDataState>(initialState);
  const [isEditMode, setIsEditMode] = useState(false);

  const update = <K extends keyof EditableDataState>(key: K, value: EditableDataState[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const updateNested = <K extends keyof EditableDataState, NK extends keyof EditableDataState[K]>(
    key: K, nestedKey: NK, value: EditableDataState[K][NK]
  ) => {
    setData(prev => ({
      ...prev,
      [key]: { ...(prev[key] as object), [nestedKey]: value },
    }));
  };

  const updateMaintenanceItem = (index: number, field: keyof EditableMaintenanceItem, value: number) => {
    setData(prev => {
      const items = [...prev.maintenanceItems];
      items[index] = { ...items[index], [field]: value };
      // Auto-recalculate annualSavings when withoutSystem or withSystem changes
      if (field === 'withoutSystem' || field === 'withSystem') {
        items[index].annualSavings = items[index].withoutSystem - items[index].withSystem;
      }
      return { ...prev, maintenanceItems: items };
    });
  };

  const toggleEditMode = () => setIsEditMode(prev => !prev);

  const derived = computeDerived(data);

  return (
    <EditableDataContext.Provider value={{ data, update, updateNested, updateMaintenanceItem, isEditMode, toggleEditMode, derived }}>
      {children}
    </EditableDataContext.Provider>
  );
}

export function useEditableData() {
  const ctx = useContext(EditableDataContext);
  if (!ctx) {
    // During HMR or module reload the provider may momentarily be absent.
    // Return a safe fallback so components don't crash.
    const fallback: EditableDataContextValue = {
      data: initialState,
      update: () => {},
      updateNested: () => {},
      updateMaintenanceItem: () => {},
      isEditMode: false,
      toggleEditMode: () => {},
      derived: computeDerived(initialState),
    };
    return fallback;
  }
  return ctx;
}
