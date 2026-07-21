'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SupportTicket, OrchestrationPlan } from '@/types';
import { DEMO_TICKETS } from '@/lib/orchestratorEngine';
import { Send, CheckCircle, XCircle, Loader2, Zap, Bot, Database, Search, FileText, User, ArrowRight, BookOpen } from 'lucide-react';

const agentColors: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  'Ticket Analyzer': { bg: 'bg-ice-blue/15', text: 'text-ice-blue', border: 'border-ice-blue/20', icon: <Search size={12} /> },
  'Knowledge Searcher': { bg: 'bg-amber/15', text: 'text-amber', border: 'border-amber/20', icon: <BookOpen size={12} /> },
  'Database Operator': { bg: 'bg-emerald/15', text: 'text-emerald', border: 'border-emerald/20', icon: <Database size={12} /> },
  'Resolution Composer': { bg: 'bg-purple-400/15', text: 'text-purple-400', border: 'border-purple-400/20', icon: <FileText size={12} /> },
};

const actionLabels: Record<string, string> = {
  analyze_ticket: 'Analyzing ticket intent & entities',
  search_solutions: 'Searching knowledge base',
  update_records: 'Updating database records',
  deep_search: 'Deep search for related articles',
  log_resolution: 'Logging resolution to database',
  compose_response: 'Composing customer response',
};

interface TicketPanelProps {
  ticket: SupportTicket | null;
  plan: OrchestrationPlan | null;
  currentStepIndex: number;
  running: boolean;
  completed: boolean;
  resolution: string;
  onSubmit: (subject: string, description: string, name: string, email: string) => void;
  onLoadDemo: (index: number) => void;
  onReset: () => void;
}

