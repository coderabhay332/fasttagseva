import type { Env } from '../types/env';

export async function sendEmail(env: Env, to: string, subject: string, html: string): Promise<void> {
  // Using Gmail SMTP via fetch (works in Workers with app password)
  const emailBody = [
    `From: ${env.EMAIL_USER}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset=utf-8',
    '',
    html
  ].join('\r\n');
  
  // Base64 encode for Gmail API
  const encodedEmail = btoa(unescape(encodeURIComponent(emailBody)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  try {
    // Using Gmail API (requires OAuth2 or App Password)
    // For simplicity, this example uses a hypothetical email service
    // In production, use Resend, SendGrid, or AWS SES HTTP API
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.EMAIL_PASS}`, // Use Resend API key
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: env.EMAIL_USER,
        to,
        subject,
        html
      })
    });
    
    if (!response.ok) {
      throw new Error(`Email API error: ${response.status}`);
    }
    
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email send failed:', error);
    throw error;
  }
}

// Alternative: SendGrid API
export async function sendEmailSendGrid(env: Env, to: string, subject: string, html: string): Promise<void> {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.EMAIL_PASS}`, // SendGrid API key
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: env.EMAIL_USER },
      subject,
      content: [{ type: 'text/html', value: html }]
    })
  });
  
  if (!response.ok) {
    throw new Error(`SendGrid error: ${response.status}`);
  }
}
