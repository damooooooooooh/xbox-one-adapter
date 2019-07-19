/**
 * XboxOne device type.
 */
'use strict';

const { Device, Constants } = require('gateway-addon');
const XboxOneProperty = require('./xbox-one-property');

/**
 * Xbox One device type.
 */
class XboxOneDevice extends Device {
  /**
   * Initialize the object.
   *
   * @param {Object} adapter - XboxOneAdapter instance
   * @param {String} id - Xbox Device Id
   * @param {Object} device - the device API object
   */

  constructor(adapter, id, device) {
    super(adapter, id);

    this.deviceId = device.id;
    this.name = device.description;
    this.description = device.address;
    this['@context'] = 'https://iot.mozilla.org/schemas';

    this.type = Constants.THING_TYPE_ON_OFF_SWITCH;
    this['@type'] = ['OnOffSwitch'];

    this.properties.set(
      'on',
      new RingProperty(
        this,
        'on',
        {
          '@type': 'OnOffProperty',
          label: 'On/Off',
          type: 'boolean',
        },
        false));

    this.adapter.handleDeviceAdded(this);
  }
}

module.exports = RingDevice;
