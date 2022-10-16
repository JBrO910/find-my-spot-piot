import { config } from "dotenv";
import mqtt from "mqtt";
import { io } from "socket.io-client";

config();

const socket = io(
  `${process.env.SOCKET_SERVER_ADDRESS}/${process.env.GARAGE_ID}`
);

const mqttClient = mqtt.connect(process.env.MQTT_BROKER_ADDRESS);

mqttClient.on("connect", () => console.log("Connected to broker"));

const liveSpotTopic = "live-spot";
const registerTopic = "register";
[liveSpotTopic, registerTopic].forEach((topic) => {
  mqttClient.subscribe(
    topic,
    (err) => err && console.log(`ERROR listening to ${topic}`, err)
  );
});

const updateSpot = (message) => {
  const { id, status } = JSON.parse(message.toString());
  socket.emit("update", id, status);
};
const registerSpot = (message) => {
  const { id, localIdentifier, status } = JSON.parse(message.toString());
  socket.emit("register", id, localIdentifier, status);
};

const topics = {
  [liveSpotTopic]: updateSpot,
  [registerTopic]: registerTopic,
};

mqttClient.on("message", (topic, message) => {
  if (!(topic in topics)) {
    console.log(`No listener defined for ${topic}`);
    return;
  }
  topics[topic](message);
});
