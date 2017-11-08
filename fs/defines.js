load('api_config.js');
load('api_dht.js');
load('api_sys.js');
load('api_timer.js');
load('api_net.js');
load('api_http.js');
load('api_rpc.js');

let createPackage = ffi('char* createPackage(int, int, int, char*)');

/* ESP module meta info */
let getInfo = function() {
	return JSON.stringify({
		"deviceId": deviceId,
		"total_ram": Sys.total_ram(),
		"free_ram": Sys.free_ram(),
		"uptime": Sys.uptime(),
		"t": Timer.now()
	});
};

let pin = 14;
let dht = DHT.create(pin, DHT.DHT22);

let isConnected;
let deviceId = Cfg.get('device.id');
let ID = 0x04;
let subID = 0x02;
let conf = 1;


