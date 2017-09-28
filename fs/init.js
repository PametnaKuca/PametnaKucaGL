load('api_config.js');
load('api_mqtt.js');
load('api_sys.js');
load('api_timer.js');
load('api_uart.js');
load('api_net.js');

/* ID values */
let dhtId = 0x01;
let mapInitId = 0x02;
let mapChangeId = 0x03;
let rfidAddId = 0x04;

let uartNo = 0;		//uart number
let baud = 115200;

let isConnected = false;
let isMQTTConnected = false;

let deviceId = Cfg.get('device.id');
let topicPub = 'devices/' + deviceId + '/messages/events/';
let qos = 1;

/* Imported C functions */
let parseTemperature = ffi('char* returnTemperature(char*)');
let parseHumidity = ffi('char* returnHumidity(char*)');

// Configure UART at 115200 baud
UART.setConfig(uartNo, {
	baudRate: baud,
	esp8266: {
		swapRxCtsTxRts: true,	//GPIO15 becomes TX instead of GPIO1, GPIO13 RX
	},
});

/*  Start a TCP server with these settings.
 */
Net.serve({
	addr: 'tcp://1234',
	onconnect: function(conn) {
		print("Connected from:", conn);
	},
	ondata: function(conn, data){
		print('Received from:', Net.ctos(conn, false, true, true), ':', data);
		Net.send(conn, data);            // Echo received data back
	   	Net.discard(conn, data.length);  // Discard received data
	},
	onclose: function(conn){
		print("Disconnected!");
	},
});


/*  Handler function that receives 4 different events: Net.STATUS_DISCONNECTED,
 *  Net.STATUS_CONNECTING, Net.STATUS_CONNECTED and Net.STATUS_GOT_IP.
 */
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

/*  Handler function for MQTT connection. conn is an opaque connection handle,
 *  ev is an event number and edata is an event-specific data. Ev values could 
 *  be low-level network events like Net.EV_CLOSE or MQTT specific events like
 *  MQTT.EV_CONNACK.
 */
MQTT.setEventHandler(function(conn, ev, evdata){
	if(ev === MQTT.EV_CONNACK) {
		isMQTTConnected = true;
		print("MQTT Connection Acknowledge:", JSON.stringify(ev));
	}
	if(ev === 214) {
		isMQTTConnected = false;
		print("MQTT Disconnection:", JSON.stringify(ev));
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
		/* TODO */

		let temp = parseTemperature(rec);
		print('Parsed temperature:', temp);
		let hum = parseHumidity(rec);
		print('Parsed humidity:', hum);		
		let msg = JSON.stringify({ "temperature": temp, "humidity": hum });
		print('Poruka za slanje:', msg);
		let ok = MQTT.pub(topicPub, msg, qos);
		print("Published: ", ok ? "yes" : "no", "Response", ok);
	}  
}, null);

// Enable Rx
UART.setRxEnabled(uartNo, true);
