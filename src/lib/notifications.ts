import { FIRM_INFO } from "@/data/firm";

interface NotifyNewAppointmentPayload {
  inquiryId: string;
  fullName: string;
  phone: string;
  whatsappNumber: string;
  email?: string | null;
  clientType: string;
  serviceCategory: string;
  consultationType: string;
  preferredDate: string;
  preferredTime: string;
  description: string;
  leadSource: string;
  utmCampaign?: string | null;
}

/**
 * Sends an email notification to the chamber admin when RESEND_API_KEY is configured.
 * Always fails gracefully so email outages never block saving a client lead.
 */
export async function sendAdminEmailNotification(
  payload: NotifyNewAppointmentPayload
): Promise<{ sent: boolean; provider: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || FIRM_INFO.email;
  const fromEmail =
    process.env.EMAIL_FROM || "TaxVat LawAid Desk <onboarding@resend.dev>";

  if (!apiKey) {
    return { sent: false, provider: "database_notification_only" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [adminEmail],
        subject: `[TaxVat LawAid] New Pending Appointment ${payload.inquiryId} — ${payload.fullName}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #1B1E59; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
            <div style="background: #2B2E7E; color: #ffffff; padding: 20px 24px;">
              <h2 style="margin: 0; font-size: 18px;">New Appointment Request (Pending Approval)</h2>
              <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">Inquiry ID: <strong>${payload.inquiryId}</strong></p>
            </div>
            <div style="padding: 20px 24px; font-size: 14px; line-height: 1.6; color: #1E293B;">
              <p><strong>Client:</strong> ${escapeHtml(payload.fullName)} (${escapeHtml(payload.clientType)})</p>
              <p><strong>Phone:</strong> ${escapeHtml(payload.phone)} | <strong>WhatsApp:</strong> ${escapeHtml(payload.whatsappNumber)}</p>
              ${payload.email ? `<p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>` : ""}
              <p><strong>Service Category:</strong> ${escapeHtml(payload.serviceCategory)}</p>
              <p><strong>Consultation Mode:</strong> ${escapeHtml(payload.consultationType)}</p>
              <p><strong>Preferred Slot:</strong> ${escapeHtml(payload.preferredDate)} at ${escapeHtml(payload.preferredTime)} (Asia/Dhaka)</p>
              <p><strong>Lead Source:</strong> ${escapeHtml(payload.leadSource)}${payload.utmCampaign ? ` / Campaign: ${escapeHtml(payload.utmCampaign)}` : ""}</p>
              <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 16px 0;" />
              <p><strong>Brief Description:</strong></p>
              <p style="background: #F8F9FC; padding: 12px; border-radius: 6px;">${escapeHtml(payload.description)}</p>
              <p style="margin-top: 20px; font-size: 13px; color: #475569;">
                Log in to your secure <strong>/admin</strong> dashboard to review, confirm, or reject this request.
              </p>
            </div>
          </div>
        `,
      }),
    });

    return { sent: res.ok, provider: "resend" };
  } catch {
    return { sent: false, provider: "resend_error" };
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
