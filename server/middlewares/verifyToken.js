const JWT = require('jsonwebtoken');


module.exports.verifyToken = (req, res, next) => {
  const authorization = req.get('Authorization');
  
  !authorization && res.status(400).json({ message: 'Not authenticated!' });
  
  const token = authorization.split(' ')[1];
  
  let payload;
  try {
    /* Returns the payload if the signature is valid.
    If not, it will throw the error. */
    payload = JWT.verify(token, process.env.JWT_SECRET);

  } catch (error) {
    res.status(500).json({
      msg:"token decoder error",
      error
    });
  }
  req.user = payload;
  
  next();
};

module.exports.verifyTokenAndAuth = (req, res, next) => {
  this.verifyToken(req, res, () => {
    //console.log(req.params.id === req.params.id);
    if (req.user.id === req.params.id || (req.user.role == "dc6f8d6a-c14d-4b6e-8646-aa5a5d5c5f5e")) {
      next();
    } else {
      res.status(403).json('You are not allowed to do that!');
    }
  });
};

module.exports.verifyIsAdmin = (req, res, next) => {
  this.verifyToken(req, res, () => {
    console.log(req.params);
    if (req.user.id === req.params.id || (req.user.role == "dc6f8d6a-c14d-4b6e-8646-aa5a5d5c5f5e" || req.user.role == "38f8c336-7df6-4c6e-a0a2-41c7077fb879")) {
      next();
    } else {
      res.status(403).json('You are not allowed to do that!');
    }
  });
};
