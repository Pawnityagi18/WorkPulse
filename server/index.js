import 'dotenv/config'; // must run before any import that reads process.env at module load time
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { generalLimiter } from './middleware/rateLimiter.js';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import proposalRoutes from './routes/proposalRoutes.js';
import freelancerRoutes from './routes/freelancerRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import paymentRoutes, { handleRazorpayWebhook } from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for Render deployment
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS: Allow both Localhost and live Vercel domains seamlessly
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  'https://workpulse-force.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean).map(url => url.replace(/\/+$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin or from Vercel / localhost
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback to allow connection
    }
  },
  credentials: true
}));

app.use('/api/', generalLimiter);

// IMPORTANT: the Razorpay webhook needs the raw request body to verify the signature,
// so it must be registered BEFORE express.json() and must not be re-parsed as JSON.
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleRazorpayWebhook);

app.use(express.json());

// Serve uploaded files (avatars, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect Database
connectDB();

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'WorkPulse Full-Stack Express Server active.' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/freelancers', freelancerRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

app.listen(PORT, () => {
  console.log(`🚀 WorkPulse Full-Stack Server running at http://localhost:${PORT}`);
});