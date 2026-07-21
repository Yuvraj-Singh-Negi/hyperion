export interface Agent {
  id: string;
  name: string;
  role: 'scout' | 'strategist' | 'tactical' | 'commander';
  status: 'idle' | 'scanning' | 'planning' | 'executing' | 'resolved';
  confidence: number;
  objective: string;
  timeline: string;
  actions: string[];
}

export interface Alert {
  id: string;
  type: 'cyber' | 'weather' | 'financial' | 'infrastructure' | 'supply_chain' | 'geopolitical';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  region: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
}

export interface Metric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export interface Signal {
  id: string;
  source: string;
  type: string;
  confidence: number;
  timestamp: string;
  summary: string;
}

export interface DashboardData {
  globalRiskIndex: number;
  cyberThreatLevel: string;
  activeEvents: number;
  agentsOnline: number;
  responseLatency: string;
  satellitesTracked: number;
  countriesMonitored: number;
}

export interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
}
