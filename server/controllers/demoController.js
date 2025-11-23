import DemoRequest from '../models/DemoRequest.js';
import { sendDemoConfirmationEmail, sendDemoNotificationEmail } from '../utils/emailService.js';

// Create a new demo request
export const createDemoRequest = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      company,
      jobTitle,
      companySize,
      phone,
      preferredDate,
      preferredTime,
      specificRequirements,
      hearAboutUs
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !company || !jobTitle || !companySize) {
      return res.status(400).json({
        message: 'Please fill in all required fields'
      });
    }

    // Check if email already has a recent demo request (within last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingRequest = await DemoRequest.findOne({
      email: email.toLowerCase(),
      status: 'pending',
      createdAt: { $gte: oneDayAgo }
    });

    if (existingRequest) {
      return res.status(409).json({
        message: 'You already submitted a demo request today. Our team will contact you within 24 hours. If urgent, please email us directly at intouch.buisness01@gmail.com',
        existingRequestId: existingRequest._id,
        submittedAt: existingRequest.createdAt
      });
    }

    // Create new demo request
    const demoRequest = new DemoRequest({
      firstName,
      lastName,
      email: email.toLowerCase(),
      company,
      jobTitle,
      companySize,
      phone,
      preferredDate: preferredDate ? new Date(preferredDate) : null,
      preferredTime,
      specificRequirements,
      hearAboutUs
    });

    await demoRequest.save();

    // Send confirmation email to requester
    const confirmationResult = await sendDemoConfirmationEmail(demoRequest);
    
    // Send notification email to InTouch team
    const notificationResult = await sendDemoNotificationEmail(demoRequest);

    console.log(`✅ Demo request created for ${email}`);

    res.status(201).json({
      message: 'Demo request submitted successfully! We will contact you within 24 hours.',
      success: true,
      requestId: demoRequest._id
    });

  } catch (error) {
    console.error('Demo request creation error:', error);
    res.status(500).json({
      message: 'Failed to submit demo request. Please try again.',
      error: error.message
    });
  }
};

// Get all demo requests (for admin)
export const getDemoRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const demoRequests = await DemoRequest.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DemoRequest.countDocuments(filter);

    res.json({
      demoRequests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get demo requests error:', error);
    res.status(500).json({
      message: 'Failed to fetch demo requests',
      error: error.message
    });
  }
};

// Update demo request status
export const updateDemoRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'contacted', 'scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid status value'
      });
    }

    const demoRequest = await DemoRequest.findByIdAndUpdate(
      id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!demoRequest) {
      return res.status(404).json({
        message: 'Demo request not found'
      });
    }

    res.json({
      message: 'Demo request status updated successfully',
      demoRequest
    });

  } catch (error) {
    console.error('Update demo request status error:', error);
    res.status(500).json({
      message: 'Failed to update demo request status',
      error: error.message
    });
  }
};