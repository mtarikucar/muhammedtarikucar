const JWT = require('jsonwebtoken');


module.exports.verifyToken = (req, res, next) => {
  const authorization = req.get('Authorization');
  console.log(authorization,'sdvadbvadfbsdfffffffffffffffffffffffff');
  !authorization && res.status(400).json({ message: 'Not authenticated!' });
  
  const token = authorization.split(' ')[1];
  
  let payload;
  try {
    /* Returns the payload if the signature is valid.
    If not, it will throw the error. */
    payload = JWT.verify(token, process.env.JWT_SECRET);
    console.log("asdasdas",payload);
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
    if (req.user.id === req.params.id || (req.user.role == "member")) {
      next();
    } else {
      res.status(403).json('You are not allowed to do that!');
    }
  });
};

module.exports.verifyIsAdmin = (req, res, next) => {
  this.verifyToken(req, res, () => {
    console.log(req.params);
    if (req.user.id === req.params.id || req.user.role == "admin" ) {
      next();
    } else {
      res.status(403).json('You are not allowed to do that!');
    }
  });
};
