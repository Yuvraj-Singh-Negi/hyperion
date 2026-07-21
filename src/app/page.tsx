'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Activity, Shield, ChevronDown, Terminal, Zap, Radio, Mic, MicOff, Command, ArrowRight, Globe, Satellite, Radar, Brain, Target, Crown, AlertTriangle, BarChart3, Layers, RefreshCw, Download, Send, Clock, Headset, Bug } from 'lucide-react';
import Image from 'next/image';
import SplashScreen from '@/components/SplashScreen';
import DataUploader from '@/components/DataUploader';
import AgentGraph from '@/components/AgentGraph';
import ParticleField from '@/components/ParticleField';
import ScanningLine from '@/components/ScanningLine';
import NewsFeed from '@/components/NewsFeed';
import EmergencyBanner from '@/components/EmergencyBanner';
import TicketPanel from '@/components/TicketPanel';
import CodeAgentPanel from '@/components/CodeAgentPanel';
import { useCSVParser } from '@/hooks/useCSVParser';
import { useOrchestrator } from '@/hooks/useOrchestrator';
import { useCodeAgent } from '@/hooks/useCodeAgent';
import { useAgentSystem } from '@/hooks/useAgentSystem';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { speakText, sendWebhookAlert } from '@/lib/apiService';
import { Anomaly, TacticalAction, AgentScenario } from '@/types';

const severityColors: Record<string, string> = {
  low: 'text-titanium border-titanium/20 bg-titanium/5',
  moderate: 'text-amber border-amber/20 bg-amber/5',
  high: 'text-crimson border-crimson/20 bg-crimson/5',
  critical: 'text-crimson border-crimson/30 bg-crimson/10',
};

const severityGradients: Record<string, string> = {
  low: 'from-titanium/20 to-titanium/5',
  moderate: 'from-amber/30 to-amber/10',
  high: 'from-crimson/40 to-crimson/10',
  critical: 'from-crimson/60 to-crimson/20',
};

function AnimatedCounter({ value, color }: { value: number; color: string }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) return;
    const duration = 800;
    const startTime = performance.now();
    let raf: number;
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
      else prevRef.current = end;
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span className={`text-3xl font-light ${color}`}>{display}</span>;
}

