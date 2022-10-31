import GarageController from '../controllers/GarageController.js'
import LiveSpotController from '../controllers/LiveSpotController.js'
import SpotController from '../controllers/SpotController.js'
import LiveSpot from '../models/LiveSpot.js'
import Spot from '../models/Spot.js'
import { Log } from '../utils/logger.js'

export default (io) => {
    const garageController = new GarageController()
    const spotController = new SpotController()
    const liveSpotController = new LiveSpotController()

    // Read all registered Garages
    garageController.getAll()
        .then((garages) =>
            // Create Socket Network foreach garage
            garages.forEach((garage) => {
                const LOG_TAG = `GarageSocket(${ garage.id })`

                // On status change of spots sync to listeners
                liveSpotController.onStatusChange(garage.id, (spots) => {
                    const freeSpots = spots.reduce((acc, curr) => acc + +curr.isFree, 0)
                    Log.tag(LOG_TAG)
                        .trace(
                            `Spots changed, Free Spots: ${ freeSpots }/${ spots.length }`,
                        )
                    io.of(`/${ garage.id }`)
                        .emit('update', spots)
                })

                // Build Network for garage
                io.of(`/${ garage.id }`)
                    .on('connect', async (socket) => {
                        Log.tag(LOG_TAG)
                            .trace(`Socket(${ socket.id }) connected`)

                        socket.emit(
                            'update',
                            await liveSpotController.getGarageSpotsOnce(garage.id),
                        )

                        // Add route for spots to register themselves and store both in live and document database
                        socket.on('register', (spotId, localIdentifier, x, y, z) => {
                            const spot = new Spot(garage.id, localIdentifier, x, y, z, spotId)
                            spotController.setSpot(spot)

                            const liveSpot = new LiveSpot(
                                0, // Set the starting value to free
                                spotId,
                            )
                            liveSpotController.setLiveSpot(liveSpot)

                            Log.tag(LOG_TAG)
                                .trace('Registered spot with id', spotId)
                        })

                        // Add route to update a value of a specific live spot in the garage
                        socket.on('update', (id, value) => {
                            liveSpotController.setLiveSpotStatus(garage.id, id, value)
                            Log.tag(LOG_TAG)
                                .trace(`Update spot(${ id }) with status ${ value }`)
                        })

                        // Add route to receive a keep alive signal from a specific spot in a garage
                        socket.on('keepAlive', (id) =>
                            liveSpotController.keepAlive(garage.id, id),
                        )

                        socket.on('disconnect', () =>
                            Log.tag(LOG_TAG)
                                .trace(`Socket(${ socket.id }) disconnected`),
                        )
                    })
            }),
        )
}
