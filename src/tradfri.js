'use strict'
var fs = require('fs');
const tradfriLib = require("node-tradfri-client");
const TradfriClient = tradfriLib.TradfriClient;
const discoverGateway = tradfriLib.discoverGateway;

let id = {identity: '', psk: ''};
let tfClient = '';
let gw = '';
let t;

const lightbulbs = [];

function init() {

 discoverGateway()
  .then((g) => {
    if(!g)
      Promise.reject(`Gateway not found (${gw}`);

    gw = g;
    console.log('gateway is: ' + JSON.stringify(gw));
  }, error)
  .then(authenticate, error )
  .then(connectToGw, error)
  .then(subscribeGw, error)
  //.then(() => t.clearInterval() )
  .catch((e) => console.log('error in promise ' + e))

}

function error(e) {
  console.trace(`we have an error: ${e.stack}`);
  process.exit();
}
  
function authenticate() {
  return new Promise(function(resolve, reject) {
    const password = process.env.GW_PASSWORD; 

    console.log('autenticating..' + password);
    tfClient = new TradfriClient(gw.host, {watchConnection: true});
    
    tfClient.authenticate(password)
    .then((i) => { 
      id = i;
      console.log('authenticated, id = ' + id.identity, ' psk = ' + id.psk);
      resolve();
    })
    .catch((e) => {
        console.log('error auth: ' + e);
        reject(e);
    });
  });  
}

function connectToGw(){
  return new Promise(function(resolve, reject) {
    tfClient.connect(id.identity, id.psk)
    .then(() => {
      console.log('connected to GW');
      resolve();
    });
  });
}

function subscribeGw() {
  return new Promise(function(resolve, reject) {
    tfClient.on('device updated', onDeviceUpdated);
    tfClient.on('connection lost', onConnectionLost);
    tfClient.observeDevices();
  })
}

function onDeviceUpdated(device) {
  // We currently store only bulbs! 
  if(device.type === 2) {
    // store this device (replace if already in array)
    const index = lightbulbs.findIndex((e) => e.instanceId === device.instanceId);
    if(index != -1)
      lightbulbs.splice(index, 1, device);
    else
      lightbulbs.push(device);
  }
}

function onConnectionLost() {
  // lightbulbs = {};
  // bulbList = {};
  // tfClient.destroy();
  // init();
  console.log('------> connection lost!');
  tfClient.destroy();
  //t = setInterval(init, 5000);
  process.exit();
}
  

function onGwError(err) {
  console.log('GW Error, restarting');
  tfClient.destroy();
  //t = setInterval(init, 5000);
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

/*

device updated", callback: DeviceUpdatedCallback): 
    on(event: "device removed", callback: DeviceRemovedCallback): 
    on(event: "group updated", callback: GroupUpdatedCallback): 
    on(event: "group removed", callback: GroupRemovedCallback): 
    on(event: "scene updated", callback: SceneUpdatedCallback): 
    on(event: "scene removed", callback: SceneRemovedCallback): 
    on(event: "gateway updated", callback: GatewayUpdatedCallback): 
    on(event: "error", callback: ErrorCallback): 
    on(event: "ping succeeded", callback: () => void): 
    on(event: "ping failed", callback: PingFailedCallback): 
    on(event: "connection alive", callback: () => void): 
    on(event: "connection failed", callback: ConnectionFailedCallback): 
    on(event: "connection lost", callback: () => void): 
    on(event: "gateway offline", callback: () => void): 
    on(event: "reconnecting", callback: ReconnectingCallback): 
    on(event: "give up", callback: () => void): 
    on(event: "rebooting", callback: RebootNotificationCallback): 
    on(event: "firmware update available", callback: FirmwareUpdateNotificationCallback): 
    on(event: "internet connectivity changed"

    */