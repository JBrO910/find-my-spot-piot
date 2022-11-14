// import { config } from "dotenv";
// import setupMockBroker from "./MockBroker";
// import setupMQTTBroker from "./MQTTBroker";
//
// config();
//
// const useMock = ["--mock", "-m"].some((flag) => process.argv.includes(flag));
// const useRegister = ["--register", "-r"].some((flag) =>
//   process.argv.includes(flag)
// );
//
// if (useMock) {
//   setupMockBroker(useRegister);
// } else {
//   setupMQTTBroker();
// }

const mqtt = require('mqtt')
const client  = mqtt.connect('mqtt://192.168.218.111')

client.on('connect', function () {
  client.subscribe('presence', function (err) {
    if (!err) {
      client.publish('presence', 'Hello mqtt')
    }
  })
})

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
  client.end()
})
