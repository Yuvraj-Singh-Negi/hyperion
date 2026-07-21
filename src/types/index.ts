export type AgentRole = 'scout' | 'strategist' | 'tactical' | 'commander';
export type AgentStatus = 'idle' | 'scanning' | 'analyzing' | 'planning' | 'executing' | 'resolved';
export type Severity = 'low' | 'moderate' | 'high' | 'critical';
export type AnomalyType = 'cyber' | 'weather' | 'financial' | 'infrastructure' | 'supply_chain' | 'geopolitical';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  confidence: number;
  objective: string;
  timeline: string;
  actions: string[];
  thinking: string;
}

export interface Anomaly {
  id: string;
  type: AnomalyType;
  severity: Severity;
  title: string;
  description: string;
  timestamp: string;
  region: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  rowData?: Record<string, unknown>;
}

export interface AgentMessage {
  id: string;
  from: AgentRole;
  to: AgentRole | 'all';
  content: string;
  timestamp: number;
  type: 'alert' | 'analysis' | 'plan' | 'approval' | 'report';
}

export interface AgentScenario {
  id: string;
  title: string;
  probability: number;
  impact: string;
  cost: number;
  timeline: string;
  description: string;
}

export interface TacticalAction {
  id: string;
  type: 'api_call' | 'notification' | 'reallocation' | 'patch' | 'negotiation';
  label: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  target: string;
  description: string;
}

export interface CSVColumn {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date';
  sample: string;
}

export interface CSVData {
  columns: CSVColumn[];
  rows: Record<string, unknown>[];
  fileName: string;
  rowCount: number;
}

export interface ParsedAnomaly {
  anomaly: Anomaly;
  rowIndex: number;
}

export interface AgentState {
  scout: {
    anomalies: Anomaly[];
    scanning: boolean;
    progress: number;
    message: string;
  };
  strategist: {
    scenarios: AgentScenario[];
    analyzing: boolean;
    message: string;
  };
  tactical: {
    actions: TacticalAction[];
    planning: boolean;
    message: string;
  };
  commander: {
    decision: 'pending' | 'approved' | 'rejected' | 'modified';
    feedback: string;
    logs: string[];
  };
}
