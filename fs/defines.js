load('api_config.js');
//load('api_dht.js');
load('api_mqtt.js');
load('api_sys.js');
load('api_timer.js');
load('api_uart.js');
load('api_net.js');
load('api_wifi.js');


/* Other defines */
let uartNo = 0;		//uart number
let isConnected = false;
//let isMQTTConnected = false;

//let deviceId = Cfg.get('device.id');
//let topic = 'devices/' + deviceId + '/messages/events/';

/* Imported C functions */
let parseTemperature = ffi('char* returnTemperature(char*)');
let parseHumidity = ffi('char* returnHumidity(char*)');

let checkIfValid = ffi('int checkIfValid(char*, int)');
let getSize = ffi('int getSize(char*)');
let getID = ffi('char* getID(char*)');
let getSubID = ffi('char* getSubID(char*)');
let getConf = ffi('char* getConf(char*)');
let getMessage = ffi('char* getMessage(char*, int)');

// Configure UART at 115200 baud
UART.setConfig(uartNo, {
	baudRate: 115200,
//	esp8266: {
//		swapRxCtsTxRts: true,	//GPIO15 becomes TX instead of GPIO1, GPIO13 RX
//	},
});
