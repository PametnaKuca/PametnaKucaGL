load('api_config.js');
//load('api_dht.js');
//load('api_mqtt.js');
load('api_sys.js');
load('api_timer.js');
load('api_uart.js');

let uartNo = 0;		//uart number
let rxAcc = '';		//accumulaterd Rx data, will be echoed back to Tx
let value = false;
//let topic = 'devices/' + Cfg.get('device.id') + '/messages/events/';
let RxPin = Cfg.get('app.RxPin');
let TxPin = Cfg.get('app.TxPin');


// Configure UART at 115200 baud
UART.setConfig(uartNo, {
	baudRate: 115200;
	esp8266: {
		gpio: {
			rx: RxPin;
			tx: TxPin;
		},
	},
});


/*	Set Dispatcher callback that will be called whenever new Rx data or 
 *  space in the Tx buffer becomes available
 */
UART.setDispatcher(uartNo, function(uartNo) {
	let ra = UART.readAvail(uartNo);
	if (ra > 0) {
		// Received new data: print it immediately to the console, and also
		// accumulate in the "rxAcc" variable which will be echoed back to UART later
		let data = UART.read(uartNo);
		print ('Received UART data:', data);
		rxAcc += data;
	}
}, null);

// Enable Rx
UART.setRxEnabled(uartNo, true);


// This function reads data from the DHT sensor every 2 second
Timer.set(1000 /* milliseconds */, true /* repeat */, function() {

  value = !value;
  let oa = UART.writeAvail(uartNo);
  print(Serial.write(uartNo, oa, oa.length));
  UART.write(
	uartNo,
	'Hello UART! '
		+ (value ? 'Tick' : 'Tock')
		+ ' uptime: ' + JSON.stringify(Sys.uptime())
		+ ' RAM: ' + JSON.stringify(Sys.free_ram())
		+ (rxAcc.length > 0 ? (' Rx: ' + rxAcc) : '')
		+ '\n'
  );
  rxAcc = '';

  /*
   * let msg = JSON.stringify({ temperature: dht.getTemp(), humidity: dht.getHumidity() });

   * let ok = MQTT.pub(topic, msg, 1);
   * print(ok, topic, '->', msg);
   */
}, null);

