// utils/sendEmail.js - Updated with email templates
const nodemailer = require('nodemailer');

// Email templates
const emailTemplates = {
  accountCreated: (context) => ({
    subject: 'Your Account Has Been Created',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Our Platform!</h2>
        <p>Hello ${context.name},</p>
        <p>Your account has been successfully created.</p>
        <p><strong>Account Details:</strong></p>
        <ul>
          <li>Email: ${context.email}</li>
          <li>Username: ${context.username || context.email}</li>
        </ul>
        ${context.tempPassword ? `
          <p><strong>Temporary Password:</strong> ${context.tempPassword}</p>
          <p>Please login and change your password immediately.</p>
        ` : ''}
        <p>Best regards,<br>The Platform Team</p>
      </div>
    `
  }),
  
  roleUpdated: (context) => ({
    subject: 'Account Role Updated',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Account Update Notification</h2>
        <p>Hello ${context.name},</p>
        <p>Your account role has been updated to <strong>${context.newRole}</strong>.</p>
        <p>You now have additional permissions on our platform.</p>
        <p>Best regards,<br>The Platform Team</p>
      </div>
    `
  }),
  
  bulkEmail: (context) => ({
    subject: context.subject || 'Important Announcement',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${context.subject || 'Important Announcement'}</h2>
        <p>Hello ${context.name},</p>
        <div>${context.message || ''}</div>
        <p>Best regards,<br>The Platform Team</p>
      </div>
    `
  })
};

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // If template is provided, use template
  let emailSubject = options.subject;
  let emailHtml = options.html;
  
  if (options.template && emailTemplates[options.template]) {
    const templateData = emailTemplates[options.template](options.context || {});
    emailSubject = templateData.subject;
    emailHtml = templateData.html;
  }

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.to || options.email, // Support both 'to' and 'email' properties
    subject: emailSubject,
    html: emailHtml,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Email sent:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
      to: message.to
    };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Export both sendEmail and emailTemplates
module.exports = {
  sendEmail,
  emailTemplates
};