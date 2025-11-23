import nodemailer from 'nodemailer';

/**
 * Create email transporter based on environment configuration
 * Supports multiple email services with fallback to console logging for development
 */
export const createEmailTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER || 'intouch.buisness01@gmail.com';
  const emailPass = process.env.EMAIL_PASS || 'ikeonmpcexphpqxa';

  // Check if email credentials are properly configured
  if (!emailUser || !emailPass || emailPass === 'your-app-password-here') {
    console.error('❌ Email credentials not configured properly!');
    return null;
  }

  try {
    let transportConfig;

    switch (emailService.toLowerCase()) {
      case 'gmail':
        transportConfig = {
          service: 'gmail',
          auth: {
            user: emailUser,
            pass: emailPass
          }
        };
        break;

      case 'outlook':
      case 'hotmail':
        transportConfig = {
          service: 'hotmail',
          auth: {
            user: emailUser,
            pass: emailPass
          }
        };
        break;

      case 'yahoo':
        transportConfig = {
          service: 'yahoo',
          auth: {
            user: emailUser,
            pass: emailPass
          }
        };
        break;

      case 'smtp':
        // Custom SMTP configuration
        transportConfig = {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
          auth: {
            user: emailUser,
            pass: emailPass
          }
        };
        break;

      default:
        console.warn(`⚠️ Unknown email service: ${emailService}. Using Gmail as default.`);
        transportConfig = {
          service: 'gmail',
          auth: {
            user: emailUser,
            pass: emailPass
          }
        };
    }

    const transporter = nodemailer.createTransport(transportConfig);
    
    // Verify transporter configuration silently
    transporter.verify((error) => {
      if (error) {
        console.error('❌ Email service error:', error.message);
      } else {
        console.log('✅ Email service ready');
      }
    });

    return transporter;
  } catch (error) {
    console.error('❌ Error creating email transporter:', error);
    return null;
  }
};

/**
 * Send email with fallback to console logging
 */
export const sendEmail = async (mailOptions) => {
  const transporter = createEmailTransporter();

  if (!transporter) {
    console.error('❌ Email transporter not available');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent to:', mailOptions.to);
    return { success: true, messageId: info.messageId, mode: 'production' };
  } catch (error) {
    console.error('❌ Email failed to:', mailOptions.to, '-', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send verification email for password reset
 */
export const sendVerificationEmail = async (email, verificationCode) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'intouch.buisness01@gmail.com',
    to: email,
    subject: 'InTouch - Password Reset Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1;">InTouch</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 10px; text-align: center;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Password Reset Request</h2>
          <p style="color: #64748b; margin-bottom: 30px;">
            We received a request to reset your password. Please use the verification code below:
          </p>
          
          <div style="background: #6366f1; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0;">
            ${verificationCode}
          </div>
          
          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            This code will expire in 10 minutes for security reasons.
          </p>
          <p style="color: #64748b; font-size: 14px;">
            If you didn't request this password reset, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px;">
          <p>© 2025 InTouch. All rights reserved.</p>
        </div>
      </div>
    `
  };

  return await sendEmail(mailOptions);
};

/**
 * Send demo confirmation email to requester
 */
export const sendDemoConfirmationEmail = async (demoRequest) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'intouch.buisness01@gmail.com',
    to: demoRequest.email,
    subject: 'InTouch - Demo Request Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6;">InTouch</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 10px;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Thank You for Your Demo Request!</h2>
          
          <p style="color: #64748b; margin-bottom: 20px;">
            Hi ${demoRequest.firstName},
          </p>
          
          <p style="color: #64748b; margin-bottom: 20px;">
            We've received your request for a personalized InTouch demo. Our team will contact you within 24 hours to schedule your session.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3b82f6; margin-bottom: 15px;">Request Details:</h3>
            <p><strong>Name:</strong> ${demoRequest.firstName} ${demoRequest.lastName}</p>
            <p><strong>Company:</strong> ${demoRequest.company}</p>
            <p><strong>Job Title:</strong> ${demoRequest.jobTitle}</p>
            <p><strong>Company Size:</strong> ${demoRequest.companySize}</p>
            ${demoRequest.preferredDate ? `<p><strong>Preferred Date:</strong> ${new Date(demoRequest.preferredDate).toLocaleDateString()}</p>` : ''}
            ${demoRequest.preferredTime ? `<p><strong>Preferred Time:</strong> ${demoRequest.preferredTime}</p>` : ''}
          </div>
          
          <p style="color: #64748b; margin-bottom: 20px;">
            During your demo, you'll see:
          </p>
          
          <ul style="color: #64748b; margin-bottom: 20px;">
            <li>Real-time collaborative coding environment</li>
            <li>HD video interviewing capabilities</li>
            <li>Advanced monitoring and proctoring features</li>
            <li>Comprehensive analytics and reporting</li>
          </ul>
          
          <p style="color: #64748b; margin-bottom: 20px;">
            If you have any immediate questions, feel free to reply to this email or contact our support team.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px;">
          <p>© 2025 InTouch. All rights reserved.</p>
          <p>Revolutionizing remote technical interviews</p>
        </div>
      </div>
    `
  };

  return await sendEmail(mailOptions);
};

/**
 * Send demo notification email to InTouch team
 */
export const sendDemoNotificationEmail = async (demoRequest) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'intouch.buisness01@gmail.com',
    to: process.env.EMAIL_USER || 'intouch.buisness01@gmail.com',
    subject: 'New Demo Request - InTouch',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">🚨 New Demo Request</h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b;">Contact Information:</h3>
          <p><strong>Name:</strong> ${demoRequest.firstName} ${demoRequest.lastName}</p>
          <p><strong>Email:</strong> ${demoRequest.email}</p>
          <p><strong>Phone:</strong> ${demoRequest.phone || 'Not provided'}</p>
          
          <h3 style="color: #1e293b; margin-top: 20px;">Company Information:</h3>
          <p><strong>Company:</strong> ${demoRequest.company}</p>
          <p><strong>Job Title:</strong> ${demoRequest.jobTitle}</p>
          <p><strong>Company Size:</strong> ${demoRequest.companySize}</p>
          
          <h3 style="color: #1e293b; margin-top: 20px;">Demo Preferences:</h3>
          <p><strong>Preferred Date:</strong> ${demoRequest.preferredDate ? new Date(demoRequest.preferredDate).toLocaleDateString() : 'Not specified'}</p>
          <p><strong>Preferred Time:</strong> ${demoRequest.preferredTime || 'Not specified'}</p>
          
          ${demoRequest.specificRequirements ? `
            <h3 style="color: #1e293b; margin-top: 20px;">Specific Requirements:</h3>
            <p style="background: white; padding: 15px; border-radius: 6px;">${demoRequest.specificRequirements}</p>
          ` : ''}
          
          <p><strong>How they heard about us:</strong> ${demoRequest.hearAboutUs || 'Not specified'}</p>
          <p><strong>Request submitted:</strong> ${new Date(demoRequest.createdAt).toLocaleString()}</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #64748b;">Please contact this prospect within 24 hours.</p>
        </div>
      </div>
    `
  };

  return await sendEmail(mailOptions);
};

