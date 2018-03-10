// Created March 10th 2018
// Frednick Piard (CodeWarrior Fred)
// GreenFreight , Let's Feed The World! 

var sleep = require('sleep');
var Gpio = require('pigpio').Gpio;
var wpi = require('wiring-pi');

wpi.wiringPiSetupGpio();

var ledRed = 17;
var ledBlue = 22;
var redLightIntensity = 0 ;
var blueLightIntensity = 0;

wpi.softPwmCreate(ledRed, 0, 100);
wpi.softPwmCreate(ledBlue, 0, 100);


while (true) {

for(var i=0 ; i<100 ; i++){
	wpi.softPwmWrite(ledRed, i);
	wpi.softPwmWrite(ledBlue, i);
	sleep.msleep(10);
}

for(var j=100 ; j>0 ; j--){
	wpi.softPwmWrite(ledRed, j);
	wpi.softPwmWrite(ledBlue, j);
	sleep.msleep(10);
}

}



