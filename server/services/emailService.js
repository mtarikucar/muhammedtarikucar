const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Gmail SMTP configuration
      this.transporter = nodemailer.createTransporter({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER || 'your-email@gmail.com',
          pass: process.env.EMAIL_PASSWORD || 'your-app-password'
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          logger.error('Email service configuration error:', error);
          this.isConfigured = false;
        } else {
          logger.info('Email service is ready to send messages');
          this.isConfigured = true;
        }
      });

    } catch (error) {
      logger.error('Failed to initialize email transporter:', error);
      this.isConfigured = false;
    }
  }

  async sendEmail(options) {
    if (!this.isConfigured) {
      logger.warn('Email service not configured, skipping email send');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'Muhammed Tarik Ucar',
          address: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@muhammedtarikucar.com'
        },
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments || []
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info(`Email sent successfully to ${options.to}`, {
        messageId: result.messageId,
        subject: options.subject
      });

      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }
  }

  // Welcome email template
  async sendWelcomeEmail(userEmail, userName) {
    const subject = 'Hoş Geldiniz - muhammedtarikucar.com';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hoş Geldiniz</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Hoş Geldiniz!</h1>
          </div>
          <div class="content">
            <h2>Merhaba ${userName}!</h2>
            <p>muhammedtarikucar.com'a hoş geldiniz! Hesabınız başarıyla oluşturuldu.</p>
            <p>Bu platformda teknoloji, programlama ve kişisel deneyimler hakkında yazılar bulabilir, yorumlar yapabilir ve toplulukla etkileşime geçebilirsiniz.</p>
            <p>
              <a href="https://muhammedtarikucar.com" class="button">Siteyi Ziyaret Et</a>
            </p>
            <p>Herhangi bir sorunuz varsa, bize ulaşmaktan çekinmeyin.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Muhammed Tarik Ucar. Tüm hakları saklıdır.</p>
            <p>Bu e-posta muhammedtarikucar.com tarafından gönderilmiştir.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Hoş Geldiniz ${userName}!
      
      muhammedtarikucar.com'a hoş geldiniz! Hesabınız başarıyla oluşturuldu.
      
      Bu platformda teknoloji, programlama ve kişisel deneyimler hakkında yazılar bulabilir, yorumlar yapabilir ve toplulukla etkileşime geçebilirsiniz.
      
      Siteyi ziyaret etmek için: https://muhammedtarikucar.com
      
      Herhangi bir sorunuz varsa, bize ulaşmaktan çekinmeyin.
      
      © 2024 Muhammed Tarik Ucar. Tüm hakları saklıdır.
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      text,
      html
    });
  }

  // Newsletter confirmation email
  async sendNewsletterConfirmation(email, confirmationToken) {
    const confirmationUrl = `https://muhammedtarikucar.com/newsletter/confirm?token=${confirmationToken}`;
    
    const subject = 'Bülten Aboneliğinizi Onaylayın';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bülten Aboneliği Onayı</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bülten Aboneliği</h1>
          </div>
          <div class="content">
            <h2>Aboneliğinizi Onaylayın</h2>
            <p>muhammedtarikucar.com bültenine abone olmak için e-posta adresinizi onaylamanız gerekiyor.</p>
            <p>Aşağıdaki butona tıklayarak aboneliğinizi onaylayabilirsiniz:</p>
            <p>
              <a href="${confirmationUrl}" class="button">Aboneliği Onayla</a>
            </p>
            <p>Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
            <p><small>Bu link 24 saat geçerlidir.</small></p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Muhammed Tarik Ucar. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Bülten Aboneliği Onayı
      
      muhammedtarikucar.com bültenine abone olmak için e-posta adresinizi onaylamanız gerekiyor.
      
      Aboneliğinizi onaylamak için şu linke tıklayın: ${confirmationUrl}
      
      Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
      
      Bu link 24 saat geçerlidir.
      
      © 2024 Muhammed Tarik Ucar. Tüm hakları saklıdır.
    `;

    return this.sendEmail({
      to: email,
      subject,
      text,
      html
    });
  }

  // Password reset email
  async sendPasswordResetEmail(email, resetToken, userName) {
    const resetUrl = `https://muhammedtarikucar.com/reset-password?token=${resetToken}`;
    
    const subject = 'Şifre Sıfırlama Talebi';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Şifre Sıfırlama</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: #EF4444; color: white; text-decoration: none; border-radius: 5px; }
          .warning { background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Şifre Sıfırlama</h1>
          </div>
          <div class="content">
            <h2>Merhaba ${userName}!</h2>
            <p>Hesabınız için şifre sıfırlama talebinde bulundunuz.</p>
            <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
            <p>
              <a href="${resetUrl}" class="button">Şifremi Sıfırla</a>
            </p>
            <div class="warning">
              <strong>Güvenlik Uyarısı:</strong> Eğer bu talebi siz yapmadıysanız, hesabınızın güvenliği için derhal bizimle iletişime geçin.
            </div>
            <p><small>Bu link 1 saat geçerlidir.</small></p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Muhammed Tarik Ucar. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Şifre Sıfırlama Talebi
      
      Merhaba ${userName}!
      
      Hesabınız için şifre sıfırlama talebinde bulundunuz.
      
      Şifrenizi sıfırlamak için şu linke tıklayın: ${resetUrl}
      
      GÜVENLIK UYARISI: Eğer bu talebi siz yapmadıysanız, hesabınızın güvenliği için derhal bizimle iletişime geçin.
      
      Bu link 1 saat geçerlidir.
      
      © 2024 Muhammed Tarik Ucar. Tüm hakları saklıdır.
    `;

    return this.sendEmail({
      to: email,
      subject,
      text,
      html
    });
  }

  // Contact form email
  async sendContactFormEmail(formData) {
    const { name, email, subject, message } = formData;
    
    const emailSubject = `İletişim Formu: ${subject}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>İletişim Formu</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6366F1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; }
          .value { margin-top: 5px; padding: 10px; background: white; border-radius: 3px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Yeni İletişim Formu Mesajı</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Ad Soyad:</div>
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <div class="label">E-posta:</div>
              <div class="value">${email}</div>
            </div>
            <div class="field">
              <div class="label">Konu:</div>
              <div class="value">${subject}</div>
            </div>
            <div class="field">
              <div class="label">Mesaj:</div>
              <div class="value">${message}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Yeni İletişim Formu Mesajı
      
      Ad Soyad: ${name}
      E-posta: ${email}
      Konu: ${subject}
      
      Mesaj:
      ${message}
    `;

    return this.sendEmail({
      to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
      subject: emailSubject,
      text,
      html
    });
  }
}

module.exports = new EmailService();
