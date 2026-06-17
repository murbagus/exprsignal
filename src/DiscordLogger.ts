import axios from "axios";

export interface LoggerFile {
  fieldname: string;
  originalname?: string;
  filename?: string;
  mimetype: string;
  size: number;
}

export interface LoggerRequest {
  method?: string;
  url?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
  file?: LoggerFile;
  files?: LoggerFile[] | Record<string, LoggerFile[]>;
}

interface FileInfo {
  field_name: string;
  file_name: string;
  mimetype: string;
  size: string;
}

interface BodyRequestFormat {
  type: string;
  fields: unknown;
  files: FileInfo[];
}

export class DiscordLogger {
  constructor(private readonly webhookUrl: string) {}

  async send(
    request: LoggerRequest,
    title: string,
    message: string,
    color: number,
    stackTrace?: string
  ): Promise<void> {
    try {
      const formatedRequestBody = this.formatRequestBody(request);

      await axios.post(this.webhookUrl, {
        embeds: [
          {
            title: title,
            color: color,
            description: this.truncateText(message, 4090),
            timestamp: new Date().toISOString(),
            fields: [
              {
                name: "🔗 URL",
                value:
                  "```" +
                  `${request.method || "Unknown"} | ${
                    request.url || "Unknown"
                  }` +
                  "```",
                inline: false,
              },
            ],
          },
          {
            title: "📝 Stack Trace",
            description: stackTrace
              ? this.truncateText("```" + stackTrace + "```", 4090)
              : "```No stack trace available```",
            color: color,
          },
          {
            title: "📦 Body Payload",
            description:
              "```" + this.truncateText(formatedRequestBody, 4090) + "```",
            color: color,
          },
        ],
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to send error to Discord:", errorMessage);
    }
  }

  private formatRequestBody(request: LoggerRequest): string {
    if (!request.body && !request.file && !request.files) {
      return "No body payload available";
    }

    const contentType = request.headers?.["content-type"];
    const formatedData: BodyRequestFormat = {
      type: Array.isArray(contentType) ? contentType[0] : contentType || "Unknown",
      fields: {},
      files: [],
    };
    if (request.file) {
      formatedData.files.push({
        field_name: request.file.fieldname,
        file_name: request.file.originalname || request.file.filename || "Unknown",
        mimetype: request.file.mimetype,
        size: request.file.size.toString() + " bytes",
      });
    }
    if (request.files) {
      const filesArray = Array.isArray(request.files)
        ? request.files
        : Object.values(request.files).flat();
      for (const f of filesArray) {
        formatedData.files.push({
          field_name: f.fieldname,
          file_name: f.originalname || f.filename || "Unknown",
          mimetype: f.mimetype,
          size: f.size.toString() + " bytes",
        });
      }
    }

    formatedData.fields = request.body as Record<string, any>;

    return JSON.stringify(formatedData, null, 2);
  }

  private truncateText(text: string, maxLength: number): string {
    if (!text) return "N/A";

    if (text.length <= maxLength) {
      return text;
    }

    return text.substring(0, maxLength - 3) + "...";
  }
}
