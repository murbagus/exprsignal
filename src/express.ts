import { Request } from "express";
import { LoggerFile, LoggerRequest } from "./DiscordLogger.js";

function mapMulterFile(file: Express.Multer.File): LoggerFile {
  return {
    fieldname: file.fieldname,
    originalname: file.originalname,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
  };
}

export function toLoggerRequest(request: Request): LoggerRequest {
  return {
    method: request.method,
    url: request.url,
    headers: request.headers as Record<string, string | string[] | undefined>,
    body: request.body,
    file: request.file ? mapMulterFile(request.file) : undefined,
    files: request.files
      ? Array.isArray(request.files)
        ? request.files.map(mapMulterFile)
        : Object.fromEntries(
            Object.entries(request.files).map(([key, files]) => [
              key,
              files.map(mapMulterFile),
            ])
          )
      : undefined,
  };
}
