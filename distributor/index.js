import { config } from "dotenv";
import mqtt from "mqtt";
import { io } from "socket.io-client";

config();

const socket = io(
  `${process.env.SOCKET_SERVER_ADDRESS}/${process.env.GARAGE_ID}`
);

const updateSpot = (message) => {
  const { id, status } = JSON.parse(message.toString());
  socket.emit("update", id, parseInt(status));
};
const registerSpot = (message) => {
  const { id, localIdentifier, x, y, z } = JSON.parse(message.toString());
  socket.emit("register", id, localIdentifier, x, y, z);
};

if (process.env.USE_MOCK) {
  console.log("Starting Demo");
  const sleep = async (time) =>
    new Promise((resolve) => setTimeout(resolve, time));

  const maxX = 10,
    maxY = 5,
    maxZ = 3;
  const ignorePattern = [0, 1, 2].flatMap((z) =>
    [1, 3].flatMap((y) =>
      Array.from({ length: 8 }).map((_, i) => `spot-${2 + i}${y}${z}`)
    )
  );
  ignorePattern.push(
    ...[0, 1, 2].flatMap((z) =>
      Array.from({ length: 8 }).map((_, y) => `spot-${1}${y}${z}`)
    )
  );

  const run = async () => {
    const states = {}

    for (let x = 0; x < maxX; x++) {
      for (let y = 0; y < maxY; y++) {
        for (let z = 0; z < maxZ; z++) {
          const idNumber = x * 100 + y * 10 + z;
          const id = `spot-${String(idNumber).padStart(3, "0")}`;

          if (ignorePattern.includes(id)) {
            break;
          }
          states[id] = 0
          registerSpot(JSON.stringify({ id, x, y, z }));
        }
      }
    }

    // TODO REDUCE AMOUNT OF CALLS

    console.log("Registered all");
    await sleep(5000);
    console.log("Starting Simulation");
    const timeBetween = 4000
    const chanceToSkip = 0.8

    for (let run = 0; run <= 10; run++) {
      console.log("RUN")
      for (let x = 0; x < maxX; x++) {
        for (let y = 0; y < maxY; y++) {
          for (let z = 0; z < maxZ; z++) {
            if (Math.random() <= chanceToSkip) {
              continue;
            }

            const idNumber = x * 100 + y * 10 + z;
            const id = `spot-${String(idNumber).padStart(3, "0")}`

            if (ignorePattern.includes(id)) {
              break;
            }
            const status = +(!states[id]);
            states[id] = status

            setTimeout(() => {
              console.log("UPDATE", id, status)
              updateSpot(
                JSON.stringify({
                  id,
                  status,
                })
              );
            }, Math.random() * timeBetween)
          }
        }
      }

      await sleep(timeBetween);
    }
  };

  run().then(() => console.log("Demo is done"));
} else {
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

  const topics = {
    [liveSpotTopic]: updateSpot,
    [registerTopic]: registerSpot,
  };

  mqttClient.on("message", (topic, message) => {
    if (!(topic in topics)) {
      console.log(`No listener defined for ${topic}`);
      return;
    }
    console.log(topic, JSON.parse(message.toString()));
    topics[topic](message);
  });
}
