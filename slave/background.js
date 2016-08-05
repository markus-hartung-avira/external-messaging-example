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


class Settings {
  constructor(initialSettings) {
    this._settings = initialSettings;
    this._remoteExtensions = {};
    this.onChange = new EventEmitter();
    chrome.runtime.onMessageExternal.addListener(this._onMessageExternal.bind(this));
  }

  set(key, value) {
    let oldValue = this._settings[key];
    if (value !== oldValue) {
      this._settings[key] = value;
      this.onChange.trigger(key, value, oldValue);
      this._informRemotes(key, value, oldValue);
    }
  }

  get(key) {
    return this._send({
      command: 'settings:get',
      key
    });
  }

  getAll() {
    return this._settings;
  }

  addRemote(extensionId, allowedKeys) {
    this._remoteExtensions[extensionId] = allowedKeys;
  }

  _informRemotes(key, value, oldValue) {
    let message = {
      command: 'settings:onChange',
      key,
      value,
      oldValue
    }
    for (let remoteId in this._remoteExtensions) {
      chrome.runtime.sendMessage(remoteId, message);
    }
  }

  _onMessageExternal(message, sender, response) {
    let remote = this._remoteExtensions[sender.id];
    if (!remote) {
      return;
    }

    let command = message.command;
    let key = message.key;
    switch (command) {
      case 'settings:set':
        if (remote.indexOf(key) != -1) {
          this.set(key, message.value);
          response({});
        } else {
          response({error: 'Remote is not allowed to control setting ' + key});
        }
        break;
      case 'settings:get':
        response({value: this._settings[key]});
        break;
      case 'settings:getAll':
        response({value: this._settings});
        break;
    }
  }
}



console.log('Slave');

const MASTER_EXTENSION_ID = 'bajgjohkdiegndkpfccjohaipmghnegn';

var settings = new Settings({
  volume: 0,
  bass: 8,
  treble: 4,
  input: 'cd'
});
settings.addRemote(MASTER_EXTENSION_ID, ['volume', 'input']);

settings.onChange.addListener((key, newValue, oldValue) =>
  console.log(key, 'was changed from', oldValue, 'to', newValue));

settings.set('input', 'lp');

setInterval(function() {
  settings.set('treble', Math.round(Math.random() * 10));
}, 5000);
