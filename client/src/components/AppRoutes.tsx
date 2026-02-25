import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, LoginPage } from '../features/auth';
import { ReportPage } from '../features/reports';
import { ReportsPage } from '../features/admin';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/report"
        element={
          <ProtectedRoute>
            <ReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute requiredStatus="admin">
            <ReportsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
