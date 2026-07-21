'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { SupportTicket, OrchestrationPlan } from '@/types';
import { generatePlan, executeStep, createTicket, DEMO_TICKETS } from '@/lib/orchestratorEngine';
import { speakText } from '@/lib/apiService';

export function useOrchestrator() {
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [plan, setPlan] = useState<OrchestrationPlan | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [resolution, setResolution] = useState('');
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cancelledRef = useRef(false);
  const contextRef = useRef<{
    analysis?: { summary: string; category: string; confidence: number; context: string };
    solutions?: { findings: string; sources: string[] };
    dbResults?: string[];
    resolution?: string;
  }>({});

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

  const submitTicket = useCallback(async (subject: string, description: string, name: string, email: string) => {
    clearTimers();
    cancelledRef.current = false;
    setCompleted(false);
    setResolution('');
    contextRef.current = {};

    const newTicket = createTicket(subject, description, name, email);
    setTicket(newTicket);

    const generatedPlan = await generatePlan(newTicket);
    setPlan({ ...generatedPlan, status: 'planning' });
    setCurrentStepIndex(-1);
    setRunning(true);

    const steps = [...generatedPlan.steps];

    addTimer(300, () => {
      setPlan((p) => p ? { ...p, status: 'executing' } : p);
      setCurrentStepIndex(0);

      let cumulativeDelay = 0;
      steps.forEach((step, index) => {
        cumulativeDelay += step.duration;

        addTimer(cumulativeDelay - step.duration + 50, () => {
          if (cancelledRef.current) return;
          setPlan((p) => p ? {
            ...p,
            steps: p.steps.map((s, i) => i === index ? { ...s, status: 'running' as const } : s),
          } : p);
        });

        addTimer(cumulativeDelay, async () => {
          if (cancelledRef.current) return;
          try {
            const { output, newContext } = await executeStep(step, newTicket, contextRef.current);
            contextRef.current = newContext;
            setPlan((p) => p ? {
              ...p,
              steps: p.steps.map((s, i) => i === index ? { ...s, status: 'completed' as const, output } : s),
            } : p);

            if (index < steps.length - 1) {
              setCurrentStepIndex(index + 1);
            } else {
              setCurrentStepIndex(steps.length);
              setPlan((p) => p ? { ...p, status: 'completed', confidence: 0.92 + Math.random() * 0.06 } : p);
              setResolution(newContext.resolution || output);
              setRunning(false);
              setCompleted(true);
              speakText('Ticket resolution complete. Response ready for customer.').catch(() => {});
            }
          } catch {
            setPlan((p) => p ? {
              ...p,
              steps: p.steps.map((s, i) => i === index ? { ...s, status: 'failed' as const, output: 'Execution failed' } : s),
              status: 'failed',
            } : p);
            setRunning(false);
          }
        });
      });
    });
  }, [clearTimers, addTimer]);

  const loadDemo = useCallback((index: number) => {
    if (index >= 0 && index < DEMO_TICKETS.length) {
      const t = DEMO_TICKETS[index];
      submitTicket(t.subject, t.description, t.customer.name, t.customer.email);
    }
  }, [submitTicket]);

  const reset = useCallback(() => {
    clearTimers();
    setTicket(null);
    setPlan(null);
    setCurrentStepIndex(-1);
    setRunning(false);
    setCompleted(false);
    setResolution('');
    contextRef.current = {};
  }, [clearTimers]);

  return { ticket, plan, currentStepIndex, running, completed, resolution, submitTicket, loadDemo, reset };
}
