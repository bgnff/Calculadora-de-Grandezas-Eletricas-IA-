import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { EnergyDevice } from '@/hooks/use-voltiva-data';

export const deviceService = {
  async getDevices(userId: string): Promise<EnergyDevice[]> {
    if (!isSupabaseConfigured || !userId) return [];

    try {
      const { data, error } = await supabase
        .from('energy_devices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Voltiva] Erro ao carregar equipamentos do Supabase:', error.message);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        name: row.name,
        watts: Number(row.watts),
        hoursPerDay: Number(row.hours_per_day),
        daysPerMonth: Number(row.days_per_month),
      }));
    } catch (err) {
      console.error('[Voltiva] Exceção ao carregar equipamentos:', err);
      return [];
    }
  },

  async addDevice(
    userId: string,
    device: Omit<EnergyDevice, 'id'>
  ): Promise<EnergyDevice | null> {
    if (!isSupabaseConfigured || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('energy_devices')
        .insert({
          user_id: userId,
          name: device.name,
          watts: device.watts,
          hours_per_day: device.hoursPerDay,
          days_per_month: device.daysPerMonth,
        })
        .select()
        .single();

      if (error || !data) {
        console.error('[Voltiva] Erro ao cadastrar equipamento no Supabase:', error?.message);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        watts: Number(data.watts),
        hoursPerDay: Number(data.hours_per_day),
        daysPerMonth: Number(data.days_per_month),
      };
    } catch (err) {
      console.error('[Voltiva] Exceção ao cadastrar equipamento:', err);
      return null;
    }
  },

  async removeDevice(userId: string, id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !userId || !id) return false;

    try {
      const { error } = await supabase
        .from('energy_devices')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      return !error;
    } catch {
      return false;
    }
  },
};
