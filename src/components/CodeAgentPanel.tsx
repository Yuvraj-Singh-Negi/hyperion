'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CodeIteration, CodeAgentResult, getPromptSuggestions } from '@/lib/codeAgentEngine';
import { Code, RefreshCw, CheckCircle, XCircle, AlertTriangle, Loader2, Zap, Bug, Play, FileText, ChevronDown, ChevronUp } from 'lucide-react';

const statusIcons: Record<string, React.ReactNode> = {
  generating: <Loader2 size={10} className="animate-spin text-ice-blue" />,
  validating: <AlertTriangle size={10} className="text-amber" />,
  testing: <Play size={10} className="text-ice-blue" />,
  passed: <CheckCircle size={10} className="text-emerald" />,
  failed: <XCircle size={10} className="text-crimson" />,
};

const statusLabels: Record<string, string> = {
  generating: 'Generating',
  validating: 'Validating',
  testing: 'Testing',
  passed: 'Passed',
  failed: 'Failed',
};

const errorTypeColors: Record<string, string> = {
  syntax: 'text-crimson bg-crimson/10 border-crimson/20',
  reference: 'text-amber bg-amber/10 border-amber/20',
  type: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  logic: 'text-amber bg-amber/10 border-amber/20',
  runtime: 'text-crimson bg-crimson/10 border-crimson/20',
};

interface CodeAgentPanelProps {
  iterations: CodeIteration[];
  running: boolean;
  completed: boolean;
  result: CodeAgentResult | null;
  currentCode: string;
  currentAttempt: number;
  onStart: (prompt: string) => void;
  onReset: () => void;
}

