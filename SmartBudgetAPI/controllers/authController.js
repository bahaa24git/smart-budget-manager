const { sql } = require('../config/db'); // Import the database connection
const bcrypt = require('bcryptjs'); // Import bcryptjs for password hashing
const jwt = require('jsonwebtoken'); // Import jsonwebtoken

// Register new user
exports.register = async (req, res) => {
    const { username, email, password } = req.body; // Now email is included

    console.log("Register request body:", req.body); // Debug log

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide username, email, and password' });
    }

    try {
        const pool = await sql.connect();
        console.log("Connected to DB, inserting user..."); // Debug log

        // Hash the password using bcryptjs
        const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds set to 10

        await pool.request()
            .input('username', sql.NVarChar, username)
            .input('email', sql.NVarChar, email) // Fixed email variable
            .input('passwordHash', sql.NVarChar, hashedPassword) // Use hashed password
            .query('INSERT INTO Users (Username, Email, PasswordHash, CreatedAt, UpdatedAt) VALUES (@username, @email, @passwordHash, GETDATE(), GETDATE())');

        console.log("User inserted successfully"); // Debug log
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error); // Shows error stack
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Login user
exports.login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide both username and password' });
    }

    try {
        const pool = await sql.connect();

        // Get user from the database
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM Users WHERE Username = @username');

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = result.recordset[0]; // Get the first user (there should only be one)
        
        // Compare the plain password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.PasswordHash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user.UserID, username: user.Username }, // Payload
            process.env.JWT_SECRET, // Secret key from .env
            { expiresIn: '1h' } // Token expiration time
        );

        // Send the token in the response
        res.status(200).json({
            message: 'User logged in successfully',
            token: token
        });

    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};