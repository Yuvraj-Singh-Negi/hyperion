'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { AgentMessage, AgentState, CSVData, Agent } from '@/types';
import { scoutScan, strategize, planTactical, generateMessages } from '@/lib/agentEngine';

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
      setAgents((prev) => prev.map((a) => a.role === 'scout' ? { ...a, status: 'scanning' as const, objective: 'Scanning data streams for anomalies...' } : a));
      setState((prev) => ({ ...prev, scout: { ...prev.scout, scanning: true, progress: 10, message: 'Initializing scan...' } }));
    });

    addTimer(500, () => setState((prev) => ({ ...prev, scout: { ...prev.scout, progress: 30, message: 'Analyzing signal patterns...' } })));
    addTimer(1000, () => setState((prev) => ({ ...prev, scout: { ...prev.scout, progress: 60, message: 'Cross-referencing datasets...' } })));
    addTimer(1500, () => setState((prev) => ({ ...prev, scout: { ...prev.scout, progress: 85, message: 'Identifying statistical outliers...' } })));

    addTimer(2200, () => {
      const anomalies = scoutScan(rows);
      setState((prev) => ({ ...prev, scout: { anomalies, scanning: false, progress: 100, message: `${anomalies.length} anomalies identified` } }));
      setAgents((prev) => prev.map((a) => a.role === 'scout' ? { ...a, status: 'resolved' as const, confidence: 94.2, objective: `${anomalies.length} anomalies found` } : a));

      if (anomalies.length === 0 || cancelledRef.current) {
        setRunning(false);
        setCompleted(true);
        return;
      }

      // Phase 2: Strategist
      addTimer(600, () => {
        setAgents((prev) => prev.map((a) => a.role === 'strategist' ? { ...a, status: 'analyzing' as const, objective: 'Modeling escalation scenarios...' } : a));
        setState((prev) => ({ ...prev, strategist: { ...prev.strategist, analyzing: true, message: 'Running predictive models...' } }));

        addTimer(1500, () => {
          if (cancelledRef.current) return;
          const scenarios = strategize(anomalies);
          setState((prev) => ({ ...prev, strategist: { scenarios, analyzing: false, message: `${scenarios.length} scenarios modeled` } }));
          setAgents((prev) => prev.map((a) => a.role === 'strategist' ? { ...a, status: 'resolved' as const, confidence: 87.6, objective: `${scenarios.length} escalation paths` } : a));

          // Phase 3: Tactical
          addTimer(800, () => {
            setAgents((prev) => prev.map((a) => a.role === 'tactical' ? { ...a, status: 'planning' as const, objective: 'Formulating mitigation actions...' } : a));
            setState((prev) => ({ ...prev, tactical: { ...prev.tactical, planning: true, message: 'Generating action plan...' } }));

            addTimer(1500, () => {
              if (cancelledRef.current) return;
              const actions = planTactical(scenarios);
              setState((prev) => ({ ...prev, tactical: { actions, planning: false, message: `${actions.length} actions queued` } }));
              setAgents((prev) => prev.map((a) => a.role === 'tactical' ? { ...a, status: 'resolved' as const, confidence: 99.1, objective: `${actions.length} mitigations ready` } : a));

              // Phase 4: Commander
              addTimer(1000, () => {
                setAgents((prev) => prev.map((a) => a.role === 'commander' ? { ...a, status: 'executing' as const, objective: 'Reviewing and approving plan...' } : a));
                setState((prev) => ({ ...prev, commander: { ...prev.commander, decision: 'pending' as const, feedback: 'Analyzing tactical recommendations...', logs: [] } }));

                addTimer(1500, () => {
                  if (cancelledRef.current) return;
                  const msgs = generateMessages(anomalies, scenarios, actions);
                  setMessages(msgs);
                  setState((prev) => ({
                    ...prev,
                    commander: {
                      decision: 'approved' as const,
                      feedback: 'All mitigations authorized. Autonomous protocols engaged.',
                      logs: actions.map((a) => `✓ ${a.label} — ${a.status === 'pending' ? 'Approved' : 'Completed'}`),
                    },
                  }));
                  setAgents((prev) => prev.map((a) => a.role === 'commander' ? { ...a, status: 'resolved' as const, confidence: 100, objective: 'Mission plan approved' } : a));
                  setRunning(false);
                  setCompleted(true);
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
  }, [clearTimers]);

  return { agents, state, messages, running, completed, runAnalysis, reset };
}
