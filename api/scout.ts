import type { VercelRequest, VercelResponse } from '@vercel/node';
import https from 'https';

// Scout Agent v2 - Universal Structured Data Extractor
// Plugin architecture: add any API by defining a config

interface ScoutConfig {
  name: string;
  baseUrl: string;
  method: 'GET' | 'POST';
  buildUrl: (params: Record<string, string>) => string;
  transform: (raw: any) => ScoutResult[];
}

interface ScoutResult {
  id: string;
  name: string;
  title?: string;
  organization?: string;
  location: { city?: string; state?: string; zip?: string };
  contact: { phone?: string; email?: string; url?: string };
  metadata: Record<string, any>;
}

// PLUGINS - Add new data sources here
const PLUGINS: Record<string, ScoutConfig> = {
  // Plugin 1: NPI Registry (Physicians)
  npi: {
    name: 'NPI Registry',
    baseUrl: 'npiregistry.cms.hhs.gov',
    method: 'GET',
    buildUrl: (p) => `/api/?version=2.1&taxonomy_description=${encodeURIComponent(p.query)}&state=${p.state}&limit=${p.limit}&skip=0`,
    transform: (data) => {
      return (data.results || []).map((r: any) => {
        const basic = r.basic || {};
        const addr = r.addresses?.find((a: any) => a.address_purpose === 'LOCATION') || r.addresses?.[0] || {};
        const tax = r.taxonomies?.find((t: any) => t.primary) || r.taxonomies?.[0] || {};
        return {
          id: r.number,
          name: [basic.first_name, basic.middle_name, basic.last_name].filter(Boolean).join(' '),
          title: basic.credential,
          organization: basic.organization_name,
          location: { city: addr.city, state: addr.state, zip: addr.postal_code },
          contact: { phone: addr.telephone_number },
          metadata: { specialty: tax.desc, npi: r.number, addresses: r.addresses }
        };
      });
    }
  },

  // Plugin 2: Job Board (Indeed-style template)
  jobboard: {
    name: 'Job Board Aggregator',
    baseUrl: 'api.indeed.com',
    method: 'GET',
    buildUrl: (p) => `/ads/apisearch?publisher=${process.env.INDEED_PUBLISHER || 'DEMO'}&q=${encodeURIComponent(p.query)}&l=${p.state}&limit=${p.limit}`,
    transform: (data) => {
      return (data.results || []).map((r: any) => ({
        id: r.jobkey,
        name: r.jobtitle,
        organization: r.company,
        location: { city: r.city, state: r.state },
        contact: { url: r.url },
        metadata: { source: r.source, date: r.date, snippet: r.snippet }
      }));
    }
  },

  // Plugin 3: Custom API (bring your own endpoint)
  custom: {
    name: 'Custom API',
    baseUrl: 'api.example.com',
    method: 'GET',
    buildUrl: () => '/data',
    transform: (data) => data.results || []
  }
};

function fetchData(config: ScoutConfig, params: Record<string, string>): Promise<any> {
  return new Promise((resolve, reject) => {
    const path = config.buildUrl(params);
    const options = {
      hostname: config.baseUrl,
      path: path,
      method: config.method,
      headers: {
        'User-Agent': 'ScoutAgent/2.0',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } 
        catch (e) { resolve({ raw: data }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    plugin = 'npi',
    query = '',
    state = '',
    limit = '10',
    customConfig = null
  } = req.body || {};

  try {
    const config: ScoutConfig = customConfig || PLUGINS[plugin];
    
    if (!config) {
      return res.status(400).json({ 
        error: `Unknown plugin: ${plugin}`, 
        available: Object.keys(PLUGINS) 
      });
    }

    const raw = await fetchData(config, { query, state, limit });
    const results = config.transform(raw);

    return res.status(200).json({
      success: true,
      plugin: config.name,
      query,
      state,
      count: results.length,
      results
    });

  } catch (e: any) {
    return res.status(500).json({ 
      success: false, 
      error: e.message
    });
  }
}
