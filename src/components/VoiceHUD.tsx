'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Command, Volume2 } from 'lucide-react';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';

interface WaveBar {
  height: number;
  duration: number;
}

function Waveform({ isListening }: { isListening: boolean }) {
  const [bars] = useState<WaveBar[]>(() => {
    const result: WaveBar[] = [];
    for (let i = 0; i < 24; i++) {
      result.push({
        height: Math.random() * 32 + 4,
        duration: 0.5 + Math.random() * 0.5,
      });
    }
    return result;
  });

  if (!isListening) {
    return (
      <div className="flex items-center gap-3 text-titanium/40">
        <Volume2 size={16} />
        <span className="text-xs">Say a command</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-full bg-ice-blue/60"
          animate={{
            height: [4, bar.height, 4],
          }}
          transition={{
            duration: bar.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  );
}

export default function VoiceHUD() {
  const [showHUD, setShowHUD] = useState(false);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const commands = [
    { command: 'open war room', action: () => scrollTo('war-room'), description: 'Navigate to War Room' },
    { command: 'activate scout', action: () => scrollTo('war-room'), description: 'View Scout Agent' },
    { command: 'show risks', action: () => scrollTo('dashboard'), description: 'View Threat Dashboard' },
    { command: 'show dashboard', action: () => scrollTo('dashboard'), description: 'View Dashboard' },
    { command: 'emergency mode', action: () => scrollTo('hero'), description: 'Return to overview' },
  ];

  const { isListening, transcript, isSupported, toggleListening, transcriptHistory } =
    useVoiceCommands(commands);

  if (!isSupported) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {showHUD && (
          <motion.div
            className="glass-panel rounded-2xl p-4 mb-4 w-72"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs tracking-wider text-titanium uppercase flex items-center gap-2">
                  <Command size={12} />
                  Voice Command
                </span>
                <span
                  className={`text-[10px] ${
                    isListening ? 'text-emerald' : 'text-titanium/40'
                  }`}
                >
                  {isListening ? 'Listening' : 'Idle'}
                </span>
              </div>

              <div className="relative h-16 flex items-center justify-center">
                <Waveform isListening={isListening} />
              </div>

              {transcript && (
                <div className="text-[10px] text-titanium/60 text-center italic">
                  &ldquo;{transcript}&rdquo;
                </div>
              )}

              {transcriptHistory.length > 0 && (
                <div className="pt-2 border-t border-pearl/5 space-y-1">
                  <span className="text-[9px] uppercase tracking-wider text-titanium/30">
                    Recent Commands
                  </span>
                  {transcriptHistory.slice(-3).map((cmd, i) => (
                    <div key={i} className="text-[10px] text-titanium/40 truncate">
                      {cmd}
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-pearl/5 space-y-1.5">
                <span className="text-[9px] uppercase tracking-wider text-titanium/30">
                  Available Commands
                </span>
                {commands.map((cmd) => (
                  <div
                    key={cmd.command}
                    className="text-[10px] text-titanium/50 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-ice-blue/30 shrink-0" />
                    {cmd.description}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
          isListening
            ? 'bg-crimson/20 text-crimson border border-crimson/30 shadow-glow-blue'
            : 'glass-light text-titanium hover:text-pearl hover:bg-pearl/10'
        }`}
        onClick={() => {
          toggleListening();
          if (!showHUD) setShowHUD(true);
        }}
        onMouseEnter={() => setShowHUD(true)}
        onMouseLeave={() => {
          if (!isListening) setShowHUD(false);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isListening ? 'Stop listening' : 'Start voice command'}
      >
        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
      </motion.button>
    </div>
  );
}
