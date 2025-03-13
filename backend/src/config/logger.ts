import winston from 'winston';
import config from './config';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define transport types
interface LoggerTransports {
  console: winston.transports.ConsoleTransportInstance;
  file: winston.transports.FileTransportInstance;
}

// Create transports
const transports: LoggerTransports = {
  console: new winston.transports.Console({
    level: config.nodeEnv === 'development' ? 'debug' : 'info',
  }),
  file: new winston.transports.File({
    filename: config.logging.filePath,
    level: config.logging.level,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
};

// Create logger instance
const logger = winston.createLogger({
  level: config.nodeEnv === 'development' ? 'debug' : 'info',
  levels,
  format,
  transports: [transports.console, transports.file],
});

// Handle uncaught exceptions and unhandled rejections
logger.exceptions.handle(
  new winston.transports.File({ filename: 'logs/exceptions.log' })
);

process.on('unhandledRejection', (error: Error) => {
  logger.error('Unhandled Rejection:', error);
});

export default logger; 