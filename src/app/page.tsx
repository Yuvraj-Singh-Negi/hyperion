'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Activity, Shield, ChevronDown, Terminal, Zap, Radio, Mic, MicOff, Command, ArrowRight, Globe, Satellite, Radar } from 'lucide-react';
import Image from 'next/image';
import SplashScreen from '@/components/SplashScreen';
import DataUploader from '@/components/DataUploader';
import AgentGraph from '@/components/AgentGraph';
import { useCSVParser } from '@/hooks/useCSVParser';
import { useAgentSystem } from '@/hooks/useAgentSystem';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { Anomaly, TacticalAction, AgentScenario } from '@/types';

const severityColors: Record<string, string> = {
  low: 'text-titanium border-titanium/20 bg-titanium/5',
  moderate: 'text-amber border-amber/20 bg-amber/5',
  high: 'text-crimson border-crimson/20 bg-crimson/5',
  critical: 'text-crimson border-crimson/30 bg-crimson/10',
};

function CollapsibleSection({ title, icon, defaultOpen, children }: { title: string; icon: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full px-6 py-4 flex items-center justify-between text-left">
        <div className="flex items-center gap-3">
          <span className="text-titanium/40">{icon}</span>
          <span className="text-sm font-medium text-pearl/70">{title}</span>
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
      height: Math.random() * 24 + 2,
      duration: 0.4 + Math.random() * 0.3,
    }))
  );

  return (
    <div className="flex items-center gap-0.5 h-8 mb-3">
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-full bg-gradient-to-t from-ice-blue/40 to-ice-blue/80"
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
  const { agents, state, messages, running, completed, runAnalysis, reset: resetAgents } = useAgentSystem();

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const voiceCommands = [
    { keywords: ['open war room', 'war room', 'command center'], action: () => { setView('war-room'); scrollToSection('command-center'); }, description: 'Open War Room' },
    { keywords: ['activate scout', 'scout', 'show anomalies'], action: () => { setView('war-room'); scrollToSection('command-center'); }, description: 'View Scout' },
    { keywords: ['show risks', 'show dashboard', 'dashboard', 'anomalies'], action: () => { setView('dashboard'); scrollToSection('command-center'); }, description: 'View Dashboard' },
    { keywords: ['emergency mode', 'emergency', 'full alert'], action: () => { setView('war-room'); if (csvData && !running) { resetAgents(); runAnalysis(csvData); } scrollToSection('command-center'); }, description: 'Emergency Mode' },
    { keywords: ['upload data', 'load data', 'import'], action: () => { setView('upload'); scrollToSection('command-center'); }, description: 'Upload Data' },
    { keywords: ['start analysis', 'analyze', 'run', 'execute'], action: () => { if (csvData && !running) { resetAgents(); runAnalysis(csvData); } }, description: 'Start Analysis' },
    { keywords: ['reset', 'clear', 'stop'], action: () => { resetAgents(); resetCSV(); }, description: 'Reset System' },
  ];

  const { isListening, transcript, isSupported, toggleListening, lastCommand } = useVoiceCommands(voiceCommands);

  return (
    <>
      {!splashComplete && <SplashScreen onComplete={() => setSplashComplete(true)} />}

      <div ref={mainRef} id="command-center" className="relative min-h-screen bg-obsidian overflow-hidden">

        {/* Hero Background — Earth from orbit */}
        <div className="fixed inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1614730321143-b6c4fc16ea29?w=1920&q=90"
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/70 via-obsidian/50 to-obsidian/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/30 via-transparent to-obsidian/30" />
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-obsidian to-transparent" />
        </div>

        {/* Command Center image overlay for depth */}
        <div className="fixed inset-0 z-[1] pointer-events-none opacity-30 mix-blend-screen">
          <Image
            src="https://images.unsplash.com/photo-1517976487492-5750f3195933?w=1920&q=85"
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <div className="fixed inset-0 z-[1] bg-gradient-to-t from-obsidian via-obsidian/80 to-obsidian/60 pointer-events-none" />

        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 pt-6">
          <div className="max-w-7xl mx-auto">
            <div className="glass rounded-2xl px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ice-blue/20 to-ice-blue/5 border border-ice-blue/20 flex items-center justify-center shadow-glow-blue">
                  <Satellite size={16} className="text-ice-blue" />
                </div>
                <div>
                  <span className="text-sm font-medium tracking-[0.25em] text-pearl/80">HYPERION</span>
                  <span className="text-[8px] tracking-[0.3em] text-titanium/40 uppercase ml-3">War Room OS</span>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-8">
                {[
                  { key: 'war-room', label: 'War Room' },
                  { key: 'upload', label: 'Intelligence' },
                  { key: 'dashboard', label: 'Threats' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setView(item.key)}
                    className={`text-xs tracking-widest uppercase transition-all duration-300 relative ${
                      view === item.key ? 'text-ice-blue' : 'text-titanium/50 hover:text-pearl/70'
                    }`}
                  >
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
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isListening
                        ? 'bg-crimson/20 text-crimson border border-crimson/30 shadow-glow-blue'
                        : 'glass-light text-titanium/50 hover:text-pearl border border-pearl/5'
                    }`}
                    onMouseEnter={() => setShowVoiceHUD(true)}
                    onMouseLeave={() => { if (!isListening) setTimeout(() => setShowVoiceHUD(false), 1200); }}
                    aria-label="Voice command"
                  >
                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                  </button>
                )}
                <button
                  onClick={() => { if (csvData && !running) { resetAgents(); runAnalysis(csvData); } }}
                  disabled={!csvData || running}
                  className="group px-5 py-2 text-xs tracking-widest uppercase rounded-full bg-gradient-to-r from-ice-blue/20 to-ice-blue/10 text-ice-blue border border-ice-blue/20 hover:bg-ice-blue/30 transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-2"
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
                      isListening ? 'bg-emerald/10 text-emerald' : 'bg-pearl/5 text-titanium/30'
                    }`}>
                      {isListening ? 'LIVE' : 'STANDBY'}
                    </span>
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
                    {voiceCommands.slice(0, 4).map((cmd) => (
                      <span key={cmd.description} className="text-[9px] px-2.5 py-1 rounded-full bg-pearl/5 border border-pearl/5 text-titanium/50">
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
            {/* WAR ROOM VIEW */}
            {view === 'war-room' && (
              <motion.div
                key="war-room"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex items-end justify-between">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-light text-[10px] tracking-widest text-ice-blue/80 uppercase border border-ice-blue/10">
                      <Radar size={10} />
                      <span>Command Center</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-light text-pearl/90">War Room</h2>
                    {!csvData && (
                      <p className="text-sm text-titanium/50 font-light mt-2">
                        Upload a dataset to begin analysis, or explore the agent network below.
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {!csvData && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setView('upload')}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ice-blue/10 text-ice-blue border border-ice-blue/20 hover:bg-ice-blue/20 transition-all text-xs tracking-wide"
                        >
                          <Upload size={12} />
                          Upload
                        </button>
                        <button
                          onClick={() => {
                            fetch('/sample_data.csv')
                              .then((r) => r.text())
                              .then((text) => {
                                const file = new File([text], 'sample_data.csv', { type: 'text/csv' });
                                parseFile(file);
                              });
                          }}
                          className="px-5 py-2.5 rounded-full border border-pearl/10 text-titanium/50 hover:text-pearl/70 hover:border-pearl/20 transition-all text-xs tracking-wide"
                        >
                          Load Sample
                        </button>
                      </div>
                    )}
                    {csvData && !running && (
                      <button
                        onClick={() => { resetAgents(); runAnalysis(csvData); }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald/10 text-emerald border border-emerald/20 hover:bg-emerald/20 transition-all text-xs tracking-wide"
                      >
                        <Radar size={12} />
                        Run Analysis
                      </button>
                    )}
                    {csvData && running && (
                      <div className="text-[10px] text-ice-blue/60 font-mono flex items-center gap-2">
                        <motion.div className="w-2 h-2 rounded-full bg-ice-blue" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                        Processing...
                      </div>
                    )}
                  </div>
                </div>

                <AgentGraph agents={agents} state={state} />

                <div className="grid lg:grid-cols-2 gap-6">
                  <CollapsibleSection title="Agent Communication" icon={<Radio size={14} />} defaultOpen>
                    <div className="space-y-3 max-h-56 overflow-y-auto scrollbar-hide">
                      {messages.length === 0 ? (
                        <p className="text-xs text-titanium/30 italic">Awaiting agent activity. Run an analysis to initiate.</p>
                      ) : (
                        messages.map((msg) => (
                          <div key={msg.id} className="group flex items-start gap-3 text-xs border-l-2 border-ice-blue/15 pl-3 py-1.5 hover:border-ice-blue/30 transition-colors">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-mono text-titanium/30 uppercase tracking-wider">
                                {msg.from} <span className="text-titanium/20">→</span> {msg.to}
                              </span>
                              <span className="text-xs text-pearl/60 mt-0.5 leading-relaxed">{msg.content}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CollapsibleSection>

                  <CollapsibleSection title="Agent Status" icon={<Terminal size={14} />} defaultOpen>
                    <div className="space-y-3">
                      {[
                        { label: 'Scout', message: state.scout.message, badge: state.scout.anomalies.length > 0 ? `${state.scout.anomalies.length} anomalies` : null, status: state.scout.scanning ? 'scanning' : state.scout.anomalies.length > 0 ? 'complete' : 'idle' },
                        { label: 'Strategist', message: state.strategist.message, badge: state.strategist.scenarios.length > 0 ? `${state.strategist.scenarios.length} scenarios` : null, status: state.strategist.analyzing ? 'scanning' : state.strategist.scenarios.length > 0 ? 'complete' : 'idle' },
                        { label: 'Tactical', message: state.tactical.message, badge: state.tactical.actions.length > 0 ? `${state.tactical.actions.length} actions` : null, status: state.tactical.planning ? 'scanning' : state.tactical.actions.length > 0 ? 'complete' : 'idle' },
                        { label: 'Commander', message: state.commander.decision === 'approved' ? 'All mitigations authorized' : state.commander.feedback, badge: null, status: state.commander.decision === 'approved' ? 'complete' : 'idle' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-4 py-2 border-b border-pearl/[0.03] last:border-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            item.status === 'complete' ? 'bg-emerald shadow-glow-emerald' :
                            item.status === 'scanning' ? 'bg-ice-blue animate-pulse' : 'bg-titanium/20'
                          }`} />
                          <span className="text-xs text-titanium/40 w-20 shrink-0 font-mono">{item.label}</span>
                          <span className="text-xs text-pearl/50 truncate">{item.message}</span>
                          {item.badge && (
                            <span className="text-[9px] text-ice-blue/60 shrink-0">{item.badge}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CollapsibleSection>
                </div>
              </motion.div>
            )}

            {/* INTELLIGENCE / UPLOAD VIEW */}
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
                  <h2 className="text-4xl sm:text-5xl font-light text-pearl/90">Import Intelligence</h2>
                  <p className="text-sm text-titanium/50 max-w-lg mx-auto leading-relaxed">
                    Upload a CSV dataset containing operational data. Hyperion&apos;s Scout agent will
                    automatically scan for statistical anomalies and trigger the analysis pipeline.
                  </p>
                </div>

                <DataUploader onFileLoaded={parseFile} parsing={parsing} error={error} csvData={csvData} />

                {csvData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel rounded-2xl p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-medium text-pearl/60 uppercase tracking-wider">Dataset Preview</h3>
                      <span className="text-[9px] text-titanium/30 font-mono">{csvData.columns.length} columns · {csvData.rowCount} records</span>
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

            {/* THREAT DASHBOARD VIEW */}
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
                    <Zap size={10} />
                    <span>Anomaly Detection — Real-Time Analysis</span>
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-light text-pearl/90">Threat Dashboard</h2>
                  <p className="text-sm text-titanium/50 max-w-lg mx-auto leading-relaxed">
                    Detected anomalies, risk scenarios, and autonomous mitigation actions
                    generated by the Hyperion agent swarm.
                  </p>
                </div>

                {state.scout.anomalies.length === 0 ? (
                  <div className="glass-panel rounded-3xl p-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-pearl/5 border border-pearl/5 flex items-center justify-center mx-auto mb-4">
                      <Shield size={24} className="text-titanium/30" />
                    </div>
                    <p className="text-sm text-titanium/40">No threats detected</p>
                    <p className="text-xs text-titanium/20 mt-1">Upload a dataset and run analysis to populate the dashboard.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-3 gap-4">
                      {[
                        { label: 'Active Anomalies', value: state.scout.anomalies.length, color: 'text-crimson', bg: 'bg-crimson/10' },
                        { label: 'Risk Scenarios', value: state.strategist.scenarios.length, color: 'text-amber', bg: 'bg-amber/10' },
                        { label: 'Mitigation Actions', value: state.tactical.actions.length, color: 'text-ice-blue', bg: 'bg-ice-blue/10' },
                      ].map((stat) => (
                        <div key={stat.label} className="glass-panel rounded-2xl p-5 text-center">
                          <div className={`text-3xl font-light ${stat.color}`}>{stat.value}</div>
                          <div className="text-xs text-titanium/50 mt-1">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    <CollapsibleSection title={`Detected Anomalies (${state.scout.anomalies.length})`} icon={<Zap size={14} />} defaultOpen>
                      <div className="space-y-2">
                        {state.scout.anomalies.map((a: Anomaly) => (
                          <div key={a.id} className="group flex items-start gap-4 p-4 rounded-xl bg-pearl/[0.02] border border-pearl/5 hover:bg-pearl/[0.04] transition-colors">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                              a.severity === 'critical' ? 'bg-crimson/10 text-crimson' :
                              a.severity === 'high' ? 'bg-amber/10 text-amber' :
                              'bg-titanium/10 text-titanium'
                            }`}>
                              {a.severity === 'critical' ? 'CR' : a.severity === 'high' ? 'HI' : 'LW'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-pearl/80">{a.title}</span>
                                <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${severityColors[a.severity]}`}>{a.severity}</span>
                              </div>
                              <p className="text-xs text-titanium/50 leading-relaxed">{a.description}</p>
                              <div className="flex items-center gap-3 mt-1.5 text-[9px] text-titanium/30 font-mono">
                                <span>{a.region}</span>
                                <span className="w-1 h-1 rounded-full bg-pearl/10" />
                                <span>{a.timestamp}</span>
                                <span className="w-1 h-1 rounded-full bg-pearl/10" />
                                <span className={a.trend === 'up' ? 'text-crimson/50' : 'text-emerald/50'}>{a.value}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>

                    {state.strategist.scenarios.length > 0 && (
                      <CollapsibleSection title={`Risk Scenarios (${state.strategist.scenarios.length})`} icon={<Activity size={14} />}>
                        <div className="space-y-3">
                          {state.strategist.scenarios.map((s: AgentScenario) => (
                            <div key={s.id} className="p-4 rounded-xl bg-pearl/[0.02] border border-pearl/5">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-pearl/70">{s.title}</span>
                                <span className="text-[10px] font-mono text-amber/80">{s.probability}% probability</span>
                              </div>
                              <p className="text-xs text-titanium/50 leading-relaxed mb-3">{s.description}</p>
                              <div className="flex items-center gap-4 text-[9px] text-titanium/30 font-mono">
                                <span>Impact: {s.impact}</span>
                                <span>Cost: ${s.cost.toLocaleString()}</span>
                                <span>Timeline: {s.timeline}</span>
                              </div>
                              <div className="mt-2 h-1 rounded-full bg-pearl/5 overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-amber/20 to-amber/40" style={{ width: `${s.probability}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                    )}

                    {state.tactical.actions.length > 0 && (
                      <CollapsibleSection title={`Mitigation Actions (${state.tactical.actions.length})`} icon={<Shield size={14} />}>
                        <div className="space-y-2">
                          {state.tactical.actions.map((a: TacticalAction) => (
                            <div key={a.id} className="flex items-center gap-4 p-4 rounded-xl bg-pearl/[0.02] border border-pearl/5">
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
          </AnimatePresence>
        </main>

        {/* Analytics complete banner */}
        {completed && (
          <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="glass-panel rounded-2xl px-8 py-4 flex items-center gap-4 shadow-layered">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald animate-pulse shadow-glow-emerald" />
              <div>
                <span className="text-sm text-emerald/90 font-light">Analysis Complete</span>
                <span className="text-xs text-titanium/40 ml-3">Autonomous mitigation protocols active</span>
              </div>
              <button
                onClick={() => { resetAgents(); resetCSV(); }}
                className="text-xs text-titanium/30 hover:text-pearl/60 ml-6 transition-colors"
              >
                Clear Session
              </button>
            </div>
          </motion.div>
        )}

        {/* Status bar */}
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-pearl/[0.03] bg-obsidian/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-4 text-[9px] text-titanium/30 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald/60" />
                System Online
              </span>
              <span>Hyperion Core v2.1</span>
              <span className="hidden sm:inline">• {csvData ? `${csvData.rowCount} records loaded` : 'No dataset'}</span>
            </div>
            <div className="flex items-center gap-4 text-[9px] text-titanium/20 font-mono">
              <span>{isSupported ? 'Voice API: Ready' : 'Voice API: Unavailable'}</span>
              <span className="hidden sm:inline">Agents: {agents.filter(a => a.status !== 'idle').length}/4 active</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
