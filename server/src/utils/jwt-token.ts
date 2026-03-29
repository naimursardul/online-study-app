import jwt from "jsonwebtoken";

export const createJWT = (user: any) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );
};
