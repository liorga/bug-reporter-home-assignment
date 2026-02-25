import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import type { Report } from '../../types/Report';
import { QUERY_KEYS } from './constants/index';

export function useReports() {
  const queryClient = useQueryClient();

  const reportsQuery = useQuery<Report[]>({
    queryKey: QUERY_KEYS.REPORTS,
    queryFn: () => apiClient.getReports(),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      reportId,
      status,
    }: {
      reportId: string;
      status: 'APPROVED' | 'RESOLVED';
    }) => apiClient.updateReportStatus(reportId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REPORTS });
    },
  });

  return {
    reports: reportsQuery.data ?? [],
    isLoading: reportsQuery.isLoading,
    isError: reportsQuery.isError,
    error: reportsQuery.error,
    updateStatus: statusMutation.mutate,
    isUpdating: statusMutation.isPending,
  };
}
