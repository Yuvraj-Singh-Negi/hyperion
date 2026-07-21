'use client';

import { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Mic, MicOff, Bot, Globe, Volume2, VolumeX, Trash2, Loader2, ChevronDown } from 'lucide-react';
import { useChatbot } from '@/hooks/useChatbot';
import { LANGUAGES } from '@/lib/chatbotEngine';

export default function ChatbotPanel() {
  const {
    messages, input, setInput, lang, changeLang, isTyping,
    voiceEnabled, setVoiceEnabled, isListening, isSupported,
    sendMessage, toggleListening, clearChat,
  } = useChatbot();

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmit = useCallback(() => {
    if (input.trim() && !isTyping) {
      sendMessage(input);
      inputRef.current?.focus();
    }
  }, [input, isTyping, sendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col" style={{ height: '600px' }}>
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-pearl/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ice-blue/20 to-ice-blue/5 border border-ice-blue/20 flex items-center justify-center">
            <Bot size={16} className="text-ice-blue" />
          </div>
          <div>
            <span className="text-sm font-medium text-pearl/80">Hyperion Assistant</span>
            <span className="text-[8px] text-titanium/30 font-mono block">{LANGUAGES.find(l => l.code === lang)?.native}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
              voiceEnabled ? 'bg-ice-blue/10 text-ice-blue' : 'bg-pearl/5 text-titanium/30'
            }`}
            title={voiceEnabled ? 'Mute TTS' : 'Enable TTS'}
          >
            {voiceEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
          </button>
          <button
            onClick={clearChat}
            className="w-7 h-7 rounded-lg bg-pearl/5 text-titanium/30 hover:text-crimson/60 hover:bg-crimson/10 transition-colors flex items-center justify-center"
            title="Clear chat"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Language selector */}
      <div className="px-5 py-2 border-b border-pearl/5 flex items-center gap-1.5 overflow-x-auto scrollbar-hide shrink-0">
        <Globe size={10} className="text-titanium/30 shrink-0" />
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            onClick={() => changeLang(l.code)}
            className={`text-[9px] px-2 py-1 rounded-full whitespace-nowrap transition-all ${
              lang === l.code
                ? 'bg-ice-blue/15 text-ice-blue border border-ice-blue/20'
                : 'text-titanium/40 hover:text-pearl/60 border border-transparent'
            }`}
          >
            {l.native}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i === messages.length - 1 ? 0 : undefined }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-ice-blue/15 border border-ice-blue/20 text-pearl/90'
                  : 'bg-pearl/5 border border-pearl/5 text-pearl/70'
              }`}
            >
              <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <span className="text-[7px] text-titanium/20 font-mono mt-1.5 block">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-pearl/5 border border-pearl/5 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1.5">
                <motion.div className="w-1.5 h-1.5 rounded-full bg-ice-blue/60" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                <motion.div className="w-1.5 h-1.5 rounded-full bg-ice-blue/60" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
                <motion.div className="w-1.5 h-1.5 rounded-full bg-ice-blue/60" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-3 border-t border-pearl/5 shrink-0">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about Hyperion's agents, features, or capabilities..."
              rows={1}
              className="w-full bg-pearl/5 border border-pearl/10 rounded-xl px-3.5 py-2.5 text-xs text-pearl/70 placeholder:text-titanium/30 outline-none focus:border-ice-blue/30 focus:bg-pearl/[0.03] transition-all resize-none scrollbar-hide"
              style={{ minHeight: '36px', maxHeight: '120px' }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
              }}
            />
          </div>
          {isSupported && (
            <button
              onClick={toggleListening}
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                isListening
                  ? 'bg-crimson/20 text-crimson border border-crimion/30'
                  : 'bg-pearl/5 text-titanium/40 hover:text-pearl border border-pearl/5 hover:border-ice-blue/20'
              }`}
            >
              {isListening ? <MicOff size={14} /> : <Mic size={14} />}
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isTyping}
            className="w-9 h-9 rounded-xl bg-ice-blue/20 text-ice-blue border border-ice-blue/25 hover:bg-ice-blue/30 transition-all shrink-0 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isTyping ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
