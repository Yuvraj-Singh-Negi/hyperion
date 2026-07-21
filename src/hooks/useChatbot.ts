'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage, SupportedLang, LANGUAGES, findBestResponse, createMessage, getGreeting } from '@/lib/chatbotEngine';
import { speakText } from '@/lib/apiService';

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

    await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));

    const response = findBestResponse(text, lang);
    const assistantMsg = createMessage('assistant', response);
    setMessages((prev) => [...prev, assistantMsg]);
    setIsTyping(false);

    if (voiceEnabled) {
      speakText(response).catch(() => {});
    }
  }, [lang, voiceEnabled]);

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
