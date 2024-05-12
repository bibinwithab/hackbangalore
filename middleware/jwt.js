const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }
  try {
    jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
      if (err) {
        return res.status(401).json({ message: "Access denied" });
      }
      req.user = payload;
      next();
    });
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};
module.exports = verifyToken;
