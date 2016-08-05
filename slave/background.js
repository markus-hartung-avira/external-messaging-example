"use strict";

const MASTER_EXTENSION_ID = 'bajgjohkdiegndkpfccjohaipmghnegn'

chrome.runtime.onMessageExternal.addListener(function(message, sender, response) {
  console.log('Sender:', sender);
  console.log('Message:', message);
  // Let's make sure we only work for the master extension
  if (sender.id !== MASTER_EXTENSION_ID) {
    return;
  }

  var sum = message.a + message.b;
  response({sum});
});
