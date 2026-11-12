
import type { Request, Response, NextFunction } from "express";
import type { User } from "../models/user.js";

export interface AuthenticatedRequest extends Request {
  user?: User;
}

const demoUsers: Record<string, User> = {
  "manager-token": {
    id: "manager-1",
    name: "Manager One",
    role: "MANAGER"
  },
  "director-token": {
    id: "director-1",
    name: "Director One",
    role: "DIRECTOR"
  },
  "director-token-2": {
    id: "director-2",
    name: "Director Two",
    role: "DIRECTOR"
  }
};

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required."
    });
  }

  const token = authorization.slice(7);
  const user = demoUsers[token];

  if (!user) {
    return res.status(401).json({
      message: "Invalid token."
    });
  }

  req.user = user;
  next();
}
