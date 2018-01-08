load('defines.js');

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
		let rec = UART.read(uartNo);
		let size = getSize(rec);
		
		UART.write(uartNo, 'Received UART data:' + rec + '\r\n');
		UART.write(uartNo, 'Size:' + JSON.stringify(size) + '\r\n');

		/* Check if last byte(XOR) matches the message */
		if (checkIfValid(rec, size)){
			UART.write(uartNo, 'Message is valid!\r\n');

			let ID = getID(rec);
			UART.write(uartNo, 'ID:' + ID + '\r\n');

			let subID = getSubID(rec);
			UART.write(uartNo, 'SubID:' + subID + '\r\n');

			let conf = getConf(rec);
			UART.write(uartNo, 'Configuration:' + conf + '\r\n');
			
			let message = getMessage(rec, size);
			UART.write(uartNo, 'Message:' + message + '\r\n');
		}

		print("Received UART data:", rec);
		let temp = parseTemperature(rec);
		print('Parsed temperature:', temp);
		let hum = parseHumidity(rec);
		print('Parsed humidity:', hum);		
		let msg = JSON.stringify({ "temperature": temp, "humidity": hum });
		print('Poruka za slanje:', msg);
//		let ok = MQTT.pub(topic, msg, 1);
//		print("Published: ", ok ? "yes" : "no", "Response", ok);
	}  
}, null);

// Enable Rx
UART.setRxEnabled(uartNo, true);
