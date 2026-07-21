'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Activity, Shield, ChevronDown, Terminal, Zap, Radio, Mic, MicOff, Command } from 'lucide-react';
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
      <button onClick={() => setOpen(!open)} className="w-full px-5 py-4 flex items-center justify-between text-left">
        <div className="flex items-center gap-3">
          <span className="text-titanium/60">{icon}</span>
          <span className="text-sm font-medium text-pearl/80">{title}</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="text-titanium/40" />
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
            <div className="px-5 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
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
    { keywords: ['open war room', 'war room', 'command center'], action: () => { setView('war-room'); scrollToSection('main'); }, description: 'Open War Room' },
    { keywords: ['activate scout', 'scout', 'show anomalies'], action: () => { setView('war-room'); scrollToSection('main'); }, description: 'View Scout' },
    { keywords: ['show risks', 'show dashboard', 'dashboard', 'anomalies'], action: () => { setView('dashboard'); scrollToSection('main'); }, description: 'View Dashboard' },
    { keywords: ['emergency mode', 'emergency', 'full alert'], action: () => { setView('war-room'); if (csvData && !running) { resetAgents(); runAnalysis(csvData); } }, description: 'Emergency Mode' },
    { keywords: ['upload data', 'load data', 'import'], action: () => { setView('upload'); scrollToSection('main'); }, description: 'Upload Data' },
    { keywords: ['start analysis', 'analyze', 'run', 'execute'], action: () => { if (csvData && !running) { resetAgents(); runAnalysis(csvData); } }, description: 'Start Analysis' },
    { keywords: ['reset', 'clear', 'stop'], action: () => { resetAgents(); resetCSV(); }, description: 'Reset System' },
  ];

  const voiceHook = useVoiceCommands(voiceCommands);
  const isListening = voiceHook.isListening;
  const transcript = voiceHook.transcript;
  const isSupported = voiceHook.isSupported;
  const toggleListening = voiceHook.toggleListening;
  const lastCommand = voiceHook.lastCommand;
  const transcriptHistory = voiceHook.transcriptHistory;

  return (
    <>
      {!splashComplete && <SplashScreen onComplete={() => setSplashComplete(true)} />}

      <div ref={mainRef} id="main" className="relative min-h-screen bg-obsidian">
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
          <div className="max-w-7xl mx-auto">
            <div className="glass rounded-2xl px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-ice-blue/10 border border-ice-blue/20 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 64 64" fill="none" className="text-ice-blue">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <path d="M32 12 L32 52 M16 24 L48 24 M16 40 L48 40" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
                    <circle cx="32" cy="32" r="4" fill="currentColor" fillOpacity="0.3" />
                  </svg>
                </div>
                <span className="text-sm font-medium tracking-wider text-pearl/80">HYPERION</span>
              </div>
              <div className="hidden md:flex items-center gap-6">
                {['War Room', 'Upload', 'Dashboard'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setView(item.toLowerCase().replace(' ', '-'))}
                    className={`text-xs tracking-wider uppercase transition-colors duration-300 ${
                      view === item.toLowerCase().replace(' ', '-') ? 'text-ice-blue' : 'text-titanium hover:text-pearl'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {isSupported && (
                  <button
                    onClick={toggleListening}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isListening ? 'bg-crimson/20 text-crimson border border-crimson/30' : 'glass-light text-titanium hover:text-pearl'
                    }`}
                    onMouseEnter={() => setShowVoiceHUD(true)}
                    onMouseLeave={() => { if (!isListening) setTimeout(() => setShowVoiceHUD(false), 1000); }}
                    aria-label="Voice command"
                  >
                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                  </button>
                )}
                <button
                  onClick={() => { if (csvData && !running) { resetAgents(); runAnalysis(csvData); } }}
                  disabled={!csvData || running}
                  className="px-4 py-2 text-xs tracking-wider uppercase rounded-full bg-ice-blue/10 text-ice-blue border border-ice-blue/20 hover:bg-ice-blue/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {running ? 'Running...' : 'Run Analysis'}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showVoiceHUD && isSupported && (
                <motion.div
                  className="glass-panel rounded-2xl p-4 mt-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onMouseEnter={() => setShowVoiceHUD(true)}
                  onMouseLeave={() => setShowVoiceHUD(false)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Command size={12} className="text-ice-blue" />
                    <span className="text-[10px] uppercase tracking-wider text-titanium/60">Voice Commands</span>
                    <span className={`text-[9px] ml-auto ${isListening ? 'text-emerald' : 'text-titanium/30'}`}>
                      {isListening ? 'Listening...' : 'Click mic to activate'}
                    </span>
                  </div>
                  {transcript && <div className="text-[11px] text-ice-blue/70 mb-2 italic">&ldquo;{transcript}&rdquo;</div>}
                  {lastCommand && <div className="text-[10px] text-emerald mb-2">→ {lastCommand}</div>}
                  <div className="flex flex-wrap gap-1.5">
                    {voiceCommands.slice(0, 4).map((cmd) => (
                      <span key={cmd.description} className="text-[9px] px-2 py-0.5 rounded-full bg-pearl/5 text-titanium/50">
                        {cmd.keywords[0]}
                      </span>
                    ))}
                  </div>
                  {transcriptHistory.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-pearl/5 space-y-0.5">
                      {transcriptHistory.slice(-3).map((t, i) => (
                        <div key={i} className="text-[9px] text-titanium/30 truncate">{t}</div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatePresence mode="wait">
            {view === 'upload' && (
              <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="text-center space-y-3 mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-light text-xs tracking-wider text-ice-blue uppercase">
                    <Upload size={12} />
                    <span>Data Ingestion</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-light text-pearl">Import Dataset</h2>
                  <p className="text-titanium/60 text-sm max-w-lg mx-auto">
                    Upload a CSV file containing enterprise data. Hyperion&apos;s Scout agent will automatically detect anomalies.
                  </p>
                </div>

                <DataUploader onFileLoaded={parseFile} parsing={parsing} error={error} csvData={csvData} />

                {csvData && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-2xl p-5 space-y-3">
                    <h3 className="text-xs font-medium text-pearl/70 uppercase tracking-wider">Dataset Preview</h3>
                    <div className="overflow-x-auto scrollbar-hide">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-pearl/5">
                            {csvData.columns.map((col) => (
                              <th key={col.key} className="text-left py-2 pr-4 text-titanium/50 font-medium">{col.label}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvData.rows.slice(0, 6).map((row, i) => (
                            <tr key={i} className="border-b border-pearl/[0.02]">
                              {csvData.columns.map((col) => (
                                <td key={col.key} className="py-2 pr-4 text-pearl/60 truncate max-w-[120px]">{String(row[col.key] ?? '')}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-[10px] text-titanium/30">Showing {Math.min(6, csvData.rows.length)} of {csvData.rows.length} rows</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {view === 'war-room' && (
              <motion.div key="war-room" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="text-center space-y-3 mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-light text-xs tracking-wider text-ice-blue uppercase">
                    <Activity size={12} />
                    <span>Command Center</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-light text-pearl">War Room</h2>
                  <p className="text-titanium/60 text-sm max-w-xl mx-auto">
                    Four AI agents connected to the Hyperion Core. Upload a dataset and run analysis to see them in action.
                  </p>
                </div>

                <AgentGraph agents={agents} state={state} />

                <div className="grid md:grid-cols-2 gap-4">
                  <CollapsibleSection title="Agent Communication Log" icon={<Radio size={14} />} defaultOpen>
                    <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                      {messages.length === 0 ? (
                        <p className="text-xs text-titanium/40 italic">No messages yet. Run an analysis to see agent communication.</p>
                      ) : (
                        messages.map((msg) => (
                          <div key={msg.id} className="flex items-start gap-2 text-xs border-l-2 border-ice-blue/20 pl-3 py-1">
                            <span className="text-[10px] font-mono text-titanium/40 uppercase shrink-0">{msg.from} → {msg.to}</span>
                            <span className="text-pearl/60">{msg.content}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </CollapsibleSection>

                  <CollapsibleSection title="System Status" icon={<Terminal size={14} />} defaultOpen>
                    <div className="space-y-2">
                      {[
                        { label: 'Scout', message: state.scout.message, status: state.scout.scanning ? 'scanning' : state.scout.anomalies.length > 0 ? 'complete' : 'idle' },
                        { label: 'Strategist', message: state.strategist.message, status: state.strategist.analyzing ? 'scanning' : state.strategist.scenarios.length > 0 ? 'complete' : 'idle' },
                        { label: 'Tactical', message: state.tactical.message, status: state.tactical.planning ? 'scanning' : state.tactical.actions.length > 0 ? 'complete' : 'idle' },
                        { label: 'Commander', message: state.commander.decision === 'approved' ? 'Mission approved' : state.commander.feedback, status: state.commander.decision === 'approved' ? 'complete' : 'idle' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-3 text-xs">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            item.status === 'complete' ? 'bg-emerald' : item.status === 'scanning' ? 'bg-ice-blue animate-pulse' : 'bg-titanium/30'
                          }`} />
                          <span className="text-titanium/50 w-16 shrink-0">{item.label}</span>
                          <span className="text-pearl/60 truncate">{item.message}</span>
                        </div>
                      ))}
                    </div>
                  </CollapsibleSection>
                </div>
              </motion.div>
            )}

            {view === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="text-center space-y-3 mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-light text-xs tracking-wider text-amber uppercase">
                    <Zap size={12} />
                    <span>Anomaly Detection</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-light text-pearl">Threat Dashboard</h2>
                  <p className="text-titanium/60 text-sm max-w-lg mx-auto">
                    Detected anomalies, risk scenarios, and mitigation actions.
                  </p>
                </div>

                {state.scout.anomalies.length === 0 ? (
                  <div className="glass-panel rounded-2xl p-12 text-center">
                    <p className="text-titanium/40 text-sm">No anomalies detected yet.</p>
                    <p className="text-titanium/30 text-xs mt-1">Upload a CSV dataset and run analysis.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <CollapsibleSection title={`Anomalies (${state.scout.anomalies.length})`} icon={<Zap size={14} />} defaultOpen>
                      <div className="space-y-2">
                        {state.scout.anomalies.map((a: Anomaly) => (
                          <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-pearl/[0.02] border border-pearl/5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold ${
                              a.severity === 'critical' ? 'bg-crimson/10 text-crimson' : a.severity === 'high' ? 'bg-amber/10 text-amber' : 'bg-titanium/10 text-titanium'
                            }`}>
                              {a.severity === 'critical' ? 'C' : a.severity === 'high' ? 'H' : 'L'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-medium text-pearl/80">{a.title}</span>
                                <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-full border ${severityColors[a.severity]}`}>{a.severity}</span>
                              </div>
                              <p className="text-[11px] text-titanium/60">{a.description}</p>
                              <div className="flex items-center gap-2 mt-1 text-[9px] text-titanium/30">
                                <span>{a.region}</span><span>·</span><span>{a.timestamp}</span><span>·</span><span>{a.value}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection title={`Scenarios (${state.strategist.scenarios.length})`} icon={<Activity size={14} />}>
                      <div className="space-y-2">
                        {state.strategist.scenarios.map((s: AgentScenario) => (
                          <div key={s.id} className="p-3 rounded-xl bg-pearl/[0.02] border border-pearl/5">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-pearl/80">{s.title}</span>
                              <span className="text-[10px] font-mono text-amber">{s.probability}%</span>
                            </div>
                            <p className="text-[11px] text-titanium/60 mb-2">{s.description}</p>
                            <div className="flex items-center gap-3 text-[9px] text-titanium/40">
                              <span>Impact: {s.impact}</span><span>·</span>
                              <span>Cost: ${s.cost.toLocaleString()}</span><span>·</span>
                              <span>Timeline: {s.timeline}</span>
                            </div>
                            <div className="mt-2 h-1 rounded-full bg-pearl/5 overflow-hidden">
                              <div className="h-full rounded-full bg-amber/30" style={{ width: `${s.probability}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection title={`Actions (${state.tactical.actions.length})`} icon={<Shield size={14} />}>
                      <div className="space-y-2">
                        {state.tactical.actions.map((a: TacticalAction) => (
                          <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-pearl/[0.02] border border-pearl/5">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${a.status === 'completed' ? 'bg-emerald' : a.status === 'executing' ? 'bg-ice-blue animate-pulse' : 'bg-titanium/30'}`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-pearl/80">{a.label}</span>
                                <span className="text-[9px] text-titanium/40">via {a.target}</span>
                              </div>
                              <p className="text-[10px] text-titanium/50 mt-0.5">{a.description}</p>
                            </div>
                            <span className={`text-[9px] uppercase ${
                              a.status === 'completed' ? 'text-emerald' : a.status === 'executing' ? 'text-ice-blue' : 'text-titanium/30'
                            }`}>{a.status}</span>
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {completed && (
          <motion.div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="glass-panel rounded-2xl px-6 py-3 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
              <span className="text-xs text-emerald">Analysis complete — Autonomous mitigation protocols active</span>
              <button
                onClick={() => { resetAgents(); resetCSV(); }}
                className="text-xs text-titanium/50 hover:text-pearl ml-4"
              >
                Reset
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
