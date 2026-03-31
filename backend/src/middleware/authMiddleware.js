const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

function authMiddleware(request, response, next) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.status(401).json({ message: "Authorization token not provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    request.user = payload;
    next();
  } catch (error) {
    return response.status(401).json({ message: "Invalid or expired token." });
  }
}

module.exports = authMiddleware;