load('defines.js');

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

Net.connect({
	addr: 'tcp://192.168.4.1:80',	//[PROTO://]HOST:PORT
	onconnect: function(conn) {
		print("Conn: ", conn);
		print("Connected to:", Net.ctos(conn, false, true, true));
		Net.send(conn, getInfo());       // Echo received data back
		print('Data sent!');
	},
	onclose: function(conn){
		print("Disconnected!");
	},
});

Timer.set(5*1000 /* milliseconds */, true /* repeat */, function(conn) {

	if(isConnected){
		//print('Sending...:', msg);
		print('Getting HTTP request...');
		let temp = dht.getTemp();
		let hum = dht.getHumidity();
		let data = JSON.stringify(temp) + ',' + JSON.stringify(hum);
		print("Data: ", data);
		let msg = createPackage(ID, subID, conf, data);
		print("Message: ", msg);

		RPC.call('ws://192.168.4.1/rpc', 'SendData', {msg: JSON.stringify(msg)}, function(resp, ud){
			print('Send message: ', JSON.stringify(msg));
			print('Response:', JSON.stringify(resp));
		}, null);

		//HTTP.query({
		//	url: 'http://192.168.4.1',
		//	data: JSON.stringify(msg, '\r\n'),
		//	success: function(body, full_http_msg) { print("Great Success!"); },
		//	error: function(err) { print(err); },
		//});
	} 
}, null);

//RPC.addHandler('SendData', func(){
//	HTTP.query({
//		url: 'http://192.168.4.1/rpc',
//		data: JSON.stringify({ temperature: dht.getTemp(), humidity: dht.getHumidity//() });,
//		success: function(body, full_http_msg) { print(body); },
//		error: function(err) { print(err); },
//	});
//});
