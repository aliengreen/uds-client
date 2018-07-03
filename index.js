/* jslint node: true, sub: true */
/* jshint esversion: 6 */
'use strict';

var request = require('request');


var mySingleton = (function () {

    // Instance stores a reference to the Singleton
    var instance;

    var defTimeout   = 10000,
        xdefLang     = 'en',
        host         = 'https://admin.aliengreen.ge',
        access_token = undefined;

  function init() {

    // Singleton

        /* ------------------------------------------------------------ */

        // Private methods and variables
        async function callApi(uri, method, param, key) {

         var options = {
              url: host + uri,
              method: method,
              json: true, 
              body: param
            };

          if(key !== undefined) {
            options.headers = {
                'Authorization': 'Bearer ' + key
            };
          }

          return new Promise((resolve, reject) => {
            request(options, function (error, response, body) {
              if(error) {
                reject({code: error.errno, error: error.message});
              } else { 
                  if(response.statusCode != 200) {
                    reject({code: response.statusCode, error: statusCodeToMessage(response.statusCode)});
                  } else {
                    
                    /* Workaround !!! to detect error */
                    if(body.result !== undefined && body.result.statusCode) {
                        reject({code: body.result.statusCode, error: body.result.message});
                    } else {
                        resolve(body);
                    }
                  }
              }
             });
          });
        }

        /* ------------------------------------------------------------ */

        function statusCodeToMessage(statusCode) {

            if(statusCode == 401) {
                return "Unauthorized request, invalid email/password or invalid access token";
            } else if(statusCode == 408) { 
                return "Device is offline";
            } else if(statusCode == 404) {
                return "Device not found, invalid EUI64 serial number";
            } else if(statusCode == 418) {
                return "The remote server is a teapot (" + statusCode + ")";
            } else {
                return "Unknown status code " + statusCode;
            }
        }

        /* ------------------------------------------------------------ */

    return {

            // Public methods and variables
            getAccessToken: () => {
                return access_token;
            },

            loginSync: async (email, password) => {

                var param = {
                  email: email,
                  password: password
                };

                try {
                    let result = await callApi('/auth/login', 'POST', param);
                    access_token = result.access_token;
                    return {access_token: result.access_token};
                } catch (err) {
                   return err;
                }
            },
          
            logout: async () => {

                try {
                    return callApi('/auth/logout', 'POST', {}, access_token);
                } catch (err) {
                   return err;
                }
            },


            getConfigSync: async() => {

                try {
                    let result = await callApi('/api/config', 'GET', {}, access_token);
                    return result;
                } catch (err) {
                   return err;
                }

            },

            setConfigSync: async(conf) => {

                try {
                    let result = await callApi('/api/config', 'POST', conf, access_token);
                    return result;
                } catch (err) {
                   return err;
                }

            },

            getRegisterSync: async(eui64, reg) => {

                var param = {
                  euid_64: eui64,
                  type: 'get_register',
                  register_name: reg
                };

                try {
                    let result = await callApi('/api/registers', 'POST', param, access_token);
                    return {result: result.result.records};
                } catch (err) {
                   return err;
                }

            },

            getRegister: async(eui64, reg) => {

                var param = {
                  euid_64: eui64,
                  type: 'get_register',
                  register_name: reg
                };

                return callApi('/api/registers', 'POST', param, access_token);
            },

            putRegisterSync: async(eui64, reg, value, value_len, type) => {

                var param = {
                  euid_64: eui64,
                  type: 'put_register',
                  register_name: reg,
                  register_value: value,
                  register_value_len: value_len,
                  register_value_type: type
                };

                try {
                    let result = await callApi('/api/registers', 'POST', param, access_token);
                    return {result: result.result};
                } catch (err) {
                   return err;
                }
            },

            getStatusSync: async(eui64) => {

                var param = {
                  euid_64: eui64,
                  type: 'get_status',
                };

                try {
                    let result = await callApi('/api/registers', 'POST', param, access_token);
                    return {result: result.result};
                } catch (err) {
                   return err;
                }

            },

            restartDeviceSync: async(eui64) => {

                try {
                    let result = await instance.putRegisterSync(eui64, 0x0136, 1, 1, 'uint');
                    return result;
                } catch (err) {
                   return err;
                }
            }


    };

  };

  return {

    // Get the Singleton instance if one exists
    // or create one if it doesn't
    getInstance: function () {

      if ( !instance ) {
        instance = init();
      }

      return instance;
    }

  };

})();

module.exports = mySingleton.getInstance();




