export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const errCode = err.statusCode || 500;
  const errMessage = err.message || "Internal Server Error";
  res.status(errCode).json({ message: errMessage });
};
