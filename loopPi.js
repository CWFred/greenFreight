var accountSid = "AC63236b75b81acba384cbd5695f18f67a"; // Your Account SID from www.twilio.com/console
var authToken = "34e285acb925e6426bbec49d8820dcf8"; //Twilio API token.
let deviceID = 1;
let mqtt = require("mqtt");
let sleep = require("sleep");
let Gpio = require("pigpio").Gpio;
var wpi = require("wiringpi-node");
let jsonfile = require("jsonfile");
let observe = require("observe");
let keypress = require("keypress");
let twilio = require("twilio");
let twilioClient = new twilio(accountSid, authToken);

let mQTTClient = mqtt.connect("tcp://45.79.178.96:");
let stateFile = "/home/pi/GF/latestState.json";

//interact with keyboard
keypress(process.stdin);

// Your twilio phone Number is +17818195809

let airPumpPin = 16; //in8
let lightPin = 17; //in7
let exhaustPin = 23; //in6
let fanPin = 22; //in5
let pumpPin = 26; //in4

let outputPins = [lightPin, pumpPin, fanPin, exhaustPin, airPumpPin];
let sensorPins = [];

var state = {
	lightStatus: false,
	airPumpStatus: false,
	pumpStatus: false,
	fanStatus: false,
	exhaustStatus: false
};

var stateListener = observe(state);

stateListener.on("change", function(change) {
	jsonfile.writeFileSync(stateFile, state);
	publishSystemState();
});

wpi.wiringPiSetupGpio();

// Used to set pins to either inputs or outputs.
outputPinSetUp(outputPins);
sensorPinSetUp(sensorPins);
//setUpEcMeter(ecSensorPin);
resetToPrevState();

mQTTClient.on("connect", function() {
	console.log("Successful connection");
	mQTTClient.subscribe("greenfreight/raspberryPI/#");
});

mQTTClient.on("message", function(topic, message) {
	if (!topic) {
	}

	let value = JSON.parse(message)["command"] === "ON";
	switch (topic) {
		case "greenfreight/raspberryPI/lights":
			actuateLights(value);
			break;

		case "greenfreight/raspberryPI/fan":
			actuateFan(value);
			break;

		case "greenfreight/raspberryPI/airpump":
			actuateAirPump(value);
			break;

		case "greenfreight/raspberryPI/exhaust":
			actuateExhaust(value);
			break;

		case "greenfreight/raspberryPI/pump":
			actuatePump(value);
			break;

		case "greenfreight/raspberryPI/demandState":
			publishSystemState();
			break;

		case "greenfreight/raspberryPI/water":
			waterPlants15Min();
			break;

		case "greenfreight/raspberryPI/water":
			writeToLog();
			break;

		default:
			break;
	}
});

function setState(latestState) {
	for (let elem in latestState) {
		switch (elem.toString()) {
			case "lightStatus":
				actuateLights(latestState[elem.toString()]);
				break;
			case "airPumpStatus":
				actuateAirPump(latestState[elem.toString()]);
				break;
			case "pumpStatus":
				actuatePump(latestState[elem.toString()]);
				break;
			case "fanStatus":
				actuateFan(latestState[elem.toString()]);
				break;
			case "exhaustStatus":
				actuateExhaust(latestState[elem.toString()]);
				break;
		}
	}
}

function actuateLights(value) {
	if (value) {
		console.log("lightOn");
		wpi.digitalWrite(lightPin, wpi.LOW);
		stateListener.set("lightStatus", true);
	} else {
		console.log("lightOff");
		wpi.digitalWrite(lightPin, wpi.HIGH);
		stateListener.set("lightStatus", false);
	}
}

function actuatePump(value, report = true) {
	if (value) {
		console.log("pumpOn");
		wpi.digitalWrite(pumpPin, wpi.LOW);
		stateListener.set("pumpStatus", true);
		twilioClient.messages.create({
			body: "Pump on my dude!",
			to: "+16179805137",
			from: "+17818195809"
		});
	} else {
		console.log("pumpOff");
		wpi.digitalWrite(pumpPin, wpi.HIGH);
		stateListener.set("pumpStatus", false);
		twilioClient.messages.create({
			body: "Pump off my guy!",
			to: "+16179805137",
			from: "+17818195809"
		});
	}
}

