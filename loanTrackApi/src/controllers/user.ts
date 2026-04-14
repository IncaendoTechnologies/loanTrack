import { Request, Response } from "express";
import { getRandomLoanLimit } from "../helpers/user";
import * as userService from "../services/user";
import { User, UserInput } from "../models/user";
import { AuthenticatedRequest } from "../middleware/auth";

const hasRequiredFields = (payload: Partial<UserInput>): payload is UserInput => {
  return Boolean(
    payload.id &&
      payload.owner &&
      payload.email &&
      payload.phoneNumber &&
      payload.firstName &&
      payload.lastName
  );
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const payload = req.body as Partial<UserInput>;
    const authenticatedSub = (req as AuthenticatedRequest).auth?.sub;
    if (!authenticatedSub) {
      return res.status(401).json({ error: "Unauthorized user" });
    }

    if (!hasRequiredFields(payload)) {
      return res.status(400).json({
        error:
          "Missing required fields: id, owner, email, phoneNumber, firstName, lastName",
      });
    }
    if (payload.id !== authenticatedSub || payload.owner !== authenticatedSub) {
      return res
        .status(403)
        .json({ error: "id/owner must match authenticated Cognito user" });
    }

    const now = new Date().toISOString();
    const user: User = {
      ...payload,
      loanLimit: payload.loanLimit ?? getRandomLoanLimit(),
      createdAt: now,
      updatedAt: now,
    };

    const result = await userService.createUser(user);
    return res.status(201).json(result);
  } catch (error) {
    const err = error as { code?: string; message?: string };
    if (err.code === "ConditionalCheckFailedException") {
      return res.status(409).json({ error: "User already exists" });
    }
    return res.status(500).json({
      error: "Error creating user",
      details: err.message,
      code: err.code,
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const authenticatedSub = (req as AuthenticatedRequest).auth?.sub;
    if (!authenticatedSub) {
      return res.status(401).json({ error: "Unauthorized user" });
    }
    if (id !== authenticatedSub) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const user = await userService.getUserById(id);

    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (error) {
    const err = error as { code?: string; message?: string };
    return res.status(500).json({
      error: "Error fetching user",
      details: err.message,
      code: err.code,
    });
  }
};

export const updateUserById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const payload = req.body as Partial<UserInput>;
    const authenticatedSub = (req as AuthenticatedRequest).auth?.sub;
    if (!authenticatedSub) {
      return res.status(401).json({ error: "Unauthorized user" });
    }
    if (id !== authenticatedSub) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (!hasRequiredFields(payload)) {
      return res.status(400).json({
        error:
          "Missing required fields: id, owner, email, phoneNumber, firstName, lastName",
      });
    }

    if (payload.id !== id) {
      return res
        .status(400)
        .json({ error: "Path id and payload id must be the same" });
    }
    if (payload.owner !== authenticatedSub) {
      return res
        .status(403)
        .json({ error: "owner must match authenticated Cognito user" });
    }

    const user = await userService.updateUserById(id, {
      owner: payload.owner,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      firstName: payload.firstName,
      lastName: payload.lastName,
      loanLimit: payload.loanLimit,
      updatedAt: new Date().toISOString(),
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (error) {
    const err = error as { code?: string; message?: string };
    return res.status(500).json({
      error: "Error updating user",
      details: err.message,
      code: err.code,
    });
  }
};
