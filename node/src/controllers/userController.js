import User from '../models/userModel.js';






// Controller to get the logged-in user's profile
export const getProfile = async (req, res) => {
  try {
    // The user ID is already available in req.user, thanks to the protect middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }