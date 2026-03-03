import express from 'express';
import bcryptjs from 'bcryptjs';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({
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
        recentActivity: user.recentActivity.slice(-10).reverse(),
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/', verifyToken, async (req, res) => {
  try {
    const {
      name, email, phone, employeeId, userRole, pharmacyOrganization, avatarUrl,
    } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (employeeId !== undefined) user.employeeId = employeeId;
    if (userRole !== undefined) user.userRole = userRole;
    if (pharmacyOrganization !== undefined) user.pharmacyOrganization = pharmacyOrganization;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    user.recentActivity.push({ action: 'Updated profile details', timestamp: new Date() });
    if (user.recentActivity.length > 20) user.recentActivity.shift();

    await user.save();
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



router.put('/notifications', verifyToken, async (req, res) => {
  try {
    const { phoneEnabled, phoneNumber, emailEnabled, emailAddress } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.notifications = {
      phoneEnabled: !!phoneEnabled,
      phoneNumber: phoneNumber || '',
      emailEnabled: !!emailEnabled,
      emailAddress: emailAddress || user.email,
    };
    user.recentActivity.push({ action: 'Updated notification preferences', timestamp: new Date() });
    if (user.recentActivity.length > 20) user.recentActivity.shift();

    await user.save();
    res.json({ success: true, message: 'Notification preferences saved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


router.put('/security', verifyToken, async (req, res) => {
  try {
    const { password, confirmPassword, twoFactorEnabled } = req.body;
    const user = await User.findById(req.user.userId).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (password) {
      if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match' });
      }
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      }
      user.password = password; 
      user.recentActivity.push({ action: 'Changed password and Email', timestamp: new Date() });
    }

    if (twoFactorEnabled !== undefined) {
      user.twoFactorEnabled = twoFactorEnabled;
      if (twoFactorEnabled) {
        user.recentActivity.push({ action: 'Enabled two-factor authentication', timestamp: new Date() });
      }
    }
    if (user.recentActivity.length > 20) user.recentActivity.shift();

    await user.save();
    res.json({ success: true, message: 'Security settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


router.post('/reset-link', async (req, res) => {
  try {
    const { contact } = req.body;
    if (!contact) return res.status(400).json({ success: false, message: 'Email or phone required' });
    res.json({ success: true, message: 'Reset link sent if the account exists' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
