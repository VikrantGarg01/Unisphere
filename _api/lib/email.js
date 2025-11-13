import * as brevo from '@getbrevo/brevo';

export const sendOTPEmail = async (email, otp) => {
  // Development mode - log OTP to console instead of sending email
  if (!process.env.BREVO_API_KEY) {
    console.log('\n' + '='.repeat(60))
    console.log('🔐 DEVELOPMENT MODE - OTP EMAIL')
    console.log('='.repeat(60))
    console.log(`📧 To: ${email}`)
    console.log(`🔢 OTP: ${otp}`)
    console.log(`⏰ Expires in: 10 minutes`)
    console.log('='.repeat(60) + '\n')
    return { success: true, devMode: true }
  }

  // Initialize Brevo API client
  const apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

  const sendSmtpEmail = new brevo.SendSmtpEmail();
  sendSmtpEmail.subject = "Your Unisphere Verification Code";
  sendSmtpEmail.sender = { name: "Unisphere", email: "noreply.unisphere1@gmail.com" };
  sendSmtpEmail.to = [{ email: email }];
  sendSmtpEmail.htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563EB; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .otp-box { background: white; border: 2px solid #2563EB; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 8px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌐 Unisphere</h1>
        </div>
        <div class="content">
          <h2>Verify Your Email</h2>
          <p>Welcome to Unisphere! Use the following OTP to complete your registration:</p>
          <div class="otp-box">${otp}</div>
          <p><strong>This code will expire in 10 minutes.</strong></p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Unisphere. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ OTP email sent successfully to ${email} (Message ID: ${data.messageId})`);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error: error.message };
  }
}

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
