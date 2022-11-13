import { Router } from 'express'
import GarageController from '../controllers/GarageController.js'
import LiveSpotController from '../controllers/LiveSpotController.js'
import SpotController from '../controllers/SpotController.js'
import Garage from '../models/Garage.js'
import { Log } from '../utils/logger.js'

const LOG_TAG = 'GarageRouter'

const garageRouter = Router()
const garageController = new GarageController()
const spotController = new SpotController()
const liveSpotController = new LiveSpotController()

garageRouter.get('/', async (req, res) => {
  const garages = await garageController.getAll()
  res.send(garages)
})

garageRouter.get('/overview', async (req, res) => {
  const liveSpots = await liveSpotController.getAllOnce()
  const garages = await garageController.getAll()

  const freeSpotsForGarage = (id) =>
    liveSpots[id]
      ?.filter((e) => e.status !== undefined)
      ?.reduce((acc, curr) => acc + curr.status, 0)

  res.send(
    garages
      .filter((garage) => !(!liveSpots[garage.id]?.length || !freeSpotsForGarage(garage.id)))
      .map((garage) => ({
        ...garage,
        totalSpots: liveSpots[garage.id]?.length,
        freeSpots: freeSpotsForGarage(garage.id),
      })),
  )
})

garageRouter.get('/:id', async (req, res) => {
  if (!req.params.id) {
    res.status(404).send()
    return
  }

  const garage = await garageController.getSingle(req.params.id)

  res.send(garage)
})

garageRouter.get('/:id/spots', async (req, res) => {
  if (!req.params.id) {
    res.status(404).send([])
    return
  }

  const spots = await spotController.getAllForGarage(req.params.id)
  const liveSpots = await liveSpotController
    .getGarageSpotsOnce(req.params.id)
    .then((s) => s.reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {}))

  const combinedSpots = spots.reduce(
    (acc, curr) => ({
      ...acc,
      [curr.id]: { ...curr, ...(liveSpots[curr.id] ?? {}) },
    }),
    {},
  )

  res.send(combinedSpots)
})

garageRouter.delete('/:id', async (req, res) => {
  if (!req.params.id) {
    res.status(404).send()
    return
  }

  await garageController.deleteSingle(req.params.id)
  await spotController.deleteForGarage(req.params.id)
  await liveSpotController.removeForGarage(req.params.id)

  res.status(200).send()
})

garageRouter.delete('/:id/reset', async (req, res) => {
  if (!req.params.id) {
    res.status(404).send()
    return
  }

  await spotController.deleteForGarage(req.params.id)
  await liveSpotController.removeForGarage(req.params.id)

  res.status(200).send()
})

garageRouter.post('/', async (req, res) => {
  // TODO Refresh io listener

  if (['name', 'address', 'phoneNumber'].some((key) => !(key in req.body))) {
    Log.tag(LOG_TAG).warn(
      'Failed to create garage, some required fields are missing',
    )
    res.status(400).send({
      code: 400,
      message: 'Some fields are missing',
    })
    return
  }

  const { name, address, phoneNumber } = req.body
  const garage = new Garage(name, address, phoneNumber)
  const created = await garageController.addOne(garage)

  Log.tag(LOG_TAG).info(`Created Garage`, created.id)
  res.status(200).send(created.id)
})

// TODO Add levelDescription to register spots function

export default garageRouter
