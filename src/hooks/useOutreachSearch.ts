import { useCallback, useState } from 'react';

export type OutreachResult = {
  name: string;
  position: string;
  location: string;
  specialty?: string;
  source: string;
  sourceUrl: string;
  email?: string;
  phone?: string;
};

type OutreachResponse = {
  status: 'placeholder';
  message: string;
  results: OutreachResult[];
};

const searchDoctors = async (
  specialty: string,
  location: string,
  requirements: string,
): Promise<OutreachResponse> => {
  const gatewayUrl = import.meta.env.VITE_OPENCLAW_GATEWAY_URL;
  const gatewayToken = import.meta.env.VITE_OPENCLAW_GATEWAY_TOKEN;

  void gatewayUrl;
  void gatewayToken;

  await new Promise((resolve) => window.setTimeout(resolve, 1500));

  return {
    status: 'placeholder',
    message: 'AI search will be connected to OpenClaw gateway. For now, showing sample results.',
    results: [
      {
        name: 'Taylor Smith',
        position: `Current role identified from public web profiles${requirements ? ` — ${requirements}` : ''}`,
        location: location || 'Flexible location',
        specialty,
        source: 'AI-powered web search',
        sourceUrl: '#',
        email: 'sample.doctor@email.com',
        phone: '(555) 123-4567',
      },
      {
        name: 'Jordan Patel',
        position: 'Sample candidate record from medical directory and fellowship listing',
        location: location || 'National search',
        specialty,
        source: 'AI-powered web search',
        sourceUrl: '#',
      },
    ],
  };
};

export function useOutreachSearch() {
  const [searchResults, setSearchResults] = useState<OutreachResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (specialty: string, location: string, requirements: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await searchDoctors(specialty, location, requirements);
      setSearchResults(response.results);
      return response;
    } catch {
      setSearchResults([]);
      const message = 'Could not complete outreach search right now. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setSearchResults([]);
    setError(null);
  }, []);

  return {
    searchResults,
    loading,
    error,
    search,
    clearResults,
  };
}
