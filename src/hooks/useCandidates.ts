import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Candidate, InsertCandidate, UpdateCandidate } from '../lib/database.types';

export function useCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('updated_at', { ascending: false });

    setLoading(false);

    if (error) {
      throw error;
    }

    setCandidates((data ?? []) as Candidate[]);
    return (data ?? []) as Candidate[];
  }, []);

  useEffect(() => {
    fetchCandidates().catch(() => {
      setCandidates([]);
    });
  }, [fetchCandidates]);

  const addCandidate = useCallback(
    async (data: InsertCandidate) => {
      setLoading(true);
      const { data: created, error } = await supabase
        .from('candidates')
        .insert(data)
        .select('*')
        .single();

      if (error) {
        setLoading(false);
        throw error;
      }

      await fetchCandidates();
      setLoading(false);
      return created as Candidate;
    },
    [fetchCandidates],
  );

  const updateCandidate = useCallback(
    async (id: string, data: UpdateCandidate) => {
      setLoading(true);
      const { error } = await supabase.from('candidates').update(data).eq('id', id);

      if (error) {
        setLoading(false);
        throw error;
      }

      await fetchCandidates();
      setLoading(false);
    },
    [fetchCandidates],
  );

  const deleteCandidate = useCallback(
    async (id: string) => {
      setLoading(true);
      const { error } = await supabase.from('candidates').delete().eq('id', id);

      if (error) {
        setLoading(false);
        throw error;
      }

      await fetchCandidates();
      setLoading(false);
    },
    [fetchCandidates],
  );

  const getCandidateById = useCallback(async (id: string) => {
    setLoading(true);
    const { data, error } = await supabase.from('candidates').select('*').eq('id', id).single();
    setLoading(false);

    if (error) {
      throw error;
    }

    return data as Candidate;
  }, []);

  return {
    candidates,
    loading,
    fetchCandidates,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    getCandidateById,
  };
}
