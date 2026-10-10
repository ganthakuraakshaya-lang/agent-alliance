import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { ReportStorage } from './server/storage';
import { runAgenticFIRAnalysis, compareTwoCasesWithGemini } from './server/geminiOrchestrator';
import { FIRReport } from './src/types/fir';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Configurable credentials (with default fallback for evaluation demonstration)
const DEMO_USERNAME = process.env.DEMO_OFFICER_USERNAME || 'officer';
const DEMO_PASSWORD = process.env.DEMO_OFFICER_PASSWORD || 'investigation2026';
const SESSION_SECRET = process.env.SESSION_SECRET || 'fir-analyzer-secret-key-2026';

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser(SESSION_SECRET));

// Cryptographically signed session tokens (HMAC-SHA256)
interface SessionPayload {
  username: string;
  role: string;
  exp: number;
  createdAt: number;
}

const revokedTokens = new Set<string>();

function createSessionToken(username: string, role: string): string {
  const payload: SessionPayload = {
    username,
    role,
    createdAt: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24-hour validity
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payloadB64).digest('base64url');
  return `${payloadB64}.${signature}`;
}

function verifySessionToken(token: string): { username: string; role: string } | null {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  if (revokedTokens.has(token)) return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payloadB64).digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload: SessionPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (Date.now() > payload.exp) {
      return null;
    }
    return { username: payload.username, role: payload.role };
  } catch {
    return null;
  }
}

function getSessionFromRequest(req: Request): { username: string; role: string } | null {
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const tokenFromCookie = req.cookies?.fir_session_token || req.signedCookies?.fir_session_token;
  const token = tokenFromHeader || tokenFromCookie;

  if (!token) return null;
  return verifySessionToken(token);
}

// Authentication guard middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized. Please sign in with authorized credentials.' });
  }
  (req as unknown as { user: { username: string; role: string } }).user = session;
  next();
}

// --- AUTH API ROUTES ---

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  // Verification against environment-configured demo credentials
  const validUser = username.trim() === DEMO_USERNAME;
  const validPass = password === DEMO_PASSWORD;

  if (!validUser || !validPass) {
    return res.status(401).json({
      error: 'Invalid username or password. Authorized personnel only.',
    });
  }

  const role = 'Authorized Reviewing Officer';
  const token = createSessionToken(username.trim(), role);

  res.cookie('fir_session_token', token, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  return res.json({
    authenticated: true,
    username: username.trim(),
    role,
    token,
    loginTime: new Date().toISOString(),
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const token = (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.substring(7) : null) || req.cookies?.fir_session_token;
  if (token) {
    revokedTokens.add(token);
  }
  res.clearCookie('fir_session_token');
  return res.json({ success: true, message: 'Logged out successfully.' });
});

app.get('/api/auth/session', (req: Request, res: Response) => {
  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ authenticated: false });
  }
  return res.json({
    authenticated: true,
    username: session.username,
    role: session.role,
    loginTime: new Date().toISOString(),
  });
});

// --- FIR ANALYSIS API ROUTE ---

app.post('/api/analyze', requireAuth, async (req: Request, res: Response) => {
  try {
    const { complaintText, complaintTitle, incidentLocation, incidentDateTime } = req.body || {};
    if (!complaintText || typeof complaintText !== 'string' || !complaintText.trim()) {
      return res.status(400).json({ error: 'Complaint text is required and cannot be empty.' });
    }

    const trimmedText = complaintText.trim();
    const user = (req as unknown as { user: { username: string; role: string } }).user;
    const reviewer = user?.username || 'Authorized Police Officer';

    // Unique report reference ID
    const year = new Date().getFullYear();
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const reportId = `FIR-${year}-${randomHex}`;

    // Execute the 7-Agent AI Workflow via Google AI Studio Gemini integration
    const result = await runAgenticFIRAnalysis(
      trimmedText,
      complaintTitle?.trim(),
      incidentLocation?.trim(),
      incidentDateTime?.trim(),
      reportId,
      reviewer
    );

    const report: FIRReport = {
      id: reportId,
      complaintTitle: complaintTitle?.trim() || `Complaint Ref: ${reportId}`,
      complaintText: trimmedText, // Preserved exactly as submitted
      incidentLocation: incidentLocation?.trim(),
      incidentDateTime: incidentDateTime?.trim(),
      submittedAt: new Date().toISOString(),
      reviewer,
      analysisStatus: 'COMPLETED',
      analysisResult: result,
    };

    const saved = ReportStorage.save(report);
    if (!saved) {
      console.warn('Notice: Report kept in session response.');
    }

    return res.status(200).json(report);
  } catch (err: unknown) {
    console.error('Unhandled analysis error:', err);
    return res.status(500).json({
      error: 'An unexpected processing error occurred while analyzing complaint.',
    });
  }
});

// --- CRIME PATTERN & CASE COMPARISON ROUTE (Section 6) ---

app.post('/api/compare-cases', requireAuth, async (req: Request, res: Response) => {
  try {
    const { caseAText, caseBText } = req.body || {};
    if (!caseAText || !caseBText) {
      return res.status(400).json({ error: 'Both Case A and Case B narrative texts are required for comparative analysis.' });
    }

    const comparison = await compareTwoCasesWithGemini(caseAText.trim(), caseBText.trim());
    return res.json(comparison);
  } catch (err: unknown) {
    console.error('Case comparison error:', err);
    return res.status(500).json({ error: 'Failed to process case comparison.' });
  }
});

// --- REPORTS API ROUTES ---

app.get('/api/reports', requireAuth, (_req: Request, res: Response) => {
  try {
    const reports = ReportStorage.getAll();
    return res.json(reports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    return res.status(500).json({ error: 'Failed to retrieve saved reports.' });
  }
});

app.get('/api/reports/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = ReportStorage.getById(id);
    if (!report) {
      return res.status(404).json({ error: `Report with reference ID "${id}" was not found.` });
    }
    return res.json(report);
  } catch (err) {
    console.error('Error fetching report detail:', err);
    return res.status(500).json({ error: 'Failed to retrieve report detail.' });
  }
});

app.patch('/api/reports/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reviewStatus, officerNotes } = req.body || {};
    const updated = ReportStorage.update(id, { reviewStatus, officerNotes });
    if (!updated) {
      return res.status(404).json({ error: `Report ${id} not found.` });
    }
    return res.json(updated);
  } catch (err) {
    console.error('Error updating report:', err);
    return res.status(500).json({ error: 'Failed to update report.' });
  }
});

// --- SYSTEM STATUS ROUTE ---

app.get('/api/status', requireAuth, (_req: Request, res: Response) => {
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0 && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  return res.json({
    geminiConfigured,
    storageType: 'Application Session / In-Memory Store',
    reportsCount: ReportStorage.count(),
  });
});

// --- STATIC ASSETS & VITE MIDDLEWARE ---

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FIR ANALYZER AGENT] Server active on http://0.0.0.0:${PORT} (Mode: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
