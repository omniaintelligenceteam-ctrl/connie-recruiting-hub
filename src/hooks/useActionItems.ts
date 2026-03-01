import { useCallback, useEffect, useState } from 'react';
import { differenceInDays, isAfter, isBefore, isToday, parseISO, subDays } from 'date-fns';
import { supabase } from '../lib/supabase';
import type { Candidate, Interaction } from '../lib/database.types';

export interface ActionItem {
  id: string;
  candidateId: string;
  candidateName: string;
  specialty: string;
  type: 'overdue' | 'due-today' | 'due-soon' | 'stale' | 'new';
  message: string;
  urgency: 'high' | 'medium' | 'low';
  suggestedAction: string;
  daysOverdue?: number;
}

type CandidateWithLastInteraction = Candidate & { lastInteractionAt?: string | null };

function buildActionItems(candidates: CandidateWithLastInteraction[]): ActionItem[] {
  const now = new Date();
  const soonLimit = new Date();
  soonLimit.setDate(now.getDate() + 3);

  const items: ActionItem[] = [];

  for (const candidate of candidates) {
    const candidateName = `${candidate.first_name} ${candidate.last_name}`;
    const lastInteraction = candidate.lastInteractionAt ? parseISO(candidate.lastInteractionAt) : null;
    const createdAt = parseISO(candidate.created_at);

    if (candidate.next_step_due) {
      const due = parseISO(candidate.next_step_due);

      if (isBefore(due, now) && !isToday(due)) {
        items.push({
          id: `${candidate.id}-overdue`,
          candidateId: candidate.id,
          candidateName,
          specialty: candidate.specialty,
          type: 'overdue',
          message: `${candidateName} follow-up is overdue by ${Math.max(1, differenceInDays(now, due))} day(s).`,
          urgency: 'high',
          suggestedAction: 'Send Follow-up',
          daysOverdue: Math.max(1, differenceInDays(now, due)),
        });
      } else if (isToday(due)) {
        items.push({
          id: `${candidate.id}-due-today`,
          candidateId: candidate.id,
          candidateName,
          specialty: candidate.specialty,
          type: 'due-today',
          message: `${candidateName} has a follow-up due today.`,
          urgency: 'medium',
          suggestedAction: 'Schedule Call',
        });
      } else if (isAfter(due, now) && isBefore(due, soonLimit)) {
        items.push({
          id: `${candidate.id}-due-soon`,
          candidateId: candidate.id,
          candidateName,
          specialty: candidate.specialty,
          type: 'due-soon',
          message: `${candidateName} follow-up is due within 3 days.`,
          urgency: 'low',
          suggestedAction: 'Plan Next Step',
        });
      }
    }

    const staleThreshold = subDays(now, 14);
    if (lastInteraction && isBefore(lastInteraction, staleThreshold)) {
      const days = differenceInDays(now, lastInteraction);
      items.push({
        id: `${candidate.id}-stale`,
        candidateId: candidate.id,
        candidateName,
        specialty: candidate.specialty,
        type: 'stale',
        message: `${candidateName} hasn't been contacted in ${days} days.`,
        urgency: 'medium',
        suggestedAction: 'Re-engage Candidate',
      });
    }

    const newThreshold = subDays(now, 2);
    const hasNoInteractions = !lastInteraction;
    if (hasNoInteractions && isAfter(createdAt, newThreshold)) {
      items.push({
        id: `${candidate.id}-new`,
        candidateId: candidate.id,
        candidateName,
        specialty: candidate.specialty,
        type: 'new',
        message: `Welcome ${candidateName} to the pipeline — time for first outreach?`,
        urgency: 'low',
        suggestedAction: 'Send Intro Email',
      });
    }
  }

  const urgencyRank: Record<ActionItem['urgency'], number> = { high: 0, medium: 1, low: 2 };

  return items.sort((a, b) => urgencyRank[a.urgency] - urgencyRank[b.urgency]);
}

export function useActionItems() {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchActionItems = useCallback(async () => {
    setLoading(true);

    const [candidateResult, interactionResult] = await Promise.all([
      supabase.from('candidates').select('*').order('updated_at', { ascending: false }),
      supabase.from('interactions').select('*').order('contact_date', { ascending: false }),
    ]);

    setLoading(false);

    if (candidateResult.error) throw candidateResult.error;
    if (interactionResult.error) throw interactionResult.error;

    const interactions = (interactionResult.data ?? []) as Interaction[];
    const lastByCandidate = interactions.reduce<Record<string, string>>((acc, item) => {
      if (!item.candidate_id) return acc;
      if (!acc[item.candidate_id]) {
        acc[item.candidate_id] = item.contact_date;
      }
      return acc;
    }, {});

    const candidatesWithInteraction = ((candidateResult.data ?? []) as Candidate[]).map((candidate) => ({
      ...candidate,
      lastInteractionAt: lastByCandidate[candidate.id] ?? null,
    }));

    setActionItems(buildActionItems(candidatesWithInteraction));
  }, []);

  useEffect(() => {
    fetchActionItems().catch(() => {
      setActionItems([]);
    });
  }, [fetchActionItems]);

  return {
    actionItems,
    loading,
    fetchActionItems,
  };
}
