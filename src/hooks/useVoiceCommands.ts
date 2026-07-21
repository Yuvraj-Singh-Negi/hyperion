'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface VoiceCommandHandler {
  command: string;
  action: () => void;
}

interface VoiceCommandsReturn {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  toggleListening: () => void;
  transcriptHistory: string[];
}

export function useVoiceCommands(commands: VoiceCommandHandler[]): VoiceCommandsReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [transcriptHistory, setTranscriptHistory] = useState<string[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results[event.results.length - 1];
      const text = last[0].transcript.toLowerCase();
      setTranscript(text);

      if (last.isFinal) {
        setTranscriptHistory((prev) => [...prev.slice(-9), text]);

        for (const cmd of commands) {
          if (text.includes(cmd.command.toLowerCase())) {
            cmd.action();
            break;
          }
        }
      }
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
    };

    return () => {
      recognitionRef.current?.abort();
    };
  }, [isSupported, commands]);

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

  return { isListening, transcript, isSupported, toggleListening, transcriptHistory };
}
