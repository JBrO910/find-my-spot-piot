import mqtt from 'mqtt'
import { Log } from './logger'
import {
    emitKeepAliveSpot,
    listenToLoadSpots,
    emitLoadSpots,
    emitUpdateSpot,
    mqttToSocketEmit,
} from './socket'
import { KEEP_ALIVE, REQUEST_ID, REQUEST_ID_RESPONSE, UPDATE_SPOT } from './topics'
import { sleep } from './utils'

// ? Sleep time defaults to 10 seconds
export default function setupMQTTBroker(registerSleepTime=1000 * 10) {
    const mqttClient = mqtt.connect(process.env.MQTT_BROKER_ADDRESS);

    const registeredSpots = []
    const topics = {
        [UPDATE_SPOT]: mqttToSocketEmit(emitUpdateSpot),
        [KEEP_ALIVE]: mqttToSocketEmit(emitKeepAliveSpot),
        [REQUEST_ID_RESPONSE]: (message) => {
            const { spots } = JSON.parse(message.toString());

            Log.trace("Register spot", spots);
            registeredSpots.push(...spots);
        },
    };

    mqttClient.on("connect", () => {
        Log.info("Connected to MQTT Client")

        mqttClient.publish(REQUEST_ID_RESPONSE, '{"spots":[1]}')

        listenToLoadSpots(async () => {
            // TODO Block requests while setup is currently running and if it is already setup
            Log.info("Loading Spots requested")
            const requestTime = new Date()
            mqttClient.publish(REQUEST_ID, requestTime.toLocaleString())

            await sleep(registerSleepTime)

            Log.trace(`Register ${registeredSpots.length} spots`)
            emitLoadSpots(registeredSpots)
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
            Log.tag("onMessage").warn(`No listener defined for ${topic}`)
            return;
        }
        Log.tag("onMessage").trace(topic, JSON.parse(message.toString()))

        topics[topic](message);
    });
}
