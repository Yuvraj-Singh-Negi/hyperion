'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { CodeIteration, CodeAgentResult } from '@/lib/codeAgentEngine';
import { generateCode, validateAndTest, refactorCode } from '@/lib/codeAgentEngine';
import { speakText } from '@/lib/apiService';

export function useCodeAgent() {
  const [prompt, setPromptState] = useState('');
  const [iterations, setIterations] = useState<CodeIteration[]>([]);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState<CodeAgentResult | null>(null);
  const [currentCode, setCurrentCode] = useState('');
  const [currentAttempt, setCurrentAttempt] = useState(0);
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

  const startGeneration = useCallback(async (userPrompt: string) => {
    clearTimers();
    cancelledRef.current = false;
    setPromptState(userPrompt);
    setIterations([]);
    setResult(null);
    setCurrentCode('');
    setCurrentAttempt(0);
    setRunning(true);
    setCompleted(false);

    const allIterations: CodeIteration[] = [];
    let code = '';
    const maxAttempts = 3;

    // Phase 1: Generate
    addTimer(200, () => {
      if (cancelledRef.current) return;
      const iter1: CodeIteration = { attempt: 1, code: '', status: 'generating', errors: [], duration: 0 };
      allIterations.push(iter1);
      setIterations([...allIterations]);

      addTimer(800, () => {
        if (cancelledRef.current) return;
        code = generateCode(userPrompt);
        setCurrentCode(code);
        iter1.code = code;
        iter1.status = 'validating';
        setIterations([...allIterations]);

        addTimer(400, () => {
          if (cancelledRef.current) return;
          iter1.status = 'testing';
          setIterations([...allIterations]);

          addTimer(500, () => {
            if (cancelledRef.current) return;
            const testResult = validateAndTest(code, userPrompt);
            iter1.status = testResult.passed ? 'passed' : 'failed';
            iter1.errors = testResult.errors;
            iter1.duration = 1900;
            setIterations([...allIterations]);

            if (testResult.passed) {
              finish(userPrompt, allIterations, code, true);
              return;
            }

            // Attempt 2: Refactor
            attemptRefactor(2);
          });
        });
      });
    });

    function attemptRefactor(attempt: number) {
      if (attempt > maxAttempts || cancelledRef.current) {
        finish(userPrompt, allIterations, code, false);
        return;
      }

      setCurrentAttempt(attempt);

      addTimer(300, () => {
        if (cancelledRef.current) return;
        const iter: CodeIteration = { attempt, code: '', status: 'generating', errors: [], duration: 0 };
        allIterations.push(iter);
        setIterations([...allIterations]);

        addTimer(600, () => {
          if (cancelledRef.current) return;
          const prevErrors = allIterations[allIterations.length - 2]?.errors || [];
          code = refactorCode(code, prevErrors, userPrompt);
          setCurrentCode(code);
          iter.code = code;
          iter.status = 'validating';
          setIterations([...allIterations]);

          addTimer(300, () => {
            if (cancelledRef.current) return;
            iter.status = 'testing';
            setIterations([...allIterations]);

            addTimer(500, () => {
              if (cancelledRef.current) return;
              const testResult = validateAndTest(code, userPrompt);
              iter.status = testResult.passed ? 'passed' : 'failed';
              iter.errors = testResult.errors;
              iter.duration = 1700;
              setIterations([...allIterations]);

              if (testResult.passed) {
                finish(userPrompt, allIterations, code, true);
              } else {
                attemptRefactor(attempt + 1);
              }
            });
          });
        });
      });
    }

    function finish(p: string, iters: CodeIteration[], finalCode: string, passed: boolean) {
      setRunning(false);
      setCompleted(true);
      setResult({
        prompt: p,
        iterations: iters,
        finalCode,
        passed,
        totalAttempts: iters.length,
      });

      if (passed) {
        speakText(`Code agent successful after ${iters.length} iteration${iters.length > 1 ? 's' : ''}. All tests passing.`).catch(() => {});
      } else {
        speakText(`Code agent completed. Maximum iterations reached. Some tests still failing.`).catch(() => {});
      }
    }
  }, [clearTimers, addTimer]);

  const reset = useCallback(() => {
    clearTimers();
    setPromptState('');
    setIterations([]);
    setResult(null);
    setCurrentCode('');
    setCurrentAttempt(0);
    setRunning(false);
    setCompleted(false);
  }, [clearTimers]);

  return { prompt, iterations, running, completed, result, currentCode, currentAttempt, startGeneration, reset };
}
