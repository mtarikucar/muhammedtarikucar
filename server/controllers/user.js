const User = require("../models/User.model");

async function getUserById(req, res, next) {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (er) {
    console.log(er);
    console.log("get isteği hatası:", er);
    next(er);
  }
}

async function getAllUser(req, res, next) {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (er) {
    console.log(er);
    console.log("get isteği hatası:", er);
    next(er);
  }
}

async function updateUserById(req, res, next) {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: "User not found!",
      });
    }

    // Check if user is updating their own profile or is admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: "You can only update your own profile!",
      });
    }

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.password;
    delete updateData.role; // Only admin can change roles
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // If non-admin user tries to change role, prevent it
    if (req.user.role !== 'admin' && updateData.role) {
      delete updateData.role;
    }

    // Update user
    await user.update(updateData);
    
    // Get updated user without password
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      status: 'success',
      message: "User updated successfully!",
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function deleteUser(req, res) {
  try {
    const gonnaDeletedUser = await User.findByPk(req.params.id);
    if (!gonnaDeletedUser) {
      return res.status(404).json({ message: "User not found!" });
    }
    await gonnaDeletedUser.update({
      isActive: false,
    });
    res.status(200).json({
      message: "User is deleted successfully!",
    });
  } catch (error) {
    res.status(500).json(error);
  }
}

async function deleteUserPermanent(req, res) {
  try {
    const gonnaDeletedUser = await User.findByPk(req.params.id);
    if (!gonnaDeletedUser) {
      return res.status(404).json({ message: "User not found!" });
    }
    await gonnaDeletedUser.destroy();
    res.status(200).json({
      message: "User is deleted successfully as permanently!",
    });
  } catch (error) {
    res.status(500).json(error);
  }
}

module.exports = {
  getUserById,
  getAllUser,
  updateUserById,
  deleteUser,
  deleteUserPermanent,
};
