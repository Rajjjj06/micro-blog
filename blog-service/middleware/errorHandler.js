export const errorHandler = (err, req, res, next) => {
  const errCode = err.statusCode || 500;
  const errMessage = err.message || "Internal Server Error";

  res.status(errCode).json({
    error: {
      code: errCode,
      message: errMessage,
    },
  });
};
