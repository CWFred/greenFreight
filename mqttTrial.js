var mqtt = require("mqtt");
let Agenda = require("agenda");
let { MongoClient } = require("mongodb");

var client = mqtt.connect("tcp://45.79.178.96", [{ useNewUrlParser: true }]);

client.on("connect", function() {
	client.subscribe("greenfreight/raspberryPI/getState");
});

client.on("message", function(topic, message) {
	let json = JSON.parse(message);
	console.log(topic);
	console.log(json);
});

async function run() {
	const db = await MongoClient.connect("mongodb://127.0.0.1/agendatest");

	const agenda = new Agenda().mongo(db, "jobs");

	// Define a "job", an arbitrary function that agenda can execute
	agenda.define("lightsOn", () => {
		client.publish(
			"greenfreight/raspberryPI/lights",
			JSON.stringify({
				command: "ON"
			})
		);
	});

	agenda.define("pumpOn", () => {
		client.publish(
			"greenfreight/raspberryPI/pump",
			JSON.stringify({
				command: "ON"
			})
		);
	});

	agenda.define("airPumpOn", () => {
		client.publish(
			"greenfreight/raspberryPI/airpump",
			JSON.stringify({
				command: "ON"
			})
		);
	});

	agenda.define("fanOn", () => {
		client.publish(
			"greenfreight/raspberryPI/fan",
			JSON.stringify({
				command: "ON"
			})
		);
	});

	agenda.define("exhaustOn", () => {
		client.publish(
			"greenfreight/raspberryPI/exhaust",
			JSON.stringify({
				command: "ON"
			})
		);
	});

	////////////////////////////////

	agenda.define("lightsOff", () => {
		client.publish(
			"greenfreight/raspberryPI/lights",
			JSON.stringify({
				command: "OFF"
			})
		);
	});

	agenda.define("pumpOff", () => {
		client.publish(
			"greenfreight/raspberryPI/pump",
			JSON.stringify({
				command: "OFF"
			})
		);
	});

	agenda.define("airPumpOff", () => {
		client.publish(
			"greenfreight/raspberryPI/airpump",
			JSON.stringify({
				command: "OFF"
			})
		);
	});

	agenda.define("fanOff", () => {
		client.publish(
			"greenfreight/raspberryPI/fan",
			JSON.stringify({
				command: "OFF"
			})
		);
	});

	agenda.define("exhaustOff", () => {
		client.publish(
			"greenfreight/raspberryPI/exhaust",
			JSON.stringify({
				command: "OFF"
			})
		);
	});

	agenda.define("state", () => {
		client.publish(
			"greenfreight/raspberryPI/demandState",
			JSON.stringify({})
		);
	});

	agenda.define("print", () => {
		console.log("print");
	});

	await new Promise(resolve => agenda.once("ready", resolve));

	// Schedule a job for 1 second from now and persist it to mongodb.
	// Jobs are uniquely defined by their name, in this case "hello"
	agenda.schedule(new Date(Date.now() + 1000), "hello");
	agenda.start();
}

run().catch(error => {
	console.error(error);
	process.exit(-1);
});

process.on("SIGINT", function() {
	console.log("Caught interrupt signal");
	process.exit();
});
