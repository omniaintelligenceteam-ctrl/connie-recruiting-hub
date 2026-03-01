import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { InsertInteraction, Interaction } from '../lib/database.types';

export function useInteractions() {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInteractions = useCallback(async (candidateId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('contact_date', { ascending: false });

    setLoading(false);

    if (error) {
      throw error;
    }

    setInteractions((data ?? []) as Interaction[]);
    return (data ?? []) as Interaction[];
  }, []);

  const addInteraction = useCallback(
    async (data: InsertInteraction) => {
      setLoading(true);
      const { data: created, error } = await supabase
        .from('interactions')
        .insert(data)
        .select('*')
        .single();

      if (error) {
        setLoading(false);
        throw error;
      }

      if (created?.candidate_id) {
        await fetchInteractions(created.candidate_id);
      } else {
        setLoading(false);
      }

      return created as Interaction;
    },
    [fetchInteractions],
  );

  return {
    interactions,
    loading,
    fetchInteractions,
    addInteraction,
  };
}
