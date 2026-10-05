import { LyraActionPayload } from '../types';

export interface ActionExecutionResult {
  success: boolean;
  message: string;
  action: LyraActionPayload;
}

// Approved external reference domains for safe browsing
export const APPROVED_EXTERNAL_DOMAINS = [
  'arxiv.org',
  'docs.ros.org',
  'github.com',
  'rust-lang.org',
  'python.org',
  'kernel.org',
  'wikipedia.org',
  'mit.edu',
  'stanford.edu',
];

export function isApprovedUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
    const host = parsed.hostname.toLowerCase();
    return APPROVED_EXTERNAL_DOMAINS.some(
      (approved) => host === approved || host.endsWith(`.${approved}`)
    );
  } catch {
    return false;
  }
}

// Parses natural commands from Lyra responses or user prompts
export function parseLyraActions(text: string): LyraActionPayload | null {
  const lower = text.toLowerCase();

  // Navigation commands
  if (lower.includes('navigate to') || lower.includes('open section') || lower.includes('go to')) {
    if (lower.includes('goal')) return { type: 'navigate', target: 'goals' };
    if (lower.includes('plan') || lower.includes('today')) return { type: 'navigate', target: 'plan' };
    if (lower.includes('practice') || lower.includes('quiz') || lower.includes('pyq')) return { type: 'navigate', target: 'practice' };
    if (lower.includes('resource') || lower.includes('book')) return { type: 'navigate', target: 'resources' };
    if (lower.includes('nexora')) return { type: 'navigate', target: 'nexora' };
    if (lower.includes('analytic') || lower.includes('progress') || lower.includes('track')) return { type: 'navigate', target: 'analytics' };
    if (lower.includes('setting')) return { type: 'navigate', target: 'settings' };
  }

  // Create task command
  if (lower.includes('add task:') || lower.includes('create task:') || lower.includes('schedule task:')) {
    const match = text.match(/(?:add|create|schedule) task:\s*([^\n\.]+)/i);
    if (match && match[1]) {
      return {
        type: 'create_task',
        data: { title: match[1].trim(), minutes: 45, category: 'learning' },
        requiresConfirmation: true,
        confirmationMessage: `Add objective "${match[1].trim()}" to Today's Execution Plan?`,
      };
    }
  }

  // Set reminder
  if (lower.includes('set reminder:') || lower.includes('remind me to')) {
    const match = text.match(/(?:set reminder|remind me to):\s*([^\n\.]+)/i);
    if (match && match[1]) {
      return {
        type: 'set_reminder',
        data: { reminder: match[1].trim() },
        requiresConfirmation: false,
      };
    }
  }

  // External URL browsing request
  if (lower.includes('open link:') || lower.includes('open website:')) {
    const match = text.match(/(?:open link|open website):\s*([^\s\n\)]+)/i);
    if (match && match[1]) {
      const url = match[1];
      const approved = isApprovedUrl(url);
      return {
        type: 'open_approved_url',
        target: url,
        requiresConfirmation: true,
        confirmationMessage: approved
          ? `Open verified reference link ${url} in a new tab?`
          : `Notice: ${url} is not on the default approved STEM domains list. Proceed with caution?`,
      };
    }
  }

  return null;
}
