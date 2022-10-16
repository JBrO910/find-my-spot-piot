import { Router } from 'express'
import GarageController from '../controllers/GarageController.js'
import LiveSpotController from '../controllers/LiveSpotController.js'
import Garage from '../models/Garage.js'

const garageRouter = Router()
const garageController = new GarageController()
const liveSpotController = new LiveSpotController()

garageRouter.get('/', async (req, res) => {
  const garages = await garageController.getAll()
  res.send(garages)
})

garageRouter.get('/overview', async (req, res) => {
  const liveSpots = await liveSpotController.getAllOnce()
  const garages = await garageController.getAll()

  const freeSpotsForGarage = (id) => liveSpots[id]?.reduce((acc, curr) => acc + +(!curr.isFree), 0)

  res.send(garages.map((garage) => ({...garage, totalSpots: liveSpots[garage.id]?.length ?? 0, freeSpots: freeSpotsForGarage(garage.id) ?? 0})))
})

garageRouter.get('/:id', async (req, res) => {
  if(!req.params.id) return

  const garage = await garageController.getSingle(req.params.id)

  res.send(garage)
})

garageRouter.post("/garage", async (req, res) => {
  if (['name', 'address', 'phoneNumber'].some((key) => !(key in req.body))){
    res.status(400).send({
      code: 400,
      message: 'Some fields are missing',
    })
    return
  }
  const {name, address, phoneNumber} = req.body
  const garage = new Garage(name, address, phoneNumber)
  const created = await garageController.addOne(garage)
  res.status(200).send(created.id)
})

export default garageRouter
