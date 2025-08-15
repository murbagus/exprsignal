import axios from "axios";
import { Request } from "express";

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
    request: Request,
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

  private formatRequestBody(request: Request): string {
    if (!request.body && !request.file && !request.files) {
      return "No body payload available";
    }

    const formatedData: BodyRequestFormat = {
      type: request.headers["content-type"] || "Unknown",
      fields: {},
      files: [],
    };
    if (request.file) {
      formatedData.files.push({
        field_name: request.file.fieldname,
        file_name: request.file.originalname || request.file.filename,
        mimetype: request.file.mimetype,
        size: request.file.size.toString() + " bytes",
      });
    }
    if (request.files) {
      for (const [, fileValues] of Object.entries(request.files)) {
        const fileArray = Array.isArray(fileValues) ? fileValues : [fileValues];
        for (const f of fileArray as Express.Multer.File[]) {
          formatedData.files.push({
            field_name: f.fieldname,
            file_name: f.originalname || f.filename,
            mimetype: f.mimetype,
            size: f.size.toString() + " bytes",
          });
        }
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
