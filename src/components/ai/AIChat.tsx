import { SendHorizontal } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type ChatMessage = {
  id: string;
  role: 'user' | 'ai';
  text: string;
};

const suggestedPrompts = [
  'Who needs follow-up?',
  'Draft an outreach email',
  'Morning briefing',
  'Compensation benchmarks',
];

const aiPlaceholder =
  'AI assistant coming soon! This will connect to your OpenClaw gateway for intelligent responses.';

export default function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: 'ai',
      text: 'Hi Connie — ask me anything about your pipeline.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !isThinking, [input, isThinking]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking) {
      return;
    }

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', text: trimmed }]);
    setInput('');
    setIsThinking(true);

    window.setTimeout(() => {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'ai', text: aiPlaceholder }]);
      setIsThinking(false);
    }, 900);
  };

  return (
    <section className="mx-auto flex h-[calc(100vh-10rem)] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 p-4 md:p-5">
        <h2 className="text-2xl font-bold text-slate-900">AI Assistant</h2>
        <p className="mt-1 text-base text-slate-600">Ask for follow-ups, outreach drafts, and quick insights.</p>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4 md:p-5">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-base leading-relaxed md:max-w-[70%] ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-200 bg-slate-100 text-slate-800'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-base text-slate-700">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="space-y-3 border-t border-slate-200 p-4 md:p-5">
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              className="min-h-11 rounded-full border border-slate-300 bg-slate-50 px-4 text-base text-slate-700 hover:border-blue-300 hover:text-blue-700"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Type your question..."
            className="min-h-11 flex-1 rounded-lg border border-slate-300 px-3 text-base"
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={!canSend}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-blue-600 px-3 text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            aria-label="Send message"
          >
            <SendHorizontal size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
