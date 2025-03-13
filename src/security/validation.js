const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // Check length
  if (password.length < 12) return false;

  // Check for uppercase
  if (!/[A-Z]/.test(password)) return false;

  // Check for lowercase
  if (!/[a-z]/.test(password)) return false;

  // Check for numbers
  if (!/[0-9]/.test(password)) return false;

  // Check for special characters
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;

  return true;
};

module.exports = {
  validateEmail,
  validatePassword
}; 