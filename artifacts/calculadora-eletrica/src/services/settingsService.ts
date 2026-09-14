import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { VoltivaSettings } from '@/hooks/use-voltiva-data';

const defaultSettings: VoltivaSettings = {
  monthlyGoal: 120,
  currency: 'R$',
};

export const settingsService = {
  async getSettings(userId: string): Promise<VoltivaSettings> {
    if (!isSupabaseConfigured || !userId) return defaultSettings;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) return defaultSettings;

      return {
        monthlyGoal: Number(data.monthly_goal) || defaultSettings.monthlyGoal,
        currency: data.currency || defaultSettings.currency,
      };
    } catch {
      return defaultSettings;
    }
  },

  async updateSettings(
    userId: string,
    settings: Partial<VoltivaSettings>
  ): Promise<boolean> {
    if (!isSupabaseConfigured || !userId) return false;

    try {
      const payload: Record<string, unknown> = {
        user_id: userId,
        updated_at: new Date().toISOString(),
      };

      if (settings.monthlyGoal !== undefined) {
        payload.monthly_goal = settings.monthlyGoal;
      }
      if (settings.currency !== undefined) {
        payload.currency = settings.currency;
      }

      const { error } = await supabase
        .from('user_settings')
        .upsert(payload);

      if (error) {
        console.error('[Voltiva] Erro ao salvar configurações no Supabase:', error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[Voltiva] Exceção ao salvar configurações:', err);
      return false;
    }
  },
};
