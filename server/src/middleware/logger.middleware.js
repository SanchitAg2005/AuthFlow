module.exports = (req, res, next) => {
  const start = Date.now();

  // Monitor performance and log once request is completed
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[API Request] ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | Cost: ${duration}ms | IP: ${req.ip}`
    );
  });

  next();
};
