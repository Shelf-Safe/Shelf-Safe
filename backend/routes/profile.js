import express from 'express';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import multer from 'multer';
import { put } from '@vercel/blob';
import { sendEmail } from '../utils/sendEmail.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported image type'));
    }
  },
});

function makeBlobPath(prefix, originalName = 'avatar.jpg') {
  const safeName = String(originalName || 'avatar.jpg').replace(/[^a-zA-Z0-9._-]/g, '-');
  return `${prefix}/${Date.now()}-${safeName}`;
}

async function uploadAvatar(file) {
  if (!file?.buffer) return '';

  const token = process.env.BLOB_READ_WRITE_TOKEN;

  // local/dev fallback if blob token is missing
  if (!token) {
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  }

  const blob = await put(makeBlobPath('avatars', file.originalname), file.buffer, {
    access: 'public',
    token,
    contentType: file.mimetype || 'image/jpeg',
    addRandomSuffix: false,
  });

  return blob?.url || '';
}

router.post('/request-password-reset', async (req, res) => {
  try {
    const { resetContact } = req.body;

    const trimmedResetContact = resetContact?.trim();

    if (!trimmedResetContact) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number is required',
      });
    }

    const user = await User.findOne({
      $or: [
        { email: trimmedResetContact.toLowerCase() },
        { phone: trimmedResetContact },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email or phone number',
      });
    }

    if (!user.email) {
      return res.status(400).json({
        success: false,
        message: 'This account does not have a valid email address for reset',
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: 'ShelfSafe Password Reset',
      html: `
    <p>Hello ${user.name || 'User'},</p>
    <p>You requested a password reset for your ShelfSafe account.</p>
    <p>Click the link below to reset your password:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>This link will expire in 1 hour.</p>
  `,
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset link sent successfully',
    });
  } catch (error) {
    console.error('Request password reset error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send reset link',
    });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        userRole: user.userRole,
        pharmacyOrganization: user.pharmacyOrganization,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        notifications: user.notifications,
        twoFactorEnabled: user.twoFactorEnabled,
        recentActivity: user.recentActivity?.slice(-10) || [],
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
    });
  }
});

router.put('/', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    const {
      name,
      employeeId,
      userRole,
      phone,
      pharmacyOrganization,
      notifications,
      password,
      twoFactorEnabled,
      avatarUrl,
    } = req.body;

    let parsedNotifications = notifications;
    if (typeof notifications === 'string') {
      try {
        parsedNotifications = JSON.parse(notifications);
      } catch {
        parsedNotifications = undefined;
      }
    }

    const parsedTwoFactorEnabled =
      typeof twoFactorEnabled === 'string'
        ? twoFactorEnabled === 'true'
        : twoFactorEnabled;

    const updateFields = {};

    if (name !== undefined) updateFields.name = name.trim();
    if (employeeId !== undefined) updateFields.employeeId = employeeId.trim();
    if (userRole !== undefined) updateFields.userRole = userRole.trim();
    if (phone !== undefined) updateFields.phone = phone.trim();

    if (pharmacyOrganization !== undefined) {
      updateFields.pharmacyOrganization = pharmacyOrganization.trim();
    }

    if (parsedNotifications !== undefined) {
      updateFields.notifications = parsedNotifications;
    }

    if (parsedTwoFactorEnabled !== undefined) {
      updateFields.twoFactorEnabled = parsedTwoFactorEnabled;
    }

    if (password !== undefined && password.trim() !== '') {
      updateFields.password = await bcryptjs.hash(password.trim(), 10);
    }

    if (req.file) {
      updateFields.avatarUrl = await uploadAvatar(req.file);
    } else if (avatarUrl !== undefined) {
      updateFields.avatarUrl = String(avatarUrl).trim();
    }

    const activityEntries = [];
    const activityTimestamp = new Date();

    if (name !== undefined) {
      activityEntries.push({
        action: 'Updated full name',
        timestamp: activityTimestamp,
      });
    }

    if (phone !== undefined) {
      activityEntries.push({
        action: 'Updated phone number',
        timestamp: activityTimestamp,
      });
    }

    if (employeeId !== undefined) {
      activityEntries.push({
        action: 'Updated employee ID',
        timestamp: activityTimestamp,
      });
    }

    if (userRole !== undefined) {
      activityEntries.push({
        action: 'Updated user role',
        timestamp: activityTimestamp,
      });
    }

    if (pharmacyOrganization !== undefined) {
      activityEntries.push({
        action: 'Updated pharmacy organization',
        timestamp: activityTimestamp,
      });
    }

    if (password !== undefined && password.trim() !== '') {
      activityEntries.push({
        action: 'Changed password',
        timestamp: activityTimestamp,
      });
    }

    if (parsedNotifications !== undefined) {
      activityEntries.push({
        action: parsedNotifications?.emailEnabled
          ? 'Enabled email notifications'
          : 'Disabled email notifications',
        timestamp: activityTimestamp,
      });
    }

    if (parsedTwoFactorEnabled !== undefined) {
      activityEntries.push({
        action: parsedTwoFactorEnabled
          ? 'Enabled two-factor authentication'
          : 'Disabled two-factor authentication',
        timestamp: activityTimestamp,
      });
    }

    if (req.file || avatarUrl !== undefined) {
      activityEntries.push({
        action: 'Updated profile photo',
        timestamp: activityTimestamp,
      });
    }

    const updateOperation = {
      $set: updateFields,
    };

    if (activityEntries.length > 0) {
      updateOperation.$push = {
        recentActivity: {
          $each: activityEntries,
        },
      };
    }

    const updateResult = await User.updateOne(
      { _id: req.user.userId },
      updateOperation
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const updatedUser = await User.findById(req.user.userId).lean();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        employeeId: updatedUser.employeeId,
        userRole: updatedUser.userRole,
        pharmacyOrganization: updatedUser.pharmacyOrganization,
        phone: updatedUser.phone,
        avatarUrl: updatedUser.avatarUrl,
        notifications: updatedUser.notifications,
        twoFactorEnabled: updatedUser.twoFactorEnabled,
        recentActivity: updatedUser.recentActivity?.slice(-10) || [],
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
});

export default router;