'use strict'

const express = require('express');
const router = express.Router();
const twoFactor = require('node-2fa');
const createJWToken = require('../lib/jwt').createJWToken;

router.post('/', (req, res) => {
  const id = req.headers.id; // <-- this is our user, currently must be set to 'caesium_api_user'
  const otp = req.headers.otp; // <-- this is our one-time-key

  /* Here we should check password in a database.. */
  if(id === undefined || otp === undefined ) {
    res.status(401);
    res.json({ message: "Access Denied. Id and/or otp is incorrect." });
    return;
  } else {
       
    // verify key from user:
    if(!twoFactor.verifyToken(getIdOtpSecret(id), otp)) {
      res.status(401).json({ error: "Access Denied." });
      return;
    } else {
      
    res.status(200);
    res.json({
        success: true,
        token: createJWToken({ sessionData: {user: id, data: "hej hopp"}, maxAge: 3600 })
      });
    }
  }
})

module.exports = router;

/**
 * Retreive the secret used to generate/verify the OTP. 
 * 
 * TODO: add a db for more users..
 * @param {*} user 
 */
function getIdOtpSecret(id) {
  if(id != 'caesium_api_user') {
    throw 'Unkown user';
  }
  return process.env.OTP_SECRET;
}