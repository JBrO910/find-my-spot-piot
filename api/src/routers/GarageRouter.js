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
      .filter((garage) => req.user.isAdmin || !!liveSpots[garage.id]?.length)
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
  if (['name', 'address', 'phoneNumber', 'hourlyRate', 'maxRate', 'ensureUserBalance', 'payOnExit'].some((key) => !(key in req.body))) {
    Log.tag(LOG_TAG).warn(
      'Failed to create garage, some required fields are missing',
    )
    res.status(400).send({
      code: 400,
      message: 'Some fields are missing',
    })
    return
  }

  const { name, address, phoneNumber, openingHoursWorkdays, openingHoursWeekend, hourlyRate, maxRate, ensureUserBalance, payOnExit } = req.body


  if ((openingHoursWorkdays && openingHoursWorkdays[0] >= openingHoursWorkdays[1]) ||
      (openingHoursWeekend && openingHoursWeekend[0] >= openingHoursWeekend[1])) {
    const error = {
      message: 'Opening hours must be valid',
      code: 'error',
    }
    return res.status(404).send(error)
  }
  if (hourlyRate > maxRate) {
    const error = {
      message: 'Hourly rate must be lower than max rate',
      code: 'error',
    }
    return res.status(404).send(error)
  }
  if (hourlyRate < 0 || maxRate < 0) {
    const error = {
      message: 'Hourly rate and max rate must be positive numbers',
      code: 'error',
    }
    return res.status(404).send(error)
  }

  const garage = new Garage(name, address, phoneNumber, openingHoursWorkdays, openingHoursWeekend, hourlyRate, maxRate, ensureUserBalance, payOnExit)
  const created = await garageController.addOne(garage)

  Log.tag(LOG_TAG).info(`Created Garage`, created.id)
  res.status(200).send(created.id)
})

export default garageRouter