export default function CodeAgentPanel({ iterations, running, completed, result, currentCode, currentAttempt, onStart, onReset }: CodeAgentPanelProps) {
  const [promptInput, setPromptInput] = useState('');
  const [expandedIteration, setExpandedIteration] = useState<number | null>(null);
  const [showCode, setShowCode] = useState(true);
  const suggestions = getPromptSuggestions();

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || running) return;
    onStart(promptInput.trim());
  }, [promptInput, running, onStart]);

  const handleSuggestion = useCallback((prompt: string) => {
    setPromptInput(prompt);
  }, []);

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Left Panel: Input */}
      <div className="lg:col-span-2 space-y-4">
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Code size={14} className="text-ice-blue/60" />
            <span className="text-[10px] uppercase tracking-widest text-titanium/40 font-mono">Code Prompt</span>
            {running && (
              <motion.span className="text-[8px] text-ice-blue/60 font-mono ml-auto" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
                ATTEMPT {currentAttempt}/3
              </motion.span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[9px] uppercase tracking-wider text-titanium/30 font-mono block mb-1">Describe the function to write</label>
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="e.g. Write a function that returns the Fibonacci sequence up to n terms"
                rows={3}
                disabled={running}
                className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-pearl/70 placeholder:text-titanium/20 focus:outline-none focus:border-ice-blue/30 transition-colors resize-none disabled:opacity-30"
              />
            </div>
            <button
              type="submit"
              disabled={running || !promptInput.trim()}
              className="w-full py-2.5 text-xs tracking-widest uppercase rounded-xl bg-gradient-to-r from-ice-blue/25 to-ice-blue/10 text-ice-blue border border-ice-blue/20 hover:from-ice-blue/35 hover:to-ice-blue/15 transition-all disabled:opacity-20 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {running ? (
                <><Loader2 size={12} className="animate-spin" /> Generating...</>
              ) : (
                <><Zap size={12} /> Generate & Test</>
              )}
            </button>
          </form>
        </div>

        {/* Prompt Suggestions */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={12} className="text-amber/60" />
            <span className="text-[10px] uppercase tracking-widest text-titanium/40 font-mono">Suggested Prompts</span>
          </div>
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSuggestion(s.prompt)}
                disabled={running}
                className="w-full text-left p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all disabled:opacity-20 group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-mono ${
                    s.difficulty === 'hard' ? 'text-crimson/70 bg-crimson/10' :
                    s.difficulty === 'medium' ? 'text-amber/70 bg-amber/10' :
                    'text-emerald/70 bg-emerald/10'
                  }`}>{s.difficulty}</span>
                </div>
                <p className="text-[11px] text-pearl/70 group-hover:text-pearl/90 transition-colors">{s.label}</p>
                <p className="text-[8px] text-titanium/30 mt-0.5 truncate">{s.prompt}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Result Summary */}
        {completed && result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-panel rounded-2xl p-5 ${result.passed ? 'border-emerald/10' : 'border-crimson/10'}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${result.passed ? 'bg-emerald/10 text-emerald' : 'bg-crimson/10 text-crimson'}`}>
                {result.passed ? <CheckCircle size={18} /> : <XCircle size={18} />}
              </div>
              <div>
                <span className={`text-sm font-medium ${result.passed ? 'text-emerald/90' : 'text-crimson/90'}`}>
                  {result.passed ? 'All Tests Passed' : 'Some Tests Failed'}
                </span>
                <p className="text-[10px] text-titanium/40 font-mono mt-0.5">
                  {result.totalAttempts} iteration{result.totalAttempts > 1 ? 's' : ''} · {result.passed ? 'Self-corrected' : 'Max attempts reached'}
                </p>
              </div>
              <button onClick={onReset} className="ml-auto text-[9px] text-titanium/30 hover:text-pearl/60 transition-colors flex items-center gap-1">
                <RefreshCw size={10} /> New
              </button>
            </div>
          </motion.div>
        )}

        {/* Code Display */}
        {currentCode && (
          <div className="glass-panel rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowCode(!showCode)}
              className="w-full px-4 py-3 flex items-center justify-between border-b border-white/[0.03]"
            >
              <div className="flex items-center gap-2">
                <Code size={12} className="text-titanium/40" />
                <span className="text-[10px] uppercase tracking-widest text-titanium/40 font-mono">
                  {running ? `Current Code (Attempt ${currentAttempt})` : 'Generated Code'}
                </span>
              </div>
              {showCode ? <ChevronUp size={12} className="text-titanium/30" /> : <ChevronDown size={12} className="text-titanium/30" />}
            </button>
            {showCode && (
              <div className="p-4 max-h-64 overflow-y-auto scrollbar-hide">
                <pre className="text-[10px] font-mono text-pearl/60 leading-relaxed whitespace-pre-wrap">{currentCode}</pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Panel: Iteration Timeline */}
      <div className="lg:col-span-3 space-y-4">
        {iterations.length === 0 && !running && !completed ? (
          <div className="glass-panel rounded-3xl p-16 text-center h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-ice-blue/5 border border-ice-blue/10 flex items-center justify-center mx-auto mb-4">
              <Bug size={24} className="text-ice-blue/40" />
            </div>
            <p className="text-sm text-titanium/40">Enter a prompt to begin</p>
            <p className="text-xs text-titanium/20 mt-1 max-w-xs mx-auto leading-relaxed">
              The code agent will generate, test, parse errors, and refactor — automatically fixing issues up to 3 attempts.
            </p>
          </div>
        ) : (
          <>
            {/* Pipeline Status */}
            <div className="glass-panel rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bug size={12} className="text-titanium/40" />
                <span className="text-[10px] uppercase tracking-widest text-titanium/40 font-mono">Self-Correction Pipeline</span>
                {running && (
                  <span className="text-[8px] text-ice-blue/50 font-mono ml-auto">
                    Attempt {currentAttempt} of 3
                  </span>
                )}
                {completed && result && (
                  <span className={`text-[8px] font-mono ml-auto ${result.passed ? 'text-emerald/50' : 'text-crimson/50'}`}>
                    {result.passed ? 'PASSED' : 'FAILED'}
                  </span>
                )}
              </div>

              {/* Pipeline Steps */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Generate', desc: 'LLM produces code', icon: <Zap size={10} />, active: running && iterations.length >= 1 },
                  { label: 'Test', desc: 'Sandbox execution', icon: <Play size={10} />, active: running && iterations.length >= 1 && iterations.some(i => i.status === 'testing' || i.status === 'passed' || i.status === 'failed') },
                  { label: 'Refactor', desc: 'Auto-fix errors', icon: <RefreshCw size={10} />, active: running && iterations.length > 1 },
                ].map((step, i) => (
                  <div key={i} className={`rounded-xl p-3 text-center border transition-all ${
                    step.active ? 'bg-ice-blue/[0.04] border-ice-blue/15' : 'bg-white/[0.01] border-white/[0.03]'
                  }`}>
                    <div className={`flex items-center justify-center mb-1.5 ${step.active ? 'text-ice-blue' : 'text-titanium/20'}`}>
                      {step.active ? <motion.div animate={{ rotate: step.label === 'Refactor' ? 360 : 0 }} transition={{ duration: 2, repeat: step.label === 'Refactor' ? Infinity : 0, ease: 'linear' }}>{step.icon}</motion.div> : step.icon}
                    </div>
                    <p className={`text-[9px] font-mono uppercase tracking-wider ${step.active ? 'text-ice-blue/70' : 'text-titanium/20'}`}>{step.label}</p>
                    <p className="text-[7px] text-titanium/20 mt-0.5">{step.desc}</p>
                  </div>
                ))}
              </div>

              {/* Iteration Cards */}
              <div className="space-y-2">
                {iterations.map((iter, i) => {
                  const isExpanded = expandedIteration === i;
                  const isLatest = i === iterations.length - 1;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className={`rounded-xl border transition-all cursor-pointer ${
                        iter.status === 'passed' ? 'border-emerald/15 bg-emerald/[0.02]' :
                        iter.status === 'failed' ? 'border-crimson/15 bg-crimson/[0.02]' :
                        'border-white/[0.05] bg-white/[0.01]'
                      } ${isLatest && running ? 'border-ice-blue/20 shadow-glow-blue/30' : ''}`}
                      onClick={() => setExpandedIteration(isExpanded ? null : i)}
                    >
                      <div className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            iter.status === 'passed' ? 'bg-emerald/10' :
                            iter.status === 'failed' ? 'bg-crimson/10' :
                            'bg-ice-blue/10'
                          }`}>
                            <span className={
                              iter.status === 'passed' ? 'text-emerald' :
                              iter.status === 'failed' ? 'text-crimson' :
                              'text-ice-blue'
                            }>
                              {statusIcons[iter.status] || statusIcons.generating}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-medium ${
                                iter.status === 'passed' ? 'text-emerald/80' :
                                iter.status === 'failed' ? 'text-crimson/80' :
                                'text-pearl/70'
                              }`}>
                                Attempt {iter.attempt}
                              </span>
                              <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-mono ${
                                iter.status === 'passed' ? 'bg-emerald/10 text-emerald/70' :
                                iter.status === 'failed' ? 'bg-crimson/10 text-crimson/70' :
                                'bg-ice-blue/10 text-ice-blue/70'
                              }`}>
                                {statusLabels[iter.status] || iter.status}
                              </span>
                              {iter.errors.length > 0 && (
                                <span className="text-[8px] text-crimson/50 font-mono">{iter.errors.length} error{iter.errors.length > 1 ? 's' : ''}</span>
                              )}
                            </div>
                            <p className="text-[8px] text-titanium/30 font-mono mt-0.5">
                              {(iter.duration / 1000).toFixed(1)}s
                              {iter.errors.length > 0 && ` · ${iter.errors.filter(e => e.severity === 'error').length} critical`}
                            </p>
                          </div>
                          {iter.errors.length > 0 && (
                            <ChevronDown size={12} className={`text-titanium/20 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          )}
                        </div>
                      </div>

                      {/* Expanded error details */}
                      {isExpanded && iter.errors.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="px-3.5 pb-3.5 space-y-1.5"
                        >
                          {iter.errors.map((err, j) => (
                            <div key={j} className={`p-2.5 rounded-lg border text-[10px] ${errorTypeColors[err.type] || 'text-titanium/50 bg-white/[0.02] border-white/[0.05]'}`}>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-[8px] uppercase tracking-wider font-bold ${err.type === 'syntax' || err.type === 'runtime' ? 'text-crimson/70' : 'text-amber/70'}`}>
                                  {err.type}
                                </span>
                                <span className="text-[8px] text-titanium/30 font-mono">Line {err.line}</span>
                                <span className={`text-[7px] uppercase ${err.severity === 'error' ? 'text-crimson/50' : 'text-amber/50'}`}>({err.severity})</span>
                              </div>
                              <p className="text-[10px] text-pearl/60 leading-relaxed">{err.message}</p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
