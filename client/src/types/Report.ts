export const ISSUE_TYPES = [
  'Bug',
  'Feature Request',
  'Improvement',
  'Documentation',
  'Other',
] as const;

export type IssueType = (typeof ISSUE_TYPES)[number];

export interface Report {
  id: string;
  issueType: string;
  description: string;
  contactName: string;
  contactEmail: string;
  status: 'NEW' | 'APPROVED' | 'RESOLVED';
  createdAt: number;
  approvedAt?: number;
  attachmentUrl: string;
  attachmentFilename?: string;
}

export interface CreateReportPayload {
  issueType: string;
  description: string;
  contactName: string;
  contactEmail: string;
  attachment?: File;
}
