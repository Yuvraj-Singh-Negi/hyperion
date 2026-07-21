'use client';

import { SupportTicket, OrchestrationPlan, OrchestrationStep, TicketPriority } from '@/types';
import { callGroq } from './apiService';

const KB_ENTRIES: Record<string, string> = {
  'password reset': 'To reset a password: 1) Navigate to Settings > Security. 2) Click "Reset Password". 3) Enter new password (min 8 chars, 1 uppercase, 1 special). 4) Confirm. For SSO users, the IT admin must initiate from the admin console.',
  'refund': 'Refund policy: Full refund within 30 days of purchase. Partial refund (50%) between 30-60 days. No refund after 60 days. Enterprise contracts are non-refundable but can be credited. Refunds are processed within 5-7 business days to the original payment method.',
  'account locked': 'Account lockout occurs after 5 failed login attempts. Unlock: 1) Wait 15 minutes for auto-unlock. 2) Use "Forgot Password" flow. 3) Contact IT to force unlock from admin panel. SSO accounts are managed by your identity provider.',
  'billing': 'Billing support: Invoices are generated on the 1st of each month. Payment terms are Net-30. Accepted methods: Visa, Mastercard, ACH, Wire Transfer. For disputed charges, submit a ticket within 14 days. Late payments incur 1.5% monthly interest.',
  'api key': 'API key management: Generate keys from Developer > API Keys. Max 5 keys per account. Keys expire after 365 days. Rotate keys every 90 days for security. Never share keys in client-side code. Use environment variables for key storage.',
  'integration': 'Integration guide: Supported integrations include Slack, Salesforce, Jira, Zendesk, and GitHub. Connection requires OAuth 2.0 authentication. Webhooks can be configured under Settings > Integrations. Rate limit: 1000 requests/hour per integration.',
  'data export': 'Data export: Available in CSV, JSON, and XLSX formats. Go to Settings > Data Management > Export. Maximum export size is 100K rows. Larger exports are emailed as compressed files when ready. Exports include all data up to the time of request.',
  'subscription': 'Subscription plans: Basic ($29/mo) - 5 users, Pro ($99/mo) - 20 users, Enterprise (Custom) - unlimited. Downgrades take effect at next billing cycle. Upgrades are immediate and prorated. Cancel anytime from Settings > Billing.',
  'performance': 'Performance troubleshooting: 1) Check system status at status.example.com. 2) Clear browser cache and cookies. 3) Disable browser extensions. 4) Check your network connectivity. 5) Ensure minimum requirements: Chrome 90+, 8GB RAM, 10Mbps internet.',
  'security': 'Security best practices: Enable 2FA under Security Settings. Use strong passwords. Review active sessions monthly. Report suspicious activity immediately to security@example.com. Our SOC 2 Type II audit is available upon request via NDA.',
};

