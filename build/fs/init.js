load('api_config.js');
//load('api_dht.js');
load('api_mqtt.js');
load('api_sys.js');
load('api_timer.js');
load('api_uart.js');
load('api_net.js');

let uartNo = 0;		//uart number
let isConnected = false;
//let isMQTTConnected = false;

let deviceId = Cfg.get('device.id');
//let topic = 'devices/' + deviceId + '/messages/events/';

/* Imported C functions */
let parseTemperature = ffi('char* returnTemperature(char*)');
let parseHumidity = ffi('char* returnHumidity(char*)');
let parsePackage = ffi('void* parsePackage(char*)');

// Configure UART at 115200 baud
UART.setConfig(uartNo, {
	baudRate: 115200,
	esp8266: {
		swapRxCtsTxRts: true,	//GPIO15 becomes TX instead of GPIO1, GPIO13 RX
	},
});


Net.setStatusEventHandler(function(ev, arg){
	print("Wifi Event:", ev);
	if(ev === Net.STATUS_DISCONNECTED) {
		print("Wifi DISCONNECTED - Event time:", Timer.now());
		isConnected = false;
	}
	if(ev === Net.STATUS_CONNECTING) {
		print("Wifi CONNECTING - Event time:", Timer.now());
		isConnected = false;
	}
	if(ev === Net.STATUS_CONNECTED) {
		print("Wifi CONNECTED - Event time:", Timer.now());
		isConnected = true;
	}
	if(ev === Net.STATUS_GOT_IP) {
		print("Device got IP - Event time:", Timer.now());
		isConnected = true;
	}
}, null);


//MQTT.setEventHandler(function(conn, ev, evdata){
//	if(ev === MQTT.EV_CONNACK) {
//		isMQTTConnected = true;
//		print("MQTT Connection Acknowledge:", JSON.stringify(ev));
//	} //else {
		//isMQTTConnected = false;
		//print("Nisam povezan");
	//}
//	if(ev === 214) {
//		isMQTTConnected = false;
//		print("MQTT DisConnection:", JSON.stringify(ev));
//	}
//}, null);


/*	Set Dispatcher callback that will be called whenever new Rx data or 
 *  space in the Tx buffer becomes available
 */
UART.setDispatcher(uartNo, function(uartNo, ud) {
	let ra = UART.readAvail(uartNo);
	let oa = UART.writeAvail(uartNo);
	if (ra > 0) {
		// Received new data: print it immediately to the console, and also
		// accumulate in the "rxAcc" variable which will be echoed back to UART later
		let rec = UART.read(uartNo);
		//UART.write(uartNo, 'Received UART data:' + data + '\r\n');
		print('Received UART data:', rec);
		let pack = parsePackage(rec);
		print('Parsed data:', pack);

		//print("Received UART data:", rec);
		//let temp = parseTemperature(rec);
		//print('Parsed temperature:', temp);
		//let hum = parseHumidity(rec);
		//print('Parsed humidity:', hum);		
		//let msg = JSON.stringify({ "temperature": temp, "humidity": hum });
		//print('Poruka za slanje:', msg);
		//print(msg);
//		let ok = MQTT.pub(topic, msg, 1);
//		print("Published: ", ok ? "yes" : "no", "Response", ok);
	}  
}, null);

// Enable Rx
UART.setRxEnabled(uartNo, true);
