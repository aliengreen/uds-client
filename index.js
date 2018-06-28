/* jslint node: true, sub: true */
/* jshint esversion: 6 */
'use strict';

var request = require('request');

// Init the module
module.exports = (function () {

  var defTimeout = 10000,
      defLang    = 'ka',
      host       = 'https://admin.aliengreen.ge/';

  var get = function get() {

      return defTimeout++;
  };

  return {
    get: get,
  };
})();