import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

const uploadsDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG, JPG, and PDF files are allowed'));
    }
  },
});

// Types
interface Report {
  id: string;
  issueType: string;
  description: string;
  contactName: string;
  contactEmail: string;
  status: 'NEW' | 'APPROVED' | 'RESOLVED';
  createdAt: number;
  approvedAt?: number;
  attachmentUrl: string;
  attachmentFilename?: string;
}

interface UserStatusEntry {
  email: string;
  status: 'allowed' | 'blacklisted' | 'admin';
  reason?: string;
}

// In-memory storage
const reports: Report[] = [
  {
    id: uuidv4(),
    issueType: 'Bug',
    description: 'Application crashes when clicking the submit button twice quickly',
    contactName: 'Alice Johnson',
    contactEmail: 'alice@example.com',
    status: 'NEW',
    createdAt: Date.now() - 86400000 * 3,
    attachmentUrl: '/uploads/placeholder.txt'
  },
  {
    id: uuidv4(),
    issueType: 'Feature Request',
    description: 'Add dark mode support for better accessibility',
    contactName: 'Bob Smith',
    contactEmail: 'bob@example.com',
    status: 'APPROVED',
    createdAt: Date.now() - 86400000 * 5,
    approvedAt: Date.now() - 86400000 * 2,
    attachmentUrl: '/uploads/placeholder.txt'
  },
  {
    id: uuidv4(),
    issueType: 'Bug',
    description: 'Form validation not working on mobile devices',
    contactName: 'Carol Davis',
    contactEmail: 'carol@example.com',
    status: 'RESOLVED',
    createdAt: Date.now() - 86400000 * 7,
    approvedAt: Date.now() - 86400000 * 4,
    attachmentUrl: '/uploads/placeholder.txt'
  }
];

const userStatuses: UserStatusEntry[] = [
  { email: 'admin@example.com', status: 'admin' },
  { email: 'blocked@example.com', status: 'blacklisted', reason: 'Account suspended due to policy violation' },
  { email: 'spam@test.com', status: 'blacklisted', reason: 'Multiple spam reports received' }
];

// API Routes

// GET /api/reports - Get all reports
app.get('/api/reports', (_req: Request, res: Response) => {
  res.json(reports);
});

// POST /api/reports - Create a new report (multipart/form-data)
app.post('/api/reports', upload.single('attachment'), (req: Request, res: Response) => {
  const { issueType, description, contactName, contactEmail } = req.body;

  const attachmentUrl = req.file
    ? `/uploads/${req.file.filename}`
    : '/uploads/placeholder.txt';

  const attachmentFilename = req.file?.originalname;

  const newReport: Report = {
    id: uuidv4(),
    issueType: issueType || '',
    description: description || '',
    contactName: contactName || '',
    contactEmail: contactEmail || '',
    status: 'NEW',
    createdAt: Date.now(),
    attachmentUrl,
    ...(attachmentFilename && { attachmentFilename }),
  };

  reports.push(newReport);
  res.status(201).json(newReport);
});

// POST /api/reports/:id/status - Update report status (Approve / Resolve)
app.post('/api/reports/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body as { status?: string };

  const validStatuses = ['APPROVED', 'RESOLVED'] as const;
  if (!status || !validStatuses.includes(status as typeof validStatuses[number])) {
    res.status(400).json({ error: 'Status must be APPROVED or RESOLVED' });
    return;
  }

  const report = reports.find((r) => r.id === id);
  if (!report) {
    res.status(404).json({ error: 'Report not found' });
    return;
  }

  report.status = status as Report['status'];
  if (status === 'APPROVED') {
    report.approvedAt = Date.now();
  }

  res.json(report);
});

// POST /api/check-status - Check user authentication status
app.post('/api/check-status', (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  const entry = userStatuses.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!entry) {
    res.json({ status: 'allowed' });
    return;
  }

  if (entry.status === 'blacklisted') {
    res.json({ status: 'blacklisted', reason: entry.reason });
    return;
  }

  res.json({ status: entry.status });
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Uploads served at http://localhost:${PORT}/uploads`);
});