function actuateAirPump(value) {
	if (value) {
		console.log("airPumpOn");
		wpi.digitalWrite(airPumpPin, wpi.LOW);
		stateListener.set("airPumpStatus", true);
	} else {
		console.log("airPumpOff");
		wpi.digitalWrite(airPumpPin, wpi.HIGH);
		stateListener.set("airPumpStatus", false);
	}
}

function actuateFan(value) {
	if (value) {
		console.log("fanOn");
		wpi.digitalWrite(fanPin, wpi.LOW);
		stateListener.set("fanStatus", true);
	} else {
		console.log("fanOff");
		wpi.digitalWrite(fanPin, wpi.HIGH);
		stateListener.set("fanStatus", false);
	}
}

function actuateExhaust(value) {
	if (value) {
		console.log("exhaustOn");
		wpi.digitalWrite(exhaustPin, wpi.LOW);
		stateListener.set("exhaustStatus", true);
	} else {
		console.log("exhaustOff");
		wpi.digitalWrite(exhaustPin, wpi.HIGH);
		stateListener.set("exhaustStatus", false);
	}
}

function publishSystemState() {
	let currentState = {
		lightStatus: state.lightStatus,
		pumpStatus: state.pumpStatus,
		airPumpStatus: state.airPumpStatus,
		fanStatus: state.fanStatus,
		exhaustStatus: state.exhaustStatus,
		date: new Date(),
		ID: deviceID
	};
	mQTTClient.publish(
		"greenfreight/raspberryPI/getState",
		JSON.stringify(currentState)
	);
}

function setInitialState() {
	wpi.digitalWrite(lightPin, wpi.HIGH);
	wpi.digitalWrite(fanPin, wpi.HIGH);
	wpi.digitalWrite(pumpPin, wpi.HIGH);
	wpi.digitalWrite(airPumpPin, wpi.HIGH);
	wpi.digitalWrite(exhaustPin, wpi.HIGH);
}

function outputPinSetUp(outputPins) {
	outputPins.forEach(pin => {
		wpi.pinMode(pin, wpi.OUTPUT);
	});
}

function sensorPinSetUp(sensorPins) {
	sensorPins.forEach(pin => {
		wpi.pinMode(pin, wpi.INPUT);
	});
}

function resetToPrevState() {
	jsonfile.readFile(stateFile, function(err, latestState) {
		if (err) {
			setInitialState();
		} else {
			setState(latestState);
		}
	});
}

function waterPlants15Min() {
	actuatePump(true);
	sleep.sleep(900);
	actuatePump(false);
}

function checkTime() {
	let now = new Date();
	let hour = now.getHours();
	if (hour > 0 && hour < 12) {
		actuateLights(true);
	} else {
		actuateLights(false);
	}
}

function waterPlantsSchedule() {
	while (true) {
		checkTime();
		actuatePump(true);
		sleep.sleep(900);
		actuatePump(false);
		for (var i = 0; i <= 16; i++) {
			sleep.sleep(900);
			checkTime();
		}
	}
}

// listen for the "keypress" event
// 's' to print out state.
process.stdin.on("keypress", function(ch, key) {
	if (key) {
		if (key.name == "s") {
			console.log(state);
		}

		if (key.name == "p") {
			actuatePump(!state["pumpStatus"]);
		}

		if (key.name == "a") {
			actuateAirPump(!state["airPumpStatus"]);
		}

		if (key.name == "l") {
			actuateLights(!state["lightStatus"]);
		}

		if (key.name == "f") {
			actuateFan(!state["fanStatus"]);
		}

		if (key.name == "e") {
			actuateExhaust(!state["exhaustStatus"]);
		}

		if (key.name == "w") {
			waterPlants15Min();
		}

		if (key.name == "q") {
			waterPlantsSchedule();
		}
	}
});

process.stdin.setRawMode(true);
