load('defines.js');

//Net.setStatusEventHandler(function(ev, arg){
//	print("Wifi Event:", ev);
//	if(ev === Net.STATUS_DISCONNECTED) {
//		print("Wifi DISCONNECTED - Event time:", Timer.now());
//		isConnected = false;
//	}
//	if(ev === Net.STATUS_CONNECTING) {
//		print("Wifi CONNECTING - Event time:", Timer.now());
//		isConnected = false;
//	}
//	if(ev === Net.STATUS_CONNECTED) {
//		print("Wifi CONNECTED - Event time:", Timer.now());
//		isConnected = true;
//	}
//	if(ev === Net.STATUS_GOT_IP) {
//		print("Device got IP - Event time:", Timer.now());
//		isConnected = true;
//	}
//}, null);


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
	//print('ra:', ra);
	let oa = UART.writeAvail(uartNo);
	//print('Neki kurac');
	if (ra > 0) {
		// Received new data: print it immediately to the console, and also
		// accumulate in the "rxAcc" variable which will be echoed back to UART later
		let rec = UART.read(uartNo);
		let size = getSize(rec);
		
		//UART.write(uartNo, 'Received UART data:' + data + '\r\n');
		print('');
		print('Received UART data:', rec);
		print('Size is:', size);
		//let pack = parsePackage(rec);
		//print('Parsed data:', pack);

		/* Check if last byte(XOR) matches the message */
		if (checkIfValid(rec, size)){
			print('Message is valid!');

			let ID = getID(rec);
			print('ID:', ID);

			let subID = getSubID(rec);
			print('SubID:', subID);

			let conf = getConf(rec);
			print('Configuration:', conf);
			
			let message = getMessage(rec, size);
			print('Message:', message);
		}

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
