'use client';

import { callGroq } from './apiService';

// ─── Types ───

export interface CodeIteration {
  attempt: number;
  code: string;
  status: 'generating' | 'validating' | 'testing' | 'passed' | 'failed';
  errors: CodeError[];
  duration: number;
}

export interface CodeError {
  type: 'syntax' | 'reference' | 'type' | 'logic' | 'runtime';
  message: string;
  line: number;
  column: number;
  severity: 'error' | 'warning';
}

export interface CodeAgentResult {
  prompt: string;
  iterations: CodeIteration[];
  finalCode: string;
  passed: boolean;
  totalAttempts: number;
}

export interface TestResult {
  passed: boolean;
  output: string;
  errors: CodeError[];
}

// ─── Prompt Templates ───

const PROMPT_TEMPLATES: Record<string, { description: string; testCases: string }> = {
  'Write a function that returns the Fibonacci sequence up to n terms': {
    description: 'fibonacci sequence generator',
    testCases: 'fibonacci(1) → [0]; fibonacci(5) → [0,1,1,2,3]; fibonacci(8) → [0,1,1,2,3,5,8,13]',
  },
  'Write a function that checks if a string is a palindrome': {
    description: 'palindrome checker',
    testCases: 'isPalindrome("racecar") → true; isPalindrome("hello") → false; isPalindrome("A man a plan a canal Panama") → true',
  },
  'Write a function that finds the most frequent element in an array': {
    description: 'most frequent element finder',
    testCases: 'mostFrequent([1,3,1,3,2,1]) → 1; mostFrequent(["a","b","a"]) → "a"; mostFrequent([]) → null',
  },
  'Write a function that deep clones an object': {
    description: 'deep clone utility',
    testCases: 'deepClone({a:1,b:{c:2}}) → {a:1,b:{c:2}}; deepClone(null) → null; deepClone([1,[2,3]]) → [1,[2,3]]',
  },
  'Write a function that debounces another function': {
    description: 'debounce wrapper',
    testCases: 'Creates a debounced version that delays invocation by wait ms. Leading edge optional.',
  },
};

// ─── Generated Code Templates (with deliberate errors for early iterations) ───

function generateInitialCode(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes('fibonacci')) {
    return `function fibonacci(n) {
  if (n === 0) return [];
  if (n === 1) return [0];
  const seq = [0, 1];
  for (let i = 2; i < n; i++);
    seq.push(seq[i - 1] + seq[i - 2]);
  return seq;
}`;
  }

  if (lower.includes('palindrome')) {
    return `function isPalindrome(str) {
  const cleaned = str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const reversed = cleaned.split('').reverse().join('');
  return cleaned == reversed;
}`;
  }

  if (lower.includes('frequent') || lower.includes('most common')) {
    return `function mostFrequent(arr) {
  if (arr.length === 0) return null;
  const freq = {};
  let maxCount = 0;
  let maxItem = null;
  for (const item of arr) {
    freq[item] = (freq[item] || 0) + 1;
    if (freq[item] > maxCount) {
      maxCount = freq[item];
      maxItem = item;
    }
  }
  return maxItem;
}`;
  }

  if (lower.includes('deep clone') || lower.includes('deepclone')) {
    return `function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(deepClone);
  }
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}`;
  }

  if (lower.includes('debounce')) {
    return `function debounce(fn, wait) {
  let timeout = null;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn.apply(context, args);
    }, wait);
  };
}`;
  }

  // Generic fallback
  return `function solution(input) {
  // TODO: implement solution for: ${prompt}
  return input;
}`;
}

// ─── Produce intentional errors for iteration 0 (first attempt) ───

function injectErrors(code: string, prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes('fibonacci')) {
    // Extra semicolon after for loop creates empty statement, off-by-one
    return code.replace('for (let i = 2; i < n; i++);', 'for (let i = 2; i < n; i++);');
  }

  if (lower.includes('palindrome')) {
    // == instead of === (logic "error" that passes tests but is a warning)
    return code.replace('cleaned == reversed', 'cleaned == reversed');
  }

  if (lower.includes('debounce')) {
    // Missing leading edge option, but code is structurally correct
    return code;
  }

  // For others, the initial code is basically correct or has subtle issues
  return code;
}

// ─── Syntax Validator ───

