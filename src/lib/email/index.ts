import { Resend } from "resend";

import { env } from "@/env";
import {
  renderAdminUploadRequestEmail,
  renderUserUploadRequestEmail,
  type UploadRequestTemplateData,
} from "./templates/upload-request";

type SendResult =
  | { ok: true }
  | { ok: false; reason: string; error?: unknown };

function getResendClient() {
  if (!env.RESEND_API_KEY) return null;
  return new Resend(env.RESEND_API_KEY);
}

function requireFrom(): string | null {
  return env.RESEND_FROM ?? null;
}

async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}): Promise<SendResult> {
  const resend = getResendClient();
  const from = requireFrom();

  if (!resend || !from) {
    return {
      ok: false,
      reason: "Missing Resend configuration (RESEND_API_KEY or RESEND_FROM).",
    };
  }

  try {
    await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: "Resend send failed", error };
  }
}

export async function sendUploadRequestEmails(
  data: UploadRequestTemplateData & {
    adminEmails?: string[] | null;
  },
) {
  const fallbackAdminEmail = env.ADMIN_NOTIFICATION_EMAIL ?? null;
  const adminEmails =
    data.adminEmails && data.adminEmails.length > 0
      ? data.adminEmails
      : fallbackAdminEmail
        ? [fallbackAdminEmail]
        : [];
  const siteUrl = data.siteUrl ?? env.SITE_URL ?? "";

  const baseData: UploadRequestTemplateData = { ...data, siteUrl };

  const results: SendResult[] = [];

  if (adminEmails.length > 0) {
    const adminEmailContent = renderAdminUploadRequestEmail(baseData);
    results.push(
      await sendEmail({
        to: adminEmails,
        subject: adminEmailContent.subject,
        html: adminEmailContent.html,
        text: adminEmailContent.text,
      }),
    );
  }

  const userEmailContent = renderUserUploadRequestEmail(baseData);
  results.push(
    await sendEmail({
      to: data.email,
      subject: userEmailContent.subject,
      html: userEmailContent.html,
      text: userEmailContent.text,
    }),
  );

  return results;
}

export async function sendUploadRequestStatusEmail(opts: {
  requestId: string;
  email: string;
  status: "APPROVED" | "REJECTED";
  notes?: string | null;
}) {
  const siteUrl = env.SITE_URL ?? "";
  const resend = getResendClient();
  const from = requireFrom();

  if (!resend || !from) {
    return {
      ok: false,
      reason: "Missing Resend configuration (RESEND_API_KEY or RESEND_FROM).",
    };
  }

  const statusLabel =
    opts.status === "APPROVED" ? "approved" : "rejected";
  const detailsUrl = `${siteUrl.replace(/\/$/, "")}/upload-requests/${opts.requestId}`;
  const subject = `Your upload request was ${statusLabel} - ${opts.requestId}`;
  const body = [
    `Your upload request (${opts.requestId}) was ${statusLabel}.`,
    opts.notes ? `Notes: ${opts.notes}` : null,
    `View details: ${detailsUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await resend.emails.send({
      from,
      to: opts.email,
      subject,
      text: body,
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: "Resend send failed", error };
  }
}

