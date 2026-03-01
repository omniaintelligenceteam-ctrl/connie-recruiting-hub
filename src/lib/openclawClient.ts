interface OpenClawConfig {
  gatewayUrl: string;
  gatewayToken: string;
}

function getConfig(): OpenClawConfig {
  return {
    gatewayUrl: import.meta.env.VITE_OPENCLAW_GATEWAY_URL || '',
    gatewayToken: import.meta.env.VITE_OPENCLAW_GATEWAY_TOKEN || '',
  };
}

export function isOpenClawConfigured(): boolean {
  const { gatewayUrl, gatewayToken } = getConfig();
  return Boolean(gatewayUrl && gatewayToken);
}

export async function sendMessage(message: string): Promise<string> {
  const { gatewayUrl, gatewayToken } = getConfig();

  if (!gatewayUrl || !gatewayToken) {
    return 'AI assistant is not configured yet. Please set up the OpenClaw gateway connection in settings.';
  }

  try {
    const response = await fetch(`${gatewayUrl}/api/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${gatewayToken}`,
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Gateway error: ${response.status}`);
    }

    const data = (await response.json()) as { response?: string; message?: string };
    return data.response || data.message || 'No response from AI.';
  } catch (error) {
    console.error('OpenClaw error:', error);
    return "I couldn't reach the AI assistant right now. Please check the gateway connection.";
  }
}
