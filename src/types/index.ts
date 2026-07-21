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

// ─── Orchestration Types ───

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed';
export type OrchestrationStatus = 'draft' | 'planning' | 'executing' | 'completed' | 'failed';

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  customer: { name: string; email: string; id: string };
  priority: TicketPriority;
  category: string;
  status: TicketStatus;
  createdAt: string;
}

export interface OrchestrationStep {
  id: string;
  agent: string;
  action: string;
  input: string;
  output: string;
  status: StepStatus;
  duration: number;
}

export interface OrchestrationPlan {
  ticketId: string;
  steps: OrchestrationStep[];
  status: OrchestrationStatus;
  summary: string;
  resolution?: string;
  confidence: number;
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
