const mqtt = require("mqtt");
const Agenda = require("agenda");
const { MongoClient } = require("mongodb");

let client = mqtt.connect("tcp://45.79.178.96", [{ useNewUrlParser: true }]);

client.on("connect", function() {
	client.subscribe("greenfreight/raspberryPI/getState");
	console.log("MQTT connected");
});

client.on("message", function(topic, message) {
	let json = JSON.parse(message);
	console.log(topic);
	console.log(json);
});

async function run() {
	const db = await MongoClient.connect(
		"mongodb://localhost:27017/agendatest"
	);

	// Agenda will use the given mongodb connection to persist data, so jobs
	// will go in the "agendatest" database's "jobs" collection.
	const agenda = new Agenda().mongo(db, "jobs");

	// Define a "job", an arbitrary function that agenda can execute
	agenda.define("lightsOn", () => {
		client.publish(
			"greenfreight/raspberryPI/lights",
			JSON.stringify({ command: "ON" })
		);
		console.log("On Light Signal");
	});

	agenda.define("lightsOff", () => {
		client.publish(
			"greenfreight/raspberryPI/lights",
			JSON.stringify({ command: "OFF" })
		);
		console.log("Off Light Signal");
	});

	agenda.define("water", () => {
		client.publish(
			"greenfreight/raspberryPI/water",
			JSON.stringify({
				command: "ON"
			})
		);
	});

	agenda.define("state", () => {
		client.publish(
			"greenfreight/raspberryPI/demandState",
			JSON.stringify({})
		);
	});

	// Wait for agenda to connect. Should never fail since connection failures
	// should happen in the `await MongoClient.connect()` call.
	await new Promise(resolve => agenda.once("ready", resolve));

	// Schedule a job for 1 second from now and persist it to mongodb.
	// Jobs are uniquely defined by their name, in this case "hello"
	agenda.schedule(new Date(Date.now() + 1000), "lightsOn");
	agenda.schedule(new Date(Date.now() + 2000), "lightsOff");
	agenda.start();
}

run().catch(error => {
	console.error(error);
	process.exit(-1);
});
