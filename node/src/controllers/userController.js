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
    // Flatten the response structure to directly return the user data
    res.status(200).json({
        status: 'success',
        user: {
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          _id: user._id,
          __v: user.__v
        },
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  };