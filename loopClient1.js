var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://learnloquesea.com')
 
setInterval(function(){client.publish('test', 'this is a test')}, 1000);
