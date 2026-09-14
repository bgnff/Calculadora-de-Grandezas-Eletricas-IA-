import { useCallback, useEffect, useState } from 'react';
import type { CalculationType } from '@/lib/electricity';
import { calculationService } from '@/services/calculationService';
import { deviceService } from '@/services/deviceService';
import { settingsService } from '@/services/settingsService';

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
    // In-memory state remains usable if storage is unavailable
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
    readStorage(`${prefix}:calculations`, [])
  );
  const [devices, setDevices] = useState<EnergyDevice[]>(() =>
    readStorage(`${prefix}:devices`, [])
  );
  const [settings, setSettings] = useState<VoltivaSettings>(() =>
    readStorage(`${prefix}:settings`, emptySettings)
  );

  // Sincronização inicial com o Supabase
  useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    async function loadFromSupabase() {
      try {
        const [remoteCalculations, remoteDevices, remoteSettings] = await Promise.all([
          calculationService.getCalculations(userId),
          deviceService.getDevices(userId),
          settingsService.getSettings(userId),
        ]);

        if (!isMounted) return;

        if (remoteCalculations.length > 0) {
          setCalculations(remoteCalculations);
          writeStorage(`${prefix}:calculations`, remoteCalculations);
        }

        if (remoteDevices.length > 0) {
          setDevices(remoteDevices);
          writeStorage(`${prefix}:devices`, remoteDevices);
        }

        if (remoteSettings) {
          setSettings(remoteSettings);
          writeStorage(`${prefix}:settings`, remoteSettings);
        }
      } catch (err) {
        console.error('[Voltiva] Erro ao sincronizar dados com o Supabase:', err);
      }
    }

    loadFromSupabase();

    return () => {
      isMounted = false;
    };
  }, [prefix, userId]);

  const saveCalculation = useCallback(
    (record: Omit<CalculationRecord, 'id' | 'createdAt'>) => {
      const tempId = makeId();
      const createdAt = new Date().toISOString();
      const newRecord: CalculationRecord = { ...record, id: tempId, createdAt };

      // Atualização otimista local
      setCalculations((current) => {
        const next = [newRecord, ...current].slice(0, 100);
        writeStorage(`${prefix}:calculations`, next);
        return next;
      });

      // Persistência assíncrona no Supabase
      if (userId) {
        calculationService.saveCalculation(userId, newRecord).then((saved) => {
          if (saved) {
            setCalculations((current) => {
              const updated = current.map((c) => (c.id === tempId ? saved : c));
              writeStorage(`${prefix}:calculations`, updated);
              return updated;
            });
          }
        });
      }
    },
    [prefix, userId]
  );

  const addDevice = useCallback(
    (device: Omit<EnergyDevice, 'id'>) => {
      const tempId = makeId();
      const newDevice: EnergyDevice = { ...device, id: tempId };

      setDevices((current) => {
        const next = [...current, newDevice];
        writeStorage(`${prefix}:devices`, next);
        return next;
      });

      if (userId) {
        deviceService.addDevice(userId, device).then((saved) => {
          if (saved) {
            setDevices((current) => {
              const updated = current.map((d) => (d.id === tempId ? saved : d));
              writeStorage(`${prefix}:devices`, updated);
              return updated;
            });
          }
        });
      }
    },
    [prefix, userId]
  );

  const removeDevice = useCallback(
    (id: string) => {
      setDevices((current) => {
        const next = current.filter((device) => device.id !== id);
        writeStorage(`${prefix}:devices`, next);
        return next;
      });

      if (userId) {
        deviceService.removeDevice(userId, id);
      }
    },
    [prefix, userId]
  );

  const updateSettings = useCallback(
    (patch: Partial<VoltivaSettings>) => {
      setSettings((current) => {
        const next = { ...current, ...patch };
        writeStorage(`${prefix}:settings`, next);
        return next;
      });

      if (userId) {
        settingsService.updateSettings(userId, patch);
      }
    },
    [prefix, userId]
  );

  const removeCalculation = useCallback(
    (id: string) => {
      setCalculations((current) => {
        const next = current.filter((c) => c.id !== id);
        writeStorage(`${prefix}:calculations`, next);
        return next;
      });

      if (userId) {
        calculationService.deleteCalculation(userId, id);
      }
    },
    [prefix, userId]
  );

  const clearCalculations = useCallback(() => {
    setCalculations([]);
    writeStorage(`${prefix}:calculations`, []);

    if (userId) {
      calculationService.clearCalculations(userId);
    }
  }, [prefix, userId]);

  return {
    calculations,
    devices,
    settings,
    saveCalculation,
    removeCalculation,
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