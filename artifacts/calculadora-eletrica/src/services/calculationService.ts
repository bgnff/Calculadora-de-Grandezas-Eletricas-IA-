import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { CalculationRecord } from '@/hooks/use-voltiva-data';
import type { CalculationType } from '@/lib/electricity';

export const calculationService = {
  async getCalculations(userId: string): Promise<CalculationRecord[]> {
    if (!isSupabaseConfigured || !userId) return [];

    try {
      const { data, error } = await supabase
        .from('calculations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Voltiva] Erro ao carregar cálculos do Supabase:', error.message);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        type: row.type as CalculationType,
        result: Number(row.result),
        unit: row.unit,
        formula: row.formula,
        inputs: (row.inputs || {}) as Record<string, string>,
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.error('[Voltiva] Exceção ao carregar cálculos:', err);
      return [];
    }
  },

  async saveCalculation(
    userId: string,
    record: Omit<CalculationRecord, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
  ): Promise<CalculationRecord | null> {
    if (!isSupabaseConfigured || !userId) return null;

    try {
      const payload = {
        user_id: userId,
        type: record.type,
        result: record.result,
        unit: record.unit,
        formula: record.formula,
        inputs: record.inputs,
      };

      const { data, error } = await supabase
        .from('calculations')
        .insert(payload)
        .select()
        .single();

      if (error || !data) {
        console.error('[Voltiva] Erro ao salvar cálculo no Supabase:', error?.message);
        return null;
      }

      return {
        id: data.id,
        type: data.type as CalculationType,
        result: Number(data.result),
        unit: data.unit,
        formula: data.formula,
        inputs: (data.inputs || {}) as Record<string, string>,
        createdAt: data.created_at,
      };
    } catch (err) {
      console.error('[Voltiva] Exceção ao salvar cálculo:', err);
      return null;
    }
  },

  async deleteCalculation(userId: string, id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !userId || !id) return false;

    try {
      const { error } = await supabase
        .from('calculations')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      return !error;
    } catch {
      return false;
    }
  },

  async clearCalculations(userId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !userId) return false;

    try {
      const { error } = await supabase
        .from('calculations')
        .delete()
        .eq('user_id', userId);

      return !error;
    } catch {
      return false;
    }
  },
};
