const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
    // Get the Authorization header from the request
    const token = req.header('Authorization');

    if (!token) {
        // If the token is missing, respond with an error
        return res.status(401).json({ message: "No token provided, authorization denied." });
    }

    // Check if token starts with 'Bearer' and extract the token
    if (!token.startsWith('Bearer ')) {
        return res.status(400).json({ message: "Token format is incorrect. Expected 'Bearer <token>'." });
    }

    // Extract the actual token by removing the 'Bearer ' part
    const actualToken = token.split(' ')[1];

    try {
        // Verify the token with the secret key stored in the environment variable
        const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);

        // Attach decoded user data to the request object for use in other routes
        req.user = decoded;

        // Move to the next middleware or route handler
        next();
    } catch (error) {
        // Handle invalid or expired token
        console.error("Token verification failed:", error);
        return res.status(400).json({ message: "Invalid or expired token." });
    }
};

module.exports = verifyAdmin;
