import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || 'http://104.131.177.111:18789';
  const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN || '';

  if (!gatewayToken) {
    return res.status(500).json({ error: 'OPENCLAW_GATEWAY_TOKEN is not configured' });
  }

  try {
    const response = await fetch(`${gatewayUrl}/api/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${gatewayToken}`,
      },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    let data: unknown = null;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(502).json({ error: 'Failed to reach OpenClaw gateway' });
  }
}
