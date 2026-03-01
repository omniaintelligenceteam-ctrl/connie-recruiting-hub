import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { InsertSiteVisit, NotifyPerson, ScheduleItem, SiteVisit, UpdateSiteVisit } from '../lib/database.types';

export function useSiteVisit() {
  const [siteVisit, setSiteVisit] = useState<SiteVisit | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSiteVisit = useCallback(async (candidateId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_visits')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    setLoading(false);

    if (error) throw error;

    const visit = (data as SiteVisit | null) ?? null;
    setSiteVisit(visit);
    return visit;
  }, []);

  const createSiteVisit = useCallback(async (data: InsertSiteVisit) => {
    setLoading(true);
    const { data: created, error } = await supabase
      .from('site_visits')
      .insert(data)
      .select('*')
      .single();

    setLoading(false);

    if (error) throw error;

    setSiteVisit(created as SiteVisit);
    return created as SiteVisit;
  }, []);

  const updateSiteVisit = useCallback(async (id: string, data: UpdateSiteVisit) => {
    setLoading(true);
    const { data: updated, error } = await supabase
      .from('site_visits')
      .update(data)
      .eq('id', id)
      .select('*')
      .single();

    setLoading(false);

    if (error) throw error;

    setSiteVisit(updated as SiteVisit);
    return updated as SiteVisit;
  }, []);

  const addScheduleItem = useCallback(async (visitId: string, item: ScheduleItem) => {
    const { data, error } = await supabase.from('site_visits').select('schedule').eq('id', visitId).single();
    if (error) throw error;

    const existing = ((data?.schedule as ScheduleItem[] | null) ?? []);
    return updateSiteVisit(visitId, { schedule: [...existing, item] });
  }, [updateSiteVisit]);

  const removeScheduleItem = useCallback(async (visitId: string, itemId: string) => {
    const { data, error } = await supabase.from('site_visits').select('schedule').eq('id', visitId).single();
    if (error) throw error;

    const existing = ((data?.schedule as ScheduleItem[] | null) ?? []);
    return updateSiteVisit(visitId, { schedule: existing.filter((item) => item.id !== itemId) });
  }, [updateSiteVisit]);

  const addNotifyPerson = useCallback(async (visitId: string, person: NotifyPerson) => {
    const { data, error } = await supabase.from('site_visits').select('notify_list').eq('id', visitId).single();
    if (error) throw error;

    const existing = ((data?.notify_list as NotifyPerson[] | null) ?? []);
    return updateSiteVisit(visitId, { notify_list: [...existing, person] });
  }, [updateSiteVisit]);

  const toggleNotified = useCallback(async (visitId: string, personId: string) => {
    const { data, error } = await supabase.from('site_visits').select('notify_list').eq('id', visitId).single();
    if (error) throw error;

    const existing = ((data?.notify_list as NotifyPerson[] | null) ?? []);
    const next = existing.map((person) =>
      person.id === personId
        ? {
            ...person,
            notified: !person.notified,
            notified_at: !person.notified ? new Date().toISOString() : null,
          }
        : person,
    );

    return updateSiteVisit(visitId, { notify_list: next });
  }, [updateSiteVisit]);

  return {
    siteVisit,
    loading,
    fetchSiteVisit,
    createSiteVisit,
    updateSiteVisit,
    addScheduleItem,
    removeScheduleItem,
    addNotifyPerson,
    toggleNotified,
  };
}
