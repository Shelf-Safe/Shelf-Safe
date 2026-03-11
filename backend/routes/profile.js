import express from 'express';
import bcryptjs from 'bcryptjs';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

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
        recentActivity: user.recentActivity.slice(-10),
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


router.put('/', verifyToken, async (req, res) => {
  try {
    const { name, employeeId, userRole, phone, pharmacyOrganization, notifications, password, twoFactorEnabled } = req.body;

    const updateFields = {};

    if (name !== undefined) updateFields.name = name.trim();
    if (employeeId !== undefined) updateFields.employeeId = employeeId.trim();
    if (userRole !== undefined) updateFields.userRole = userRole.trim();
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (pharmacyOrganization !== undefined) {
      updateFields.pharmacyOrganization = pharmacyOrganization.trim();
    }

    if (notifications !== undefined) {
      updateFields.notifications = notifications;
    }

    if (twoFactorEnabled !== undefined) {
      updateFields.twoFactorEnabled = twoFactorEnabled;
    }

    if (password !== undefined && password.trim() !== '') {
      updateFields.password = await bcryptjs.hash(password.trim(), 10);
    }

    const updateResult = await User.updateOne(
      { _id: req.user.userId },
      {
        $set: updateFields,
        $push: {
          recentActivity: {
            action: 'Updated profile details',
            timestamp: new Date(),
          },
        },
      }
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