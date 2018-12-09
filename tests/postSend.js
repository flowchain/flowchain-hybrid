var request = require('request');
request.post('http://127.0.0.1:3000/iot/7697/send', {payload:{temperature:30}, key: 'lambda'});
