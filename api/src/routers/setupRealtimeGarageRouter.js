import GarageController from '../controllers/GarageController.js'
import LiveSpotController from '../controllers/LiveSpotController.js'
import SpotController from '../controllers/SpotController.js'
import LiveSpot from '../models/LiveSpot.js'
import Spot from '../models/Spot.js'
import { Log } from '../utils/logger.js'

export default (io) => {
    const garageController = new GarageController()
    const liveSpotController = new LiveSpotController()
    const spotController = new SpotController()

    const setupGarage = (garage) => {
        const LOG_TAG = `Garage[${ garage.id }]`

        const garageConsumerSockets = io.of(`/${ garage.id }`)
        const garageBrokerSocket = io.of(`/${ garage.id }-broker`)
        const garageRegisterSocket = io.of(`/${ garage.id }-register`)

        const registerSpot = (spot) => {
            const newSpot = new Spot(
                garage.id,
                spot.localIdentifier ?? spot.id,
                spot.x,
                spot.y,
                spot.z,
                spot.type,
                spot.id,
            )
            Log.tag(LOG_TAG)
                .trace('Adding Spot to the database', newSpot.serialised)
            spotController.setSpot(newSpot)
            const newLiveSpot = new LiveSpot(1 /* Occupied */, garage.id, newSpot.id)
            Log.tag(LOG_TAG)
                .trace(
                    'Adding LiveSpot to the database',
                    newLiveSpot.serialised,
                )
            liveSpotController.setLiveSpot(newLiveSpot)
        }

        const registerLevelDescription = (levelDescription) => {
            garage.levelDescription = levelDescription
            Log.tag(LOG_TAG)
                .trace(
                    'Adding LevelDescription to the garage',
                    garage.serialised,
                    levelDescription,
                )
            garageController.updateOne(garage)
        }

        const setUpMaintenanceSocket = (socket) => {
            socket.on('turnOn', (id) => {
                Log.tag(LOG_TAG)
                    .trace('Requested turn on for', id)
                liveSpotController.turnOnOff(garage.id, id, false)
                garageBrokerSocket.emit('turnOn', id)
            })
            socket.on('turnOff', (id) => {
                Log.tag(LOG_TAG)
                    .trace('Requested turn off for', id)
                liveSpotController.turnOnOff(garage.id, id, true)
                garageBrokerSocket.emit('turnOff', id)
            })
            socket.on('blink', (id) => {
                Log.tag(LOG_TAG)
                    .trace('Requested blink for', id)
                garageBrokerSocket.emit('blink', id)
            })
            socket.on('measure', (id) => {
                Log.tag(LOG_TAG)
                    .trace('Requested measure for', id)
                garageBrokerSocket.emit('measure', id)
            })
            socket.on('openGate', (id) => {
                Log.tag(LOG_TAG)
                    .trace('Requested open gate for', id)
                garageBrokerSocket.emit('openGate', id)
            })
            socket.on('register', ({spots, levelDescription, gates}) => {
                registerLevelDescription(levelDescription)

                const idSetSpots = spots.reduce((acc, curr) => {
                    registerSpot(curr)

                    acc.add(curr.id.split('-')[0])

                    return acc
                }, new Set())
                const idsSpots = [...idSetSpots]

                const idSetGate = gates.reduce((acc, curr) => {
                    garage.addGate(curr.id)
                    acc.add(curr.id)
                    return acc
                }, new Set())
                const idsGate = [...idSetGate]

                garageController.updateOne(garage)

                Log.tag(LOG_TAG)
                    .trace('Register spots for controller ids', idsSpots)

                Log.tag(LOG_TAG)
                    .trace('Register gates for controller ids', idsGate)

                garageBrokerSocket.emit('register', {
                    spots: idsSpots,
                    gates: idsGate,
                    openingHoursWorkdays: garage.openingHoursWorkdays,
                    openingHoursWeekend: garage.openingHoursWeekend,
                })
            })
        }

        // On status change of spots sync to listeners
        liveSpotController.onStatusChange(garage.id, (spots) => {
            const freeSpots = spots.reduce((acc, curr) => acc + +curr.status, 0)

            const logMessage = `Spots changed, Free Spots: ${ freeSpots }/${ spots.length }`
            Log.tag(LOG_TAG)
                .trace(logMessage)

            garageConsumerSockets.emit('update', spots)
        })

        garageBrokerSocket.on('connect', (socket) => {
            Log.tag(LOG_TAG)
                .info(`BrokerSocket(${ socket.id }) Connected`)

            socket.on('loadSpotsResponse', ({spots, gates}) => {
                Log.tag(LOG_TAG)
                    .trace(
                        `Received ${ spots?.length } spots for registration`,
                        `Received ${ gates?.length } gates for registration`,
                    )
                garageRegisterSocket.emit('loadSpotsResponse', {spots, gates})
            })

            socket.on('measureResult', ({measure, id}) => {
                Log.tag(LOG_TAG)
                    .trace(`Received measurement ${ measure } for ${ id }`)
                garageRegisterSocket.emit('measureResult', {measure, id})
                garageConsumerSockets.emit('measureResult', {measure, id})
            })

            socket.on('readCardResult', ({uid}) => {
                Log.tag(LOG_TAG)
                    .trace(`Received card reading ${ uid }`)
                garageRegisterSocket.emit('readCardResult', {uid})
            })

            // Add route to update a value of a specific live spot in the garage
            socket.on('update', (id, value) => {
                Log.tag(LOG_TAG)
                    .trace(`Update spot(${ id }) with status ${ value }`)
                liveSpotController.setLiveSpotStatus(garage.id, id, value)
            })

            // Add route to receive a keep alive signal from a specific spot in a garage
            socket.on('keepAlive', (id) =>
                liveSpotController.keepAlive(garage.id, id),
            )

            socket.on('disconnect', () =>
                Log.tag(LOG_TAG)
                    .info(`BrokerSocket(${ socket.id }) disconnected`),
            )
        })

        garageRegisterSocket.on('connect', (socket) => {
            Log.tag(LOG_TAG)
                .info(`RegisterSocket(${ socket.id }) Connected`)

            socket.on('readCard', () => {
                Log.tag(LOG_TAG)
                    .trace('Requested to read card for registration')
                garageBrokerSocket.emit('readCard')
            })

            socket.on('loadSpots', () => {
                Log.tag(LOG_TAG)
                    .trace('Requested to load spots for registration')
                garageBrokerSocket.emit('loadSpots')
            })
            socket.on('update', (id, value) => {
                Log.tag(LOG_TAG)
                    .trace(
                        `REGISTER Update spot(${ id }) with status ${ value }`,
                    )
                liveSpotController.setLiveSpotStatus(garage.id, id, value)
            })

            setUpMaintenanceSocket(socket)

            socket.on('disconnect', () =>
                Log.tag(LOG_TAG)
                    .info(`RegisterSocket(${ socket.id }) disconnected`),
            )
        })

        garageConsumerSockets.on('connect', async (socket) => {
            Log.tag(LOG_TAG)
                .info(`Socket(${ socket.id }) connected`)

            socket.on('update', (id, value) => {
                Log.tag(LOG_TAG)
                    .trace(
                        `CONSUMER Update spot(${ id }) with status ${ value }`,
                    )
                liveSpotController.setLiveSpotStatus(garage.id, id, value)
            })

            setUpMaintenanceSocket(socket)

            socket.on('disconnect', () =>
                Log.tag(LOG_TAG)
                    .info(`Socket(${ socket.id }) disconnected`),
            )
        })
    }

    garageController.onAdded((garage) => {
        Log.trace(`Added garage, "${ garage.id }" , connect listeners`)
        setupGarage(garage)
    })
}
