'use strict'

var express = require('express');
const tradfri = require('../../../tradfri');
var api = express.Router();

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
