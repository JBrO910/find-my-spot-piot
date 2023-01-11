import { randomUUID } from 'crypto'
import { Router } from 'express'
import ApiController from '../controllers/ApiController.js'
import GarageController from '../controllers/GarageController.js'
import LiveSpotController from '../controllers/LiveSpotController.js'
import SpotController from '../controllers/SpotController.js'
import ApiKey from '../models/ApiKey.js'
import Garage from '../models/Garage.js'
import { Log } from '../utils/logger.js'

const LOG_TAG = 'GarageRouter'

const garageRouter = Router()
const garageController = new GarageController()
const spotController = new SpotController()
const liveSpotController = new LiveSpotController()
const apiController = new ApiController()

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
        res.status(404)
            .send()
        return
    }

    const garage = await garageController.getSingle(req.params.id)

    res.send(garage)
})

garageRouter.get('/:id/spots', async (req, res) => {
    if (!req.params.id) {
        res.status(404)
            .send([])
        return
    }

    const spots = await spotController.getAllForGarage(req.params.id)
    const liveSpots = await liveSpotController
        .getGarageSpotsOnce(req.params.id)
        .then((s) => s.reduce((acc, curr) => ({...acc, [curr.id]: curr}), {}))

    const combinedSpots = spots.reduce(
        (acc, curr) => ({
            ...acc,
            [curr.id]: {...curr, ...(liveSpots[curr.id] ?? {})},
        }),
        {},
    )

    res.send(combinedSpots)
})

garageRouter.delete('/:id', async (req, res) => {
    if (!req.params.id) {
        res.status(404)
            .send()
        return
    }

    await garageController.deleteSingle(req.params.id)
    await spotController.deleteForGarage(req.params.id)
    await liveSpotController.removeForGarage(req.params.id)

    res.status(200)
        .send()
})

garageRouter.delete('/:id/reset', async (req, res) => {
    if (!req.params.id) {
        res.status(404)
            .send()
        return
    }

    await spotController.deleteForGarage(req.params.id)
    await liveSpotController.removeForGarage(req.params.id)

    res.status(200)
        .send()
})

garageRouter.post('/', async (req, res) => {
    if (['name', 'address', 'phoneNumber', 'hourlyRate', 'maxRate', 'ensureUserBalance', 'payOnExit', 'sleepTime'].some(
        (key) => !(key in req.body))) {
        Log.tag(LOG_TAG)
            .warn(
                'Failed to create garage, some required fields are missing',
            )
        res.status(400)
            .send({
                code: 400,
                message: 'Some fields are missing',
            })
        return
    }

    const {
        name,
        address,
        phoneNumber,
        openingHoursWorkdays,
        openingHoursWeekend,
        hourlyRate,
        maxRate,
        ensureUserBalance,
        payOnExit,
        sleepTime,
    } = req.body

    if ((openingHoursWorkdays && openingHoursWorkdays[0] >= openingHoursWorkdays[1]) ||
        (openingHoursWeekend && openingHoursWeekend[0] >= openingHoursWeekend[1])) {
        const error = {
            message: 'Opening hours must be valid',
            code: 'error',
        }
        return res.status(404)
            .send(error)
    }
    if (hourlyRate > maxRate) {
        const error = {
            message: 'Hourly rate must be lower than max rate',
            code: 'error',
        }
        return res.status(404)
            .send(error)
    }
    if (hourlyRate < 0 || maxRate < 0) {
        const error = {
            message: 'Hourly rate and max rate must be positive numbers',
            code: 'error',
        }
        return res.status(404)
            .send(error)
    }
    if (sleepTime <= 0) {
        const error = {
            message: 'Sleep time must be a positive number',
            code: 'error',
        }
        return res.status(404)
            .send(error)
    }

    const garage = new Garage(name, address, phoneNumber, openingHoursWorkdays, openingHoursWeekend, hourlyRate,
        maxRate, ensureUserBalance, payOnExit, sleepTime)
    const created = await garageController.addOne(garage)

    const apiKey = new ApiKey(randomUUID(), created.id)
    await apiController.add(apiKey)

    Log.tag(LOG_TAG)
        .info(`Created Garage`, created.id)
    res.status(200)
        .send({id: created.id, apiKey: apiKey.key})
})

garageRouter.put('/:id', async (req, res) => {
    if (['hourlyRate', 'maxRate', 'ensureUserBalance', 'payOnExit', 'sleepTime'].some((key) => !(key in req.body))) {
        Log.tag(LOG_TAG)
            .warn(
                'Failed to create garage, some required fields are missing',
            )
        res.status(400)
            .send({
                code: 400,
                message: 'Some fields are missing',
            })
        return
    }
    const garage = await garageController.getSingle(req.params.id)
    if (!garage) {
        res.status(404)
            .send('Garage not found')
        return
    }

    garage.openingHoursWeekend = req.body.openingHoursWeekend
    garage.openingHoursWorkdays = req.body.openingHoursWorkdays
    garage.hourlyRate = req.body.hourlyRate
    garage.maxRate = req.body.maxRate
    garage.ensureUserBalance = req.body.ensureUserBalance
    garage.payOnExit = req.body.payOnExit
    garage.sleepTime = req.body.sleepTime

    if ((garage.openingHoursWorkdays && garage.openingHoursWorkdays[0] >= garage.openingHoursWorkdays[1]) ||
        (garage.openingHoursWeekend && garage.openingHoursWeekend[0] >= garage.openingHoursWeekend[1])) {
        const error = {
            message: 'Opening hours must be valid',
            code: 'error',
        }
        return res.status(404)
            .send(error)
    }
    if (garage.hourlyRate > garage.maxRate) {
        const error = {
            message: 'Hourly rate must be lower than max rate',
            code: 'error',
        }
        return res.status(404)
            .send(error)
    }
    if (garage.hourlyRate < 0 || garage.maxRate < 0) {
        const error = {
            message: 'Hourly rate and max rate must be positive numbers',
            code: 'error',
        }
        return res.status(404)
            .send(error)
    }
    if (garage.sleepTime <= 0) {
        const error = {
            message: 'Sleep time must be a positive number',
            code: 'error',
        }
        return res.status(404)
            .send(error)
    }

    await garageController.updateOne(garage)

    Log.tag(LOG_TAG)
        .info(`Updated Garage`, req.params.id)
    res.status(200)
        .send(req.params.id)
})

export default garageRouter
