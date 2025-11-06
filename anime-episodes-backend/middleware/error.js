function notFound(req, res, next) {
  res.status(404).json({ success:false, message:'Route not found' });
}

function errorHandler(err, req, res, next) {
  console.error('💥', err);
  const status = err.status || 500;
  res.status(status).json({
    success:false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

module.exports = { notFound, errorHandler };
