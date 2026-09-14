import { useCallback, useEffect, useState } from 'react';
import { profileService } from '@/services/profileService';

export type EnergyGoal = 'learn' | 'save' | 'plan' | 'diagnose';
export type EnergyInterest = 'fundamentals' | 'consumption' | 'savings' | 'safety';
export type KnowledgeLevel = 'beginner' | 'familiar' | 'advanced';

export interface EnergyProfileDraft {
  step: number;
  goal: EnergyGoal | '';
  interests: EnergyInterest[];
  knowledge: KnowledgeLevel | '';
}

export interface EnergyProfile {
  goal: EnergyGoal;
  interests: EnergyInterest[];
  knowledge: KnowledgeLevel;
  completedAt: string;
}

const PROFILE_KEY = 'voltiva.energy-profile.v1';
const DRAFT_KEY = 'voltiva.energy-profile-draft.v1';

export const emptyEnergyProfileDraft: EnergyProfileDraft = {
  step: 0,
  goal: '',
  interests: [],
  knowledge: '',
};

function storage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isGoal(value: unknown): value is EnergyGoal {
  return value === 'learn' || value === 'save' || value === 'plan' || value === 'diagnose';
}

function isInterest(value: unknown): value is EnergyInterest {
  return value === 'fundamentals' || value === 'consumption' || value === 'savings' || value === 'safety';
}

function isKnowledge(value: unknown): value is KnowledgeLevel {
  return value === 'beginner' || value === 'familiar' || value === 'advanced';
}

function readJson(key: string): unknown {
  const currentStorage = storage();
  if (!currentStorage) return null;
  try {
    const raw = currentStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readProfile(key: string): EnergyProfile | null {
  const value = readJson(key);
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<EnergyProfile>;
  if (!isGoal(candidate.goal) || !isKnowledge(candidate.knowledge) || !Array.isArray(candidate.interests)) return null;
  const interests = candidate.interests.filter(isInterest);
  if (!interests.length || typeof candidate.completedAt !== 'string') return null;
  return { goal: candidate.goal, knowledge: candidate.knowledge, interests, completedAt: candidate.completedAt };
}

function readDraft(key: string): EnergyProfileDraft {
  const value = readJson(key);
  if (!value || typeof value !== 'object') return emptyEnergyProfileDraft;
  const candidate = value as Partial<EnergyProfileDraft>;
  const step = typeof candidate.step === 'number' && candidate.step >= 0 && candidate.step <= 2 ? Math.floor(candidate.step) : 0;
  const interests = Array.isArray(candidate.interests) ? candidate.interests.filter(isInterest) : [];
  return {
    step,
    goal: isGoal(candidate.goal) ? candidate.goal : '',
    interests,
    knowledge: isKnowledge(candidate.knowledge) ? candidate.knowledge : '',
  };
}

function writeDraft(key: string, draft: EnergyProfileDraft) {
  const currentStorage = storage();
  if (!currentStorage) return;
  try {
    currentStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // In-memory state remains usable
  }
}

export function useEnergyProfile(userId: string) {
  const profileKey = `${PROFILE_KEY}:${userId}`;
  const draftKey = `${DRAFT_KEY}:${userId}`;
  const [profile, setProfile] = useState<EnergyProfile | null>(() => readProfile(profileKey));
  const [draft, setDraft] = useState<EnergyProfileDraft>(() => readDraft(draftKey));

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    async function syncProfile() {
      try {
        const [remoteProfile, remoteDraft] = await Promise.all([
          profileService.getProfile(userId),
          profileService.getDraft(userId),
        ]);

        if (!isMounted) return;

        if (remoteProfile) {
          setProfile(remoteProfile);
          storage()?.setItem(profileKey, JSON.stringify(remoteProfile));
        }

        if (remoteDraft && remoteDraft.step > 0) {
          setDraft(remoteDraft);
          writeDraft(draftKey, remoteDraft);
        }
      } catch (err) {
        console.error('[Voltiva] Erro ao carregar perfil do Supabase:', err);
      }
    }

    syncProfile();

    return () => {
      isMounted = false;
    };
  }, [draftKey, profileKey, userId]);

  const updateDraft = useCallback((patch: Partial<EnergyProfileDraft>) => {
    setDraft((current) => {
      const next = { ...current, ...patch };
      writeDraft(draftKey, next);

      if (userId) {
        profileService.saveDraft(userId, next);
      }

      return next;
    });
  }, [draftKey, userId]);

  const beginEditing = useCallback(() => {
    setDraft((current) => {
      const next = profile
        ? { step: 0, goal: profile.goal, interests: [...profile.interests], knowledge: profile.knowledge }
        : current;
      writeDraft(draftKey, next);
      if (userId) {
        profileService.saveDraft(userId, next);
      }
      return next;
    });
  }, [draftKey, profile, userId]);

  const completeProfile = useCallback((completedDraft: EnergyProfileDraft) => {
    if (!isGoal(completedDraft.goal) || !isKnowledge(completedDraft.knowledge) || !completedDraft.interests.length) return;
    const nextProfile: EnergyProfile = {
      goal: completedDraft.goal,
      interests: completedDraft.interests,
      knowledge: completedDraft.knowledge,
      completedAt: new Date().toISOString(),
    };
    const currentStorage = storage();
    try {
      currentStorage?.setItem(profileKey, JSON.stringify(nextProfile));
      currentStorage?.removeItem(draftKey);
    } catch {
      // In-memory update
    }
    setProfile(nextProfile);
    setDraft(emptyEnergyProfileDraft);

    if (userId) {
      profileService.saveProfile(userId, nextProfile);
      profileService.deleteDraft(userId);
    }
  }, [draftKey, profileKey, userId]);

  return { profile, draft, updateDraft, beginEditing, completeProfile };
}