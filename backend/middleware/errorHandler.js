export function errorHandler(err, req, res, next) {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'सर्व्हर अंतर्गत त्रुटी (Internal Server Error)',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

export default errorHandler;
