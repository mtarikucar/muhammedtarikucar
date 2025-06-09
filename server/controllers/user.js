const User = require("../models/User.model");

async function getUserById(req, res, next) {
  try {
    const userId = req.params.id;

    const user = await User.find({ _id: userId });
    res.json(user);
  } catch (er) {
    console.log(er);
    console.log("get isteği hatası:", er);
    next(er);
  }
}

async function getAllUser(req, res) {
  try {
    const users = await User.find();

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
    const user = await User.findById(userId);
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
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // If non-admin user tries to change role, prevent it
    if (req.user.role !== 'admin' && updateData.role) {
      delete updateData.role;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password'); // Exclude password from response

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
    const gonnaDeletedUser = await models.user.findByPk(req.params.id);
    await gonnaDeletedUser.save({
      isActive: false,
      isDeleted: true,
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
    const gonnaDeletedUser = await models.user.findByPk(req.params.id);
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
