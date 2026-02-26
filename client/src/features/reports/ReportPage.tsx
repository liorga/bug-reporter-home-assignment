import { ReportForm } from './ReportForm';

export function ReportPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Report a Bug</h1>
        <p className="page-subtitle">Help us improve by describing the issue you encountered.</p>
      </div>
      <ReportForm />
    </div>
  );
}
