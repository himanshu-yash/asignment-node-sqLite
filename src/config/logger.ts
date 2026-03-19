import { createLogger, format, transports } from "winston";

const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`)
);

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), logFormat),
    }),
    new transports.File({ filename: "logs/error.log", level: "error", format: logFormat }),
    new transports.File({ filename: "logs/combined.log", format: logFormat }),
  ],
});

export default logger;
