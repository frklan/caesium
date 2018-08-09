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
      throw new Error('Can\'t find gateway');
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
    console.error(`Unhandled error: ${e}\nExiting`);
    process.exit();
  }
}

function onError(e) {
  console.error('Error:');

  /* TODO; do proper error handling.. */
  // if (e instanceof TradfriError) {
  //   // handle the error depending on `e.code`
  // } else {
  //     // handle the error as you normally would.
  // }
}

function onConnectionLost() {
  gwStatus = {status: 'offline'};
}

function onConnectionFailed(connectionAttempt, maximumAttempts){
  lightbulbs = [];
  gwStatus = {status: 'offline'};
}

function onGiveUp() {
  lightbulbs = [];
  gwStatus = {status: 'offline'};
}

function onConnectionAlive() {
  gwStatus = {status: 'online'};
}

function onDeviceUpdated(device) {
  if(device.type === 2) { // we have a light bulb.
    const index = lightbulbs.findIndex((bulb) => bulb.instanceId == device.instanceId);
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

function getGatewayStatusAsJson() {
  return {
    status: gwStatus.status || '',
    name: gw.name || '',
    host: gw.host || '',
  };
}

function convertBulbListToApiResponse(bulbList) {
  const bulbStatus = bulbList.map(bulb => {
    return {
      name: bulb.name,
      id: bulb.instanceId,
      lastSeen: bulb.lastSeen,
      light: {
        onOff: bulb.lightList[0].onOff || false,
        dimmer: bulb.lightList[0].dimmer || 0,
        color: bulb.lightList[0].color || "0",
        colorTemperature: bulb.lightList[0].colorTemperature || 0,
        colorX: bulb.lightList[0].colorX || 0,
        colorY: bulb.lightList[0].colorY || 0,
        transitionTime: bulb.lightList[0].transitionTime || 0
      },  
    };
  });

  return {
    gateway: getGatewayStatusAsJson(),
    lightbulbs: bulbStatus,
  };
}

/* ****************************************** */
/* Here's the public interface to the module: */
/* ****************************************** */

/**
 * Returns a list with the current bulbs 
 */
function getBulbs() {
  //Filter out only lighbulbs, return as new array including only specific properties
  return convertBulbListToApiResponse(lightbulbs.filter((device) => device.type === 2));
    
}


function getBulb(id) {
  return convertBulbListToApiResponse(lightbulbs.filter(device => (device.type === 2 && device.instanceId == id)));
}

/**
 * Turn on or off a specific bulb
 * 
 * @param {*} id id of bulb to operate
 * @param {*} state indicates if we want the bulb to turn on or off
 */
function setBulbOnOff(id, state) {
  if(gwStatus.status != 'online') {
    throw 'gateway offline';
  }

  const bulb = lightbulbs.filter((device) => device.instanceId === id)[0];
  if(bulb === undefined) {
    throw 'no such bulb';
  }


  if(state === 'on') {
    bulb.lightList[0].turnOn();
  } else if(state === 'off') {
    bulb.lightList[0].turnOff();
  } else {
    throw 'unkown state';
  }

  return {
    gateway: getGatewayStatusAsJson(),
    status: 'done',
  }
}

function toggleBulb(id) {
  if(gwStatus.status != 'online') {
    throw 'gateway offline';
  }

  const bulb = lightbulbs.filter((device) => device.instanceId === id)[0];
  if(bulb === undefined) {
    throw 'no such bulb';
  }

  
  bulb.lightList[0].toggle();
  return {
    gateway: getGatewayStatusAsJson(),
    status: 'done',
  }
}

module.exports.toggleBulb = toggleBulb;
module.exports.getBulb = getBulb;
module.exports.getBulbs = getBulbs;
module.exports.setBulbOnOff = setBulbOnOff;
