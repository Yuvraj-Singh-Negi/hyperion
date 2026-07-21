'use client';

export interface NewsItem {
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
}

// --- AI LLM Service (server-side proxy via /api/chat) ---

export async function chatWithAI(systemPrompt: string, messages: { role: 'user' | 'assistant'; content: string }[], userMessage: string): Promise<string> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt, messages, userMessage }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.content || 'I apologize, I was unable to process that request.';
  } catch (err) {
    console.error('AI chat failed:', err);
    // Smart fallback when the API route is unavailable
    const q = userMessage.toLowerCase();
    if (q.includes('agent') || q.includes('scout') || q.includes('strategist') || q.includes('tactical') || q.includes('commander')) {
      return `Great question about Hyperion's agents! The platform uses a 4-agent swarm: Scout (anomaly detection), Strategist (risk modeling), Tactical (mitigation planning), and Commander (decision approval). Each agent communicates via the War Room graph. Would you like me to go deeper into any specific agent?`;
    }
    if (q.includes('upload') || q.includes('csv') || q.includes('data')) {
      return `You can upload CSV data in the Intelligence view or use the "Load Sample" button in the War Room. Hyperion analyzes 8 telemetry columns (throughput, latency, error rate, etc.) and scans for statistical anomalies using outlier detection.`;
    }
    if (q.includes('ticket') || q.includes('orchestrator')) {
      return `The Ticket Orchestrator autonomously resolves support tickets using 4 sub-agents: Ticket Analyzer, Knowledge Searcher, Database Operator, and Resolution Composer. Check it out under the Tickets view!`;
    }
    if (q.includes('code') || q.includes('generate')) {
      return `The Code Agent generates JavaScript functions from natural language. It has a self-correction loop: generate → validate syntax → run 5 test cases → parse errors → refactor → retry (up to 3 attempts). Try "Fibonacci" or "Palindrome checker" in the Code AI view!`;
    }
    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return `Hello! I'm the Hyperion Assistant. I can answer questions about the platform's agents (Scout, Strategist, Tactical, Commander), features (voice commands, TTS, CSV analysis, ticket orchestration, code generation), and more. What would you like to know?`;
    }
    return 'I apologize, but I encountered an error processing your request. Please try again.';
  }
}

export async function callGroq(prompt: string): Promise<string> {
  return chatWithAI('You are a helpful assistant.', [], prompt);
}

// --- NewsAPI Service ---

const NEWSAPI_ENDPOINT =
  'https://newsapi.org/v2/top-headlines?country=us&category=business';

const MOCK_NEWS: NewsItem[] = [
  {
    title: 'Fed Signals Potential Rate Cut Amid Economic Uncertainty',
    description:
      'The Federal Reserve has indicated it may cut interest rates in the coming months to stimulate economic growth.',
    source: 'Financial Times',
    url: 'https://example.com/fed-rate-cut',
    publishedAt: new Date().toISOString(),
  },
  {
    title: 'Tech Stocks Rally as AI Sector Continues Rapid Expansion',
    description:
      'Major technology indices saw significant gains as investor confidence in AI-driven growth remains strong.',
    source: 'Bloomberg',
    url: 'https://example.com/tech-rally',
    publishedAt: new Date().toISOString(),
  },
  {
    title: 'Global Supply Chain Disruptions Impact Manufacturing Output',
    description:
      'Ongoing geopolitical tensions are contributing to new supply chain bottlenecks across multiple industries.',
    source: 'Reuters',
    url: 'https://example.com/supply-chain',
    publishedAt: new Date().toISOString(),
  },
  {
    title: 'Cybersecurity Threats Rise as Nation-State Actors Intensify Attacks',
    description:
      'Government agencies warn of increased cyber espionage targeting critical infrastructure and financial systems.',
    source: 'The Guardian',
    url: 'https://example.com/cyber-threats',
    publishedAt: new Date().toISOString(),
  },
  {
    title: 'Energy Prices Volatile as OPEC+ Debates Production Cuts',
    description:
      'Oil markets remain turbulent as major producers consider further output restrictions to support prices.',
    source: 'CNN Business',
    url: 'https://example.com/energy-prices',
    publishedAt: new Date().toISOString(),
  },
];

export async function fetchLiveNews(): Promise<NewsItem[]> {
  const apiKey = process.env.NEXT_PUBLIC_NEWSAPI_KEY;

  if (!apiKey) {
    console.warn('No NewsAPI key found, returning mock data.');
    return MOCK_NEWS;
  }

  try {
    const res = await fetch(`${NEWSAPI_ENDPOINT}&apiKey=${apiKey}`);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`NewsAPI error (${res.status}): ${errorText}`);
    }

    const data = await res.json();

    if (!data.articles || data.articles.length === 0) {
      return MOCK_NEWS;
    }

    return data.articles.map(
      (a: {
        title?: string;
        description?: string;
        source?: { name?: string };
        url?: string;
        publishedAt?: string;
      }) => ({
        title: a.title ?? 'Untitled',
        description: a.description ?? '',
        source: a.source?.name ?? 'Unknown',
        url: a.url ?? '#',
        publishedAt: a.publishedAt ?? new Date().toISOString(),
      }),
    );
  } catch (err) {
    console.error('Failed to fetch live news, returning mock data:', err);
    return MOCK_NEWS;
  }
}

// --- Webhook / Twilio SMS Service ---

export async function sendWebhookAlert(
  message: string,
  webhookUrl?: string,
): Promise<boolean> {
  const url = webhookUrl || process.env.NEXT_PUBLIC_WEBHOOK_URL;

  if (!url) {
    console.warn('No webhook URL configured, simulating successful alert.');
    console.log(`[Webhook Simulated] Payload: ${JSON.stringify({ text: message, source: 'hyperion' })}`);
    return true;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message, source: 'hyperion' }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Webhook error (${res.status}): ${errorText}`);
    }

    return true;
  } catch (err) {
    console.error('Webhook alert failed:', err);
    return false;
  }
}

// --- TTS Service ---

export function speakText(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('SpeechSynthesis not available in this environment.');
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