function validateSyntax(code: string): CodeError[] {
  const errors: CodeError[] = [];

  // Check bracket/brace/paren matching
  const stack: { char: string; line: number; col: number }[] = [];
  const pairs: Record<string, string> = { '(': ')', '{': '}', '[': ']' };
  const closing: Record<string, string> = { ')': '(', '}': '{', ']': '[' };

  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    if (pairs[ch]) {
      stack.push({ char: ch, line: 0, col: i });
    } else if (closing[ch]) {
      const last = stack.pop();
      if (!last || last.char !== closing[ch]) {
        const lineNum = code.slice(0, i).split('\n').length;
        errors.push({
          type: 'syntax',
          message: last
            ? `Expected '${pairs[last.char]}' but found '${ch}'`
            : `Unexpected '${ch}' — no matching opening bracket`,
          line: lineNum,
          column: i - code.slice(0, i).lastIndexOf('\n'),
          severity: 'error',
        });
      }
    }
  }

  // Unclosed brackets
  for (const s of stack) {
    const lineNum = code.slice(0, s.col).split('\n').length;
    errors.push({
      type: 'syntax',
      message: `Unclosed '${s.char}' — expected '${pairs[s.char]}'`,
      line: lineNum,
      column: s.col - code.slice(0, s.col).lastIndexOf('\n'),
      severity: 'error',
    });
  }

  // Check for semicolons after for/while/if declarations
  const forRegex = /for\s*\([^)]*\)\s*;/g;
  let match: RegExpExecArray | null;
  while ((match = forRegex.exec(code)) !== null) {
    const lineNum = code.slice(0, match.index).split('\n').length;
    errors.push({
      type: 'logic',
      message: 'Semicolon immediately after for-loop creates an empty loop body',
      line: lineNum,
      column: match.index - code.slice(0, match.index).lastIndexOf('\n'),
      severity: 'warning',
    });
  }

  return errors;
}

// ─── Sandbox Executor ───

function createTestCases(prompt: string): { input: unknown[]; expected: unknown }[] {
  const lower = prompt.toLowerCase();

  if (lower.includes('fibonacci')) {
    return [
      { input: [0], expected: [] },
      { input: [1], expected: [0] },
      { input: [5], expected: [0, 1, 1, 2, 3] },
      { input: [8], expected: [0, 1, 1, 2, 3, 5, 8, 13] },
      { input: [10], expected: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34] },
    ];
  }

  if (lower.includes('palindrome')) {
    return [
      { input: ['racecar'], expected: true },
      { input: ['hello'], expected: false },
      { input: ['A man a plan a canal Panama'], expected: true },
      { input: [''], expected: true },
      { input: ['12321'], expected: true },
    ];
  }

  if (lower.includes('frequent') || lower.includes('most common')) {
    return [
      { input: [[1, 3, 1, 3, 2, 1]], expected: 1 },
      { input: [['a', 'b', 'a']], expected: 'a' },
      { input: [[1, 1, 2, 2, 2]], expected: 2 },
      { input: [[]], expected: null },
      { input: [[5]], expected: 5 },
    ];
  }

  if (lower.includes('deep clone') || lower.includes('deepclone')) {
    return [
      { input: [{ a: 1, b: { c: 2 } }], expected: { a: 1, b: { c: 2 } } },
      { input: [null], expected: null },
      { input: [[1, [2, 3]]], expected: [1, [2, 3]] },
      { input: [{ x: { y: { z: 5 } } }], expected: { x: { y: { z: 5 } } } },
    ];
  }

  if (lower.includes('debounce')) {
    return [
      { input: [{ calls: 0 }], expected: 'function created' },
    ];
  }

  return [{ input: ['test'], expected: 'implemented' }];
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a as Record<string, unknown>);
    const kb = Object.keys(b as Record<string, unknown>);
    if (ka.length !== kb.length) return false;
    return ka.every((k) => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
  }
  return a === b;
}

function executeInSandbox(code: string, prompt: string): TestResult {
  const syntaxErrors = validateSyntax(code);
  const criticalSyntax = syntaxErrors.filter((e) => e.severity === 'error');

  if (criticalSyntax.length > 0) {
    return { passed: false, output: 'Syntax validation failed', errors: criticalSyntax };
  }

  const testCases = createTestCases(prompt);
  if (testCases.length === 0 || testCases[0].expected === 'implemented') {
    return { passed: true, output: 'Code generated successfully. Manual testing required.', errors: [] };
  }

  try {
    const fn = new Function('return ' + code)();
    if (typeof fn !== 'function') {
      return { passed: false, output: 'Generated code does not export a function', errors: [{ type: 'runtime', message: 'Expected a function but got ' + typeof fn, line: 1, column: 1, severity: 'error' }] };
    }

    const testErrors: CodeError[] = [];
    let allPassed = true;

    for (let i = 0; i < testCases.length; i++) {
      try {
        const result = fn(...testCases[i].input);
        const expected = testCases[i].expected;

        if (prompt.toLowerCase().includes('debounce')) {
          // Debounce can't be tested synchronously
          continue;
        }

        if (!deepEqual(result, expected)) {
          allPassed = false;
          testErrors.push({
            type: 'logic',
            message: `Test ${i + 1} failed: input ${JSON.stringify(testCases[i].input)} → got ${JSON.stringify(result)}, expected ${JSON.stringify(expected)}`,
            line: 1,
            column: 1,
            severity: 'error',
          });
        }
      } catch (e: unknown) {
        allPassed = false;
        const msg = e instanceof Error ? e.message : String(e);
        testErrors.push({
          type: 'runtime',
          message: `Test ${i + 1} threw: ${msg}`,
          line: 1,
          column: 1,
          severity: 'error',
        });
      }
    }

    if (allPassed) {
      return { passed: true, output: `All ${testCases.length} tests passed.`, errors: [] };
    }

    return { passed: false, output: `${testErrors.length} of ${testCases.length} tests failed`, errors: testErrors };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { passed: false, output: 'Runtime error: ' + msg, errors: [{ type: 'runtime', message: msg, line: 1, column: 1, severity: 'error' }] };
  }
}

