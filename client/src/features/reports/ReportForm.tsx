import { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import html2canvas from 'html2canvas';
import { reportSchema, type ReportFormValues } from './reportSchema';
import { apiClient } from '../../api/client';
import { ISSUE_TYPES, type Report } from '../../types/Report';

export function ReportForm() {
  const [submitResult, setSubmitResult] = useState<
    { kind: 'success'; report: Report } | { kind: 'error'; message: string } | null
  >(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      issueType: undefined,
      description: '',
      contactName: '',
      contactEmail: '',
      attachment: undefined,
    },
  });

  const selectedFile = watch('attachment');

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setValue('attachment', file, { shouldValidate: true });
  };

  const clearFile = () => {
    setValue('attachment', undefined, { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const captureScreenshot = useCallback(async () => {
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        scale: window.devicePixelRatio,
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png'),
      );

      if (!blob) throw new Error('Failed to create screenshot');

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const file = new File([blob], `screenshot-${timestamp}.png`, {
        type: 'image/png',
      });

      setValue('attachment', file, { shouldValidate: true });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setSubmitResult({
        kind: 'error',
        message: 'Screenshot capture failed. Try uploading a file instead.',
      });
    } finally {
      setIsCapturing(false);
    }
  }, [setValue]);

  const onSubmit = async (data: ReportFormValues) => {
    setSubmitResult(null);

    try {
      const report = await apiClient.createReport({
        issueType: data.issueType,
        description: data.description,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        attachment: data.attachment,
      });

      setSubmitResult({ kind: 'success', report });
      reset();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setSubmitResult({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Failed to submit report',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form" noValidate>
      <div className="form-group">
        <label htmlFor="issueType">Issue Type</label>
        <select id="issueType" {...register('issueType')} defaultValue="">
          <option value="" disabled>Select an issue type…</option>
          {ISSUE_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {errors.issueType && (
          <span className="field-error" role="alert">{errors.issueType.message}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          rows={5}
          placeholder="Describe the issue in detail…"
          {...register('description')}
        />
        {errors.description && (
          <span className="field-error" role="alert">{errors.description.message}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="contactName">Your Name</label>
        <input id="contactName" type="text" placeholder="Jane Doe" {...register('contactName')} />
        {errors.contactName && (
          <span className="field-error" role="alert">{errors.contactName.message}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="contactEmail">Your Email</label>
        <input id="contactEmail" type="email" placeholder="jane@example.com" {...register('contactEmail')} />
        {errors.contactEmail && (
          <span className="field-error" role="alert">{errors.contactEmail.message}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="attachment">Attachment (optional)</label>
        <div className="attachment-actions">
          <input
            id="attachment"
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={onFileChange}
          />
          <button
            type="button"
            className="btn btn-sm btn-secondary btn-capture"
            onClick={captureScreenshot}
            disabled={isCapturing}
          >
            {isCapturing ? 'Capturing…' : '📸 Capture Screenshot'}
          </button>
        </div>
        <span className="form-hint">Upload a file (PNG, JPG, PDF — max 5 MB) or capture a screenshot</span>

        {selectedFile && (
          <div className="file-preview">
            <span className="file-preview-name">{selectedFile.name}</span>
            <span className="file-preview-size">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
            <button type="button" className="file-preview-remove" onClick={clearFile}>Remove</button>
          </div>
        )}

        {errors.attachment && (
          <span className="field-error" role="alert">{errors.attachment.message}</span>
        )}
      </div>

      {submitResult?.kind === 'success' && (
        <div className="alert alert-success" role="status">
          Report submitted! ID: <strong>{submitResult.report.id}</strong>, Status: <strong>{submitResult.report.status}</strong>
        </div>
      )}

      {submitResult?.kind === 'error' && (
        <div className="alert alert-error" role="alert">{submitResult.message}</div>
      )}

      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting…' : 'Submit Report'}
      </button>
    </form>
  );
}
