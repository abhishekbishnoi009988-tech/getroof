import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import { connectDatabase } from './config/database';
import passport from './config/passport';

// Connect to database
connectDatabase();

// Route files
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import brokerRoutes from './routes/broker.routes';
import propertyRoutes from './routes/property.routes';
import paymentRoutes from './routes/payment.routes';
import buyerInterestRoutes from './routes/buyerInterest.routes';
import brokerNotificationRoutes from './routes/brokerNotification.routes';
import withdrawalRoutes from './routes/withdrawal.routes';

const app = express();

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Enable CORS
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'https://getroof.in', 'https://www.getroof.in', 'https://69a309cde837540df3af31ba--getroof.netlify.app', 'https://getroof.netlify.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Dev logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security headers
app.use(helmet());

// Sanitize data
app.use(mongoSanitize());

// Rate limiting (ONLY in production)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later',
});

if (process.env.NODE_ENV === 'production') {
  app.use('/api/', limiter);
}

// Prevent http param pollution
app.use(hpp());

// Initialize Passport
app.use(passport.initialize());

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/brokers', brokerRoutes);
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/buyer-interests', buyerInterestRoutes);
app.use('/api/v1/broker-notifications', brokerNotificationRoutes);
app.use('/api/v1/withdrawals', withdrawalRoutes);

// Backward compatibility
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/brokers', brokerRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/buyer-interests', buyerInterestRoutes);
app.use('/api/broker-notifications', brokerNotificationRoutes);
app.use('/api/withdrawals', withdrawalRoutes);

// Health check
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Root route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'GETROOF API', version: '1.0.0' });
});

// Handle 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  if (err.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid ID format' });
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ success: false, message: `${field} already exists` });
  }
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║           🏠 GETROOF API Server Running 🏠            ║
║  Environment: ${process.env.NODE_ENV || 'development'}                              ║
║  Port: ${PORT}                                          ║
╚════════════════════════════════════════════════════════╝
  `);
});

process.on('unhandledRejection', (err: Error) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

export default app;