let Agenda = require('agenda');
let { MongoClient } = require('mongodb');
let moment = require('moment');

async function run() {
  const db = await MongoClient.connect('mongodb://localhost:27017/agendatest2');

  const agenda = new Agenda().mongo(db, 'jobs');

  agenda.define('print', () => {
    console.log('test');
  });

  // Wait for agenda to connect. Should never fail since connection failures
  // should happen in the `await MongoClient.connect()` call.
  await new Promise(resolve => agenda.once('ready', resolve));

  // Schedule a job for 1 second from now and persist it to mongodb.
  // Jobs are uniquely defined by their name, in this case "hello"

  var testHour    = moment.tz("2014-05-06 19:51", "America/New_York");
  testHour.format(); 

  console.log(testHour);

  agenda.schedule(testHour, 'print');

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
