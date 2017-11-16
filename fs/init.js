load('defines.js');

// Configure UART at 115200 baud
//UART.setConfig(uartNo, {
//	baudRate: baud,
//	esp8266: {
//		swapRxCtsTxRts: true,	//GPIO15 becomes TX instead of GPIO1, GPIO13 RX
//	},
//});


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

/*  Start a TCP server on port 80 with these settings. IP: 192.168.4.1
 */
Net.serve({
	addr: 'tcp://80',
	onconnect: function(conn) {
		print('Connected from:', Net.ctos(conn, false, true, true));
	},
	ondata: function(conn, data){
		print('Received data from:', Net.ctos(conn, false, true, true), ':', data);
	},
	onclose: function(conn){
		print("Disconnected!");
	},
});


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
//UART.setDispatcher(uartNo, function(uartNo, ud) {
//	let ra = UART.readAvail(uartNo);
//	let oa = UART.writeAvail(uartNo);
//	if (ra > 0) {
//		let rec = UART.read(uartNo);
//		print("Received UART data:", rec);
//			
//		/* save first byte as ID, send rest of the string for parsing */
//		/* TODO */
//
//		let temp = parseTemperature(rec);
//		print('Parsed temperature:', temp);
//		let hum = parseHumidity(rec);
//		print('Parsed humidity:', hum);		
//		let msg = JSON.stringify({ "temperature": temp, "humidity": hum });
//		print('Poruka za slanje:', msg);
//		let ok = MQTT.pub(topicPub, msg, qos);
//		print("Published: ", ok ? "yes" : "no", "Response", ok);
//	}  
//}, null);

// Enable Rx
//UART.setRxEnabled(uartNo, true);


/*  RPC handler function used for communicating with slave ESP-s over websocket
 *  Slaves call function "SendData" with arguments args. This function then
 *	checks if received message is valid and parses all data that is sent - ID,
 *	subID, configuration and data message.
 *	Afterwards, if ID matches a certain sensor, it parses data message depending on
 *	what is sent and publishes data to MQTT server.
 *
 *	*NOTE* If adding more sensors than DHT22, we need to add another check
 *	for ID and do another action accordingly
 */
RPC.addHandler('SendData', function(args){
	print('Argument: ', args.msg);

	let recData = removeQuotation(args.msg);
	let size = getSize(recData);
	print('Size:', size);

	/* Check if last byte(XOR) matches the message */
	if (checkIfValid(recData, size)){
		print(uartNo, 'Message is valid!');

		let ID = getID(recData);
		print('ID:', ID);
		print('Recquired ID: ', returnChar(dhtId));

		let subID = getSubID(recData);
		print('SubID:', subID);

		let conf = getConf(recData);
		print('Configuration:', conf);
			
		let message = getMessage(recData, size);
		print('Message:', message);
		print(' ');

		if(ID === returnChar(dhtId)){
			print('Received temperature and humidity data!');
			let temp = parseTemperature(message);
			print('Parsed temperature:', temp);
			let hum = parseHumidity(message);
			print('Parsed humidity:', hum);		
			let msg = JSON.stringify({ "temperature": temp, "humidity": hum });
			print('Poruka za slanje:', msg);
			let ok = MQTT.pub(topicPub, msg, qos);
			print("Published: ", ok ? "yes" : "no", "Response", ok);
		}
	}
	return true;
});
