// Middleware function to log incoming HTTP requests
const logger = (req, res, next) => {
  // Generate a timestamp in ISO format (e.g., 2025-07-26T12:34:56.789Z)
  const timestamp = new Date().toISOString();

  // Log the timestamp, HTTP method (GET, POST, etc.), and requested URL
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  
  // Pass control to the next middleware or route handler in the stack
  next();
};

// Exporting the logger middleware so it can be used in the Express app
export default logger;
