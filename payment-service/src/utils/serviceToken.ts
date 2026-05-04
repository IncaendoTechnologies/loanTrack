import jwt from "jsonwebtoken";

const INTERNAL_SECRET = process.env.INTERNAL_JWT_SECRET!;

export const generateServiceToken = () => {
  return jwt.sign(
    {
      service: "loantrack",
      aud: "payment-service",
    },
    INTERNAL_SECRET,
    {
      expiresIn: "5m",
    }
  );
};