export default function TicketPanel({ ticket, plan, currentStepIndex, running, completed, resolution, onSubmit, onLoadDemo, onReset }: TicketPanelProps) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    onSubmit(subject.trim(), description.trim(), name.trim() || 'Valued Customer', email.trim() || 'customer@example.com');
  }, [subject, description, name, email, onSubmit]);

  const hasInput = !!ticket;

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Ticket Input Panel */}
      <div className="lg:col-span-2 space-y-4">
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bot size={14} className="text-ice-blue/60" />
            <span className="text-[10px] uppercase tracking-widest text-titanium/40 font-mono">Ticket Input</span>
            {!running && !completed && (
              <span className="text-[8px] text-titanium/20 font-mono ml-auto">READY</span>
            )}
            {running && (
              <motion.span className="text-[8px] text-ice-blue/60 font-mono ml-auto" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
                PROCESSING
              </motion.span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[9px] uppercase tracking-wider text-titanium/30 font-mono block mb-1">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Cannot reset password"
                disabled={running}
                className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-pearl/70 placeholder:text-titanium/20 focus:outline-none focus:border-ice-blue/30 transition-colors disabled:opacity-30"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider text-titanium/30 font-mono block mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                rows={4}
                disabled={running}
                className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-pearl/70 placeholder:text-titanium/20 focus:outline-none focus:border-ice-blue/30 transition-colors resize-none disabled:opacity-30"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] uppercase tracking-wider text-titanium/30 font-mono block mb-1">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  disabled={running}
                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-pearl/70 placeholder:text-titanium/20 focus:outline-none focus:border-ice-blue/30 transition-colors disabled:opacity-30"
                />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-wider text-titanium/30 font-mono block mb-1">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  disabled={running}
                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-pearl/70 placeholder:text-titanium/20 focus:outline-none focus:border-ice-blue/30 transition-colors disabled:opacity-30"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={running || !subject.trim() || !description.trim()}
              className="w-full py-2.5 text-xs tracking-widest uppercase rounded-xl bg-gradient-to-r from-ice-blue/25 to-ice-blue/10 text-ice-blue border border-ice-blue/20 hover:from-ice-blue/35 hover:to-ice-blue/15 transition-all disabled:opacity-20 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {running ? (
                <><Loader2 size={12} className="animate-spin" /> Processing</>
              ) : (
                <><Send size={12} /> Submit Ticket</>
              )}
            </button>
          </form>
        </div>

        {/* Demo Tickets */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={12} className="text-amber/60" />
            <span className="text-[10px] uppercase tracking-widest text-titanium/40 font-mono">Demo Tickets</span>
          </div>
          <div className="space-y-2">
            {DEMO_TICKETS.map((t, i) => (
              <button
                key={i}
                onClick={() => onLoadDemo(i)}
                disabled={running}
                className="w-full text-left p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all disabled:opacity-20 group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-mono ${
                    t.priority === 'urgent' ? 'text-crimson/70 bg-crimson/10 border border-crimson/15' :
                    t.priority === 'high' ? 'text-amber/70 bg-amber/10 border border-amber/15' :
                    'text-titanium/40 bg-titanium/10 border border-titanium/10'
                  }`}>{t.priority}</span>
                  <span className="text-[9px] text-titanium/30 font-mono">{t.id}</span>
                </div>
                <p className="text-[11px] text-pearl/70 group-hover:text-pearl/90 transition-colors truncate">{t.subject}</p>
                <div className="flex items-center gap-2 mt-1 text-[8px] text-titanium/30 font-mono">
                  <User size={8} />
                  <span>{t.customer.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Execution Panel */}
      <div className="lg:col-span-3 space-y-4">
        {hasInput && plan ? (
          <>
            {/* Ticket Info Bar */}
            <div className="glass-panel rounded-2xl p-4 flex items-center gap-4">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                ticket!.priority === 'urgent' ? 'bg-crimson/15 text-crimson' :
                ticket!.priority === 'high' ? 'bg-amber/15 text-amber' :
                'bg-titanium/10 text-titanium/50'
              }`}>
                <Zap size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-pearl/80 truncate">{ticket!.subject}</span>
                  <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-mono shrink-0 ${
                    ticket!.priority === 'urgent' ? 'text-crimson/70 bg-crimson/10' :
                    ticket!.priority === 'high' ? 'text-amber/70 bg-amber/10' :
                    'text-titanium/40 bg-titanium/10'
                  }`}>{ticket!.priority.toUpperCase()}</span>
                  <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-mono shrink-0 ${
                    plan.status === 'completed' ? 'text-emerald/70 bg-emerald/10' :
                    plan.status === 'failed' ? 'text-crimson/70 bg-crimson/10' :
                    plan.status === 'executing' ? 'text-ice-blue/70 bg-ice-blue/10' :
                    'text-titanium/30 bg-titanium/10'
                  }`}>{plan.status}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[8px] text-titanium/30 font-mono">
                  <span>{ticket!.id}</span>
                  <span className="w-1 h-1 rounded-full bg-pearl/10" />
                  <span>{ticket!.customer.name}</span>
                  <span className="w-1 h-1 rounded-full bg-pearl/10" />
                  <span>{ticket!.category}</span>
                  <span className="w-1 h-1 rounded-full bg-pearl/10" />
                  <span>{new Date(ticket!.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            {/* Plan Timeline */}
            <div className="glass-panel rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bot size={12} className="text-titanium/40" />
                <span className="text-[10px] uppercase tracking-widest text-titanium/40 font-mono">Orchestration Plan</span>
                {plan.confidence > 0 && (
                  <span className="text-[8px] text-emerald/50 font-mono ml-auto">
                    {Math.round(plan.confidence * 100)}% confidence
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                {plan.steps.map((step, i) => {
                  const colors = agentColors[step.agent] || { bg: 'bg-titanium/10', text: 'text-titanium/40', border: 'border-titanium/10', icon: <Bot size={12} /> };
                  const isActive = step.status === 'running';
                  const isDone = step.status === 'completed';
                  const isFailed = step.status === 'failed';
                  const isExpanded = expandedStep === i;

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={`rounded-xl border transition-all duration-300 cursor-pointer ${
                        isActive ? 'border-ice-blue/30 bg-ice-blue/[0.03]' :
                        isDone ? 'border-emerald/15 bg-emerald/[0.02]' :
                        isFailed ? 'border-crimson/20 bg-crimson/[0.02]' :
                        'border-white/[0.04] hover:border-white/[0.08] bg-white/[0.01]'
                      }`}
                      onClick={() => setExpandedStep(isExpanded ? null : i)}
                    >
                      <div className="p-3 flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                          isActive ? `${colors.bg} ${colors.text} shadow-glow-blue` :
                          isDone ? 'bg-emerald/10 text-emerald' :
                          isFailed ? 'bg-crimson/10 text-crimson' :
                          'bg-white/[0.03] text-titanium/30'
                        }`}>
                          {isDone ? <CheckCircle size={11} /> : isFailed ? <XCircle size={11} /> : isActive ? <Loader2 size={11} className="animate-spin" /> : colors.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-medium ${
                              isActive ? 'text-ice-blue' : isDone ? 'text-emerald/80' : isFailed ? 'text-crimson/80' : 'text-titanium/40'
                            }`}>{step.agent}</span>
                            <span className="text-[8px] text-titanium/20 font-mono">{actionLabels[step.action] || step.action}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[8px] font-mono uppercase tracking-wider ${
                              isActive ? 'text-ice-blue/60' : isDone ? 'text-emerald/50' : isFailed ? 'text-crimson/50' : 'text-titanium/20'
                            }`}>{step.status}</span>
                            <span className="text-[7px] text-titanium/15 font-mono">{(step.duration / 1000).toFixed(1)}s</span>
                          </div>
                        </div>
                        {i === currentStepIndex && !isDone && !isFailed && (
                          <div className="flex items-center gap-1.5">
                            <motion.div className="w-1.5 h-1.5 rounded-full bg-ice-blue" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
                          </div>
                        )}
                        {isDone && step.output && (
                          <ArrowRight size={10} className="text-titanium/20 shrink-0" />
                        )}
                      </div>
                      {isExpanded && step.output && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="px-3 pb-3"
                        >
                          <div className="bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.03]">
                            <p className="text-[10px] text-titanium/50 leading-relaxed whitespace-pre-wrap">{step.output.slice(0, 400)}</p>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Resolution Output */}
            {resolution && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-2xl p-5 border-emerald/10"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald/10 flex items-center justify-center">
                    <CheckCircle size={12} className="text-emerald" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-emerald/60 font-mono">Resolution</span>
                  <button onClick={onReset} className="text-[8px] text-titanium/20 hover:text-titanium/40 ml-auto transition-colors">Reset</button>
                </div>
                <div className="bg-emerald/[0.02] rounded-xl p-4 border border-emerald/10">
                  <p className="text-xs text-pearl/70 leading-relaxed whitespace-pre-wrap">{resolution}</p>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <div className="glass-panel rounded-3xl p-16 text-center h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-ice-blue/5 border border-ice-blue/10 flex items-center justify-center mx-auto mb-4">
              <Bot size={24} className="text-ice-blue/40" />
            </div>
            <p className="text-sm text-titanium/40">Submit a ticket to begin</p>
            <p className="text-xs text-titanium/20 mt-1 max-w-xs mx-auto leading-relaxed">
              The orchestrator will analyze intent, search knowledge base, update records, and compose a resolution — all autonomously.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
