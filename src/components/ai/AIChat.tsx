import { SendHorizontal } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { isOpenClawConfigured, sendMessage as sendOpenClawMessage } from '../../lib/openclawClient';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

const suggestedPrompts = [
  'Who needs follow-up?',
  'Draft an outreach email',
  'Morning briefing',
  'Compensation benchmarks',
];

export default function AIChat() {
  const configured = isOpenClawConfigured();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: configured
        ? 'Hi Connie — ask me anything about your pipeline.'
        : 'Connect your AI assistant in Settings to unlock smart features',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !isThinking, [input, isThinking]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', content: trimmed, timestamp: new Date() }]);
    setInput('');
    setIsThinking(true);

    const reply = await sendOpenClawMessage(trimmed);

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: reply, timestamp: new Date() }]);
    setIsThinking(false);
  };

  return (
    <section className="mx-auto flex h-[calc(100vh-10rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 p-4 md:p-5">
        <h2 className="text-2xl font-bold text-slate-900">AI Assistant</h2>
        <p className="mt-1 text-base text-slate-600">Ask for follow-ups, outreach drafts, and quick insights.</p>
      </header>

      {!configured ? <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">Connect your AI assistant in Settings to unlock smart features</div> : null}

      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 md:p-5">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${message.role === 'user' ? 'ml-auto rounded-2xl rounded-br-md bg-blue-600 text-white' : 'rounded-2xl rounded-bl-md bg-white shadow-sm'}`}>
              {message.content}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start"><div className="rounded-2xl rounded-bl-md bg-white px-4 py-2.5 shadow-sm"><span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-400 [animation:dot-pulse_1.2s_infinite]" /><span className="h-2 w-2 rounded-full bg-slate-400 [animation:dot-pulse_1.2s_0.2s_infinite]" /><span className="h-2 w-2 rounded-full bg-slate-400 [animation:dot-pulse_1.2s_0.4s_infinite]" /></span></div></div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="space-y-3 border-t border-slate-200 bg-white p-4 md:p-5">
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt) => (
            <button key={prompt} type="button" onClick={() => { void sendMessage(prompt); }} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:border-blue-300 hover:bg-blue-50">{prompt}</button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white pr-2 shadow-md">
          <input type="text" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void sendMessage(input); } }} placeholder="Ask me anything..." className="min-h-12 flex-1 rounded-full border-none px-5 py-3 text-base focus:ring-0 focus:outline-none" />
          <button type="button" onClick={() => { void sendMessage(input); }} disabled={!canSend} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white disabled:cursor-not-allowed disabled:bg-slate-300" aria-label="Send message"><SendHorizontal size={16} /></button>
        </div>
      </div>
    </section>
  );
}
