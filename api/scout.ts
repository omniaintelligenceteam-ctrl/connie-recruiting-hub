import type { VercelRequest, VercelResponse } from '@vercel/node';
import https from 'https';

interface NPIResult {
  number: string;
  basic: {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    credential?: string;
    organization_name?: string;
  };
  addresses: Array<{
    address_purpose: string;
    city?: string;
    state?: string;
    telephone_number?: string;
  }>;
  taxonomies: Array<{
    desc?: string;
    primary?: boolean;
  }>;
}

function fetchNPI(specialty: string, state: string, limit: number): Promise<object[]> {
  return new Promise((resolve, reject) => {
    const url = `https://npiregistry.cms.hhs.gov/api/?version=2.1&taxonomy_description=${encodeURIComponent(specialty)}&state=${encodeURIComponent(state)}&limit=${limit}&skip=0`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk: string) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const results = ((json.results || []) as NPIResult[]).map((r) => {
            const basic = r.basic || {};
            const address = r.addresses?.find(a => a.address_purpose === 'LOCATION') || r.addresses?.[0] || {};
            const taxonomy = r.taxonomies?.find(t => t.primary) || r.taxonomies?.[0] || {};
            return {
              name: [basic.first_name, basic.middle_name, basic.last_name, basic.credential]
                .filter(Boolean).join(' '),
              npi: r.number,
              specialty: taxonomy.desc || specialty,
              city: address.city || '',
              state: address.state || state,
              phone: address.telephone_number || '',
              organization: basic.organization_name || '',
            };
          });
          resolve(results);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { specialty = 'Cardiology', state = 'AZ', limit = 10 } = req.body || {};

  try {
    const results = await fetchNPI(String(specialty), String(state), Math.min(Number(limit), 50));
    return res.status(200).json({ success: true, results, count: results.length });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return res.status(500).json({ success: false, error: msg });
  }
}
