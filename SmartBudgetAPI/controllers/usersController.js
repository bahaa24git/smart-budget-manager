const { sql } = require('../models/db'); // Import the database connection
const bcrypt = require('bcryptjs'); // Import bcryptjs for password hashing
const { connectToDatabase } = require('../models/db');

const updateUser = async (req, res) => {
  const userIdFromToken = req.user.UserID; // Get the UserID from the JWT token
  const userIdFromParams = req.params.id; // Get the UserID from the URL params

  // Ensure the user is updating their own data
  if (userIdFromToken !== userIdFromParams) {
    return res.status(403).json({ message: 'You are not authorized to update another user\'s details.' });
  }

  const { username, email, password } = req.body;

  // Ensure all fields are provided
  if (!username || !email) {
    return res.status(400).json({ message: 'Please provide username and email' });
  }

  try {
    const pool = await connectToDatabase();

    // Hash the password only if it's provided
    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10); // Salt rounds set to 10
      console.log('Hashed Password:', hashedPassword); // Debugging step
    }

    // Update user details in the database
    const updateQuery = `
      UPDATE Users
      SET Username = @username,
          Email = @email,
          ${hashedPassword ? 'PasswordHash = @password,' : ''} -- Update password only if it's provided
          UpdatedAt = GETDATE()
      WHERE UserID = @userId
    `;

    const request = pool.request()
      .input('userId', sql.Int, userIdFromParams)
      .input('username', sql.NVarChar(100), username)
      .input('email', sql.NVarChar(100), email);

    if (hashedPassword) {
      request.input('password', sql.NVarChar(100), hashedPassword);
    }

    await request.query(updateQuery);

    res.status(200).json({ message: 'User updated successfully.' });

  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  updateUser
};