function CollapsibleSection({ title, icon, defaultOpen, badge, children }: { title: string; icon: React.ReactNode; defaultOpen?: boolean; badge?: string | number; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="glass-panel rounded-2xl overflow-hidden transition-all duration-300">
      <button onClick={() => setOpen(!open)} className="w-full px-6 py-4 flex items-center justify-between text-left group">
        <div className="flex items-center gap-3">
          <span className="text-titanium/40 group-hover:text-ice-blue/60 transition-colors">{icon}</span>
          <span className="text-sm font-medium text-pearl/70 group-hover:text-pearl/90 transition-colors">{title}</span>
          {badge !== undefined && (
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-ice-blue/10 text-ice-blue/80 font-mono">{badge}</span>
          )}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="text-titanium/30" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-6 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VoiceWaveform() {
  const [bars] = useState(() =>
    Array.from({ length: 32 }, () => ({
      height: Math.random() * 28 + 3,
      duration: 0.4 + Math.random() * 0.3,
    }))
  );

  return (
    <div className="flex items-center gap-[2px] h-10 mb-3">
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-full bg-gradient-to-t from-ice-blue/30 to-ice-blue/90"
          animate={{ height: [2, bar.height, 2] }}
          transition={{ duration: bar.duration, repeat: Infinity, ease: 'easeInOut', delay: i * 0.03 }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [splashComplete, setSplashComplete] = useState(false);
  const [view, setView] = useState('war-room');
  const [showVoiceHUD, setShowVoiceHUD] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const { csvData, parsing, error, parseFile, reset: resetCSV } = useCSVParser();
  const { agents, state, messages, running, completed, currentPhase, runAnalysis, reset: resetAgents } = useAgentSystem();
  const { ticket: orchTicket, plan: orchPlan, currentStepIndex: orchStep, running: orchRunning, completed: orchCompleted, resolution: orchResolution, submitTicket, loadDemo: loadOrchDemo, reset: resetOrchestrator } = useOrchestrator();
  const { iterations: codeIterations, running: codeRunning, completed: codeCompleted, result: codeResult, currentCode, currentAttempt, startGeneration, reset: resetCodeAgent } = useCodeAgent();

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const loadSample = useCallback(() => {
    fetch('/sample_data.csv')
      .then((r) => r.text())
      .then((text) => {
        const file = new File([text], 'sample_data.csv', { type: 'text/csv' });
        parseFile(file);
      });
  }, [parseFile]);

  const deployAnalysis = useCallback(() => {
    if (csvData && !running) {
      resetAgents();
      runAnalysis(csvData);
      speakText('Deploying analysis. All agents activating.').catch(() => {});
    }
  }, [csvData, running, resetAgents, runAnalysis]);

  const voiceCommands = [
    { keywords: ['open war room', 'war room', 'command center'], action: () => { setView('war-room'); scrollToSection('command-center'); }, description: 'Open War Room', response: 'Opening War Room. All stations online.' },
    { keywords: ['activate scout', 'scout', 'show anomalies'], action: () => { setView('war-room'); scrollToSection('command-center'); }, description: 'View Scout', response: 'Scout agent feed displayed.' },
    { keywords: ['show risks', 'show dashboard', 'dashboard', 'anomalies'], action: () => { setView('dashboard'); scrollToSection('command-center'); }, description: 'View Dashboard', response: 'Opening threat dashboard.' },
    { keywords: ['emergency mode', 'emergency', 'full alert', 'lockdown'], action: () => { setView('war-room'); if (csvData && !running) { resetAgents(); runAnalysis(csvData); } scrollToSection('command-center'); }, description: 'Emergency Mode', response: 'Emergency mode engaged. All agents activated.' },
    { keywords: ['upload data', 'load data', 'import'], action: () => { setView('upload'); scrollToSection('command-center'); }, description: 'Upload Data', response: 'Opening intelligence upload interface.' },
    { keywords: ['start analysis', 'analyze', 'run', 'execute','deploy analysis'], action: () => { deployAnalysis(); }, description: 'Start Analysis', response: 'Analysis initiated. Agent swarm deploying.' },
    { keywords: ['reset', 'clear', 'stop', 'stand down'], action: () => { resetAgents(); resetCSV(); speakText('System reset complete. Standing by.').catch(() => {}); }, description: 'Reset System', response: 'All systems reset. Ready for new mission.' },
    { keywords: ['open tickets', 'ticket', 'orchestrate', 'support'], action: () => { setView('orchestrate'); }, description: 'Open Ticket Orchestrator', response: 'Opening ticket resolution orchestrator.' },
    { keywords: ['open code agent', 'code agent', 'code ai'], action: () => { setView('code-agent'); }, description: 'Open Code Agent', response: 'Opening self-correcting code agent.' },
    { keywords: ['load sample', 'sample data', 'demo mode'], action: () => { loadSample(); }, description: 'Load Sample Data', response: 'Loading sample intelligence dataset.' },
    { keywords: ['isolate', 'quarantine', 'lock down'], action: () => { setView('dashboard'); }, description: 'Isolate Anomalies', response: 'Isolating threat nodes. Quarantine protocols active.' },
    { keywords: ['status report', 'status', 'report', 'sitrep'], action: () => {
      const active = agents.filter(a => a.status !== 'idle').length;
      const msg = `Situation report: ${active} of 4 agents active. ${state.scout.anomalies.length} anomalies detected. ${state.tactical.actions.length} mitigations queued.`;
      speakText(msg).catch(() => {});
    }, description: 'Status Report', response: 'Generating situation report.' },
    { keywords: ['authorize', 'approve', 'execute plan', 'green light'], action: () => {
      if (completed) {
        speakText('All mitigations already authorized and deployed. Mission complete.').catch(() => {});
      } else if (running) {
        speakText('Analysis still in progress. Awaiting commander recommendation.').catch(() => {});
      } else {
        speakText('No active mission to authorize. Please run an analysis first.').catch(() => {});
      }
    }, description: 'Authorize Protocol', response: 'Authorization protocols checked.' },
  ];

  const { isListening, transcript, isSupported, toggleListening, lastCommand, isSpeaking } = useVoiceCommands(voiceCommands);

  return (
    <>
      {!splashComplete && <SplashScreen onComplete={() => setSplashComplete(true)} />}

      <div ref={mainRef} id="command-center" className="relative min-h-screen bg-obsidian overflow-hidden">

        {/* Particle Field Background */}
        <ParticleField />

        {/* Scanning Line */}
        {running && <ScanningLine speed={3} />}

        {/* Emergency Alert Banner */}
        <EmergencyBanner key={`alert-${state.scout.anomalies.length}-${completed}`} anomalies={state.scout.anomalies} />

        {/* Hero Background — Earth from orbit */}
        <div className="fixed inset-0 z-[2]">
          <Image
            src="https://images.unsplash.com/photo-1614730321143-b6c4fc16ea29?w=1920&q=90"
            alt=""
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/90 via-obsidian/70 to-obsidian/95" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/50 via-transparent to-obsidian/50" />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-obsidian to-transparent" />
        </div>

        {/* Command Center overlay */}
        <div className="fixed inset-0 z-[3] pointer-events-none opacity-20 mix-blend-screen">
          <Image
            src="https://images.unsplash.com/photo-1517976487492-5750f3195933?w=1920&q=85"
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <div className="fixed inset-0 z-[3] bg-gradient-to-t from-obsidian via-obsidian/90 to-obsidian/70 pointer-events-none" />

        {/* Grid overlay */}
        <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.015]"
          style={{ backgroundImage: 'linear-gradient(rgba(100,210,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(100,210,255,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        />

        {/* Current Phase Indicator */}
        {running && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50">
            <div className="glass rounded-full px-5 py-2 flex items-center gap-3 border border-ice-blue/10 shadow-glow-blue">
              <motion.div className="w-2 h-2 rounded-full bg-ice-blue" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, repeat: Infinity }} />
              <span className="text-[10px] font-mono uppercase tracking-widest text-ice-blue/80">
                {currentPhase ? `Phase: ${currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} Agent` : 'Deploying...'}
              </span>
              <span className="text-[8px] text-titanium/40 font-mono">ACTIVE</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 pt-6">
          <div className="max-w-7xl mx-auto">
            <div className="glass rounded-2xl px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-ice-blue/20 to-ice-blue/5 border border-ice-blue/20 flex items-center justify-center shadow-glow-blue"
                  animate={running ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 2, repeat: running ? Infinity : 0 }}
                >
                  <Satellite size={18} className="text-ice-blue" />
                </motion.div>
                <div>
                  <span className="text-sm font-medium tracking-[0.25em] text-pearl/80">HYPERION</span>
                  <span className="text-[8px] tracking-[0.3em] text-titanium/40 uppercase ml-3">War Room OS</span>
                </div>
                {completed && (
                  <span className="text-[8px] px-2 py-0.5 rounded-full bg-emerald/10 text-emerald/80 border border-emerald/10 font-mono tracking-wider ml-2">
                    MISSION COMPLETE
                  </span>
                )}
              </div>

              <div className="hidden md:flex items-center gap-8">
                {[
                  { key: 'war-room', label: 'War Room', icon: <Satellite size={10} /> },
                  { key: 'upload', label: 'Intelligence', icon: <Globe size={10} /> },
                  { key: 'dashboard', label: 'Threats', icon: <AlertTriangle size={10} /> },
                  { key: 'orchestrate', label: 'Tickets', icon: <Headset size={10} /> },
                  { key: 'code-agent', label: 'Code AI', icon: <Bug size={10} /> },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setView(item.key)}
                    className={`text-xs tracking-widest uppercase transition-all duration-300 relative flex items-center gap-2 ${
                      view === item.key ? 'text-ice-blue' : 'text-titanium/50 hover:text-pearl/70'
                    }`}
                  >
                    <span className={view === item.key ? 'text-ice-blue' : 'text-titanium/30'}>{item.icon}</span>
                    {item.label}
                    {view === item.key && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-ice-blue/60"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                {isSupported && (
                  <button
                    onClick={toggleListening}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isListening
                        ? 'bg-crimson/25 text-crimson border-2 border-crimson/40 shadow-glow-amber'
                        : 'glass-light text-titanium/50 hover:text-pearl border border-pearl/5 hover:border-ice-blue/20'
                    }`}
                    onMouseEnter={() => setShowVoiceHUD(true)}
                    onMouseLeave={() => { if (!isListening) setTimeout(() => setShowVoiceHUD(false), 1200); }}
                    aria-label="Voice command"
                  >
                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                  </button>
                )}
                <button
                  onClick={deployAnalysis}
                  disabled={!csvData || running}
                  className="group px-5 py-2.5 text-xs tracking-widest uppercase rounded-full bg-gradient-to-r from-ice-blue/25 to-ice-blue/10 text-ice-blue border border-ice-blue/25 hover:from-ice-blue/35 hover:to-ice-blue/15 transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-2 shadow-glow-blue/50"
                >
                  {running ? (
                    <><motion.div className="w-3 h-3 rounded-full border-2 border-ice-blue/30 border-t-ice-blue" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /> Deploying</>
                  ) : (
                    <><Radar size={12} /> Deploy Analysis</>
                  )}
                </button>
              </div>
            </div>

            {/* Voice HUD Dropdown */}
            <AnimatePresence>
              {showVoiceHUD && isSupported && (
                <motion.div
                  className="glass-panel rounded-2xl p-5 mt-2 max-w-sm ml-auto"
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  onMouseEnter={() => setShowVoiceHUD(true)}
                  onMouseLeave={() => setShowVoiceHUD(false)}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Command size={14} className="text-ice-blue" />
                    <span className="text-[10px] uppercase tracking-widest text-titanium/50">Voice Command Interface</span>
                    <span className={`text-[8px] ml-auto px-2 py-0.5 rounded-full ${
                      isListening ? 'bg-emerald/10 text-emerald border border-emerald/20' : 'bg-pearl/5 text-titanium/30'
                    }`}>
                      {isListening ? 'LISTENING' : 'STANDBY'}
                    </span>
                    {isSpeaking && (
                      <motion.span className="text-[8px] text-ice-blue/60" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, repeat: Infinity }}>
                        SPEAKING
                      </motion.span>
                    )}
                  </div>

                  {isListening && <VoiceWaveform />}

                  {transcript && (
                    <div className="text-xs text-ice-blue/80 mb-2 italic font-light border-l-2 border-ice-blue/20 pl-3">
                      &ldquo;{transcript}&rdquo;
                    </div>
                  )}
                  {lastCommand && (
                    <div className="text-[10px] text-emerald/80 mb-2 flex items-center gap-1.5">
                      <ArrowRight size={10} /> Executed: {lastCommand}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[8px] uppercase tracking-wider text-titanium/30 w-full mb-0.5">Quick Commands</span>
                    {voiceCommands.slice(0, 6).map((cmd) => (
                      <span key={cmd.description} className="text-[9px] px-2.5 py-1 rounded-full bg-pearl/5 border border-pearl/5 text-titanium/50 hover:border-ice-blue/10 hover:text-ice-blue/60 transition-colors cursor-default">
                        {cmd.keywords[0]}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Main Content */}
        <main className="relative z-10 pt-32 pb-24 max-w-7xl mx-auto px-6">
          <AnimatePresence mode="wait">
            {/* ===== WAR ROOM VIEW ===== */}
            {view === 'war-room' && (
              <motion.div
                key="war-room"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-light text-[10px] tracking-widest text-ice-blue/80 uppercase border border-ice-blue/10">
                      <Satellite size={10} />
                      <span>Command Center — Autonomous Operations</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-light text-pearl/90 tracking-tight">War Room</h2>
                    <p className="text-sm text-titanium/50 font-light max-w-xl">
                      Deploy the 4-agent swarm to detect anomalies, model risks, plan mitigations, and execute countermeasures in real time.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {!csvData ? (
                      <>
                        <button
                          onClick={() => setView('upload')}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ice-blue/10 text-ice-blue border border-ice-blue/20 hover:bg-ice-blue/20 transition-all text-xs tracking-wide"
                        >
                          <Upload size={12} />
                          Upload Dataset
                        </button>
                        <button
                          onClick={loadSample}
                          className="px-5 py-2.5 rounded-full border border-pearl/10 text-titanium/50 hover:text-pearl/70 hover:border-pearl/20 transition-all text-xs tracking-wide inline-flex items-center gap-2"
                        >
                          <RefreshCw size={11} />
                          Load Sample Data
                        </button>
                      </>
                    ) : (
                      <>
                        {!running && (
                          <button
                            onClick={deployAnalysis}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald/15 text-emerald border border-emerald/25 hover:bg-emerald/25 transition-all text-xs tracking-wide shadow-glow-emerald/30"
                          >
                            <Radar size={12} />
                            Run Analysis
                          </button>
                        )}
                        <button
                          onClick={() => { resetAgents(); resetCSV(); }}
                          className="px-3 py-2.5 text-[10px] text-titanium/30 hover:text-pearl/50 transition-colors"
                        >
                          Clear
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <AgentGraph agents={agents} state={state} activeRole={currentPhase || undefined} />

                {/* Live Intelligence Feed */}
                {csvData && <NewsFeed />}

                {/* Agent Communication + Status side by side */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <CollapsibleSection title="Agent Communication" icon={<Radio size={14} />} defaultOpen badge={messages.length}>
                    <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide pr-1">
                      {messages.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 rounded-2xl bg-pearl/5 border border-pearl/5 flex items-center justify-center mx-auto mb-3">
                            <Radio size={18} className="text-titanium/20" />
                          </div>
                          <p className="text-xs text-titanium/30 italic">Awaiting agent activity.</p>
                          <p className="text-[9px] text-titanium/20 mt-1">Load a dataset and deploy analysis to initiate agent swarm.</p>
                        </div>
                      ) : (
                        messages.map((msg, i) => {
                          const colors: Record<string, string> = { scout: '#64d2ff', strategist: '#fbbf24', tactical: '#ef4444', commander: '#34d399' };
                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="group flex items-start gap-3 text-xs border-l-2 pl-3 py-2 hover:bg-white/[0.02] rounded-r-lg transition-colors"
                              style={{ borderColor: `${colors[msg.from]}40` }}
                            >
                              <div className="flex flex-col w-full">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[8px] font-mono uppercase tracking-wider" style={{ color: colors[msg.from] }}>
                                    {msg.from}
                                  </span>
                                  <span className="text-titanium/20 text-[8px]">→</span>
                                  <span className="text-[8px] font-mono text-titanium/30 uppercase">{msg.to === 'all' ? 'All Agents' : msg.to}</span>
                                  <span className="ml-auto text-[7px] text-titanium/20 font-mono">
                                    T+{((msg.timestamp - messages[0]?.timestamp || 0) / 1000).toFixed(1)}s
                                  </span>
                                </div>
                                <span className="text-xs text-pearl/60 leading-relaxed">{msg.content}</span>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  </CollapsibleSection>

                  <CollapsibleSection title="Agent Status" icon={<Terminal size={14} />} defaultOpen>
                    <div className="space-y-4">
                      {[
                        { label: 'Scout', icon: <Radar size={12} />, role: 'scout', message: state.scout.message, badge: state.scout.anomalies.length > 0 ? `${state.scout.anomalies.length} anomalies` : null, status: state.scout.scanning ? 'scanning' : state.scout.anomalies.length > 0 ? 'complete' : 'idle' },
                        { label: 'Strategist', icon: <Brain size={12} />, role: 'strategist', message: state.strategist.message, badge: state.strategist.scenarios.length > 0 ? `${state.strategist.scenarios.length} scenarios` : null, status: state.strategist.analyzing ? 'scanning' : state.strategist.scenarios.length > 0 ? 'complete' : 'idle' },
                        { label: 'Tactical', icon: <Target size={12} />, role: 'tactical', message: state.tactical.message, badge: state.tactical.actions.length > 0 ? `${state.tactical.actions.length} actions` : null, status: state.tactical.planning ? 'scanning' : state.tactical.actions.length > 0 ? 'complete' : 'idle' },
                        { label: 'Commander', icon: <Crown size={12} />, role: 'commander', message: state.commander.decision === 'approved' ? 'Mission approved — all systems go' : state.commander.feedback, badge: null, status: state.commander.decision === 'approved' ? 'complete' : 'idle' },
                      ].map((item) => {
                        const agent = agents.find(a => a.role === item.role);
                        return (
                          <div key={item.label} className="flex items-center gap-4 py-2.5 border-b border-pearl/[0.03] last:border-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              item.status === 'complete' ? 'bg-emerald/10 text-emerald' :
                              item.status === 'scanning' ? 'bg-ice-blue/10 text-ice-blue' : 'bg-pearl/5 text-titanium/30'
                            }`}>
                              {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-medium ${item.status === 'complete' ? 'text-emerald/80' : item.status === 'scanning' ? 'text-ice-blue/80' : 'text-titanium/40'}`}>
                                  {item.label}
                                </span>
                                <motion.span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    item.status === 'complete' ? 'bg-emerald shadow-glow-emerald' :
                                    item.status === 'scanning' ? 'bg-ice-blue' : 'bg-titanium/20'
                                  }`}
                                  animate={item.status === 'scanning' ? { scale: [1, 1.5, 1] } : {}}
                                  transition={{ duration: 1.5, repeat: item.status === 'scanning' ? Infinity : 0 }}
                                />
                                <span className="text-[8px] text-titanium/20 font-mono ml-auto">{item.status.toUpperCase()}</span>
                              </div>
                              <p className="text-[10px] text-titanium/40 mt-0.5 truncate">{item.message}</p>
                            </div>
                            {item.badge && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-ice-blue/10 text-ice-blue/70 shrink-0 font-mono">{item.badge}</span>
                            )}
                            {agent && agent.confidence < 100 && item.status !== 'idle' && (
                              <span className="text-[8px] text-titanium/20 font-mono shrink-0">{agent.confidence}%</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleSection>
                </div>
              </motion.div>
            )}

            {/* ===== INTELLIGENCE / UPLOAD VIEW ===== */}
            {view === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-3xl mx-auto space-y-8"
              >
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-light text-[10px] tracking-widest text-ice-blue/80 uppercase border border-ice-blue/10">
                    <Globe size={10} />
                    <span>Signal Intelligence — Data Ingestion</span>
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-light text-pearl/90 tracking-tight">Import Intelligence</h2>
                  <p className="text-sm text-titanium/50 max-w-lg mx-auto leading-relaxed">
                    Upload a CSV dataset containing operational telemetry. Hyperion&apos;s Scout agent will
                    automatically scan for statistical anomalies and trigger the multi-agent analysis pipeline.
                  </p>
                  <button onClick={loadSample} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-pearl/10 text-titanium/50 hover:text-pearl/70 hover:border-pearl/20 transition-all text-xs tracking-wide">
                    <RefreshCw size={10} />
                    Use sample dataset instead
                  </button>
                </div>

                <DataUploader onFileLoaded={parseFile} parsing={parsing} error={error} csvData={csvData} />

                {csvData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel rounded-2xl p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-ice-blue/10 flex items-center justify-center">
                          <BarChart3 size={14} className="text-ice-blue" />
                        </div>
                        <h3 className="text-sm font-medium text-pearl/70">Dataset Preview</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] text-titanium/30 font-mono">{csvData.columns.length} columns · {csvData.rowCount} records</span>
                        <button
                          onClick={() => { resetAgents(); resetCSV(); }}
                          className="text-[9px] text-titanium/30 hover:text-crimson/60 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto scrollbar-hide rounded-xl border border-pearl/5">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-pearl/5 bg-pearl/[0.02]">
                            {csvData.columns.map((col) => (
                              <th key={col.key} className="text-left py-2.5 px-3 text-titanium/40 font-medium tracking-wider text-[9px] uppercase">{col.label}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvData.rows.slice(0, 5).map((row, i) => (
                            <tr key={i} className="border-b border-pearl/[0.02] hover:bg-pearl/[0.01] transition-colors">
                              {csvData.columns.map((col) => (
                                <td key={col.key} className="py-2.5 px-3 text-pearl/50 truncate max-w-[140px] font-mono text-[10px]">{String(row[col.key] ?? '')}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] text-titanium/30">Showing {Math.min(5, csvData.rows.length)} of {csvData.rows.length} entries</p>
                      <button
                        onClick={() => { setView('war-room'); resetAgents(); runAnalysis(csvData); }}
                        className="text-[10px] tracking-wider text-ice-blue/70 hover:text-ice-blue flex items-center gap-1.5 transition-colors"
                      >
                        Analyze Dataset <ArrowRight size={10} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ===== THREAT DASHBOARD VIEW ===== */}
            {view === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8 max-w-5xl mx-auto"
              >
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-light text-[10px] tracking-widest text-amber/80 uppercase border border-amber/10">
                    <AlertTriangle size={10} />
                    <span>Threat Analysis — Real-Time Assessment</span>
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-light text-pearl/90 tracking-tight">Threat Dashboard</h2>
                  <p className="text-sm text-titanium/50 max-w-lg mx-auto leading-relaxed">
                    Detected anomalies, risk scenarios, and autonomous mitigation actions
                    generated by the Hyperion agent swarm.
                  </p>
                  {!csvData && (
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={loadSample} className="px-4 py-2 rounded-full border border-pearl/10 text-titanium/50 hover:text-pearl/70 hover:border-pearl/20 transition-all text-xs tracking-wide inline-flex items-center gap-2">
                        <RefreshCw size={10} />
                        Load Sample Data
                      </button>
                      <button onClick={() => { setView('upload'); }} className="px-4 py-2 rounded-full bg-ice-blue/10 text-ice-blue border border-ice-blue/20 hover:bg-ice-blue/20 transition-all text-xs tracking-wide inline-flex items-center gap-2">
                        <Upload size={10} />
                        Upload Dataset
                      </button>
                    </div>
                  )}
                </div>

                {state.scout.anomalies.length === 0 && !running ? (
                  <div className="glass-panel rounded-3xl p-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-pearl/5 border border-pearl/5 flex items-center justify-center mx-auto mb-4">
                      <Shield size={24} className="text-titanium/30" />
                    </div>
                    <p className="text-sm text-titanium/40">No threats detected</p>
                    <p className="text-xs text-titanium/20 mt-1">Upload a dataset and run analysis to populate the dashboard.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Live Stats */}
                    <div className="grid sm:grid-cols-4 gap-4">
                      {[
                        { label: 'Active Anomalies', value: state.scout.anomalies.length, color: 'text-crimson', bg: 'bg-crimson/10', icon: <AlertTriangle size={14} />, numeric: true },
                        { label: 'Risk Scenarios', value: state.strategist.scenarios.length, color: 'text-amber', bg: 'bg-amber/10', icon: <Activity size={14} />, numeric: true },
                        { label: 'Mitigation Actions', value: state.tactical.actions.length, color: 'text-ice-blue', bg: 'bg-ice-blue/10', icon: <Target size={14} />, numeric: true },
                        { label: 'Agent Status', value: `${agents.filter(a => a.status !== 'idle').length}/4`, color: 'text-emerald', bg: 'bg-emerald/10', icon: <Layers size={14} />, numeric: false },
                      ].map((stat) => (
                        <div key={stat.label} className="glass-panel rounded-2xl p-5 text-center">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-3 ${stat.bg} ${stat.color}`}>
                            {stat.icon}
                          </div>
                          {stat.numeric ? (
                            <AnimatedCounter value={stat.value as number} color={stat.color} />
                          ) : (
                            <span className={`text-3xl font-light ${stat.color}`}>{stat.value}</span>
                          )}
                          <div className="text-xs text-titanium/50 mt-1">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Anomaly Timeline */}
                    {state.scout.anomalies.length > 0 && (
                      <div className="glass-panel rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <Clock size={12} className="text-titanium/40" />
                          <span className="text-[10px] uppercase tracking-widest text-titanium/40 font-mono">Anomaly Timeline</span>
                          <span className="text-[8px] text-titanium/20 font-mono ml-auto">{state.scout.anomalies.length} events</span>
                        </div>
                        <div className="relative">
                          <div className="absolute left-[11px] top-3 bottom-3 w-px bg-pearl/5" />
                          <div className="space-y-3">
                            {state.scout.anomalies.map((a: Anomaly, i: number) => (
                              <motion.div
                                key={a.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-start gap-3"
                              >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 relative z-10 ${
                                  a.severity === 'critical' ? 'bg-crimson/20 border border-crimson/30' :
                                  a.severity === 'high' ? 'bg-amber/15 border border-amber/25' :
                                  a.severity === 'moderate' ? 'bg-amber/10 border border-amber/15' :
                                  'bg-titanium/10 border border-titanium/15'
                                }`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${
                                    a.severity === 'critical' ? 'bg-crimson' :
                                    a.severity === 'high' ? 'bg-amber' :
                                    'bg-titanium/40'
                                  }`} />
                                </div>
                                <div className="flex-1 min-w-0 pb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-medium text-pearl/70">{a.title}</span>
                                    <span className={`text-[7px] uppercase tracking-wider px-1 py-0.5 rounded-full border ${severityColors[a.severity]}`}>{a.severity}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5 text-[8px] text-titanium/30 font-mono">
                                    <span>{a.region}</span>
                                    <span className="w-1 h-1 rounded-full bg-pearl/10" />
                                    <span className={a.trend === 'up' ? 'text-crimson/50' : a.trend === 'down' ? 'text-emerald/50' : 'text-titanium/20'}>
                                      {a.value} {a.trend === 'up' ? '↑' : a.trend === 'down' ? '↓' : '→'}
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Anomalies Detail */}
                    <CollapsibleSection title="Detected Anomalies" icon={<Zap size={14} />} defaultOpen badge={state.scout.anomalies.length}>
                      <div className="space-y-3">
                        {state.scout.anomalies.map((a: Anomaly) => (
                          <motion.div
                            key={a.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group flex items-start gap-4 p-4 rounded-xl bg-pearl/[0.02] border border-pearl/5 hover:bg-pearl/[0.04] hover:border-pearl/10 transition-all"
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold bg-gradient-to-br ${severityGradients[a.severity]} ${
                              a.severity === 'critical' ? 'text-crimson' : a.severity === 'high' ? 'text-amber' : 'text-titanium'
                            }`}>
                              {a.severity === 'critical' ? 'CR' : a.severity === 'high' ? 'HI' : a.severity === 'moderate' ? 'MD' : 'LW'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-pearl/80">{a.title}</span>
                                <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${severityColors[a.severity]}`}>{a.severity}</span>
                              </div>
                              <p className="text-xs text-titanium/50 leading-relaxed">{a.description}</p>
                              <div className="flex items-center gap-3 mt-1.5 text-[9px] text-titanium/30 font-mono">
                                <span className="text-titanium/40">{a.region}</span>
                                <span className="w-1 h-1 rounded-full bg-pearl/10" />
                                <span>{a.timestamp}</span>
                                <span className="w-1 h-1 rounded-full bg-pearl/10" />
                                <span className={a.trend === 'up' ? 'text-crimson/50' : a.trend === 'down' ? 'text-emerald/50' : 'text-titanium/30'}>
                                  {a.value} {a.trend === 'up' ? '↑' : a.trend === 'down' ? '↓' : '→'}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CollapsibleSection>

                    {/* Scenarios */}
                    {state.strategist.scenarios.length > 0 && (
                      <CollapsibleSection title="Risk Scenarios" icon={<Activity size={14} />} badge={state.strategist.scenarios.length}>
                        <div className="space-y-3">
                          {state.strategist.scenarios.map((s: AgentScenario) => (
                            <div key={s.id} className="p-4 rounded-xl bg-pearl/[0.02] border border-pearl/5 hover:bg-pearl/[0.04] transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-pearl/70">{s.title}</span>
                                <span className="text-[10px] font-mono text-amber/80">{s.probability}% probability</span>
                              </div>
                              <p className="text-xs text-titanium/50 leading-relaxed mb-3">{s.description}</p>
                              <div className="flex items-center gap-4 text-[9px] text-titanium/30 font-mono">
                                <span>Impact: {s.impact}</span>
                                <span className="text-crimson/50">Cost: ${s.cost.toLocaleString()}</span>
                                <span>Timeline: {s.timeline}</span>
                              </div>
                              <div className="mt-2 h-1 rounded-full bg-pearl/5 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-amber/20 to-amber/40 transition-all duration-500"
                                  style={{ width: `${s.probability}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                    )}

                    {/* Actions */}
                    {state.tactical.actions.length > 0 && (
                      <CollapsibleSection title="Mitigation Actions" icon={<Shield size={14} />} badge={state.tactical.actions.length}>
                        <div className="space-y-2">
                          {state.tactical.actions.map((a: TacticalAction) => (
                            <div key={a.id} className="flex items-center gap-4 p-4 rounded-xl bg-pearl/[0.02] border border-pearl/5 hover:bg-pearl/[0.04] transition-colors">
                              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                a.status === 'completed' ? 'bg-emerald shadow-glow-emerald' :
                                a.status === 'executing' ? 'bg-ice-blue animate-pulse' : 'bg-titanium/20'
                              }`} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-pearl/70">{a.label}</span>
                                  <span className="text-[8px] text-titanium/30 font-mono">via {a.target}</span>
                                </div>
                                <p className="text-[10px] text-titanium/40 mt-0.5">{a.description}</p>
                              </div>
                              <span className={`text-[8px] uppercase tracking-wider font-mono ${
                                a.status === 'completed' ? 'text-emerald/60' :
                                a.status === 'executing' ? 'text-ice-blue/60' : 'text-titanium/20'
                              }`}>{a.status}</span>
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ===== ORCHESTRATION VIEW ===== */}
            {view === 'orchestrate' && (
              <motion.div
                key="orchestrate"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="text-center space-y-4 mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-light text-[10px] tracking-widest text-ice-blue/80 uppercase border border-ice-blue/10">
                    <Headset size={10} />
                    <span>Autonomous Ticket Resolution — Zero-Shot Orchestration</span>
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-light text-pearl/90 tracking-tight">Ticket Orchestrator</h2>
                  <p className="text-sm text-titanium/50 max-w-xl mx-auto leading-relaxed">
                    Submit a support ticket. Hyperion&apos;s orchestrator analyzes intent, searches the knowledge base, updates records, and composes a resolution — all autonomously with zero-shot planning.
                  </p>
                </div>

                <TicketPanel
                  ticket={orchTicket}
                  plan={orchPlan}
                  currentStepIndex={orchStep}
                  running={orchRunning}
                  completed={orchCompleted}
                  resolution={orchResolution}
                  onSubmit={submitTicket}
                  onLoadDemo={loadOrchDemo}
                  onReset={resetOrchestrator}
                />
              </motion.div>
            )}

            {/* ===== CODE AGENT VIEW ===== */}
            {view === 'code-agent' && (
              <motion.div
                key="code-agent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="text-center space-y-4 mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-light text-[10px] tracking-widest text-ice-blue/80 uppercase border border-ice-blue/10">
                    <Bug size={10} />
                    <span>Self-Correcting Code Agent — Generate, Test, Parse, Refactor</span>
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-light text-pearl/90 tracking-tight">Code Agent</h2>
                  <p className="text-sm text-titanium/50 max-w-xl mx-auto leading-relaxed">
                    Describe a function. Hyperion generates code, runs it in a sandbox, parses runtime errors, and automatically refactors — looping up to 3 attempts until all tests pass.
                  </p>
                </div>

                <CodeAgentPanel
                  iterations={codeIterations}
                  running={codeRunning}
                  completed={codeCompleted}
                  result={codeResult}
                  currentCode={currentCode}
                  currentAttempt={currentAttempt}
                  onStart={startGeneration}
                  onReset={resetCodeAgent}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Analytics complete banner */}
        {completed && (
          <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="glass-panel rounded-2xl px-8 py-4 flex items-center gap-4 shadow-layered border-emerald/10">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald animate-pulse shadow-glow-emerald" />
              <div>
                <span className="text-sm text-emerald/90 font-light">Mission Complete</span>
                <span className="text-xs text-titanium/40 ml-3">
                  {state.scout.anomalies.length} threats resolved · {state.tactical.actions.length} mitigations deployed
                </span>
              </div>
              <div className="flex items-center gap-3 ml-6">
                <button
                  onClick={() => {
                    const report = {
                      timestamp: new Date().toISOString(),
                      anomalies: state.scout.anomalies,
                      scenarios: state.strategist.scenarios,
                      actions: state.tactical.actions,
                      commander: state.commander,
                    };
                    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `hyperion-report-${Date.now()}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="text-[10px] text-ice-blue/50 hover:text-ice-blue/80 transition-colors inline-flex items-center gap-1"
                >
                  <Download size={10} /> Report
                </button>
                <button
                  onClick={() => {
                    sendWebhookAlert(
                      `[HYPERION ALERT] Mission complete: ${state.scout.anomalies.length} anomalies resolved, ${state.tactical.actions.length} mitigations deployed. Total exposure: $${state.strategist.scenarios.reduce((s, sc) => s + sc.cost, 0).toLocaleString()}.`,
                    ).then((ok) => {
                      if (ok) speakText('Alert sent successfully. Decision makers notified.').catch(() => {});
                    });
                  }}
                  className="text-[10px] text-emerald/50 hover:text-emerald/80 transition-colors inline-flex items-center gap-1"
                >
                  <Send size={10} /> Send Alert
                </button>
                <button
                  onClick={() => { setView('dashboard'); }}
                  className="text-[10px] text-titanium/30 hover:text-pearl/60 transition-colors"
                >
                  Full Report
                </button>
                <button
                  onClick={() => { resetAgents(); resetCSV(); }}
                  className="text-[10px] text-titanium/30 hover:text-pearl/60 transition-colors"
                >
                  New Mission
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Status bar */}
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-pearl/[0.03] bg-obsidian/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-4 text-[9px] text-titanium/30 font-mono">
              <span className="flex items-center gap-1.5">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-emerald/60"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                System Online
              </span>
              <span>Hyperion Core v2.1</span>
              <span className="hidden sm:inline">• {csvData ? `${csvData.rowCount} records loaded` : 'No dataset'}</span>
              {running && <span className="text-ice-blue/60">• Pipeline active</span>}
            </div>
            <div className="flex items-center gap-4 text-[9px] text-titanium/20 font-mono">
              <span>{isSupported ? 'Voice API connected' : 'Voice API unavailable'}</span>
              <span className="hidden sm:inline">Agents: {agents.filter(a => a.status !== 'idle').length}/4 active</span>
              {running && (
                <motion.span className="text-ice-blue/40" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  ● ANALYZING
                </motion.span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
