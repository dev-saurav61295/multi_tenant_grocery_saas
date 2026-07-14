import "server-only";

import nodemailer from "nodemailer";
import type { EmailType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type SendMailOptions = {
  storeId: string;
  to: string;
  subject: string;
  html: string;
  fromName: string;
  userId?: string;
  orderId?: string;
  type: EmailType;
};

export function buildAppUrl(path: string): string {
  const base = (process.env.APP_BASE_URL ?? "").replace(/\/$/, "");

  if (!base) {
    console.error("APP_BASE_URL is not set — email links will be relative and likely broken.");
  }

  return `${base}${path}`;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !Number.isFinite(port) || !user || !pass) {
    throw new Error("SMTP config is incomplete. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD.");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

async function writeEmailLog(input: {
  storeId: string;
  userId?: string;
  orderId?: string;
  type: EmailType;
  toEmail: string;
  status: "sent" | "failed";
  error?: string;
}) {
  try {
    await prisma.emailLog.create({
      data: {
        storeId: input.storeId,
        userId: input.userId,
        orderId: input.orderId,
        type: input.type,
        toEmail: input.toEmail,
        status: input.status,
        error: input.error,
      },
    });
  } catch (error) {
    console.error("Failed to write email log", error);
  }
}

export async function sendMail(opts: SendMailOptions): Promise<void> {
  const fromAddress = process.env.SMTP_FROM_ADDRESS;

  if (!fromAddress) {
    console.error("SMTP_FROM_ADDRESS is missing.");
    await writeEmailLog({
      storeId: opts.storeId,
      userId: opts.userId,
      orderId: opts.orderId,
      type: opts.type,
      toEmail: opts.to,
      status: "failed",
      error: "SMTP_FROM_ADDRESS is missing.",
    });
    return;
  }

  try {
    await getTransporter().sendMail({
      from: `${opts.fromName} <${fromAddress}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });

    await writeEmailLog({
      storeId: opts.storeId,
      userId: opts.userId,
      orderId: opts.orderId,
      type: opts.type,
      toEmail: opts.to,
      status: "sent",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Email send failed", error);

    await writeEmailLog({
      storeId: opts.storeId,
      userId: opts.userId,
      orderId: opts.orderId,
      type: opts.type,
      toEmail: opts.to,
      status: "failed",
      error: message,
    });
  }
}
