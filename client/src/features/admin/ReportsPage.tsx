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
        <h1>Admin Reports</h1>
        <TableSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page page-wide">
        <h1>Admin Reports</h1>
        <div className="alert alert-error" role="alert">
          Failed to load reports: {error?.message ?? 'Unknown error'}
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="page page-wide">
        <h1>Admin Reports</h1>
        <div className="empty-state">
          <p>No reports have been submitted yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page page-wide">
      <h1>Admin Reports</h1>
      <ReportsTable
        reports={reports}
        onUpdateStatus={handleUpdateStatus}
        isUpdating={isUpdating}
      />
    </div>
  );
}
