const express = require("express");
const app = express();
var mqtt = require("mqtt");
var client = mqtt.connect("tcp://broker.hivemq.com");
var RPIState = {};

client.on("connect", function() {
	console.log("Successful connection");
	client.subscribe("greenfreight/raspberryPI/#");
	getRPIState();
});

client.on("message", function(topic, message) {
	if (!topic) {
	}

	switch (topic) {
		case "greenfreight/raspberryPI/getState":
			RPIState = JSON.parse(message);
			break;
	}
});

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	next();
});

app.get("/api/toggleLights", (req, res) => {
	console.log("LightsToggled");
	let lightStatus = RPIState["lightStatus"];
	let lightCommand = lightStatus ? "OFF" : "ON";
	let payload = { command: lightCommand };
	client.publish(
		"greenfreight/raspberryPI/lights",
		JSON.stringify(payload),
		err => {
			if (err) {
				res.status(500).send("LightToggleSignalNotSent");
			} else {
				res.send({ message: "LightToggleSignalSent" });
			}
		}
	);
});

app.get("/api/togglePump", (req, res) => {
	console.log("PumpToggled");
	let pumpStatus = RPIState["pumpStatus"];
	let pumpCommand = pumpStatus ? "OFF" : "ON";
	let payload = { command: pumpCommand };
	client.publish(
		"greenfreight/raspberryPI/pump",
		JSON.stringify(payload),
		err => {
			if (err) {
				res.status(500).send("PumpToggleSignalNotSent");
			} else {
				res.send({ message: "PumpToggleSignalSent" });
			}
		}
	);
});

app.get("/api/toggleAirPump", (req, res) => {
	console.log("AirPumpToggled");
	let airPumpStatus = RPIState["airPumpStatus"];
	let airPumpCommand = airPumpStatus ? "OFF" : "ON";
	let payload = { command: airPumpCommand };
	client.publish(
		"greenfreight/raspberryPI/airPump",
		JSON.stringify(payload),
		err => {
			if (err) {
				res.status(500).send("AirPumpToggleSignalNotSent");
			} else {
				res.send({ message: "AirPumpToggleSignalSent" });
			}
		}
	);
});

app.get("/api/toggleVent", (req, res) => {
	console.log("VentToggled");
	let ventStatus = RPIState["ventStatus"];
	let ventCommand = ventStatus ? "OFF" : "ON";
	let payload = { command: ventCommand };
	client.publish(
		"greenfreight/raspberryPI/vent",
		JSON.stringify(payload),
		err => {
			if (err) {
				res.status(500).send("VentToggleSignalNotSent");
			} else {
				res.send({ message: "VentToggleSignalSent" });
			}
		}
	);
});

function getRPIState() {
	let lightCommand = { command: "ON" };
	client.publish(
		"greenfreight/raspberryPI/demandState",
		JSON.stringify(lightCommand)
	);
}

const port = 5001;
app.listen(port, () => console.log(`Server running on port ${port}`));
