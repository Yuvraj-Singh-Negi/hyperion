import { Anomaly, AgentScenario, TacticalAction, AgentMessage, Severity, AnomalyType } from '@/types';

const regions = [
  'Pacific Northwest', 'South China Sea', 'North Atlantic', 'Global Markets',
  'Northern Europe', 'East Asia', 'GEO Orbit', 'Middle East', 'Latin America',
  'Southeast Asia', 'Arctic Circle', 'Indian Ocean', 'Central Africa', 'Australia',
];

const anomalyTemplates = [
  { type: 'cyber' as AnomalyType, title: 'Zero-Day Exploit Detected', desc: 'Active exploitation of critical infrastructure endpoint' },
  { type: 'weather' as AnomalyType, title: 'Supercell Formation', desc: 'Atmospheric anomaly detected. Projected path intersects major assets' },
  { type: 'financial' as AnomalyType, title: 'Volatility Spike Alert', desc: 'Unusual options activity detected across energy futures markets' },
  { type: 'infrastructure' as AnomalyType, title: 'Grid Anomaly Detected', desc: 'Frequency deviation detected in power distribution network' },
  { type: 'supply_chain' as AnomalyType, title: 'Port Congestion Alert', desc: 'Throughput dropping below critical threshold' },
  { type: 'geopolitical' as AnomalyType, title: 'Satellite Anomaly', desc: 'Irregular telemetry detected from geostationary asset' },
  { type: 'cyber' as AnomalyType, title: 'Data Breach Attempt', desc: 'Unauthorized access pattern detected on internal network' },
  { type: 'financial' as AnomalyType, title: 'Liquidity Crisis Signal', desc: 'Abnormal withdrawal patterns detected across multiple institutions' },
  { type: 'supply_chain' as AnomalyType, title: 'Inventory Depletion', desc: 'Critical inventory levels below safety threshold' },
  { type: 'infrastructure' as AnomalyType, title: 'Pipeline Pressure Drop', desc: 'Unexpected pressure loss in primary distribution line' },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId(): string {
  return `anom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function analyzeCSVRow(row: Record<string, unknown>, index: number): Anomaly | null {
  const values = Object.values(row).filter((v) => typeof v === 'number') as number[];
  if (values.length === 0) return null;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const std = Math.sqrt(values.reduce((sq, v) => sq + (v - mean) ** 2, 0) / values.length);
  const threshold = 1.5;

  const outliers = values.filter((v) => Math.abs(v - mean) > threshold * std);
  if (outliers.length === 0 && index % 7 !== 0) return null;

  const severity: Severity = outliers.length > 2 ? 'critical' : outliers.length > 1 ? 'high' : Math.random() > 0.5 ? 'moderate' : 'low';
  const template = pick(anomalyTemplates);

  return {
    id: generateId(),
    type: template.type,
    severity,
    title: template.title,
    description: `${template.desc} in ${pick(regions)}`,
    timestamp: `${Math.floor(Math.random() * 59 + 1)}s ago`,
    region: pick(regions),
    value: outliers.length > 0 ? outliers[0].toFixed(1) : `${(Math.random() * 10).toFixed(1)}%`,
    trend: outliers.length > 0 ? (outliers[0] > mean ? 'up' : 'down') : 'stable',
    rowData: row,
  };
}

export function scoutScan(rows: Record<string, unknown>[]): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const processed = new Set<string>();

  for (let i = 0; i < Math.min(rows.length, 200); i++) {
    const anom = analyzeCSVRow(rows[i], i);
    if (anom && !processed.has(anom.title + anom.region)) {
      processed.add(anom.title + anom.region);
      anomalies.push(anom);
    }
  }

  return anomalies.slice(0, 8);
}

export function strategize(anomalies: Anomaly[]): AgentScenario[] {
  return anomalies.map((a, i) => ({
    id: `scenario-${i}`,
    title: `Scenario ${String.fromCharCode(65 + i)}: ${a.title} Response`,
    probability: Math.round(Math.random() * 30 + 60),
    impact: ['Critical infrastructure disruption', 'Supply chain delay', 'Financial loss', 'Service degradation', 'Reputational damage'][Math.floor(Math.random() * 5)],
    cost: Math.round(Math.random() * 500 + 100) * 10000,
    timeline: `${Math.floor(Math.random() * 24 + 1)}h`,
    description: `If unaddressed, this anomaly could cascade through ${Math.floor(Math.random() * 3 + 2)} dependent systems, causing an estimated total impact of $${(Math.round(Math.random() * 500 + 100) * 10000).toLocaleString()}.`,
  }));
}

export function planTactical(scenarios: AgentScenario[]): TacticalAction[] {
  const actions: TacticalAction[] = [];

  const actionTemplates = [
    { type: 'api_call' as const, label: 'Execute API Mitigation', target: 'Automated Response System' },
    { type: 'notification' as const, label: 'Alert Stakeholders', target: 'Enterprise Notification Service' },
    { type: 'reallocation' as const, label: 'Reallocate Resources', target: 'Resource Management Platform' },
    { type: 'patch' as const, label: 'Deploy Security Patch', target: 'Deployment Pipeline' },
    { type: 'negotiation' as const, label: 'Initiate Supplier Negotiation', target: 'Supply Chain Portal' },
  ];

  for (const scenario of scenarios) {
    const template = actionTemplates[Math.floor(Math.random() * actionTemplates.length)];
    actions.push({
      id: `action-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`,
      type: template.type,
      label: template.label,
      status: 'pending',
      target: template.target,
      description: `Executing mitigation for "${scenario.title}" via ${template.target}`,
    });
  }

  return actions.slice(0, 5);
}

export function generateMessages(anomalies: Anomaly[], scenarios: AgentScenario[], actions: TacticalAction[]): AgentMessage[] {
  const messages: AgentMessage[] = [];
  const now = Date.now();

  for (const a of anomalies.slice(0, 3)) {
    messages.push({
      id: `msg-scout-${a.id}`,
      from: 'scout',
      to: 'strategist',
      content: `Alert: ${a.title} detected in ${a.region}. Severity: ${a.severity}. Value: ${a.value}.`,
      timestamp: now + messages.length,
      type: 'alert',
    });
  }

  for (const s of scenarios.slice(0, 2)) {
    messages.push({
      id: `msg-strat-${s.id}`,
      from: 'strategist',
      to: 'tactical',
      content: `Scenario analyzed: ${s.title}. Probability: ${s.probability}%. Estimated cost: $${s.cost.toLocaleString()}. Recommended action required.`,
      timestamp: now + messages.length,
      type: 'analysis',
    });
  }

  for (const a of actions.slice(0, 2)) {
    messages.push({
      id: `msg-tact-${a.id}`,
      from: 'tactical',
      to: 'commander',
      content: `Plan formulated: ${a.label} via ${a.target}. Awaiting authorization to execute.`,
      timestamp: now + messages.length,
      type: 'plan',
    });
  }

  messages.push({
    id: 'msg-cmd-final',
    from: 'commander',
    to: 'scout',
    content: 'Mission analysis complete. Autonomous mitigation protocols authorized. Continuing monitoring cycle.',
    timestamp: now + messages.length,
    type: 'approval',
  });

  return messages;
}

export async function callLLM(prompt: string, apiKey?: string): Promise<string> {
  if (!apiKey) {
    const fallbacks: Record<string, string> = {
      scout: 'Analysis complete. Detected 3 anomaly clusters with 94.2% confidence. Primary threat: zero-day pattern in Pacific sector.',
      strategist: 'Scenario modeling complete. Projected cascade affects 4 dependent systems. Recommended: isolate affected nodes.',
      tactical: 'Mitigation plan formulated. 3 actions queued: API patch, resource reallocation, stakeholder notification.',
      commander: 'All agents synchronized. Decision: Approve tactical execution. Monitoring for secondary effects.',
    };
    const key = Object.keys(fallbacks).find((k) => prompt.toLowerCase().includes(k));
    return fallbacks[key ?? 'commander'];
  }

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? 'Analysis complete.';
  } catch {
    return 'LLM unavailable. Using local analysis.';
  }
}
