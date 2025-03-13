const checkAuth = (req, res, next) => {
  if (!req?.user) {
    return res.status(400).json({ message: "You are not authorized." });
  }
  next();
};

export { checkAuth };
