import rateLimit from 'express-rate-limit';

// Auth endpoints limit (relaxed taaki test/demo ke time block na ho)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // 20 se badha kar 150 attempts kar diya hai
  message: { success: false, message: 'Too many login attempts. Please wait a minute and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }
});

// General browsing limit (1500 requests per 15 minutes)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1500, // 300 se badha kar 1500 kar diya hai
  message: { success: false, message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }
});