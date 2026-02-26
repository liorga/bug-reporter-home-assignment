import { useCallback } from 'react';
import { useReports } from './useReports';
import { ReportsTable } from './ReportsTable';
import { TableSkeleton } from './TableSkeleton';

export function ReportsPage() {
  const { reports, isLoading, isError, error, updateStatus, isUpdating } = useReports();

  const handleUpdateStatus = useCallback(
    (reportId: string, status: 'APPROVED' | 'RESOLVED') => {
      updateStatus({ reportId, status });
    },
    [updateStatus],
  );

  if (isLoading) {
    return (
      <div className="page page-wide">
        <div className="page-header">
          <h1>Admin Reports</h1>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page page-wide">
        <div className="page-header">
          <h1>Admin Reports</h1>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <p className="empty-state-title">Failed to load reports</p>
          <p className="text-muted">{error?.message ?? 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="page page-wide">
        <div className="page-header">
          <h1>Admin Reports</h1>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p className="empty-state-title">No reports yet</p>
          <p className="text-muted">Reports will appear here once users start submitting.</p>
        </div>
      </div>
    );
  }

  const newCount = reports.filter((r) => r.status === 'NEW').length;
  const approvedCount = reports.filter((r) => r.status === 'APPROVED').length;
  const resolvedCount = reports.filter((r) => r.status === 'RESOLVED').length;

  return (
    <div className="page page-wide">
      <div className="page-header">
        <h1>Admin Reports</h1>
        <div className="report-stats">
          <span className="stat-chip stat-chip-total">{reports.length} total</span>
          {newCount > 0 && <span className="stat-chip stat-chip-new">{newCount} new</span>}
          {approvedCount > 0 && <span className="stat-chip stat-chip-approved">{approvedCount} approved</span>}
          {resolvedCount > 0 && <span className="stat-chip stat-chip-resolved">{resolvedCount} resolved</span>}
        </div>
      </div>
      <ReportsTable
        reports={reports}
        onUpdateStatus={handleUpdateStatus}
        isUpdating={isUpdating}
      />
    </div>
  );
}
