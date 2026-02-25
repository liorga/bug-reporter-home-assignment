import type { Report } from '../types/Report';

const CLASS_MAP: Record<Report['status'], string> = {
  NEW: 'badge badge-new',
  APPROVED: 'badge badge-approved',
  RESOLVED: 'badge badge-resolved',
};

export function StatusBadge({ status }: { status: Report['status'] }) {
  return <span className={CLASS_MAP[status]}>{status}</span>;
}
