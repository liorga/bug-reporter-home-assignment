import React from 'react';
import type { Report } from '../../types/Report';
import { StatusBadge } from '../../components/StatusBadge';
import { formatDate } from '../../utils/formatDate';
import { TABLE_COLUMNS } from './constants/index';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

interface ReportsTableProps {
  reports: Report[];
  onUpdateStatus: (reportId: string, status: 'APPROVED' | 'RESOLVED') => void;
  isUpdating: boolean;
}

const ReportRow = React.memo(function ReportRow({
  report,
  onUpdateStatus,
  isUpdating,
}: {
  report: Report;
  onUpdateStatus: (id: string, status: 'APPROVED' | 'RESOLVED') => void;
  isUpdating: boolean;
}) {
  return (
    <tr>
      <td className="cell-type">{report.issueType}</td>
      <td className="cell-description">{report.description}</td>
      <td className="cell-contact">
        <div>{report.contactName}</div>
        <div className="text-muted">{report.contactEmail}</div>
      </td>
      <td className="cell-status">
        <StatusBadge status={report.status} />
      </td>
      <td className="cell-date">{formatDate(report.createdAt)}</td>
      <td className="cell-date">
        {report.approvedAt ? formatDate(report.approvedAt) : '—'}
      </td>
      <td className="cell-attachment">
        {report.attachmentFilename ? (
          <a
            href={`${API_BASE}${report.attachmentUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="attachment-link"
            title={`Open ${report.attachmentFilename}`}
          >
            📎 {report.attachmentFilename}
          </a>
        ) : (
          '—'
        )}
      </td>
      <td className="cell-actions">
        {report.status === 'NEW' && (
          <button
            className="btn btn-sm btn-outline-primary"
            disabled={isUpdating}
            onClick={() => onUpdateStatus(report.id, 'APPROVED')}
          >
            Approve
          </button>
        )}
        {report.status === 'APPROVED' && (
          <button
            className="btn btn-sm btn-outline-success"
            disabled={isUpdating}
            onClick={() => onUpdateStatus(report.id, 'RESOLVED')}
          >
            Resolve
          </button>
        )}
        {report.status === 'RESOLVED' && (
          <span className="text-muted">Done</span>
        )}
      </td>
    </tr>
  );
});

const MobileCard = React.memo(function MobileCard({
  report,
  onUpdateStatus,
  isUpdating,
}: {
  report: Report;
  onUpdateStatus: (id: string, status: 'APPROVED' | 'RESOLVED') => void;
  isUpdating: boolean;
}) {
  return (
    <div className="report-card">
      <div className="report-card-header">
        <span className="report-card-type">{report.issueType}</span>
        <StatusBadge status={report.status} />
      </div>
      <p className="report-card-description">{report.description}</p>
      <div className="report-card-meta">
        <span>{report.contactName} ({report.contactEmail})</span>
        <span>{formatDate(report.createdAt)}</span>
      </div>
      {report.attachmentFilename && (
        <div className="report-card-attachment">
          <a
            href={`${API_BASE}${report.attachmentUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="attachment-link"
          >
            📎 {report.attachmentFilename}
          </a>
        </div>
      )}
      <div className="report-card-actions">
        {report.status === 'NEW' && (
          <button
            className="btn btn-sm btn-outline-primary"
            disabled={isUpdating}
            onClick={() => onUpdateStatus(report.id, 'APPROVED')}
          >
            Approve
          </button>
        )}
        {report.status === 'APPROVED' && (
          <button
            className="btn btn-sm btn-outline-success"
            disabled={isUpdating}
            onClick={() => onUpdateStatus(report.id, 'RESOLVED')}
          >
            Resolve
          </button>
        )}
        {report.status === 'RESOLVED' && (
          <span className="text-muted">Done</span>
        )}
      </div>
    </div>
  );
});

export function ReportsTable({ reports, onUpdateStatus, isUpdating }: ReportsTableProps) {
  return (
    <>
      <div className="table-wrapper desktop-only">
        <table className="reports-table">
          <thead>
            <tr>
              {TABLE_COLUMNS.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <ReportRow
                key={report.id}
                report={report}
                onUpdateStatus={onUpdateStatus}
                isUpdating={isUpdating}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="mobile-only">
        {reports.map((report) => (
          <MobileCard
            key={report.id}
            report={report}
            onUpdateStatus={onUpdateStatus}
            isUpdating={isUpdating}
          />
        ))}
      </div>
    </>
  );
}
