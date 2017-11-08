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

/*  Start a TCP server with these settings.
 */
Net.serve({
	addr: 'tcp://80',
	onconnect: function(conn) {
		print('Connected from:', Net.ctos(conn, false, true, true));
	},
	ondata: function(conn, data){
		print('blabla');
		print('Received data from:', Net.ctos(conn, false, true, true), ':', data);
		Net.send(conn, data);            // Echo received data back
	 	//Net.discard(conn, data.length);  // Discard received data
	},
	//onevent: function(conn, data){
	//	print('Received event:', Net.ctos(conn, false, true, true), ':', data);
		//Net.send(conn, data);            // Echo received data back
	   	//Net.discard(conn, data.length);  // Discard received data
	//},
	onclose: function(conn){
		print("Disconnected!");
	},
});


/*  Handler function for MQTT connection. conn is an opaque connection handle,
 *  ev is an event number and edata is an event-specific data. Ev values could 
 *  be low-level network events like Net.EV_CLOSE or MQTT specific events like
 *  MQTT.EV_CONNACK.
 */
//MQTT.setEventHandler(function(conn, ev, evdata){
//	if(ev === MQTT.EV_CONNACK) {
//		isMQTTConnected = true;
//		print("MQTT Connection Acknowledge:", JSON.stringify(ev));
//	}
//	if(ev === 214) {
//		isMQTTConnected = false;
//		print("MQTT Disconnection:", JSON.stringify(ev));
//	}
//}, null);


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

//Timer.set(5*1000 /* milliseconds */, true /* repeat */, function(conn) {
	//RPC.call('http://192.168.4.1/rpc', 'SendData', {}, function(resp, ud){
	//	print('Response:', JSON.stringify(resp));
	//}, null);
	//print("tu sam");
	//HTTP.query({
	//	url: 'http://192.168.4.1',
	//	success: function(body, full_http_msg) { print(body); print(''); print(full_http_msg); },
	//	error: function(err) { print(err); },
	//});

//}, null);

RPC.addHandler('SendData', function(args){
	print('Argument: ', args.msg);
	return true;
});
