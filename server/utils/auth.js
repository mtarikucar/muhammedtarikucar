const checkPasswordStrength = (req, res, next) => {
    const { password } = req.body;
  
    // Password strength criteria (you can customize these as needed)
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isLongEnough = password.length >= 6;
  
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSymbols || !isLongEnough) {
      return res.status(400).json({
        status: "error",
        message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol.",
      });
    }
  
    next();
  }
  
module.exports ={
  checkPasswordStrength
}