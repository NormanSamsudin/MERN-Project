const setSecureHeaders = (req, res, next) => {
  // Set X-XSS-Protection header to prevent reflected XSS attacks
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Set X-Content-Type-Options header to prevent MIME-sniffing attacks
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Set Strict-Transport-Security header to enforce HTTPS
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // Call the next middleware in the chain
  next();
};

module.exports = setSecureHeaders;
