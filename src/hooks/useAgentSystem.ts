'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { AgentMessage, AgentState, CSVData, Agent } from '@/types';
import { scoutScan, strategize, planTactical, generateMessages } from '@/lib/agentEngine';
import { speakText, sendWebhookAlert } from '@/lib/apiService';

const defaultAgents: Agent[] = [
  { id: 'scout-1', name: 'Scout', role: 'scout', status: 'idle', confidence: 100, objective: 'Standing by', timeline: 'Ready', actions: [], thinking: '' },
  { id: 'strategist-1', name: 'Strategist', role: 'strategist', status: 'idle', confidence: 100, objective: 'Standing by', timeline: 'Ready', actions: [], thinking: '' },
  { id: 'tactical-1', name: 'Tactical', role: 'tactical', status: 'idle', confidence: 100, objective: 'Standing by', timeline: 'Ready', actions: [], thinking: '' },
  { id: 'commander-1', name: 'Commander', role: 'commander', status: 'idle', confidence: 100, objective: 'Standing by', timeline: 'Ready', actions: [], thinking: '' },
];

const defaultState: AgentState = {
  scout: { anomalies: [], scanning: false, progress: 0, message: 'Awaiting data input' },
  strategist: { scenarios: [], analyzing: false, message: 'Awaiting scout data' },
  tactical: { actions: [], planning: false, message: 'Awaiting strategic directives' },
  commander: { decision: 'pending', feedback: 'Awaiting tactical plan', logs: [] },
};

