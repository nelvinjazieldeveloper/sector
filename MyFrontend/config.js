// central configuration file for the front end
// you can import the values anywhere in the app

const API_URL = 'http://localhost/sector'; // TODO: replace with real API url

// also expose on the global object if you prefer shorthand access
if (typeof global !== 'undefined') {
  global.API_URL = API_URL;
}

export default {
  API_URL,
};
