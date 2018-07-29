'use strict'

var express = require('express');
const tradfri = require('../../../tradfri');
const verifyJWT = require('../../../lib/jwt.js').verifyJWT;

var api = express.Router();

// CORS settings on all request methods.
api.all('*', (req, res, next) => {
  console.log(req.method);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,OPTIONS");
  res.header("Access-Control-Allow-Headers", "token, content-type");
  next();
});

// Do auth cgeck only on GET and PUT, i.e. not on OPTIONS,
// chrome runtime (e.g. node/electron) needs OPTIONS to be 
// open and we can't set custom headers on those requests..
api.get('*', verifyJWT);
api.put('*', verifyJWT);

api.get('/', function(req, res, next) {
  res.json({ error: 'Hello! Nothing to see here..' });
});

api.get('/bulbs', (req, res, next) => {
  try {
    res.json(tradfri.getBulbs());
    res.status(200);
  } catch(e) {
    res.state(500);
    res.json({error: 'error occured'});
    console.log(e);
  }
});

api.get('/bulb/:id', (req, res, next) => {
  const id = parseInt(req.params.id);
    
  try {
    res.json(tradfri.getBulb(id));
    res.status(200);
  } catch(e) {
    if(e === 'no bulb') {
      res.status(404);
      res.json({error: 'no bulb here'});
      next();
    }
    else {
      res.status(500);
      res.json({error: 'internal server error'});
      next();
    }
  }
});

api.put('/bulb/:id/toggle', (req, res, next) => {
  const id = parseInt(req.params.id);

  try {
    tradfri.toggleBulb(id);
    res.json({status: 'done'});
  } catch(e) {
    if(e === 'no bulb') {
      res.status(404);
      res.json({error: 'no bulb here'});
      next();
    }
    else {
      res.status(500);
      res.json({error: 'internal server error'});
      next();
    }
  }

  res.end();
});

api.put('/bulb/:id/:state', (req, res, next) => {
  const id = parseInt(req.params.id);
  const state = req.params.state;

  try {
    tradfri.setBulbOnOff(id, state);
    res.json({status: 'done'});
  } catch(e) {
    if(e === 'no bulb') {
      res.status(404);
      res.json({error: 'no bulb here'});
      next();
    }
    else {
      res.status(500);
      res.json({error: 'internal server error'});
      next();
    }
  }
  res.end();
});

module.exports = api;
