import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

/* ─── Suggestion chips ────────────────────────────────────────────────────── */

const SUGGESTIONS = [
  'How should I pay myself as a director?',
  'Do I need to register for VAT?',
  'What is my Corporation Tax deadline?',
  'How do I file a confirmation statement?',
  'What business expenses can I claim?',
  'What is the most tax-efficient salary?',
];

/* ─── Single message bubble ───────────────────────────────────────────────── */

function Message({ role, content }) {
  const isUser = role === 'user';

  return (
    <div
      className={`flex gap-3 mb-5 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: '#2563EB' }}
        >
          <span
            style={{
              color: '#fff',
              fontSize: '12px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              letterSpacing: '-0.5px',
            }}
          >
            V
          </span>
        </div>
      )}

      <div
        className="max-w-[78%] rounded-2xl px-4 py-3"
        style={{
          background: isUser ? '#2563EB' : '#FFFFFF',
          border: isUser ? 'none' : '1px solid #E8E6E1',
          color: isUser ? '#fff' : '#111',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '14px',
          lineHeight: '1.75',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        }}
      >
        {content}
      </div>

      {isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: '#F5F4F0', border: '1px solid #E8E6E1' }}
        >
          <span
            style={{
              color: '#555',
              fontSize: '12px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
            }}
          >
            You
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Typing indicator ────────────────────────────────────────────────────── */

function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-5 justify-start">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: '#2563EB' }}
      >
        <span
          style={{
            color: '#fff',
            fontSize: '12px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
          }}
        >
          V
        </span>
      </div>
      <div
        className="rounded-2xl px-4 py-3.5"
        style={{ background: '#FFFFFF', border: '1px solid #E8E6E1', borderRadius: '18px 18px 18px 4px' }}
      >
        <span className="inline-flex gap-1 items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      </div>
    </div>
  );
}

/* ─── Empty state ─────────────────────────────────────────────────────────── */

function EmptyState({ profile, onSuggest }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-4 gap-8">
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: '#EEF2FF' }}
        >
          <span
            style={{
              fontSize: '26px',
              color: '#2563EB',
              fontWeight: 800,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: '-1px',
            }}
          >
            V
          </span>
        </div>
        <h2
          className="text-xl font-bold mb-2"
          style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.3px' }}
        >
          {profile?.business_name
            ? `What can I help ${profile.business_name} with today?`
            : 'What can I help you with today?'}
        </h2>
        <p
          className="text-sm max-w-sm mx-auto"
          style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: '1.6' }}
        >
          Ask anything about your UK business — tax, compliance, payroll, Companies House, cash flow, or strategy.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center max-w-lg">
        {SUGGESTIONS.map(s => (
          <button
            key={s}
            onClick={() => onSuggest(s)}
            className="text-sm px-4 py-2 rounded-xl border transition-colors"
            style={{
              borderColor: '#E8E6E1',
              color: '#555',
              background: '#F5F4F0',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#EBE9E4')}
            onMouseLeave={e => (e.currentTarget.style.background = '#F5F4F0')}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Main chat page ──────────────────────────────────────────────────────── */

export default function Chat() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

  useEffect(() => {
    document.title = 'Ask AI — Vpayit';
  }, []);

  // Scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function buildContext() {
    if (!profile && !user) return '';
    const parts = [];
    if (profile?.business_name) parts.push(`Business name: ${profile.business_name}`);
    if (profile?.business_type) parts.push(`Business type: ${profile.business_type}`);
    if (user?.email)            parts.push(`Owner email: ${user.email}`);
    return parts.join('. ');
  }

  async function send(text) {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/v1/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          context: buildContext(),
        }),
      });

      const data = await res.json();
      const reply = data.reply ?? data.error ?? 'No response received.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Could not reach Vpayit AI. Please check your connection and try again.' },
      ]);
    } finally {
      setLoading(false);
      // Re-focus input after response
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const isEmpty = messages.length === 0 && !loading;

  return (
    <div
      className="flex flex-col"
      style={{
        height: '100%',
        minHeight: '100vh',
        background: '#FEFDFB',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* ── Page header ── */}
      <div
        className="px-6 py-5 border-b shrink-0"
        style={{ borderColor: '#E8E6E1', background: '#FEFDFB' }}
      >
        <h1
          className="text-lg font-bold"
          style={{ color: '#111', letterSpacing: '-0.3px' }}
        >
          Ask your AI Chief of Staff
        </h1>
        <p
          className="text-xs mt-0.5"
          style={{ color: '#9CA3AF' }}
        >
          UK tax law · Companies House · HMRC · Payroll · Strategy
        </p>
      </div>

      {/* ── Message area ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {isEmpty ? (
          <EmptyState profile={profile} onSuggest={s => send(s)} />
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.map((m, i) => (
              <Message key={i} role={m.role} content={m.content} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input bar ── */}
      <div
        className="px-6 py-4 border-t shrink-0"
        style={{ borderColor: '#E8E6E1', background: '#FEFDFB' }}
      >
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your UK business…"
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            style={{
              borderColor: '#E8E6E1',
              background: '#FFFFFF',
              color: '#111',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ background: '#2563EB', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {loading ? '…' : 'Send'}
          </button>
        </div>
        <p
          className="text-xs text-center mt-2"
          style={{ color: '#C4BFB8' }}
        >
          Answers based on UK law and your business profile. Not a substitute for professional accountancy advice.
        </p>
      </div>
    </div>
  );
}
