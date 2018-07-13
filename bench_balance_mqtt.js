
const net = require('net');
const EventEmitter = require('events');

///////////////////////////////////////////////////////////////////////////////

const host = process.argv[2];
const n = process.argv[3];
const c = process.argv[4];


///////////////////////////////////////////////////////////////////////////////

const CONNECT = Buffer.from([

  // fixed header:
  0x10, // CONNECT
  0x2c, // remaining length (44 bytes)

  // variable header:
  0x00, 0x06, // protocol name length
  0x4d, 0x51, 0x49, 0x73, 0x64, 0x70, // protocol name "MQIsdp"
  0x03, // mqtt protocol version 3
  0x80 | 0x40 | 0x01 , // connect flags (username, password, clean session)
  0x00, 0x3c, // keep alive timer: 60s

  // payload
  0x00, 0x0b, // client id length
  0x48, 0x49, 0x4d, 0x51, 0x54, 0x54, 0x2d, 0x54, 0x65, 0x73, 0x74, // client id "HIMQTT-Test"

  0x00, 0x07, // username "cdupont" (length: 7)
  0x63, 0x64, 0x75, 0x70, 0x6f, 0x6e, 0x74,

  0x00, 0x08, // password "password" (length: 8)
  0x70, 0x61, 0x73, 0x73, 0x77, 0x6f, 0x72, 0x64
]);

const CONNACK = Buffer.from([

  // fixed header:
  0x20, // CONNACK
  0x02, // remaining length (2 bytes)

  // variable header:
  0x00, 0x00, // return code 0 (Connection Accepted)
]);


var TOPIC = Buffer.from("Sensor2-ea0541de1ab7132a1d45b85f9b2139f5/TC2");
var DATA = Buffer.from("32");

var PUBLISH = Buffer.from([

  // fixed header:
  0x30, // PUBLISH (qos 0)
  TOPIC.length+DATA.length+2,

  // variable header:
  0x00, TOPIC.length, // topic name length
  ...TOPIC,

  ...DATA
]);



function connect(cb) {

  var conn = new net.Socket();
  conn.connect("1883", host, () => {

    conn.write(CONNECT);

    conn.once('data', (data) => {

      if(!data.equals(CONNACK)) {
        console.error(`[MQTT ] Error: Unexpected CONNACK message!\nExpected:`, CONNACK, `\nFound:`, data);
        process.exit(1);
      } else {
        console.log(`[MQTT ] Connected. (recieved CONNACK)`);
        cb(conn);
      }
    });
  });
}


var count = n;

connect((conn) => {

  const begin = new Date().getTime();

  var count = n;

  send = () => {

    count--;
    var drained = conn.write(PUBLISH);

    if(count > 0) {

      if(drained) send();
    } else {

      conn.end();
    }
  }

  send();

  conn.on('drain', () => {

    if(n > 0) send();
  });

  conn.on('close', () => {

    const end = new Date().getTime();
    console.log(`Time ellapsed: ${end-begin}ms.`);
  });
});

/*

var payload = Buffer.alloc(1024);
for(var i=0; i<1024; i++)
  payload[i] = Math.random() * 0xff;

var PUBLISH = Buffer.concat([head, payload]);

//

var SUBSCRIBE = Buffer.from([

  // fixed header:
  0x82, // SUBSCRIBE (qos 1)
  0x08, // remaining length (8 bytes)

  // variable header:
  0x12, 0x34, // message id

  0x00, 0x03, // topic name length
  0x61, 0x2f, 0x62, // topic "a/b"
  0x00 // qos 0
]);


var SUBACK = Buffer.from([

  // fixed header:
  0x90, // SUBACK
  0x03, // remaining length (4 bytes)

  // variable header:
  0x12, 0x34, // message id

  // payload:
  0x00 // granted qos (0)
]);


///////////////////////////////////////////////////////////////////////////////


module.exports = (config, test) => {

  var begin;

  //

  var subscriber = new MQTT(config)

  subscriber.on('close', (err) => test.exit(err));

  subscriber.connect(() => {

    subscriber.write(SUBSCRIBE);
    subscriber.once('data', (data) => {

      if(!data.equals(SUBACK)) {

        console.error(`[MQTT ] Error: Unexpected SUBACK message!\nExpected:`, SUBACK, `\nFound:`, data);
        test.fail();
      } else {

        console.log(`[MQTT ] Subscribed. (recieved SUBACK)`);


        var count = config.c || config.count || 100;
        var preload = config.l || config.preload || 10;
        console.log(`[Bench] Network: single publisher -> single subscriber`);
        console.log(`[Bench] Sending ${ count } packages, ${ preload } concurrent ..`);

        var pending = 0;

        var total = count*(8+1024);
        var recieved = 0;
        var n = 0;

        subscriber.on('data', (data) => {

          recieved += data.length;
          total -= data.length;
          while(recieved > (8+1024)) {
            recieved -= 8+1024;
            pending--;
            // process.stdout.write('\b \b');

            if(++n >= count) {

              var end = process.hrtime();
              var delta = (end[0]-begin[0])*1e3+(end[1]-begin[1])/1e6;

              console.log(`[Bench] Completed.`);
              console.log(`[Bench] Time delta: ${ delta } ms`);
              console.log(`[Bench] Msg/Sec: ${ count/delta*1e3 } Msg/s`);

              test.complete();
              return
            }
          }

          if(pending<preload) {
            publisher.write(PUBLISH);
            // process.stdout.write('.');
            pending++;
          }
        });

        //

        var publisher = new MQTT(config)

        publisher.on('close', (err) => test.exit(err));

        publisher.connect(() => {

          console.log(`[Bench] Please wait ..`);

          begin = process.hrtime();

          while(pending<preload) {
            publisher.write(PUBLISH);
            // process.stdout.write('.');
            pending++;
          }
        });




        //

        // test.complete();
      }
    });
  });
}*/