function generateId(): string {
  return `step-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
}

function detectIntent(text: string): { category: string; keywords: string[] } {
  const lower = text.toLowerCase();
  const checks: [string, string[]][] = [
    ['password', ['password', 'login', 'sign in', 'forgot', 'credentials', 'authenticate']],
    ['account', ['locked', 'blocked', 'suspended', 'disabled', 'access denied']],
    ['billing', ['billing', 'invoice', 'payment', 'charge', 'receipt', 'subscription', 'plan']],
    ['refund', ['refund', 'return', 'credit', 'reversal', 'money back']],
    ['api', ['api', 'key', 'token', 'integration', 'webhook', 'oauth']],
    ['export', ['export', 'download', 'backup', 'data extract']],
    ['performance', ['slow', 'performance', 'lag', 'timeout', 'crash', 'error', 'bug']],
    ['security', ['security', 'breach', 'hack', 'unauthorized', 'phishing', 'compromised']],
    ['setup', ['setup', 'install', 'configure', 'onboard', 'getting started', 'tutorial']],
  ];

  for (const [cat, keywords] of checks) {
    const matched = keywords.filter((k) => lower.includes(k));
    if (matched.length > 0) return { category: cat, keywords: matched };
  }
  return { category: 'general', keywords: [] };
}

function detectPriority(text: string): TicketPriority {
  const lower = text.toLowerCase();
  const urgent = ['urgent', 'emergency', 'immediately', 'asap', 'critical', 'deadline', 'blocked', 'down', 'outage'];
  const high = ['important', 'high', 'severe', 'major', 'problem', 'cannot', "can't work"];
  const med = ['medium', 'help', 'issue', 'question', 'inquiry'];

  if (urgent.some((w) => lower.includes(w))) return 'urgent';
  if (high.some((w) => lower.includes(w))) return 'high';
  if (med.some((w) => lower.includes(w))) return 'medium';
  return 'low';
}

async function searchKnowledgeBase(query: string, category: string): Promise<string> {
  const queryWords = query.toLowerCase().split(/\s+/);

  let bestMatch = '';
  let bestScore = 0;

  for (const [key, value] of Object.entries(KB_ENTRIES)) {
    const keyWords = key.split(/\s+/);
    let score = 0;
    for (const qw of queryWords) {
      if (keyWords.some((kw) => kw.includes(qw) || qw.includes(kw))) score += 2;
      if (value.toLowerCase().includes(qw)) score += 1;
    }
    if (key.includes(category)) score += 3;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = value;
    }
  }

  if (bestScore === 0) {
    const llm = await callGroq(`Search our knowledge base for: "${query}". Provide a helpful response based on standard practices. Keep it concise (2-3 sentences).`).catch(() => '');
    return llm || 'I searched our knowledge base but could not find a specific match. I have escalated this to our senior support team for manual review.';
  }

  return bestMatch;
}

function simulateDBUpdate(ticket: SupportTicket, action: string, resolution?: string): string {
  const updates: Record<string, string> = {
    status_update: `Ticket ${ticket.id} status updated to: in_progress. Assigned to Tier-2 support queue.`,
    customer_record: `Customer ${ticket.customer.name} (${ticket.customer.id}) record updated. Support history appended.`,
    resolution_log: resolution
      ? `Resolution logged for ticket ${ticket.id}: "${resolution.slice(0, 80)}..." SLA: ${Math.random() > 0.5 ? 'Met' : 'Exceeded (12min early)'}.`
      : `Resolution pending for ticket ${ticket.id}. Follow-up scheduled in 24h.`,
    escalation: `Ticket ${ticket.id} escalated to engineering team. Priority: ${ticket.priority}. Reference: INC-${Math.floor(Math.random() * 90000 + 10000)}.`,
    notification: `Notification sent to ${ticket.customer.email}: "Your ticket ${ticket.id} has been updated."`,
  };

  return updates[action] ?? `Action "${action}" executed successfully for ticket ${ticket.id}.`;
}

async function analyzeTicket(ticket: SupportTicket): Promise<{ summary: string; category: string; confidence: number; context: string }> {
  const intent = detectIntent(ticket.subject + ' ' + ticket.description);
  const llm = await callGroq(
    `Analyze this support ticket and extract: 1) Primary issue category, 2) Customer sentiment, 3) Business impact, 4) Recommended action priority.
    
Subject: ${ticket.subject}
Description: ${ticket.description}
Customer: ${ticket.customer.name}

Respond with a concise analysis (2-3 sentences).`
  ).catch(() => '');

  return {
    summary: llm || `Ticket categorized as "${intent.category}" issue. Keywords detected: ${intent.keywords.join(', ') || 'general inquiry'}. Priority assessment: ${detectPriority(ticket.description)}.`,
    category: intent.category,
    confidence: intent.keywords.length > 0 ? 0.85 + Math.random() * 0.1 : 0.6 + Math.random() * 0.2,
    context: JSON.stringify({ subject: ticket.subject, description: ticket.description }),
  };
}

async function searchSolutions(ticket: SupportTicket, analysis: { category: string; summary: string }): Promise<{ findings: string; sources: string[] }> {
  const kbResult = await searchKnowledgeBase(ticket.description, analysis.category);
  const llmResult = await callGroq(
    `Given this customer support ticket, provide specific solution steps.

Issue category: ${analysis.category}
Subject: ${ticket.subject}
Description: ${ticket.description}
Customer priority: ${ticket.priority}

Provide 2-3 concrete resolution steps tailored to this specific issue. Be specific and actionable.`
  ).catch(() => '');

  const findings = kbResult + (llmResult ? `\n\nAdditional guidance: ${llmResult}` : '');
  return {
    findings,
    sources: ['Knowledge Base', ...(llmResult ? ['LLM Recommendation'] : [])],
  };
}

async function executeDBActions(ticket: SupportTicket, resolution?: string): Promise<string[]> {
  const actions = ['status_update', 'customer_record'];
  if (resolution) actions.push('resolution_log');
  else if (ticket.priority === 'urgent' || ticket.priority === 'high') actions.push('escalation');
  actions.push('notification');

  return actions.map((a) => simulateDBUpdate(ticket, a, resolution));
}

async function composeResolution(
  ticket: SupportTicket,
  analysis: { summary: string },
  solutions: { findings: string },
  dbResults: string[],
): Promise<string> {
  const llm = await callGroq(
    `Compose a professional customer support response for the following ticket. 
Be empathetic, specific, and action-oriented. Include the resolution steps.

Subject: ${ticket.subject}
Customer: ${ticket.customer.name}
Priority: ${ticket.priority}

Knowledge base findings: ${solutions.findings.slice(0, 300)}
System actions taken: ${dbResults.join('. ').slice(0, 200)}

