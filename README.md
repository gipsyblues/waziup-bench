# Waziup Benchmarks

All benchmarks depend on client and server configuration, software and hardware!


## HTTP (API-Server)

```bash
node bench_http "http://dev.waziup.io" 1000 8
```

Uploads single temperature values to [Sensors/Measurements/Values](http://dev.waziup.io/docs/#/Sensors/post_domains__domain__sensors__sensor_id__measurements__measurement_id__values).

Outputs detailed request-times to *results.json*.

Param | Description | Example
------|-------------|-----------
URL   | Waziup API server | http://dev.waziup.io
Total Requests | Total number of requests | 1000
Concurrent Requests | Number of parallel requests | 8


## MQTT

```bash
node bench_mqtt "dev.waziup.io" 1000
```

Connects to the mqtt server and PUBLISH single values for a sensor.

Measures the time from the first package to TCP-connection closing and all packages arrived at the server.

Sender Action | Control Packet | Receiver Action
--------------|----------------|-------------------
PUBLISH QoS 0, DUP=0 | ----> |
 | | Deliver Application Message to appropriate onward recipient(s)

```bash
node bench_mqtt_q1 "dev.waziup.io" 1000
```

Sends PUBLISH packages and waits for PUBACK from the server. The test completes when all PUBACK packages arrived.

Sender Action | Control Packet | Receiver Action
--------------|----------------|-------------------
Send PUBLISH QoS 1, DUP 0, [Packet Identifier] |  ----> |
 | | Initiate onward delivery of the Application Message
 | <---- | Send PUBACK [Packet Identifier]
Discard message | |

```bash
node bench_mqtt_q2 "dev.waziup.io" 1000
```

Does a full QoS 2 PUBSLISH, PUBREC, PUBREL, PUBCOMP communication.

Sender Action | Control Packet | Receiver Action
--------------|----------------|-------------------
PUBLISH QoS 2, DUP 0 [Packet Identifier] | ----> |
 | | Store [Packet Identifier] then Initiate onward delivery of the Application Message
 | <---- | PUBREC [Packet Identifier]
Discard message, Store PUBREC received [Packet Identifier] | |
PUBREL [Packet Identifier] | ----> |
 | | Discard [Packet Identifier]
 | <---- | Send PUBCOMP [Packet Identifier]
Discard stored state | |
