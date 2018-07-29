var mqtt = require('mqtt');
let Agenda = require('agenda');
let { MongoClient } = require('mongodb');
var client  = mqtt.connect('mqtt://test.mosquitto.org');
var lightOn = {'command':'ON'};
var lightOff = {'command':'OFF'};

client.on('connect', function () {
  console.log('Connected');
  client.subscribe('greenfreight/raspberryPI/getState');
})

client.on('message', function(topic, message) {
	let json = JSON.parse(message);
	console.log(topic);
	console.log(json);
});

async function run() {
  const db = await MongoClient.connect('mongodb://localhost:27017/agendatest');

  const agenda = new Agenda().mongo(db, 'jobs');

  // Define a "job", an arbitrary function that agenda can execute
  agenda.define('lightsOn', () => {
    client.publish('greenfreight/raspberryPI/lights',JSON.stringify({'command':'ON'}));
  });

  agenda.define('pumpOn', () => {
    client.publish('greenfreight/raspberryPI/pump',JSON.stringify({'command':'ON'}));
  });

  agenda.define('airPumpOn', () => {
    client.publish('greenfreight/raspberryPI/airpump',JSON.stringify({'command':'ON'}));
  });

  agenda.define('fanOn', () => {
    client.publish('greenfreight/raspberryPI/fan',JSON.stringify({'command':'ON'}));
  });

  agenda.define('exhaustOn', () => {
    client.publish('greenfreight/raspberryPI/exhaust',JSON.stringify({'command':'ON'}));
  });

  ////////////////////////////////

   agenda.define('lightsOff', () => {
    client.publish('greenfreight/raspberryPI/lights',JSON.stringify({'command':'OFF'}));
  });

  agenda.define('pumpOff', () => {
    client.publish('greenfreight/raspberryPI/pump',JSON.stringify({'command':'OFF'}));
  });

  agenda.define('airPumpOff', () => {
    client.publish('greenfreight/raspberryPI/airpump',JSON.stringify({'command':'OFF'}));
  });

  agenda.define('fanOff', () => {
    client.publish('greenfreight/raspberryPI/fan',JSON.stringify({'command':'OFF'}));
  });

  agenda.define('exhaustOff', () => {
    client.publish('greenfreight/raspberryPI/exhaust',JSON.stringify({'command':'OFF'}));
  });

  agenda.define('state', () => {
    client.publish('greenfreight/raspberryPI/demandState',JSON.stringify({}));
  });

  // Wait for agenda to connect. Should never fail since connection failures
  // should happen in the `await MongoClient.connect()` call.
  await new Promise(resolve => agenda.once('ready', resolve));

  // Schedule a job for 1 second from now and persist it to mongodb.
  // Jobs are uniquely defined by their name, in this case "hello"
  agenda.schedule(new Date(Date.now() + 1000), 'lightsOn');
  agenda.schedule(new Date(Date.now() + 3000), 'airPumpOn');
  agenda.schedule(new Date(Date.now() + 5000), 'pumpOn');
  agenda.schedule(new Date(Date.now() + 11000), 'state');
  agenda.schedule(new Date(Date.now() + 100000), 'pumpOff');
  agenda.schedule(new Date(Date.now() + 190000), 'state');
  agenda.start();
}

run().catch(error => {
  console.error(error);
  process.exit(-1);
});

process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
        process.exit();
});
