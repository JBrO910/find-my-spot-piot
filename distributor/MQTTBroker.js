import axios from "axios";
import mqtt from "mqtt";
import { Log } from "./logger";
import {
    emitKeepAliveSpot,
    emitLoadSpots,
    emitResultOfMeasureMaintain,
    emitResultOfReadCard,
    emitUpdateSpot,
    listenToBlinkMaintain,
    listenToLoadSpots,
    listenToMeasureMaintain,
    listenToReadCard,
    listenToRegisterMaintain,
    listenToTurnOffMaintain,
    listenToTurnOnMaintain,
    mqttParseMessage,
} from "./socket";
import {
    BLINK,
    CARD_REGISTER,
    CARD_REGISTER_RESPONSE,
    GATE_SEND_UID,
    GATE_SEND_UID_RESPONSE,
    KEEP_ALIVE,
    MEASURE,
    MEASURE_RESPONSE,
    RECEIVE_ID,
    REQUEST_ID,
    REQUEST_ID_RESPONSE,
    TURN_OFF,
    TURN_ON,
    UPDATE_SPOT,
} from "./topics";
import { sleep } from "./utils";

let instance = axios.create({
    baseURL:
        process.env.SOCKET_SERVER_ADDRESS +
        "/parkingSession/" +
        process.env.GARAGE_ID +
        "/toggleSession",
    withCredentials: false,
});

// ? Sleep time defaults to 10 seconds
export default function setupMQTTBroker(registerSleepTime = 1000 * 10) {
    const mqttClient = mqtt.connect(process.env.MQTT_BROKER_ADDRESS);

    let isRegistering = false
    const registeredSpots = []
    const registeredGates = []
    const topics = {
        [MEASURE_RESPONSE]: mqttParseMessage(emitResultOfMeasureMaintain),
        [UPDATE_SPOT]: mqttParseMessage(emitUpdateSpot),
        [KEEP_ALIVE]: mqttParseMessage(emitKeepAliveSpot),
        [CARD_REGISTER_RESPONSE]: mqttParseMessage(emitResultOfReadCard),
        [REQUEST_ID_RESPONSE]: mqttParseMessage(async ({type, data}) => {
            if (type === "spots") {
                Log.trace("Register spots", data);
                registeredSpots.push(...data);
            } else if (type === "gate") {
                Log.trace("Register gate", data);
                registeredGates.push(data);
                await sleep(1000)
                mqttClient.publish(RECEIVE_ID, JSON.stringify({spots: [], gates: registeredGates}));
            }
        }),
        [GATE_SEND_UID]: mqttParseMessage(({uid, muid}) => {
            Log.trace("Gate read card with id", uid)
            instance.post("/", {cardID: uid})
                .then(res => console.log(res.data))
                .catch(err => console.log("AXIOS ERROR", err))

            const data = {
                muid,
                access: !!Math.round(Math.random())
            }
            mqttClient.publish(GATE_SEND_UID_RESPONSE, JSON.stringify(data))
        }),
    };

    mqttClient.on("connect", () => {
        Log.info("Connected to MQTT Client")

        listenToReadCard(() => {
            Log.trace("Register card request send")
            mqttClient.publish(CARD_REGISTER, "{}")
        })

        listenToLoadSpots(async () => {
            if (isRegistering) {
                Log.warn("Register process was already started")
                return
            }
            isRegistering = true
            registeredSpots.length = 0  // Clear array
            registeredGates.length = 0  // Clear array

            Log.info("Loading Spots requested")
            mqttClient.publish(REQUEST_ID, "{}")

            await sleep(registerSleepTime)

            Log.trace(`Register ${ registeredSpots.length } spots`)
            Log.trace(`Register ${ registeredGates.length } gates`)
            // TODO Emit gates as well
            emitLoadSpots(registeredSpots)
            isRegistering = false
        })

        listenToBlinkMaintain((id) => {
            Log.trace("Blink requested for", id)
            mqttClient.publish(BLINK, JSON.stringify({id}))
        })
        listenToMeasureMaintain((id) => {
            Log.trace("Measure requested for", id)
            mqttClient.publish(MEASURE, JSON.stringify({id}))
        })
        listenToTurnOnMaintain((id) => {
            Log.trace("Turn on", id)
            mqttClient.publish(TURN_ON, JSON.stringify({id}))
        })
        listenToTurnOffMaintain((id) => {
            Log.trace("Turn off", id)
            mqttClient.publish(TURN_OFF, JSON.stringify({id}))
        })
        listenToRegisterMaintain(({spots, gates}) => {
            Log.trace("Register requested for", spots, gates);
            mqttClient.publish(RECEIVE_ID, JSON.stringify({spots, gates}));
        });

        Object.keys(topics)
            .forEach((topic) => {
                Log.trace(`Listen to topic "${ topic }"`)
                mqttClient.subscribe(
                    topic,
                    (err) => err && Log.error(`Topic "${ topic }" failed with`, err)
                );
            });
    });

    mqttClient.on("message", (topic, message) => {
        if (!(topic in topics)) {
            Log.tag("GotMessage")
                .warn(`No listener defined for ${ topic }`)
            return;
        }
        Log.tag("GotMessage")
            .trace(topic, JSON.parse(message.toString()))

        topics[topic](message);
    });
}
