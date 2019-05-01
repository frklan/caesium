'use strict'

/* Helper functions for JWT authorization mostly copied from:
* https://medium.com/@patrykcieszkowski/jwt-authentication-in-express-js-ee898b87a60
**/

const jwt = require('jsonwebtoken');
const lodash = require('lodash');

module.exports.createJWToken = (details) => {
  if (typeof details !== 'object'){
    details = {}
  }

  if (!details.maxAge || typeof details.maxAge !== 'number'){
    details.maxAge = 3600
  }

  details.sessionData = lodash.reduce(details.sessionData || {}, (memo, val, key) => {
    if (typeof val !== "function" && key !== "password") {
      memo[key] = val
    }
    return memo
  }, {})

  const token = jwt.sign({
     data: details.sessionData
    }, process.env.JWT_SECRET, {
      expiresIn: details.maxAge,
      algorithm: 'HS256'
  });
  return token
}

module.exports.verifyJWT = (req, res, next) => {
  const token = req.headers.token || '';
 
  verifyJWTToken(token).then((decodedToken) => {
      req.user = decodedToken.data.user;
      req.jwtdata = decodedToken.data.data;
      next()
    })
    .catch((err) => {
      res.status(401);
      res.json({error: "You Shall Not Pass!"})
    })
}

/* Private methods */

function verifyJWTToken(token) {
  if(token === undefined){
    throw ('Not authorized');
  }
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, {ignoreNotBefore: false, ignoreExpiration: false}, (err, decodedToken) =>  {
      if (err || !decodedToken) {
        return reject(err);
      } else if(decodedToken.exp === undefined) { 
        // bug in JWT library, a token without an
        // expiration field will pass verification
        // There's an old pr for this:
        //  https://github.com/auth0/node-jsonwebtoken/pull/257
        reject("no exp");
      }
      resolve(decodedToken);
    })
  })
}