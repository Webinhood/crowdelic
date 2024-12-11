import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

const logDir = process.env.LOG_DIR || 'logs';
const env = process.env.NODE_ENV || 'development';

// Formato simplificado de log
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, error, ...meta } = info;
    
    // Log de erro com stack trace
    if (error) {
      return `${timestamp} ${level}: ${message} | Error: ${error.message} | Stack: ${error.stack}`;
    }
    
    // Log de objeto - extrair apenas dados essenciais
    if (typeof message === 'object') {
      const { id, type, status, error: objError } = message;
      const essentialData = { id, type, status, error: objError };
      return `${timestamp} ${level}: ${JSON.stringify(essentialData)}`;
    }
    
    // Log simples com metadados mínimos
    const relevantMeta = Object.entries(meta)
      .filter(([key]) => ['id', 'type', 'status'].includes(key))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      
    return Object.keys(relevantMeta).length
      ? `${timestamp} ${level}: ${message} | ${JSON.stringify(relevantMeta)}`
      : `${timestamp} ${level}: ${message}`;
  })
);

// Configuração do logger
const logger = winston.createLogger({
  level: env === 'development' ? 'debug' : 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'crowdelic-backend',
    env
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    new winston.transports.DailyRotateFile({
      dirname: logDir,
      filename: 'backend-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat
    })
  ]
});

// Interface simplificada do logger
const enhancedLogger = {
  debug: (message: any) => logger.debug(message),
  info: (message: any) => logger.info(message),
  warn: (message: any) => logger.warn(message),
  error: (message: any, error?: Error) => {
    if (error) {
      logger.error({ message, error });
    } else {
      logger.error(message);
    }
  }
};

// Funções auxiliares simplificadas
const createLogger = (component: string) => {
  return {
    ...enhancedLogger,
    defaultMeta: { component }
  };
};

const logRequest = (req: any, res: any, duration: number) => {
  const { method, url, ip } = req;
  logger.info({
    type: 'request',
    method,
    url,
    ip,
    status: res.statusCode,
    duration: `${duration}ms`
  });
};

const logPerformance = (operation: string, duration: number) => {
  logger.info({
    type: 'performance',
    operation,
    duration: `${duration}ms`
  });
};

export { createLogger, logRequest, logPerformance };
export default enhancedLogger;
