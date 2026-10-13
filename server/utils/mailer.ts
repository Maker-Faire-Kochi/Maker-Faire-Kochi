/**
 * Transactional mail over Brevo's HTTP API.
 *
 * HTTP, not SMTP: Cloudflare Workers cannot open SMTP sockets, so the SMTP
 * host/port from the Brevo dashboard is unused here. Same API key; send via
 * https://api.brevo.com/v3/smtp/email.
 *
 * Unconfigured (no key or no from address) means "skip", never "throw":
 * a missing mail setup must not fail a form submission.
 */

interface MailInput {
  to: string
  subject: string
  text: string
  html: string
}

function parseFrom(raw: string): { name?: string, email: string } | null {
  const s = raw.trim()
  if (!s) return null
  const m = s.match(/^\s*(.*?)\s*<([^>]+)>\s*$/)
  if (m) {
    const email = m[2]!.trim()
    const name = m[1]!.replace(/^["']|["']$/g, '').trim()
    return email ? { name: name || undefined, email } : null
  }
  return s.includes('@') ? { email: s } : null
}

export async function sendMail(input: MailInput): Promise<boolean> {
  const config = useRuntimeConfig()
  const key = (config.brevoApiKey as string) || ''
  const from = parseFrom((config.mailFrom as string) || '')
  if (!key || !from) return false

  const reply = parseFrom((config.mailReplyTo as string) || '')

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': key,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: from.name, email: from.email },
        to: [{ email: input.to }],
        replyTo: reply ? { name: reply.name, email: reply.email } : undefined,
        subject: input.subject,
        textContent: input.text,
        htmlContent: input.html,
      }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      console.error('[mail] Brevo rejected', res.status, await res.text().catch(() => ''))
      return false
    }
    return true
  } catch (err) {
    console.error('[mail] send failed', err)
    return false
  }
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/** First word, capitalised for the greeting. */
function greetingName(full: string): string {
  const first = (full.trim().split(/\s+/)[0] || 'there').toLowerCase()
  return first.charAt(0).toUpperCase() + first.slice(1)
}

const LOGO_URL = 'https://makerfaire.in/img/logo/mf-kochi-long.png'
const SITE_URL = 'https://makerfaire.in'

export function volunteerReceivedMail(name: string) {
  const first = greetingName(name)
  const subject = 'Application received — Maker Faire Kochi Media Team'
  const text = [
    `Hello ${first},`,
    '',
    'Thank you for applying to join the Maker Faire Kochi 2027 Media Team.',
    '',
    'We have received your application. It is currently under review.',
    'We will get back to you by email or WhatsApp once we have an update.',
    '',
    'Warm regards,',
    'Maker Faire Kochi',
    SITE_URL,
  ].join('\n')

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#F7F7F7;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    We have received your application. It is currently under review.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F7F7;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #0A0A0A;">
          <!-- Cyan brand rule -->
          <tr>
            <td style="height:4px;line-height:4px;font-size:0;background:#00AEEF;">&nbsp;</td>
          </tr>
          <!-- Logo -->
          <tr>
            <td align="center" style="padding:28px 28px 20px;background:#FFFFFF;">
              <a href="${SITE_URL}" style="text-decoration:none;display:inline-block;">
                <img
                  src="${LOGO_URL}"
                  width="240"
                  height="40"
                  alt="Maker Faire Kochi"
                  style="display:block;border:0;outline:none;width:240px;max-width:100%;height:auto;"
                />
              </a>
            </td>
          </tr>
          <!-- Sheet meta -->
          <tr>
            <td style="padding:10px 28px;border-top:1px solid #0A0A0A;border-bottom:1px solid #0A0A0A;font-family:Menlo,Consolas,'Courier New',monospace;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#5A6169;background:#FAFAFA;">
              Sheet 05 &middot; Media Team &middot; Application Received
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 28px 8px;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.6;color:#0A0A0A;">
              <p style="margin:0 0 20px;">Hello ${escapeHtml(first)},</p>
              <p style="margin:0 0 20px;">
                Thank you for applying to join the <strong>Maker Faire Kochi 2027 Media Team</strong>.
              </p>
            </td>
          </tr>
          <!-- Status -->
          <tr>
            <td style="padding:0 28px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #0A0A0A;background:#FAFAFA;">
                <tr>
                  <td style="width:4px;background:#C4121A;font-size:0;line-height:0;">&nbsp;</td>
                  <td style="padding:16px 18px;font-family:Menlo,Consolas,'Courier New',monospace;">
                    <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#5A6169;">
                      Current Status
                    </p>
                    <p style="margin:0;font-size:15px;line-height:1.5;color:#0A0A0A;font-weight:700;">
                      Received &mdash; Under Review
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Close -->
          <tr>
            <td style="padding:20px 28px 32px;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.6;color:#0A0A0A;">
              <p style="margin:0 0 28px;">
                We will get back to you by email or WhatsApp once we have an update.
              </p>
              <p style="margin:0 0 4px;">Warm regards,</p>
              <p style="margin:0 0 4px;font-weight:700;font-family:Georgia,'Times New Roman',serif;">Maker Faire Kochi</p>
              <p style="margin:0;font-family:Menlo,Consolas,'Courier New',monospace;font-size:13px;">
                <a href="${SITE_URL}" style="color:#C4121A;text-decoration:underline;">makerfaire.in</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 28px;border-top:1px solid #0A0A0A;background:#0A0A0A;font-family:Menlo,Consolas,'Courier New',monospace;font-size:11px;line-height:1.55;letter-spacing:0.04em;color:#A8AEB5;">
              Kerala&rsquo;s first licensed Maker Faire<br />
              26&ndash;27 January 2027 &middot; Kochi
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0;max-width:560px;font-family:Menlo,Consolas,'Courier New',monospace;font-size:11px;line-height:1.5;color:#5A6169;">
          You are receiving this because you submitted the Media Team form at
          <a href="${SITE_URL}/volunteer" style="color:#5A6169;">makerfaire.in/volunteer</a>.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject, text, html }
}
