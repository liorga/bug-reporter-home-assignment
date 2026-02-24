import { z } from 'zod';
import { ISSUE_TYPES } from '../../types/Report';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from './constants/index';

export const reportSchema = z.object({
  issueType: z.enum(ISSUE_TYPES, {
    message: 'Please select an issue type',
  }),

  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters'),

  contactName: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters'),

  contactEmail: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),

  attachment: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      'File must be 5 MB or smaller',
    )
    .refine(
      (file) => !file || ACCEPTED_FILE_TYPES.includes(file.type),
      'Only PNG, JPG, and PDF files are accepted',
    ),
});

export type ReportFormValues = z.infer<typeof reportSchema>;
