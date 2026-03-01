import { useCallback, useState } from 'react';
import { isOpenClawConfigured, sendMessage } from '../lib/openclawClient';

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
  status: 'live' | 'sample';
  message: string;
  results: OutreachResult[];
  rawResponse: string;
};

const sampleResults = (specialty: string, location: string, requirements: string): OutreachResult[] => [
  {
    name: 'Taylor Smith',
    position: `Current role identified from public web profiles${requirements ? ` — ${requirements}` : ''}`,
    location: location || 'Flexible location',
    specialty,
    source: 'Sample result',
    sourceUrl: '#',
    email: 'sample.doctor@email.com',
    phone: '(555) 123-4567',
  },
  {
    name: 'Jordan Patel',
    position: 'Sample candidate record from medical directory and fellowship listing',
    location: location || 'National search',
    specialty,
    source: 'Sample result',
    sourceUrl: '#',
  },
];

function parseDoctorsFromText(raw: string, specialty: string): OutreachResult[] {
  const lines = raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const doctors: OutreachResult[] = [];

  const addDoctor = (entry: Partial<OutreachResult>) => {
    if (!entry.name) return;
    doctors.push({
      name: entry.name,
      position: entry.position || 'Position not specified',
      location: entry.location || 'Location not specified',
      specialty: entry.specialty || specialty || 'Unknown',
      source: entry.source || 'AI web search',
      sourceUrl: entry.sourceUrl || '#',
      email: entry.email,
      phone: entry.phone,
    });
  };

  const groupedByBullets: string[] = [];
  let current = '';

  for (const line of lines) {
    if (/^(\d+\.|[-*])\s/.test(line) || /\bDr\.?\s+[A-Z][a-z]+/.test(line)) {
      if (current) groupedByBullets.push(current.trim());
      current = line.replace(/^(\d+\.|[-*])\s*/, '');
    } else {
      current += ` ${line}`;
    }
  }
  if (current) groupedByBullets.push(current.trim());

  for (const block of groupedByBullets) {
    const nameMatch = block.match(/(?:Dr\.?\s*)?([A-Z][a-zA-Z'\-.]+\s+[A-Z][a-zA-Z'\-.]+)/);
    if (!nameMatch) continue;

    const emailMatch = block.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const phoneMatch = block.match(/(\+?\d[\d\s().-]{7,}\d)/);
    const urlMatch = block.match(/https?:\/\/\S+/i);

    const locationMatch = block.match(/(?:Location|Based in|Located in)\s*[:\-]\s*([^|,;]+)/i);
    const positionMatch = block.match(/(?:Position|Role|Current)\s*[:\-]\s*([^|;]+)/i);

    addDoctor({
      name: nameMatch[1],
      position: positionMatch?.[1]?.trim() ?? block,
      location: locationMatch?.[1]?.trim(),
      sourceUrl: urlMatch?.[0],
      email: emailMatch?.[0],
      phone: phoneMatch?.[0],
    });
  }

  return doctors;
}

const searchDoctors = async (
  specialty: string,
  location: string,
  requirements: string,
): Promise<OutreachResponse> => {
  const configured = isOpenClawConfigured();

  if (!configured) {
    return {
      status: 'sample',
      message: 'Connect AI to get real search results',
      results: sampleResults(specialty, location, requirements),
      rawResponse:
        'Sample mode is active. Configure VITE_OPENCLAW_GATEWAY_URL and VITE_OPENCLAW_GATEWAY_TOKEN to run live physician sourcing.',
    };
  }

  const prompt = `Search for physicians matching: Specialty: ${specialty}, Location: ${location || 'Any'}, Requirements: ${requirements || 'None specified'}. Find real candidates from medical directories, fellowship programs, Doximity, hospital websites. Return names, current positions, locations, and any contact info found.`;

  const raw = await sendMessage(prompt);
  const parsed = parseDoctorsFromText(raw, specialty);

  return {
    status: 'live',
    message: 'Live AI search complete.',
    results: parsed,
    rawResponse: raw,
  };
};

export function useOutreachSearch() {
  const [searchResults, setSearchResults] = useState<OutreachResult[]>([]);
  const [rawResponse, setRawResponse] = useState('');
  const [isSampleMode, setIsSampleMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (specialty: string, location: string, requirements: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await searchDoctors(specialty, location, requirements);
      setSearchResults(response.results);
      setRawResponse(response.rawResponse);
      setIsSampleMode(response.status === 'sample');
      return response;
    } catch {
      setSearchResults([]);
      setRawResponse('');
      setIsSampleMode(false);
      const message = 'Could not complete outreach search right now. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setSearchResults([]);
    setRawResponse('');
    setIsSampleMode(false);
    setError(null);
  }, []);

  return {
    searchResults,
    rawResponse,
    isSampleMode,
    loading,
    error,
    search,
    clearResults,
  };
}
