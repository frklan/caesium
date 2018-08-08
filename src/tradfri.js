'use strict'
const { Accessory, AccessoryTypes, discoverGateway, TradfriClient, TradfriError, TradfriErrorCodes } = require("node-tradfri-client");

let id = {identity: '', psk: ''};
let tfClient = {};
let gw = {};
let gwStatus = {status: 'offline'};
var lightbulbs = [];

const password = process.env.GW_PASSWORD;

function logger(msg, sev) {
  if(sev != 'silly'){
    console.log(`${sev} - ${msg}`);
  }
}

async function init() {
  try {
    gw = await discoverGateway(2000);
    if(gw === null) {
      throw new Error('can\'t find gateway');
    }

    const connectionWatcherOptions = {
      pingInterval: 1000, // DEFAULT: 10000ms
      failedPingCountUntilOffline: 2, // DEFAULT: 1
      failedPingBackoffFactor: 1, // DEFAULT: 1.5
      reconnectionEnabled: true, // DEFAULT: enabled
      offlinePingCountUntilReconnect: 3, // DEFAULT: 3
      maximumReconnects: 3, // DEFAULT: infinite
      maximumConnectionAttempts: 3, // DEFAULT: infinite
      connectionInterval: 1000, // DEFAULT: 10000ms
      failedConnectionBackoffFactor: 1, // DEFAULT: 1.5
    }
    const tradfriOptions = {
      //customLogger: logger,
      watchConnection: connectionWatcherOptions,
    }

    const tradfri = new TradfriClient(gw.addresses[0], tradfriOptions);
    id = await tradfri.authenticate(password);

    await tradfri.connect(id.identity, id.psk);

    tradfri.on("error", onError);
    tradfri.on('connection lost', onConnectionLost);
    tradfri.on('connection failed', onConnectionFailed);
    tradfri.on('give up', onGiveUp);
    tradfri.on('connection alive', onConnectionAlive);
    
    tradfri.on('device updated', onDeviceUpdated)
    tradfri.on('device removed', onDeviceRemoved)
    
    tradfri.observeDevices();
    
    gwStatus = {status: 'online'};

  } catch(e) {
    console.error('-----> ' + e + '\n' + new Error().stack);
    process.exit();
  }
}

function onError(e) {
  console.error('Error:');

  if (e instanceof TradfriError) {
    // handle the error depending on `e.code`
  } else {
      // handle the error as you normally would.
  }
}

function onConnectionLost() {
  console.log('onConnectionLost');
  gwStatus = {status: 'offline'};
}

function onConnectionFailed(connectionAttempt, maximumAttempts){
  console.log('onConnectionFailed');
  lightbulbs = [];
  gwStatus = {status: 'offline'};
}

function onGiveUp() {
  console.log('onGiveUp');
  lightbulbs = [];
  gwStatus = {status: 'offline'};
}

function onConnectionAlive() {
  console.log('onConnectionAlive');
  gwStatus = {status: 'online'};
}

function onDeviceUpdated(device) {
  console.log('onDeviceUpdated:');
  if(device.type === 2) { // we have a light bulb.
    console.log(`Light bulb:\n\tname: ${device.name}`)
    const index = lightbulbs.findIndex((bulb) => bulb.instanceId == device.instanceId);
    console.log(`we have this bulb at index ${index}`);
    if( index== -1) { // we currently don't know this bulb..
      lightbulbs.push(device);
    } else { // already known, replace.
      lightbulbs.splice(index, 1, device);
    }
  } 
}

function onDeviceRemoved(instanceId) {
  const index = lightbulbs.findIndex((bulb) => bulb.instanceId == instanceId);
  if(index != -1) {
    console.log(`Removing bulb at index ${index}`);
    lightbulbs.splice(index, 1);
  }
}

// Init module:
init();

/* ****************************************** */
/* Here's the public interface to the module: */
/* ****************************************** */

/**
 * Returns a list with the current bulbs 
 */
function getBulbs() {
  //Filter out only lighbulbs, return as new array including only specific properties
  return lightbulbs.filter((device) => device.type === 2)
    .map(bulb => {
      return {
        name: bulb.name,
        id: bulb.instanceId,
        light: bulb.lightList[0] 
      };
    });

}


function getBulb(id) {
  return getBulbs().filter(device => device.id === id);
}

/**
 * Turn on or off a specific bulb
 * 
 * @param {*} id id of bulb to operate
 * @param {*} state indicates if we want the bulb to turn on or off
 */
function setBulbOnOff(id, state) {
  const bulb = lightbulbs.filter((device) => device.instanceId === id)[0];
  //console.log(bulb);
  if(bulb === undefined)
    throw new Error('no bulb');

  if(state === 'on')
    bulb.lightList[0].turnOn();
  else if(state === 'off')
    bulb.lightList[0].turnOff();
  else 
    throw new Error('unkown state');
}

function toggleBulb(id) {
  const bulb = lightbulbs.filter((device) => device.instanceId === id)[0];
  //console.log(bulb);
  if(bulb === undefined)
    throw new Error('no bulb');

  bulb.lightList[0].toggle();
}

module.exports.toggleBulb = toggleBulb;
module.exports.getBulb = getBulb;
module.exports.getBulbs = getBulbs;
module.exports.setBulbOnOff = setBulbOnOff;
