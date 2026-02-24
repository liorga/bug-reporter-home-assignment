import { Report, CreateReportPayload } from '../types/Report';
import type { CheckStatusResponse } from '../features/auth/models/index';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async checkStatus(email: string): Promise<CheckStatusResponse> {
    return this.request<CheckStatusResponse>('/api/check-status', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getReports(): Promise<Report[]> {
    return this.request<Report[]>('/api/reports');
  }

  async updateReportStatus(
    reportId: string,
    status: 'APPROVED' | 'RESOLVED',
  ): Promise<Report> {
    return this.request<Report>(`/api/reports/${reportId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  async createReport(payload: CreateReportPayload): Promise<Report> {
    const formData = new FormData();
    formData.append('issueType', payload.issueType);
    formData.append('description', payload.description);
    formData.append('contactName', payload.contactName);
    formData.append('contactEmail', payload.contactEmail);

    if (payload.attachment) {
      formData.append('attachment', payload.attachment);
    }

    const url = `${this.baseUrl}/api/reports`;
    const response = await fetch(url, { method: 'POST', body: formData });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
