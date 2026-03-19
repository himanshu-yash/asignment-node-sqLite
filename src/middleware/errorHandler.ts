import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import logger from "../config/logger";

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof AppError) {
    logger.warn(`${err.name}: ${err.message}`);
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({ success: false, message: "Internal server error" });
};
