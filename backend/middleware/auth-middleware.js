import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        message: "Unauthorized",
        code: "NO_TOKEN"
      });
    }
    
    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
        code: "NO_TOKEN"
      });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: "Token expired",
          code: "TOKEN_EXPIRED",
          expiredAt: jwtError.expiredAt
        });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          message: "Invalid token",
          code: "INVALID_TOKEN"
        });
      }
      return res.status(401).json({
        message: "Token verification failed",
        code: "TOKEN_ERROR"
      });
    }
    
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "User not found",
        code: "USER_NOT_FOUND"
      });
    }
    
    req.user = result.rows[0];
    next();
    
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      message: "Internal server error",
      code: "SERVER_ERROR"
    });
  }
};

export default authMiddleware;