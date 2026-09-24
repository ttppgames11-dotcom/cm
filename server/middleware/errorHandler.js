export function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV === 'development';
  console.error(`[ERROR ${req.id || ''}] ${req.method} ${req.originalUrl}:`, err.message || err);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 && !isDev 
      ? 'सर्व्हर अंतर्गत सुरक्षा त्रुटी. कृपया थोड्या वेळाने प्रयत्न करा. (Internal Server Error)' 
      : (err.message || 'सर्व्हर त्रुटी'),
    code: err.code || 'SERVER_ERROR',
    requestId: req.id || undefined
  });
}

export default errorHandler;
