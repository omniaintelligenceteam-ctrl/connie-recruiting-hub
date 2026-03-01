import { useCallback, useEffect, useState } from 'react';
import { addDays, formatISO, startOfDay, subDays } from 'date-fns';
import { supabase } from '../lib/supabase';
import type { Candidate, Interaction } from '../lib/database.types';

type RecentActivity = Interaction & {
  candidate: Pick<Candidate, 'id' | 'first_name' | 'last_name' | 'specialty'> | null;
};

export function useDashboardStats() {
  const [activeCandidates, setActiveCandidates] = useState(0);
  const [needsFollowUp, setNeedsFollowUp] = useState(0);
  const [upcomingActions, setUpcomingActions] = useState<Candidate[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);

    const today = startOfDay(new Date());
    const todayIso = formatISO(today, { representation: 'date' });
    const sevenDaysIso = formatISO(addDays(today, 7), { representation: 'date' });
    const fiveDaysAgoIso = subDays(today, 5).toISOString();

    const [activeResult, followUpResult, upcomingResult, recentResult] = await Promise.all([
      supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .not('stage', 'in', '("Accepted","Closed/Lost")'),
      supabase
        .from('candidates')
        .select('*')
        .or(
          `next_step_due.lte.${todayIso},and(next_step_due.is.null,stage.in.(Contacted,Responded),stage_entered_at.lt.${fiveDaysAgoIso})`,
        ),
      supabase
        .from('candidates')
        .select('*')
        .gte('next_step_due', todayIso)
        .lte('next_step_due', sevenDaysIso)
        .order('next_step_due', { ascending: true }),
      supabase
        .from('interactions')
        .select('*, candidate:candidates(id, first_name, last_name, specialty)')
        .order('contact_date', { ascending: false })
        .limit(10),
    ]);

    setLoading(false);

    if (activeResult.error) throw activeResult.error;
    if (followUpResult.error) throw followUpResult.error;
    if (upcomingResult.error) throw upcomingResult.error;
    if (recentResult.error) throw recentResult.error;

    setActiveCandidates(activeResult.count ?? 0);
    setNeedsFollowUp((followUpResult.data ?? []).length);
    setUpcomingActions((upcomingResult.data ?? []) as Candidate[]);
    setRecentActivity((recentResult.data ?? []) as RecentActivity[]);
  }, []);

  useEffect(() => {
    fetchStats().catch(() => {
      setActiveCandidates(0);
      setNeedsFollowUp(0);
      setUpcomingActions([]);
      setRecentActivity([]);
    });
  }, [fetchStats]);

  return {
    activeCandidates,
    needsFollowUp,
    upcomingActions,
    recentActivity,
    loading,
    fetchStats,
  };
}
