const http = require('http');
const fs = require('fs');


////////////////////////////////////////////////////////////////////////////////


if(process.argv.length != 5) {

  console.info('Usage: bench_http {host} {number} {concurrency}');
  console.info('Example: bench_http "http://dev.waziup.io" 1000 8');
  console.info('Output: results.json');
  process.exit();
}

const host = process.argv[2];
const n = process.argv[3];
const c = process.argv[4];

////////////////////////////////////////////////////////////////////////////////


const postData = JSON.stringify({
  username: 'cdupont',
  password: 'password'
});

const options = {
  hostname: host,
  port: 80,
  path: '/api/v1/auth/token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

var token = ""

const req = http.request(options, (res) => {

  if(res.statusCode != 200) {
    console.error(`ERROR /auth/token failed: Status ${res.statusCode}`);
  }

  res.on('data', (chunk) => {
    if(res.statusCode != 200) {
      console.error(chunk.toString('utf8'));
    } else {
      token += chunk;
    }
  });
  res.on('end', () => {
    if(res.statusCode != 200) {
      process.exit(1);
    } else {
      console.log('AUTH /auth/token successful.');
      benchmark();
    }
  });
});

req.on('error', (e) => {
  console.error(`ERROR: ${e.message}`);
});

req.write(postData);
req.end();


////////////////////////////////////////////////////////////////////////////////

function benchmark() {

  const begin = new Date().getTime();
  var times = new Array(counter);
  var counter = n;

  runner = () => {

    const start = new Date().getTime();
    singlePost(() => {

      counter--
      const stop = new Date().getTime();
      times[counter] = stop-start;

      if(counter == 0) {

        const end = new Date().getTime();
        console.log(`Time ellapsed: ${end-begin}ms.`);
        fs.writeFileSync('results.json', JSON.stringify(times))
        process.exit(1);
      } else {
        runner();
      }
    });
  }

  console.log('Bench!');
  for(var m=0; m<c; m++)
    runner();
}



function singlePost(cb) {



  const postData = JSON.stringify({
    value: '[25.6]',
    timestamp: '2016-06-08T18:20:27.873Z'
  });

  const options = {
    hostname: host,
    port: 80,
    path: '/api/v1/domains/waziup/sensors/Sensor2-ea0541de1ab7132a1d45b85f9b2139f5/measurements/TC1/values',
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {

    if(res.statusCode != 200) {
      console.error(`ERROR /api/v1/domains/../sensors/../measurements/../values failed: Status ${res.statusCode}`);
    }

    res.on('data', (chunk) => {
      if(res.statusCode != 200) {
        console.error(chunk.toString('utf8'));
      }
    });
    res.on('end', () => {
      if(res.statusCode != 200) {
        process.exit(1);
      } else {
        cb();
      }
    });
  });

  req.on('error', (e) => {
    console.error(`ERROR: ${e.message}`);
  });

  req.write(postData);
  req.end();
}
