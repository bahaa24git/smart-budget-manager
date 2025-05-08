const { sql } = require('../config/db'); // Import the database connection
const bcrypt = require('bcryptjs'); // Import bcryptjs for password hashing
const { connectToDatabase } = require('../config/db');

const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { username, email, password } = req.body;

  // Ensure all fields are provided
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide username, email, and password' });
  }

  try {
    const pool = await connectToDatabase();

    // Hash the password using bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds set to 10
    console.log('Hashed Password:', hashedPassword); // Debugging step

    // Update user details in the database
    await pool.request()
      .input('userId', sql.Int, userId)
      .input('username', sql.NVarChar(100), username)
      .input('email', sql.NVarChar(100), email)
      .input('password', sql.NVarChar(100), hashedPassword)  // Use hashed password
      .query(`
        UPDATE Users
        SET Username = @username,
            Email = @email,
            PasswordHash = @password,  -- Storing hashed password
            UpdatedAt = GETDATE()
        WHERE UserID = @userId
      `);

    res.status(200).json({ message: 'User updated successfully.' });

  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  updateUser
};