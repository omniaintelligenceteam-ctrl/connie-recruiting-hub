export async function sendMessage(message: string): Promise<string> {
  if (!message.trim()) {
    return 'Please provide a message first.';
  }

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Gateway proxy error: ${response.status}`);
    }

    const data = (await response.json()) as { response?: string; message?: string; error?: string };
    if (data.error) {
      return `AI error: ${data.error}`;
    }

    return data.response || data.message || 'No response from AI.';
  } catch (error) {
    console.error('OpenClaw error:', error);
    return "I couldn't reach the AI assistant right now. Please try again.";
  }
}

export function isOpenClawConfigured(): boolean {
  return true;
}
