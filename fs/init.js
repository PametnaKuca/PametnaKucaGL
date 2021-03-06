load('api_config.js');
load('api_mqtt.js');
load('api_sys.js');
load('api_timer.js');
load('api_uart.js');
load('api_net.js');

let uartNo = 0;		//uart number
let isConnected = false;
let isMQTTConnected = false;

let deviceId = Cfg.get('device.id');
let topicPub = 'devices/' + deviceId + '/messages/events/';
//let topicSub = 'devices/' + deviceId + 'messages/devicebound/#';


/* Imported C functions */
let parseTemperature = ffi('char* returnTemperature(char*)');
let parseHumidity = ffi('char* returnHumidity(char*)');

// Configure UART at 115200 baud
UART.setConfig(uartNo, {
	baudRate: 115200,
	esp8266: {
		swapRxCtsTxRts: true,	//GPIO15 becomes TX instead of GPIO1, GPIO13 RX
	},
});



/* ESP module meta info */
let getInfo = function() {
	return JSON.stringify({
		"deviceId": deviceId,
		"total_ram": Sys.total_ram(),
		"free_ram": Sys.free_ram(),
		"uptime": Sys.uptime(),
		"t": Timer.now()
	});
};

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


MQTT.setEventHandler(function(conn, ev, evdata){
	if(ev === MQTT.EV_CONNACK) {
		isMQTTConnected = true;
		print("MQTT Connection Acknowledge:", JSON.stringify(ev));
	}
	if(ev === 214) {
		isMQTTConnected = false;
		print("MQTT DisConnection:", JSON.stringify(ev));
	}
}, null);


/*	Set Dispatcher callback that will be called whenever new Rx data or 
 *  space in the Tx buffer becomes available
 */
UART.setDispatcher(uartNo, function(uartNo, ud) {
	let ra = UART.readAvail(uartNo);
	let oa = UART.writeAvail(uartNo);
	if (ra > 0) {
		let rec = UART.read(uartNo);
		print("Received UART data:", rec);
			
		/* save first byte as ID, send rest of the string for parsing */


		let temp = parseTemperature(rec);
		print('Parsed temperature:', temp);
		let hum = parseHumidity(rec);
		print('Parsed humidity:', hum);		
		let msg = JSON.stringify({ "temperature": temp, "humidity": hum });
		print('Poruka za slanje:', msg);
		let ok = MQTT.pub(topicPub, msg, 1);
		print("Published: ", ok ? "yes" : "no", "Response", ok);
	}  
}, null);

// Enable Rx
UART.setRxEnabled(uartNo, true);
