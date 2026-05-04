import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const INTERNAL_SECRET = process.env.INTERNAL_JWT_SECRET!;

export interface ServiceRequest extends Request {
  service?: {
    name: string;
  };
}

export const requireServiceAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, INTERNAL_SECRET) as any;

    if (!decoded.service || !decoded.aud) {
      return res.status(403).json({ error: "Invalid service token" });
    }

    if (decoded.service !== "loantrack") {
      return res.status(403).json({ error: "Unauthorized service" });
    }

    if (decoded.aud !== "payment-service") {
      return res.status(403).json({ error: "Invalid audience" });
    }
    (req as ServiceRequest).service = {
      name: decoded.service,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired service token",
    });
  }
};