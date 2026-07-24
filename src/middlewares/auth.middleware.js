import verifyToken from "../utils/verifyToken.js";

export const authenticate = (req, res, next) => {
  try {
    console.log("=== AUTH START ===");
    const authHeader = req.headers.authorization;
    console.log("Authorization:", authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No Authorization Header");
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    console.log("Decoded Token:", decoded);
    req.user = decoded;
    console.log("=== AUTH SUCCESS ===");
    next();
  } catch (error) {
    console.error("JWT VERIFY ERROR:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }
    next();
  };
};
