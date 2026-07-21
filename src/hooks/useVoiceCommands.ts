'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { speakText } from '@/lib/apiService';

interface VoiceCommand {
  keywords: string[];
  action: () => void;
  description: string;
  response?: string;
}

interface VoiceCommandsReturn {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  toggleListening: () => void;
  lastCommand: string | null;
  transcriptHistory: string[];
  speakResponse: (text: string) => Promise<void>;
  isSpeaking: boolean;
}

export function useVoiceCommands(commands: VoiceCommand[]): VoiceCommandsReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [transcriptHistory, setTranscriptHistory] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const commandsRef = useRef(commands);
  const isSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    commandsRef.current = commands;
  }, [commands]);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionClass();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results[event.results.length - 1];
      const text = last[0].transcript.toLowerCase().trim();
      setTranscript(text);

      if (last.isFinal) {
        setTranscriptHistory((prev) => [...prev.slice(-19), text]);

        // Check for exact keyword matches first
        for (const cmd of commandsRef.current) {
          const matched = cmd.keywords.some((kw) => text.includes(kw.toLowerCase()));
          if (matched) {
            setLastCommand(cmd.description);
            cmd.action();
            if (cmd.response) {
              speakText(cmd.response).then(() => {}).catch(() => {});
            }
            return;
          }
        }
      }
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      if (isListening) {
        try { recognitionRef.current?.start(); } catch { /* ignore */ }
      }
    };

    return () => {
      recognitionRef.current?.abort();
    };
  }, [isSupported, isListening]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript('');
      } catch {
        setIsListening(false);
      }
    }
  }, [isListening]);

  const speakResponse = useCallback(async (text: string) => {
    setIsSpeaking(true);
    await speakText(text);
    setIsSpeaking(false);
  }, []);

  return { isListening, transcript, isSupported, toggleListening, lastCommand, transcriptHistory, speakResponse, isSpeaking };
}
