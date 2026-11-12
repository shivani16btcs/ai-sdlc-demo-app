
import { Router } from "express";

const router = Router();

const demoUsers = [
  {
    id: "manager-1",
    name: "Manager One",
    role: "MANAGER",
    username: "manager"
  },
  {
    id: "director-1",
    name: "Director One",
    role: "DIRECTOR",
    username: "director"
  },
  {
    id: "director-2",
    name: "Director Two",
    role: "DIRECTOR",
    username: "director2"
  }
];

const demoCredentials: Record<string, string> = {
  manager: "manager123",
  director: "director123",
  director2: "director123"
};

const demoTokens: Record<string, string> = {
  manager: "manager-token",
  director: "director-token",
  director2: "director-token-2"
};

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    demoCredentials[username] !== password
  ) {
    return res.status(401).json({
      message: "Invalid username or password."
    });
  }

  const user = demoUsers.find((item) => item.username === username);

  if (!user) {
    return res.status(401).json({
      message: "Invalid username or password."
    });
  }

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      role: user.role
    },
    token: demoTokens[username]
  });
});

export default router;
