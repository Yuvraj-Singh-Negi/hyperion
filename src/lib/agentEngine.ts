'use client';

import { callGroq } from '@/lib/apiService';
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

const metricKeys = ['throughput', 'latency_ms', 'error_rate', 'cyber_alerts', 'energy_usage', 'supply_chain_index', 'financial_volatility', 'satellite_signal'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId(): string {
  return `anom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function detectOutlier(row: Record<string, unknown>): { key: string; value: number; reason: string } | null {
  const numericVals: { key: string; value: number }[] = [];
  for (const k of metricKeys) {
    const v = row[k];
    if (typeof v === 'number' && !isNaN(v)) {
      numericVals.push({ key: k, value: v });
    }
  }

  if (numericVals.length < 3) return null;

  const values = numericVals.map((v) => v.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const std = Math.sqrt(values.reduce((sq, v) => sq + (v - mean) ** 2, 0) / values.length);

  if (std < 0.01) return null;

  const threshold = 1.8;
  let worst: { key: string; value: number; deviation: number } | null = null;

  for (const nv of numericVals) {
    const dev = Math.abs(nv.value - mean) / std;
    if (dev > threshold && (!worst || dev > worst.deviation)) {
      worst = { ...nv, deviation: dev };
    }
  }

  if (!worst) return null;

  const reasons: Record<string, string> = {
    throughput: 'Critical throughput deviation from baseline',
    latency_ms: 'Latency spike exceeds operational threshold',
    error_rate: 'Error rate anomaly detected',
    cyber_alerts: 'Abnormal cybersecurity alert volume',
    energy_usage: 'Energy consumption pattern deviation',
    supply_chain_index: 'Supply chain index outside expected range',
    financial_volatility: 'Financial volatility exceeds risk tolerance',
    satellite_signal: 'Satellite signal integrity compromised',
  };

  return {
    key: worst.key,
    value: worst.value,
    reason: reasons[worst.key] ?? 'Statistical anomaly detected',
  };
}

function analyzeCSVRow(row: Record<string, unknown>, index: number): Anomaly | null {
  const outlier = detectOutlier(row);
  if (!outlier) {
    if (index % 8 !== 0) return null;
  }

  const reg = typeof row['region'] === 'string' ? row['region'] : pick(regions);
  const timestamp = typeof row['timestamp'] === 'string' ? row['timestamp'] : `${Math.floor(Math.random() * 59 + 1)}s ago`;

  const severity: Severity = outlier && outlier.value > 50 ? 'critical' : outlier ? 'high' : Math.random() > 0.5 ? 'moderate' : 'low';
  const template = pick(anomalyTemplates);

  return {
    id: generateId(),
    type: template.type,
    severity,
    title: template.title,
    description: `${template.desc} in ${reg}` + (outlier ? `. ${outlier.reason}: ${outlier.value.toFixed(1)}` : ''),
    timestamp,
    region: reg as string,
    value: outlier ? outlier.value.toFixed(1) : `${(Math.random() * 10).toFixed(1)}%`,
    trend: outlier && outlier.value > 30 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
    rowData: row,
  };
}

export function scoutScan(rows: Record<string, unknown>[]): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const processed = new Set<string>();

  for (let i = 0; i < Math.min(rows.length, 250); i++) {
    const anom = analyzeCSVRow(rows[i], i);
    if (anom && !processed.has(anom.title + anom.region)) {
      processed.add(anom.title + anom.region);
      anomalies.push(anom);
    }
    if (anomalies.length >= 10) break;
  }

  return anomalies;
}

export function strategize(anomalies: Anomaly[]): AgentScenario[] {
  const impacted = [
    'Critical infrastructure disruption',
    'Supply chain delay',
    'Financial loss',
    'Service degradation',
    'Reputational damage',
    'Regulatory penalty',
    'Operational shutdown',
    'Market share erosion',
  ];

  return anomalies.map((a, i) => ({
    id: `scenario-${i}`,
    title: `Scenario ${String.fromCharCode(65 + i)}: ${a.title} Response`,
    probability: Math.round(Math.random() * 30 + 60),
    impact: impacted[Math.floor(Math.random() * impacted.length)],
    cost: Math.round(Math.random() * 800 + 200) * 10000,
    timeline: `${Math.floor(Math.random() * 24 + 1)}h`,
    description: `If unaddressed, this anomaly could cascade through ${Math.floor(Math.random() * 3 + 2)} dependent systems. ` +
      `Primary impact zone: ${a.region}. Estimated total exposure: $${(Math.round(Math.random() * 1000 + 500) * 10000).toLocaleString()}.`,
  }));
}

export function planTactical(scenarios: AgentScenario[]): TacticalAction[] {
  const actionTemplates = [
    { type: 'api_call' as const, label: 'Execute API Mitigation', target: 'Automated Response System' },
    { type: 'notification' as const, label: 'Alert Stakeholders', target: 'Enterprise Notification Service' },
    { type: 'reallocation' as const, label: 'Reallocate Resources', target: 'Resource Management Platform' },
    { type: 'patch' as const, label: 'Deploy Security Patch', target: 'Deployment Pipeline' },
    { type: 'negotiation' as const, label: 'Initiate Supplier Negotiation', target: 'Supply Chain Portal' },
    { type: 'api_call' as const, label: 'Trigger Circuit Breaker', target: 'Trading Platform' },
    { type: 'notification' as const, label: 'Broadcast Emergency Protocol', target: 'Incident Response System' },
  ];

  const actions: TacticalAction[] = [];

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

  return actions.slice(0, 7);
}

export function generateMessages(anomalies: Anomaly[], scenarios: AgentScenario[], actions: TacticalAction[]): AgentMessage[] {
  const messages: AgentMessage[] = [];
  const now = Date.now();

  for (const a of anomalies.slice(0, 4)) {
    messages.push({
      id: `msg-scout-${a.id}`,
      from: 'scout',
      to: 'strategist',
      content: `Alert: ${a.title} detected in ${a.region}. Severity: ${a.severity}. Metric: ${a.value}. Trend: ${a.trend}.`,
      timestamp: now + messages.length,
      type: 'alert',
    });
  }

  for (const s of scenarios.slice(0, 3)) {
    messages.push({
      id: `msg-strat-${s.id}`,
      from: 'strategist',
      to: 'tactical',
      content: `Scenario analyzed: ${s.title}. Probability: ${s.probability}%. Impact: ${s.impact}. Cost: $${s.cost.toLocaleString()}. Recommended: ${s.timeline} response window.`,
      timestamp: now + messages.length,
      type: 'analysis',
    });
  }

  for (const a of actions.slice(0, 3)) {
    messages.push({
      id: `msg-tact-${a.id}`,
      from: 'tactical',
      to: 'commander',
      content: `Plan formulated: ${a.label} via ${a.target}. Status: ${a.status}. Awaiting authorization.`,
      timestamp: now + messages.length,
      type: 'plan',
    });
  }

  messages.push({
    id: 'msg-cmd-final',
    from: 'commander',
    to: 'all',
    content: 'Mission analysis complete. Autonomous mitigation protocols authorized. All agents synchronized. Continuing monitoring cycle.',
    timestamp: now + messages.length,
    type: 'approval',
  });

  return messages;
}

export async function callAgentLLM(agentName: string, context: string): Promise<string> {
  const prompt = `You are ${agentName}, an AI agent in the Hyperion autonomous war room system. ${context}. Provide a concise analysis (2-3 sentences).`;
  return callGroq(prompt);
}