Write the response (3-4 sentences) in a helpful, professional tone.`
  ).catch(() => '');

  return llm || `Hello ${ticket.customer.name},\n\nThank you for contacting us regarding "${ticket.subject}". We have analyzed your issue and identified the following resolution steps:\n\n${solutions.findings.slice(0, 200)}\n\nOur team has been notified and your ticket is being processed. We will follow up within 24 hours.\n\nBest regards,\nHyperion Support Team`;
}

export async function generatePlan(ticket: SupportTicket): Promise<OrchestrationPlan> {
  const steps: OrchestrationStep[] = [
    { id: generateId(), agent: 'Ticket Analyzer', action: 'analyze_ticket', input: ticket.description, output: '', status: 'pending', duration: 600 },
    { id: generateId(), agent: 'Knowledge Searcher', action: 'search_solutions', input: `${ticket.subject}: ${ticket.description}`, output: '', status: 'pending', duration: 800 },
    { id: generateId(), agent: 'Database Operator', action: 'update_records', input: `Ticket ${ticket.id} - ${ticket.priority} priority`, output: '', status: 'pending', duration: 500 },
    { id: generateId(), agent: 'Knowledge Searcher', action: 'deep_search', input: `Category: ${detectIntent(ticket.description).category}`, output: '', status: 'pending', duration: 700 },
    { id: generateId(), agent: 'Database Operator', action: 'log_resolution', input: `Ticket ${ticket.id} resolution`, output: '', status: 'pending', duration: 400 },
    { id: generateId(), agent: 'Resolution Composer', action: 'compose_response', input: `Final response for ${ticket.customer.name}`, output: '', status: 'pending', duration: 600 },
  ];

  return { ticketId: ticket.id, steps, status: 'draft', summary: '', confidence: 0 };
}

export async function executeStep(step: OrchestrationStep, ticket: SupportTicket, context: {
  analysis?: { summary: string; category: string; confidence: number; context: string };
  solutions?: { findings: string; sources: string[] };
  dbResults?: string[];
  resolution?: string;
}): Promise<{ output: string; newContext: typeof context }> {
  const ctx = { ...context };

  switch (step.action) {
    case 'analyze_ticket': {
      ctx.analysis = await analyzeTicket(ticket);
      return { output: ctx.analysis.summary, newContext: ctx };
    }
    case 'search_solutions': {
      if (!ctx.analysis) ctx.analysis = await analyzeTicket(ticket);
      ctx.solutions = await searchSolutions(ticket, ctx.analysis);
      return { output: ctx.solutions.findings.slice(0, 300), newContext: ctx };
    }
    case 'update_records': {
      ctx.dbResults = await executeDBActions(ticket);
      return { output: ctx.dbResults.join('\n'), newContext: ctx };
    }
    case 'deep_search': {
      if (!ctx.solutions) {
        ctx.solutions = await searchSolutions(ticket, ctx.analysis || await analyzeTicket(ticket));
      }
      const deep = await searchKnowledgeBase(ticket.description, ctx.analysis?.category || 'general');
      return { output: deep, newContext: ctx };
    }
    case 'log_resolution': {
      if (!ctx.dbResults) ctx.dbResults = await executeDBActions(ticket);
      return { output: `Resolution logged. Records updated.`, newContext: ctx };
    }
    case 'compose_response': {
      ctx.resolution = await composeResolution(
        ticket,
        ctx.analysis || await analyzeTicket(ticket),
        ctx.solutions || await searchSolutions(ticket, ctx.analysis || await analyzeTicket(ticket)),
        ctx.dbResults || [],
      );
      return { output: ctx.resolution, newContext: ctx };
    }
    default:
      return { output: `Executed action: ${step.action}`, newContext: ctx };
  }
}

export function createTicket(subject: string, description: string, name: string, email: string): SupportTicket {
  return {
    id: `TKT-${Math.floor(Math.random() * 90000 + 10000)}`,
    subject,
    description,
    customer: { name, email, id: `CUST-${Math.floor(Math.random() * 9000 + 1000)}` },
    priority: detectPriority(description),
    category: detectIntent(subject + ' ' + description).category,
    status: 'open',
    createdAt: new Date().toISOString(),
  };
}

export const DEMO_TICKETS: SupportTicket[] = [
  createTicket(
    'Cannot reset my password — urgent',
    'I am locked out of my admin account and cannot reset my password. The "Forgot Password" link sends me an error. I have a deadline in 2 hours.',
    'Sarah Chen',
    'sarah.chen@acmecorp.com',
  ),
  createTicket(
    'Billing discrepancy on last invoice',
    'Our last invoice (#INV-8942) shows a charge of $2,499 but our agreement is $1,999/mo for the Pro plan. We were also charged for 25 users but only have 18 active.',
    'Marcus Johnson',
    'marcus.j@techstart.io',
  ),
  createTicket(
    'API integration failing with 503 errors',
    'Our Salesforce integration has been returning 503 Service Unavailable errors for the past 3 hours. This is affecting our lead sync pipeline and the sales team cannot access updated data.',
    'Emily Rodriguez',
    'emily.r@dataflow.co',
  ),
];
