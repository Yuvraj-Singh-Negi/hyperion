'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { AgentMessage, AgentState, CSVData } from '@/types';
import { scoutScan, strategize, planTactical, generateMessages } from '@/lib/agentEngine';

function makeAgent(
  id: string, name: string,
  role: 'scout' | 'strategist' | 'tactical' | 'commander',
  status: AgentState['scout']['scanning'] extends boolean ? 'idle' | 'scanning' | 'analyzing' | 'planning' | 'executing' | 'resolved' : 'idle'
) {
  return { id, name, role, status, confidence: 100, objective: 'Standing by', timeline: 'Ready', actions: [], thinking: '' };
}

const defaultAgents = [
  makeAgent('scout-1', 'Scout', 'scout', 'idle'),
  makeAgent('strategist-1', 'Strategist', 'strategist', 'idle'),
  makeAgent('tactical-1', 'Tactical', 'tactical', 'idle'),
  makeAgent('commander-1', 'Commander', 'commander', 'idle'),
];

export function useAgentSystem() {
  const [agents, setAgents] = useState(defaultAgents);
  const [state, setState] = useState<AgentState>({
    scout: { anomalies: [], scanning: false, progress: 0, message: 'Awaiting data input' },
    strategist: { scenarios: [], analyzing: false, message: 'Awaiting scout data' },
    tactical: { actions: [], planning: false, message: 'Awaiting strategic directives' },
    commander: { decision: 'pending', feedback: 'Awaiting tactical plan', logs: [] },
  });
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const runAnalysis = useCallback((csvData: CSVData | null) => {
    clearTimers();
    setCompleted(false);
    setRunning(true);
    setMessages([]);

    const rows = csvData?.rows ?? [];
    const steps: { delay: number; fn: () => void }[] = [];

    // Phase 1: Scout scans
    steps.push({
      delay: 0,
      fn: () => {
        setAgents((prev) => prev.map((a) => a.role === 'scout' ? { ...a, status: 'scanning', objective: 'Scanning data streams for anomalies' } : a));
        setState((prev) => ({ ...prev, scout: { ...prev.scout, scanning: true, progress: 0, message: 'Initializing scan...' } }));
      },
    });

    for (let p = 20; p <= 100; p += 20) {
      steps.push({
        delay: 400 + p * 15,
        fn: () => {
          setState((prev) => ({ ...prev, scout: { ...prev.scout, progress: p, message: p < 100 ? `Scanning... ${p}%` : 'Anomalies detected!' } }));
        },
      });
    }

    steps.push({
      delay: 2200,
      fn: () => {
        const anomalies = scoutScan(rows);
        setState((prev) => ({ ...prev, scout: { anomalies, scanning: false, progress: 100, message: `${anomalies.length} anomalies identified` } }));
        setAgents((prev) => prev.map((a) => a.role === 'scout' ? { ...a, status: 'resolved', confidence: 94.2, objective: `${anomalies.length} anomalies found` } : a));

        if (anomalies.length === 0) {
          setRunning(false);
          setCompleted(true);
          return;
        }

        // Phase 2: Strategist analyzes
        setTimeout(() => {
          setAgents((prev) => prev.map((a) => a.role === 'strategist' ? { ...a, status: 'analyzing', objective: 'Modeling escalation scenarios' } : a));
          setState((prev) => ({ ...prev, strategist: { ...prev.strategist, analyzing: true, message: 'Running predictive models...' } }));

          setTimeout(() => {
            const scenarios = strategize(anomalies);
            setState((prev) => ({ ...prev, strategist: { scenarios, analyzing: false, message: `${scenarios.length} scenarios modeled` } }));
            setAgents((prev) => prev.map((a) => a.role === 'strategist' ? { ...a, status: 'resolved', confidence: 87.6, objective: `${scenarios.length} escalation paths` } : a));

            // Phase 3: Tactical plans
            setTimeout(() => {
              setAgents((prev) => prev.map((a) => a.role === 'tactical' ? { ...a, status: 'planning', objective: 'Formulating mitigation actions' } : a));
              setState((prev) => ({ ...prev, tactical: { ...prev.tactical, planning: true, message: 'Generating action plan...' } }));

              setTimeout(() => {
                const actions = planTactical(scenarios);
                setState((prev) => ({ ...prev, tactical: { actions, planning: false, message: `${actions.length} actions queued` } }));
                setAgents((prev) => prev.map((a) => a.role === 'tactical' ? { ...a, status: 'resolved', confidence: 99.1, objective: `${actions.length} mitigations ready` } : a));

                // Phase 4: Commander decides
                setTimeout(() => {
                  setAgents((prev) => prev.map((a) => a.role === 'commander' ? { ...a, status: 'executing', objective: 'Reviewing and approving plan' } : a));
                  setState((prev) => ({ ...prev, commander: { ...prev.commander, decision: 'pending', feedback: 'Analyzing tactical recommendations...', logs: [] } }));

                  setTimeout(() => {
                    const msgs = generateMessages(anomalies, scenarios, actions);
                    setMessages(msgs);
                    setState((prev) => ({
                      ...prev,
                      commander: {
                        decision: 'approved',
                        feedback: 'All mitigations authorized. Autonomous protocols engaged.',
                        logs: actions.map((a) => `✓ ${a.label} — ${a.status === 'pending' ? 'Approved' : 'Completed'}`),
                      },
                    }));
                    setAgents((prev) => prev.map((a) => a.role === 'commander' ? { ...a, status: 'resolved', confidence: 100, objective: 'Mission plan approved' } : a));
                    setRunning(false);
                    setCompleted(true);
                  }, 1500);
                }, 1000);
              }, 1500);
            }, 800);
          }, 1500);
        }, 600);
      },
    });

    steps.forEach((s) => {
      const timer = setTimeout(s.fn, s.delay);
      timersRef.current.push(timer);
    });
  }, [clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    setAgents(defaultAgents);
    setState({
      scout: { anomalies: [], scanning: false, progress: 0, message: 'Awaiting data input' },
      strategist: { scenarios: [], analyzing: false, message: 'Awaiting scout data' },
      tactical: { actions: [], planning: false, message: 'Awaiting strategic directives' },
      commander: { decision: 'pending', feedback: 'Awaiting tactical plan', logs: [] },
    });
    setMessages([]);
    setRunning(false);
    setCompleted(false);
  }, [clearTimers]);

  return { agents, state, messages, running, completed, runAnalysis, reset };
}
