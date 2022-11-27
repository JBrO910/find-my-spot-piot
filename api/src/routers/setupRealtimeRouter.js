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

        Log.trace(garage)

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
                spot.id,
            )
            Log.tag(LOG_TAG)
                .trace(
                    'Adding Spot to the database',
                    newSpot.serialised,
                )
            spotController.setSpot(newSpot)
            const newLiveSpot = new LiveSpot(
                1 /* Occupied */,
                garage.id,
                newSpot.id,
            )
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
                    levelDescription
                )
            garageController.updateOne(garage)
        }

        const setUpMaintenanceSocket = (socket) => {
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
            socket.on('register', ({spots, levelDescription}) => {
                registerLevelDescription(levelDescription)
                const idSet = spots.reduce((acc, curr) => {
                    registerSpot(curr)

                    acc.add(curr.id.split('-')[0])

                    return acc
                }, new Set())
                const ids = [...idSet]

                Log.tag(LOG_TAG)
                    .trace('Register spots for controller ids', ids)

                garageBrokerSocket.emit('register', ids)
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

            socket.on('loadSpotsResponse', ({spots}) => {
                Log.tag(LOG_TAG)
                    .trace(
                        `Received ${ spots?.length } spots for registration`,
                    )
                garageRegisterSocket.emit('loadSpotsResponse', {spots})
            })

            socket.on('measureResult', ({measure, id}) => {
                Log.tag(LOG_TAG)
                    .trace(`Received measurement ${ measure } for ${ id }`)
                garageRegisterSocket.emit('measureResult', {measure, id})
                garageConsumerSockets.emit('measureResult', {measure, id})
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
        })

        garageRegisterSocket.on('connect', (socket) => {
            Log.tag(LOG_TAG)
                .info(`RegisterSocket(${ socket.id }) Connected`)

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
        })

        garageConsumerSockets.on('connect', async (socket) => {
            Log.tag(LOG_TAG)
                .info(`Socket(${ socket.id }) connected`)

            setUpMaintenanceSocket(socket)

            socket.on('disconnect', () =>
                Log.tag(LOG_TAG)
                    .info(`Socket(${ socket.id }) disconnected`),
            )
            socket.on('update', (id, value) => {
                Log.tag(LOG_TAG)
                    .trace(
                        `CONSUMER Update spot(${ id }) with status ${ value }`,
                    )
                liveSpotController.setLiveSpotStatus(garage.id, id, value)
            })
        })
    }

    // Read all registered Garages
    garageController.getAll()
        .then((garages) =>
            // Create Socket Network foreach garage
            garages.forEach(setupGarage),
        )

    garageController.onAdded(garage => {
        Log.trace("Added garage, connect new listeners")
        setupGarage(garage)
    })
}