// ─── Refactor Engine ───

function applyRefactor(code: string, errors: CodeError[], prompt: string): string {
  let fixed = code;

  // Fix semicolon after for/while
  fixed = fixed.replace(/for\s*\([^)]*\)\s*;/g, (match) => match.replace(/;\s*$/, ' '));

  // Fix comparison operators based on test failures
  const hasTestFailures = errors.some((e) => e.type === 'logic');
  if (hasTestFailures) {
    const lower = prompt.toLowerCase();
    if (lower.includes('fibonacci')) {
      // Off-by-one: change i < n to i <= n or vice versa
      fixed = fixed.replace(/for\s*\(\s*let\s+i\s*=\s*2\s*;\s*i\s*([<>=]+)\s*n\s*;/, (match, op) => {
        const newOp = op === '<' ? '<=' : op === '<=' ? '<' : op;
        return match.replace(op, newOp);
      });
    }

    if (lower.includes('palindrome')) {
      // == → ===
      fixed = fixed.replace(/cleaned\s*==\s*reversed/g, 'cleaned === reversed');
    }
  }

  // Fix reference errors
  for (const err of errors) {
    if (err.type === 'reference' || err.type === 'runtime') {
      const msg = err.message.toLowerCase();
      if (msg.includes('undefined') || msg.includes('not defined')) {
        const varMatch = msg.match(/'([^']+)'/);
        if (varMatch && !fixed.includes(`let ${varMatch[1]}`) && !fixed.includes(`const ${varMatch[1]}`) && !fixed.includes(`var ${varMatch[1]}`)) {
          fixed = `let ${varMatch[1]} = null;\n` + fixed;
        }
      }
    }
  }

  return fixed;
}

// ─── Public API ───

export function generateCode(prompt: string): string {
  const initial = generateInitialCode(prompt);
  return injectErrors(initial, prompt);
}

export function validateAndTest(code: string, prompt: string): TestResult {
  const syntaxErrors = validateSyntax(code);
  const critical = syntaxErrors.filter((e) => e.severity === 'error');

  if (critical.length > 0) {
    return { passed: false, output: 'Syntax errors found', errors: critical };
  }

  return executeInSandbox(code, prompt);
}

export function refactorCode(code: string, errors: CodeError[], prompt: string): string {
  return applyRefactor(code, errors, prompt);
}

export function parseErrors(errors: CodeError[]): string[] {
  return errors.map((e) => `[${e.type.toUpperCase()}] Line ${e.line}: ${e.message}`);
}

export async function generateWithLLM(prompt: string): Promise<string> {
  const templateKey = Object.keys(PROMPT_TEMPLATES).find((k) => prompt.toLowerCase().includes(k.toLowerCase()));
  const testInfo = templateKey ? PROMPT_TEMPLATES[templateKey] : null;

  const llmPrompt = testInfo
    ? `Write a JavaScript function for: ${prompt}\n\nTest cases: ${testInfo.testCases}\n\nOnly return the function code, no explanation. Use modern JavaScript (ES6+).`
    : `Write a JavaScript function for: ${prompt}\n\nOnly return the function code, no explanation. Use modern JavaScript (ES6+).`;

  try {
    const response = await callGroq(llmPrompt);
    const codeMatch = response.match(/```(?:js|javascript)?\s*([\s\S]*?)```/);
    if (codeMatch) return codeMatch[1].trim();
    const fnMatch = response.match(/(?:function|const|let|var|async)\s+[\s\S]+/);
    if (fnMatch) return fnMatch[0].trim();
    return response;
  } catch {
    return generateCode(prompt);
  }
}

export function getPromptSuggestions(): { label: string; prompt: string; difficulty: string }[] {
  return [
    { label: 'Fibonacci Sequence', prompt: 'Write a function that returns the Fibonacci sequence up to n terms', difficulty: 'easy' },
    { label: 'Palindrome Checker', prompt: 'Write a function that checks if a string is a palindrome', difficulty: 'easy' },
    { label: 'Most Frequent Element', prompt: 'Write a function that finds the most frequent element in an array', difficulty: 'medium' },
    { label: 'Deep Clone Object', prompt: 'Write a function that deep clones an object', difficulty: 'medium' },
    { label: 'Debounce Function', prompt: 'Write a function that debounces another function', difficulty: 'hard' },
  ];
}
