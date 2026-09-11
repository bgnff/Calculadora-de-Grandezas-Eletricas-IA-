import { useCallback, useState } from 'react';
import type { CalculationType } from '@/lib/electricity';

export interface CalculationRecord {
  id: string;
  type: CalculationType;
  result: number;
  unit: string;
  formula: string;
  inputs: Record<string, string>;
  createdAt: string;
}

export interface EnergyDevice {
  id: string;
  name: string;
  watts: number;
  hoursPerDay: number;
  daysPerMonth: number;
}

export interface VoltivaSettings {
  monthlyGoal: number;
  currency: string;
}

const emptySettings: VoltivaSettings = { monthlyGoal: 120, currency: 'R$' };

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The in-memory state remains usable when storage is unavailable.
  }
}

function makeId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useVoltivaData(userId: string) {
  const prefix = `voltiva:${userId}`;
  const [calculations, setCalculations] = useState<CalculationRecord[]>(() =>
    readStorage(`${prefix}:calculations`, []),
  );
  const [devices, setDevices] = useState<EnergyDevice[]>(() =>
    readStorage(`${prefix}:devices`, []),
  );
  const [settings, setSettings] = useState<VoltivaSettings>(() =>
    readStorage(`${prefix}:settings`, emptySettings),
  );

  const saveCalculation = useCallback(
    (record: Omit<CalculationRecord, 'id' | 'createdAt'>) => {
      const next = [{ ...record, id: makeId(), createdAt: new Date().toISOString() }, ...calculations].slice(0, 100);
      setCalculations(next);
      writeStorage(`${prefix}:calculations`, next);
    },
    [calculations, prefix],
  );

  const addDevice = useCallback(
    (device: Omit<EnergyDevice, 'id'>) => {
      const next = [...devices, { ...device, id: makeId() }];
      setDevices(next);
      writeStorage(`${prefix}:devices`, next);
    },
    [devices, prefix],
  );

  const removeDevice = useCallback(
    (id: string) => {
      const next = devices.filter((device) => device.id !== id);
      setDevices(next);
      writeStorage(`${prefix}:devices`, next);
    },
    [devices, prefix],
  );

  const updateSettings = useCallback(
    (patch: Partial<VoltivaSettings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      writeStorage(`${prefix}:settings`, next);
    },
    [prefix, settings],
  );

  const clearCalculations = useCallback(() => {
    setCalculations([]);
    writeStorage(`${prefix}:calculations`, []);
  }, [prefix]);

  return {
    calculations,
    devices,
    settings,
    saveCalculation,
    addDevice,
    removeDevice,
    updateSettings,
    clearCalculations,
  };
}

export type VoltivaData = ReturnType<typeof useVoltivaData>;

export function deviceMonthlyKwh(device: EnergyDevice) {
  return (device.watts / 1000) * device.hoursPerDay * device.daysPerMonth;
}

export function totalMonthlyKwh(devices: EnergyDevice[]) {
  return devices.reduce((total, device) => total + deviceMonthlyKwh(device), 0);
}