load('api_config.js');
load('api_dht.js');
load('api_mqtt.js');
load('api_sys.js');
load('api_timer.js');

let topic = 'devices/' + Cfg.get('device.id') + '/messages/events/';
//let RXpin = Cfg.get('app.RXpin');
//let TXpin = Cfg.get('app.TXpin');
let pin = 14;

// Initialize DHT library
let dht = DHT.create(pin, DHT.DHT22);

// This function reads data from the DHT sensor every 2 second
Timer.set(1000 /* milliseconds */, true /* repeat */, function() {

  if (isNaN(h) || isNaN(t)) {
    print('Failed to read data from sensor');
    return;
  }

  let msg = JSON.stringify({ temperature: dht.getTemp(), humidity: dht.getHumidity() });

  let ok = MQTT.pub(topic, msg, 1);
  print(ok, topic, '->', msg);
}, null);

