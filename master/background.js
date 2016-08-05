"use strict";

class EventEmitter {
  constructor() {
    this._listeners = [];
  }

  addListener(callback) {
    this._listeners.push(callback);
  }

  trigger(...args) {
    this._listeners.forEach((callback) => callback(...args));
  }
}


class RemoteSettings {
  constructor(remoteExtensionId) {
    this._remoteExtensionId = remoteExtensionId;
    this.onChange = new EventEmitter();
    chrome.runtime.onMessageExternal.addListener(this._onMessageExternal.bind(this));
  }

  set(key, value) {
    return this._send({
      command: 'settings:set',
      key,
      value
    });
  }

  get(key) {
    return this._send({
      command: 'settings:get',
      key
    });
  }

  getAll() {
    return this._send({
      command: 'settings:getAll'
    });
  }

  _send(message, callback) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(this._remoteExtensionId, message, null, function(response) {
        if (typeof response === 'undefined') {
          reject('Remote extension not present');
        } else if (response.error) {
          reject(response.error);
        } else {
          resolve(response.value);
        }
      });
    });
  }

  _onMessageExternal(message, sender) {
    if (sender.id === this._remoteExtensionId && message.command == 'settings:onChange') {
      this.onChange.trigger(message.key, message.value, message.oldValue);
    }
  }
}



console.log('Master');

const SLAVE_EXTENSION_ID = 'kdpefhhbeglahfpgjiffjdopccljgjkn';

var remoteSettings = new RemoteSettings(SLAVE_EXTENSION_ID);

remoteSettings.get('volume').then((volume) => console.log('Volume:', volume));
remoteSettings.set('input', 'tape');
remoteSettings.getAll().then((settings) => console.log('Settings:', settings));

remoteSettings.onChange.addListener((key, newValue, oldValue) =>
  console.log(key, 'was changed from', oldValue, 'to', newValue));

setInterval(function() {
  remoteSettings.set('volume', Math.round(Math.random() * 11));
}, 5000);
