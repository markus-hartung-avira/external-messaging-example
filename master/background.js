"use strict";

const SLAVE_EXTENSION_ID = 'kdpefhhbeglahfpgjiffjdopccljgjkn';

function sum(a, b, callback) {
  chrome.runtime.sendMessage(SLAVE_EXTENSION_ID, {a, b}, null, callback);
}

setInterval(function() {
  let a = Math.round(Math.random() * 5);
  let b = Math.round(Math.random() * 5);

  sum(a, b, function(result) {
    console.log(a + ' + ' + b + ' = ' + result.sum);
  });
}, 5000);
