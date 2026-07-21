'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage, SupportedLang, createMessage, getGreeting } from '@/lib/chatbotEngine';
import { speakText, chatWithAI } from '@/lib/apiService';

const SYSTEM_PROMPT = `You are Hyperion Assistant, the AI helpdesk for the Hyperion autonomous War Room platform. You are helpful, concise, and knowledgeable.

HYPERION PLATFORM OVERVIEW:
Hyperion is an autonomous AI War Room that orchestrates a 4-agent swarm to detect, analyze, simulate, and neutralize enterprise crises. Built with Next.js, Tailwind CSS, Framer Motion, and React Flow.

CORE AGENTS:
- Scout Agent (first responder): Ingests CSV datasets (8 telemetry columns: throughput, latency_ms, error_rate, cyber_alerts, energy_usage, supply_chain_index, financial_volatility, satellite_signal). Scans for statistical anomalies using outlier detection (>1.8 std deviations). Found in War Room view.
- Strategist Agent (risk modeler): Models escalation scenarios from Scout's anomalies. Each scenario has probability (60-90%), impact assessment, cost estimate ($), and timeline. Projects cascade effects.
- Tactical Agent (mitigator): Formulates 5-7 concrete mitigation actions (API calls, notifications, resource reallocation, security patches, supplier negotiations). Each has pending/executing/completed status.
- Commander Agent (decision-maker): Reviews tactical plan, authorizes mitigations, logs decisions. Can be authorized via voice command "Hyperion, authorize".

VIEWS:
1. War Room — command center with agent graph (React Flow), communication feed, agent status panel
2. Intelligence — upload CSV datasets for analysis (drag-drop or file picker)
3. Threats — detailed dashboard: anomaly timeline, risk scenarios, mitigation actions, live counters
4. Tickets — autonomous ticket resolution orchestrator with 4 sub-agents (Ticket Analyzer, Knowledge Searcher, Database Operator, Resolution Composer), knowledge base of 10+ categories
5. Code AI — self-correcting code generation agent: generate JS from natural language → validate syntax → run 5 test cases → parse errors → refactor → retest (up to 3 attempts)
6. Assistant — you! The AI helpdesk chatbot

FEATURES:
- Voice commands: click mic icon, say "Open War Room", "Show dashboard", "Deploy analysis", "Status report", "Authorize protocol", "Open tickets", "Load sample data", "Reset system", "Open code agent"
- Text-to-Speech: speaks analysis completion, ticket resolution, code results, voice confirmations, status reports
- CSV analysis pipeline: 4 phases run sequentially (~11s total), visualized in React Flow graph
- Webhook/SMS alerts: POST JSON summary to webhook URL, configurable via NEXT_PUBLIC_WEBHOOK_URL
- Cinematic dark theme: particle field, scanning line, glass-morphism panels, gradient accents, Earth-from-orbit hero background
- 13 language support: English, Spanish, French, German, Chinese, Japanese, Korean, Arabic, Portuguese, Russian, Hindi, Italian, Dutch

TECH STACK: Next.js, React 19, TypeScript, Tailwind CSS 4, Framer Motion, React Flow, Lucide icons, PapaParse (CSV), Web Speech API (voice), Groq LLM (AI)

TONE: Professional, slightly futuristic, concise. Use bullet points for lists. Keep responses under 150 words unless asked for detail. If you don't know something, say so honestly.`;

export function useChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage('assistant', getGreeting('en')),
  ]);
  const [lang, setLang] = useState<SupportedLang>('en');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const changeLang = useCallback((newLang: SupportedLang) => {
    setLang(newLang);
    setMessages([createMessage('assistant', getGreeting(newLang))]);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg = createMessage('user', text);
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const context = messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    try {
      const response = await chatWithAI(SYSTEM_PROMPT, context, text);
      const assistantMsg = createMessage('assistant', response);
      setMessages((prev) => [...prev, assistantMsg]);

      if (voiceEnabled) {
        speakText(response).catch(() => {});
      }
    } catch {
      const fallback = 'I apologize, but I encountered an error. Please try your question again.';
      setMessages((prev) => [...prev, createMessage('assistant', fallback)]);
    }

    setIsTyping(false);
  }, [messages, voiceEnabled]);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionClass();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = lang === 'zh' ? 'zh-CN' : lang === 'ja' ? 'ja-JP' : lang === 'ko' ? 'ko-KR' : lang === 'ar' ? 'ar-SA' : lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : lang === 'de' ? 'de-DE' : lang === 'pt' ? 'pt-BR' : lang === 'ru' ? 'ru-RU' : lang === 'hi' ? 'hi-IN' : lang === 'it' ? 'it-IT' : lang === 'nl' ? 'nl-NL' : 'en-US';

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results[event.results.length - 1];
      const text = last[0].transcript;
      setInput(text);
      if (last.isFinal) {
        sendMessage(text);
        setIsListening(false);
      }
    };

    recognitionRef.current.onerror = () => setIsListening(false);
    recognitionRef.current.onend = () => setIsListening(false);

    return () => recognitionRef.current?.abort();
  }, [isSupported, lang, sendMessage]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  }, [isListening]);

  const clearChat = useCallback(() => {
    setMessages([createMessage('assistant', getGreeting(lang))]);
  }, [lang]);

  return { messages, input, setInput, lang, changeLang, isTyping, voiceEnabled, setVoiceEnabled, isListening, isSupported, sendMessage, toggleListening, clearChat };
}
