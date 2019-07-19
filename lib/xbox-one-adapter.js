/**
 * XboxOne adapter for Mozilla WebThings Gateway.
 */
'use strict';

const {Adapter} = require('gateway-addon');
const XboxOneDevice = require('./xbox-one-device');
var dgram = require('dgram');

const XBPORT = 5050;
const XBDEFAULT_TRIES = 5;
const XBDEFAULT_DELAY = 1000;

/**
 * Adapter for Xbox One devices.
 */
class XboxOneAdapter extends Adapter {

  /**
   * Initialize the object.
   *
   * @param {Object} addonManager - AddonManagerProxy object
   * @param {Object} manifest - Package manifest
   */
  constructor(addonManager, manifest) {
    super(addonManager, manifest.name, manifest.name);
    addonManager.addAdapter(this);

    this.config = manifest.moziot.config;
    this.pairing = false;
  }


  /**
   * Example process to add a new device to the adapter.
   *
   * The important part is to call: `this.handleDeviceAdded(device)`
   *
   * @param {String} deviceId ID of the device to add.
   * @param {String} deviceDescription Description of the device to add.
   * @return {Promise} which resolves to the device added.
   */
  addDevice(deviceId, deviceDescription) {
    return new Promise((resolve, reject) => {
      if (deviceId in this.devices) {
        reject(`Device: ${deviceId} already exists.`);
      } else {
        const device = new RingDevice(this, deviceId, deviceDescription);
        this.handleDeviceAdded(device);
        resolve(device);
      }
    });
  }

  /**
   * Example process TO remove a device from the adapter.
   *
   * The important part is to call: `this.handleDeviceRemoved(device)`
   *
   * @param {String} deviceId ID of the device to remove.
   * @return {Promise} which resolves to the device removed.
   */
  removeDevice(deviceId) {
    return new Promise((resolve, reject) => {
      const device = this.devices[deviceId];
      if (device) {
        this.handleDeviceRemoved(device);
        resolve(device);
      } else {
        reject(`Device: ${deviceId} not found.`);
      }
    });
  }

  /**
   * Clean up before shutting down this adapter.
   *
   * @returns {Promise} Promise which resolves when finished unloading.
   */
  unload() {
    clearTimeout(this.resetActivityTimeout);
    clearInterval(this.activityInterval);
    clearInterval(this.devicePollInterval);
    return super.unload();
  }

  /**
   * Start the pairing/discovery process.
   *
   * @param {Number} timeoutSeconds Number of seconds to run before timeout
   */
  startPairing(_timeoutSeconds) {
    console.log('XboxOneAdapter:', this.name,
                'id', this.id, 'pairing started');

    this.pairing = true;
    this.processDevices();
  }

  /**
   * Cancel the pairing/discovery process.
   */
  cancelPairing() {
    console.log('XboxOneAdapter:', this.name, 'id', this.id,
                'pairing cancelled');
    this.pairing = true;
  }

  /**
   * Unpair the provided the device from the adapter.
   *
   * @param {Object} device Device to unpair with
   */
  removeThing(device) {
    console.log('XboxOneAdapter:', this.name, 'id', this.id,
                'removeThing(', device.id, ') started');

    this.removeDevice(device.id).then(() => {
      console.log('XboxOneAdapter: device:', device.id, 'was unpaired.');
    }).catch((err) => {
      console.error('RingAdapter: unpairing', device.id, 'failed');
      console.error(err);
    });
  }

  /**
   * Cancel unpairing process.
   *
   * @param {Object} device Device that is currently being paired
   */
  cancelRemoveThing(device) {
    console.log('XboxOneAdapter:', this.name, 'id', this.id,
                'cancelRemoveThing(', device.id, ')');
    this.pairing = false;
  }

  processDevice(xboxDevice) {
    const id = `xbone-${xboxDevice.id}`;
    console.log('processDevice', id)
    const device = this.devices[id];

    if (device) {
      device.updateDevice(xboxDevice, null);
      return;
    }

    new XboxOneDevice(this, id, xboxDevice);
  }
}

module.exports = XboxOneAdapter;
