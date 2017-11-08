load('api_config.js');
load('api_mqtt.js');
load('api_sys.js');
load('api_timer.js');
load('api_uart.js');
load('api_net.js');
load('api_http.js');
load('api_rpc.js');

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
