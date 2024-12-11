import { Request, Response, NextFunction } from 'express';
import responseTime from 'response-time';
import { logPerformance, logRequest } from '../utils/logger';

// Track memory usage
const getMemoryUsage = () => {
  const used = process.memoryUsage();
  return {
    rss: Math.round(used.rss / 1024 / 1024), // RSS in MB
    heapTotal: Math.round(used.heapTotal / 1024 / 1024), // Heap total in MB
    heapUsed: Math.round(used.heapUsed / 1024 / 1024), // Heap used in MB
    external: Math.round(used.external / 1024 / 1024), // External in MB
  };
};

// Performance monitoring middleware
export const performanceMonitoring = () => {
  return responseTime((req: Request, res: Response, time: number) => {
    const memoryUsage = getMemoryUsage();
    
    // Log request performance
    logPerformance('request_duration', time, {
      path: req.path,
      method: req.method,
      status: res.statusCode,
      memoryUsage
    });

    // Log detailed request information
    logRequest(req, res, time);

    // Add performance headers
    res.setHeader('X-Response-Time', `${time.toFixed(2)}ms`);
    res.setHeader('X-Memory-Usage', `${memoryUsage.heapUsed}MB`);
  });
};

// Request tracking middleware
export const requestTracking = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Add request ID if not present
    req.id = req.id || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Track request start time
    const startTime = process.hrtime();
    
    // Track response
    res.on('finish', () => {
      const diff = process.hrtime(startTime);
      const time = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
      
      logPerformance('response_complete', parseFloat(time), {
        requestId: req.id,
        path: req.path,
        method: req.method,
        status: res.statusCode
      });
    });

    // Add request ID header
    res.setHeader('X-Request-ID', req.id);
    next();
  };
};

// Error tracking middleware
export const errorTracking = () => {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    logPerformance('error_occurred', 0, {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      requestId: req.id
    });
    next(err);
  };
};
