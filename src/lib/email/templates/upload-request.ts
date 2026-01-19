function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

type FileMeta = {
  fileName: string;
  storagePath: string;
  fileType: string;
  fileSize?: number;
};

export type ListingMeta = {
  referenceNumber?: string | null;
  manufacturer?: string | null;
  model?: string | null;
} | null;

export type UploadRequestTemplateData = {
  requestId: string;
  contactName: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  referenceNumber?: string | null;
  files: FileMeta[];
  listing: ListingMeta;
  siteUrl: string;
  cancellationToken?: string | null;
  isAuthenticated: boolean;
};

const baseStyles = {
  container:
    "font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; padding: 24px; color: #0f172a;",
  card:
    "background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;",
  h1: "margin: 0 0 12px; font-size: 20px; color: #0f172a;",
  h2: "margin: 16px 0 8px; font-size: 16px; color: #0f172a;",
  p: "margin: 4px 0; font-size: 14px; color: #334155;",
  strong: "color: #0f172a;",
  list: "margin: 8px 0; padding-left: 16px; color: #334155;",
  button:
    "display: inline-block; padding: 10px 16px; background: #0f172a; color: #ffffff; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 12px;",
  muted: "color: #64748b; font-size: 13px;",
};

function renderFileList(files: FileMeta[]) {
  const items = files
    .map(
      (file) =>
        `<li>${escapeHtml(file.fileName)} <span style="${baseStyles.muted}">(${escapeHtml(file.fileType)})</span></li>`,
    )
    .join("");
  return `<ul style="${baseStyles.list}">${items}</ul>`;
}

function renderListing(listing: ListingMeta) {
  if (!listing) return "<p style=\"margin:4px 0;font-size:14px;color:#64748b;\">No listing matched automatically.</p>";
  const parts = [
    listing.referenceNumber
      ? `Reference: ${escapeHtml(listing.referenceNumber)}`
      : null,
    listing.manufacturer ? `Manufacturer: ${escapeHtml(listing.manufacturer)}` : null,
    listing.model ? `Model: ${escapeHtml(listing.model)}` : null,
  ].filter(Boolean);
  return `<p style="${baseStyles.p}">${parts.join(" · ")}</p>`;
}

export function renderAdminUploadRequestEmail(data: UploadRequestTemplateData) {
  const adminUrl = `${data.siteUrl.replace(/\/$/, "")}/admin/upload-requests/${data.requestId}`;
  const filesHtml = renderFileList(data.files);
  const listingHtml = renderListing(data.listing);

  const html = `
    <div style="${baseStyles.container}">
      <div style="${baseStyles.card}">
        <h1 style="${baseStyles.h1}">New Media Upload Request</h1>
        <p style="${baseStyles.p}"><strong style="${baseStyles.strong}">Request ID:</strong> ${escapeHtml(data.requestId)}</p>
        <p style="${baseStyles.p}"><strong style="${baseStyles.strong}">From:</strong> ${escapeHtml(data.contactName)} (${escapeHtml(data.email)})</p>
        ${data.phone ? `<p style="${baseStyles.p}"><strong style="${baseStyles.strong}">Phone:</strong> ${escapeHtml(data.phone)}</p>` : ""}
        ${data.referenceNumber ? `<p style="${baseStyles.p}"><strong style="${baseStyles.strong}">Reference #:</strong> ${escapeHtml(data.referenceNumber)}</p>` : ""}
        ${data.message ? `<p style="${baseStyles.p}"><strong style="${baseStyles.strong}">Message:</strong> ${escapeHtml(data.message)}</p>` : ""}

        <h2 style="${baseStyles.h2}">Listing Match</h2>
        ${listingHtml}

        <h2 style="${baseStyles.h2}">Files (${data.files.length})</h2>
        ${filesHtml}

        <a style="${baseStyles.button}" href="${adminUrl}" target="_blank" rel="noopener noreferrer">Review in Admin</a>
      </div>
    </div>
  `;

  const text = [
    `New Media Upload Request`,
    `Request ID: ${data.requestId}`,
    `From: ${data.contactName} (${data.email})`,
    data.phone ? `Phone: ${data.phone}` : null,
    data.referenceNumber ? `Reference #: ${data.referenceNumber}` : null,
    data.message ? `Message: ${data.message}` : null,
    `Files (${data.files.length}): ${data.files.map((f) => `${f.fileName} (${f.fileType})`).join(", ")}`,
    `Admin link: ${adminUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `New Media Upload Request - ${data.requestId}`,
    html,
    text,
  };
}

export function renderUserUploadRequestEmail(data: UploadRequestTemplateData) {
  const requestUrl = `${data.siteUrl.replace(/\/$/, "")}/upload-requests/${data.requestId}`;
  const cancellationUrl =
    !data.isAuthenticated && data.cancellationToken
      ? `${data.siteUrl.replace(/\/$/, "")}/upload-requests/cancel?token=${encodeURIComponent(data.cancellationToken)}`
      : null;

  const filesHtml = renderFileList(data.files);
  const listingHtml = renderListing(data.listing);

  const html = `
    <div style="${baseStyles.container}">
      <div style="${baseStyles.card}">
        <h1 style="${baseStyles.h1}">We received your upload request</h1>
        <p style="${baseStyles.p}">Request ID: <strong style="${baseStyles.strong}">${escapeHtml(data.requestId)}</strong></p>
        ${data.referenceNumber ? `<p style="${baseStyles.p}">Reference #: ${escapeHtml(data.referenceNumber)}</p>` : ""}
        <h2 style="${baseStyles.h2}">Files (${data.files.length})</h2>
        ${filesHtml}
        <h2 style="${baseStyles.h2}">Listing Match</h2>
        ${listingHtml}
        <a style="${baseStyles.button}" href="${requestUrl}" target="_blank" rel="noopener noreferrer">View your request</a>
        ${
          cancellationUrl
            ? `<p style="${baseStyles.p}">Need to cancel? <a href="${cancellationUrl}" style="color:#0f172a;font-weight:600;">Cancel this request</a></p>`
            : ""
        }
      </div>
    </div>
  `;

  const text = [
    `We received your upload request`,
    `Request ID: ${data.requestId}`,
    data.referenceNumber ? `Reference #: ${data.referenceNumber}` : null,
    `Files (${data.files.length}): ${data.files.map((f) => `${f.fileName} (${f.fileType})`).join(", ")}`,
    `View: ${requestUrl}`,
    cancellationUrl ? `Cancel: ${cancellationUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `Upload Request Received - ${data.requestId}`,
    html,
    text,
  };
}

