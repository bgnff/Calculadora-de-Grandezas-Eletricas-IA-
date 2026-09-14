import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type {
  EnergyGoal,
  EnergyInterest,
  EnergyProfile,
  EnergyProfileDraft,
  KnowledgeLevel,
} from '@/hooks/use-energy-profile';

export interface DatabaseProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  goal: EnergyGoal | null;
  interests: EnergyInterest[];
  knowledge_level: KnowledgeLevel | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const profileService = {
  async getProfile(userId: string): Promise<EnergyProfile | null> {
    if (!isSupabaseConfigured || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[Voltiva] Erro ao carregar perfil do Supabase:', error.message);
        return null;
      }

      if (!data || !data.goal || !data.knowledge_level || !data.completed_at) {
        return null;
      }

      return {
        goal: data.goal as EnergyGoal,
        interests: (data.interests || []) as EnergyInterest[],
        knowledge: data.knowledge_level as KnowledgeLevel,
        completedAt: data.completed_at,
      };
    } catch (err) {
      console.error('[Voltiva] Exceção ao carregar perfil:', err);
      return null;
    }
  },

  async saveProfile(userId: string, profile: EnergyProfile): Promise<boolean> {
    if (!isSupabaseConfigured || !userId) return false;

    try {
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        goal: profile.goal,
        interests: profile.interests,
        knowledge_level: profile.knowledge,
        completed_at: profile.completedAt,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('[Voltiva] Erro ao salvar perfil no Supabase:', error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[Voltiva] Exceção ao salvar perfil:', err);
      return false;
    }
  },

  async getDraft(userId: string): Promise<EnergyProfileDraft | null> {
    if (!isSupabaseConfigured || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('energy_profile_drafts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) return null;

      return {
        step: data.step ?? 0,
        goal: (data.goal || '') as EnergyGoal | '',
        interests: (data.interests || []) as EnergyInterest[],
        knowledge: (data.knowledge_level || '') as KnowledgeLevel | '',
      };
    } catch {
      return null;
    }
  },

  async saveDraft(userId: string, draft: EnergyProfileDraft): Promise<boolean> {
    if (!isSupabaseConfigured || !userId) return false;

    try {
      const { error } = await supabase.from('energy_profile_drafts').upsert({
        user_id: userId,
        step: draft.step,
        goal: draft.goal,
        interests: draft.interests,
        knowledge_level: draft.knowledge,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('[Voltiva] Erro ao salvar rascunho no Supabase:', error.message);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  async deleteDraft(userId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !userId) return false;

    try {
      const { error } = await supabase
        .from('energy_profile_drafts')
        .delete()
        .eq('user_id', userId);

      return !error;
    } catch {
      return false;
    }
  },
};
