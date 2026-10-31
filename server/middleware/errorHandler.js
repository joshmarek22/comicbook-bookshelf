function errorHandler(err, _req, res, _next) {
  console.error(err);
  res.status(err.statusCode || 500).json({
    error: err.statusCode ? err.message : 'Internal server error',
  });
}

export default errorHandler;