export function useAgentSystem() {
  const [agents, setAgents] = useState<Agent[]>(defaultAgents);
  const [state, setState] = useState<AgentState>(defaultState);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cancelledRef = useRef(false);

  const clearTimers = useCallback(() => {
    cancelledRef.current = true;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const addTimer = useCallback((delay: number, fn: () => void) => {
    const timer = setTimeout(() => {
      if (!cancelledRef.current) fn();
    }, delay);
    timersRef.current.push(timer);
    return timer;
  }, []);

  const runAnalysis = useCallback((csvData: CSVData | null) => {
    clearTimers();
    cancelledRef.current = false;
    setCompleted(false);
    setRunning(true);
    setMessages([]);
    setState(defaultState);
    setAgents(defaultAgents);

    const rows = csvData?.rows ?? [];

    // Phase 1: Scout - scan with progress
    addTimer(100, () => {
      setCurrentPhase('scout');
      setAgents((prev) => prev.map((a) => a.role === 'scout' ? { ...a, status: 'scanning' as const, objective: 'Scanning data streams for anomalies...' } : a));
      setState((prev) => ({ ...prev, scout: { ...prev.scout, scanning: true, progress: 10, message: 'Initializing scan protocols...' } }));
    });

    addTimer(400, () => setState((prev) => ({ ...prev, scout: { ...prev.scout, progress: 30, message: 'Analyzing signal patterns across all channels...' } })));
    addTimer(800, () => setState((prev) => ({ ...prev, scout: { ...prev.scout, progress: 55, message: 'Cross-referencing against threat databases...' } })));
    addTimer(1200, () => setState((prev) => ({ ...prev, scout: { ...prev.scout, progress: 75, message: 'Identifying statistical outliers and anomalies...' } })));

    addTimer(1800, () => {
      const anomalies = scoutScan(rows);
      setState((prev) => ({ ...prev, scout: { anomalies, scanning: false, progress: 100, message: `${anomalies.length} anomalies identified — ${anomalies.filter(a => a.severity === 'critical' || a.severity === 'high').length} critical alerts` } }));
      setAgents((prev) => prev.map((a) => a.role === 'scout' ? { ...a, status: 'resolved' as const, confidence: 94.2, objective: `${anomalies.length} anomalies detected` } : a));

      if (anomalies.length === 0 || cancelledRef.current) {
        setRunning(false);
        setCompleted(true);
        return;
      }

      // Phase 2: Strategist
      addTimer(500, () => {
        setCurrentPhase('strategist');
        setAgents((prev) => prev.map((a) => a.role === 'strategist' ? { ...a, status: 'analyzing' as const, objective: 'Modeling escalation scenarios...' } : a));
        setState((prev) => ({ ...prev, strategist: { ...prev.strategist, analyzing: true, message: 'Running predictive models on anomaly data...' } }));

        addTimer(400, () => setState((prev) => ({ ...prev, strategist: { ...prev.strategist, message: 'Simulating cascade effects across dependent systems...' } })));
        addTimer(800, () => setState((prev) => ({ ...prev, strategist: { ...prev.strategist, message: 'Calculating probabilistic impact assessments...' } })));

        addTimer(1400, () => {
          if (cancelledRef.current) return;
          const scenarios = strategize(anomalies);
          setState((prev) => ({ ...prev, strategist: { scenarios, analyzing: false, message: `${scenarios.length} escalation scenarios modeled — total estimated impact: $${scenarios.reduce((s, sc) => s + sc.cost, 0).toLocaleString()}` } }));
          setAgents((prev) => prev.map((a) => a.role === 'strategist' ? { ...a, status: 'resolved' as const, confidence: 87.6, objective: `${scenarios.length} escalation paths mapped` } : a));

          // Phase 3: Tactical
          addTimer(600, () => {
            setCurrentPhase('tactical');
            setAgents((prev) => prev.map((a) => a.role === 'tactical' ? { ...a, status: 'planning' as const, objective: 'Formulating mitigation actions...' } : a));
            setState((prev) => ({ ...prev, tactical: { ...prev.tactical, planning: true, message: 'Generating optimal action plan...' } }));

            addTimer(400, () => setState((prev) => ({ ...prev, tactical: { ...prev.tactical, message: 'Querying available response systems...' } })));
            addTimer(900, () => setState((prev) => ({ ...prev, tactical: { ...prev.tactical, message: 'Validating action feasibility and resource availability...' } })));

            addTimer(1500, () => {
              if (cancelledRef.current) return;
              const actions = planTactical(scenarios);
              setState((prev) => ({ ...prev, tactical: { actions, planning: false, message: `${actions.length} mitigation actions queued and ready` } }));
              setAgents((prev) => prev.map((a) => a.role === 'tactical' ? { ...a, status: 'resolved' as const, confidence: 99.1, objective: `${actions.length} mitigations ready for deployment` } : a));

              // Phase 4: Commander
              addTimer(800, () => {
                setCurrentPhase('commander');
                setAgents((prev) => prev.map((a) => a.role === 'commander' ? { ...a, status: 'executing' as const, objective: 'Reviewing and approving battle plan...' } : a));
                setState((prev) => ({ ...prev, commander: { ...prev.commander, decision: 'pending' as const, feedback: 'Analyzing tactical recommendations...', logs: [] } }));

                addTimer(1200, () => {
                  if (cancelledRef.current) return;
                  const msgs = generateMessages(anomalies, scenarios, actions);
                  setMessages(msgs);
                  setState((prev) => ({
                    ...prev,
                    commander: {
                      decision: 'approved' as const,
                      feedback: 'All mitigations authorized. Autonomous protocols engaged. Deploying countermeasures.',
                      logs: actions.map((a) => `✓ ${a.label} — ${a.status === 'pending' ? 'Approved & queued' : 'Completed'}`),
                    },
                  }));
                  setAgents((prev) => prev.map((a) => a.role === 'commander' ? { ...a, status: 'resolved' as const, confidence: 100, objective: 'Mission plan approved — all agents synchronized' } : a));
                  setRunning(false);
                  setCompleted(true);
                  setCurrentPhase('');

                  // Speak completion
                  speakText('Analysis complete. All agents have reported. Mitigation protocols are now active.').catch(() => {});

                  // Webhook alert
                  sendWebhookAlert(
                    `[HYPERION ALERT] Analysis complete: ${anomalies.length} anomalies detected, ${scenarios.length} scenarios modeled, ${actions.length} mitigations queued.`,
                  ).catch(() => {});
                });
              });
            });
          });
        });
      });
    });
  }, [clearTimers, addTimer]);

  const reset = useCallback(() => {
    clearTimers();
    setAgents(defaultAgents);
    setState(defaultState);
    setMessages([]);
    setRunning(false);
    setCompleted(false);
    setCurrentPhase('');
  }, [clearTimers]);

  return { agents, state, messages, running, completed, currentPhase, runAnalysis, reset };
}
