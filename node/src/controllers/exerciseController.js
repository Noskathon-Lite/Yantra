// controllers/exerciseController.js
import Exercise from '../models/exerciseModel.js'; // Adjust the path as necessary
import User from '../models/userModel.js'; // Adjust the path as necessary

// Function to save exercises
export const saveExercises = async (req, res) => {
  const { exercises, injuryType, injuryDuration, injurySeverity, additionalDetails } = req.body;
  const userId = req.user.id;

  try {
    // Find the user by their ID to make sure the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }