load('api_config.js');
load('api_mqtt.js');
load('api_sys.js');
load('api_timer.js');
load('api_uart.js');
load('api_net.js');
load('api_http.js');
load('api_rpc.js');

/* ID values */
let dhtId = 0x3E;
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
let removeQuotation = ffi('char* removeQuotationESP(char*)');
let parseTemperature = ffi('char* returnTemperatureESP(char*)');
let parseHumidity = ffi('char* returnHumidityESP(char*)');
let returnChar = ffi('char* returnChar(int)');

let checkIfValid = ffi('int checkIfValidESP(char*, int)');
let getSize = ffi('int getSizeESP(char*)');
let getID = ffi('char* getIDESP(char*)');
let getSubID = ffi('char* getSubIDESP(char*)');
let getConf = ffi('char* getConfESP(char*)');
let getMessage = ffi('char* getMessageESP(char*, int)');
