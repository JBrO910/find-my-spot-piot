import mqtt from 'mqtt'
import { Log } from './logger'
import {
    emitKeepAliveSpot,
    listenToLoadSpots,
    emitLoadSpots,
    emitUpdateSpot,
    mqttParseMessage,
    listenToBlinkMaintain,
    listenToMeasureMaintain,
    emitResultOfMeasureMaintain,
    listenToRegisterMaintain, listenToTurnOnMaintain, listenToTurnOffMaintain,
} from './socket'
import {
    BLINK,
    KEEP_ALIVE,
    MEASURE,
    MEASURE_RESPONSE,
    RECEIVE_ID,
    REQUEST_ID,
    REQUEST_ID_RESPONSE, TURN_OFF, TURN_ON,
    UPDATE_SPOT,
} from './topics'
import { sleep } from './utils'

// ? Sleep time defaults to 10 seconds
export default function setupMQTTBroker(registerSleepTime=1000 * 10) {
    const mqttClient = mqtt.connect(process.env.MQTT_BROKER_ADDRESS);

    let isRegistering = false
    const registeredSpots = []
    const topics = {
        [MEASURE_RESPONSE]: mqttParseMessage(emitResultOfMeasureMaintain),
        [UPDATE_SPOT]: mqttParseMessage(emitUpdateSpot),
        [KEEP_ALIVE]: mqttParseMessage(emitKeepAliveSpot),
        [REQUEST_ID_RESPONSE]: mqttParseMessage(({ spots }) => {
            Log.trace("Register spot", spots);
            registeredSpots.push(...spots);
        }),
    };

    mqttClient.on("connect", () => {
        Log.info("Connected to MQTT Client")

        listenToLoadSpots(async () => {
            if(isRegistering) {
                Log.warn("Register process was already started")
                return
            }
            isRegistering = true
            registeredSpots.length = 0  // Clear array

            Log.info("Loading Spots requested")
            mqttClient.publish(REQUEST_ID, "{}")

            await sleep(registerSleepTime)

            Log.trace(`Register ${registeredSpots.length} spots`)
            emitLoadSpots(registeredSpots)
            isRegistering = false
        })

        // TODO Listen to spots registered

        // TODO Think about turn off

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
        listenToRegisterMaintain((spots) => {
            Log.trace("Register requested for", spots)
            mqttClient.publish(RECEIVE_ID, JSON.stringify({spots}))
        })

        Object.keys(topics).forEach((topic) => {
            Log.trace(`Listen to topic "${topic}"`)
            mqttClient.subscribe(
                topic,
                (err) => err && Log.error(`Topic "${topic}" failed with`, err)
            );
        });
    });

    mqttClient.on("message", (topic, message) => {
        if (!(topic in topics)) {
            Log.tag("GotMessage").warn(`No listener defined for ${topic}`)
            return;
        }
        Log.tag("GotMessage").trace(topic, JSON.parse(message.toString()))

        topics[topic](message);
    });
}
