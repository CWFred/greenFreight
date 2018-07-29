let mqtt = require('mqtt');
let sleep = require('sleep');
let Gpio = require('pigpio').Gpio;
let wpi = require('wiring-pi');

let client  = mqtt.connect('mqtt://test.mosquitto.org');

wpi.wiringPiSetupGpio();

let ledRed = 17; 
let ledBlue = 22; 
let ledGreen = 4; 

wpi.softPwmCreate(ledRed, 0, 100);
wpi.softPwmCreate(ledBlue, 0, 100);
wpi.softPwmCreate(ledGreen, 0, 100);

 client.on('connect',function(){
 	client.subscribe('greenfreight/raspberryPI/colors');
 });

client.on('message',function(topic,message){
	if(topic === 'greenfreight/raspberryPI/colors'){
		let json = JSON.parse(message);
		redVal = json['red']; 
		greenVal = json['green'];
		blueVal = json['blue'];
		wpi.softPwmWrite(ledRed, redVal);
		wpi.softPwmWrite(ledBlue, blueVal);
		wpi.softPwmWrite(ledGreen, greenVal);

		console.log(topic,message.toString());
	}
})
 
