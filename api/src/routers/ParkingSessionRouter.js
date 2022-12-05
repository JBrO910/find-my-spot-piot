import { Router } from 'express'
import GarageController from '../controllers/GarageController.js'
import ParkingSessionController from '../controllers/ParkingSessionController.js'
import UserController from '../controllers/UserController.js'
import ParkingSession from '../models/ParkingSession.js'
import { Log } from '../utils/logger.js'

const LOG_TAG = 'ParkingSessionRouter'

const parkingSessionRouter = Router()
const parkingSessionController = new ParkingSessionController()
const userController = new UserController()
const garageController = new GarageController()

const getValidateParkingSessionRequest = async (req, res, next) => {
  if (['cardID'].some((key) => !(key in req.body))) {
    Log.tag(LOG_TAG).warn('Missing cardID', req.body)
    res.status(400).send({
      code: 400,
      message: 'Some fields are missing',
    })
    return
  }

  const garage = await garageController.getSingle(req.params.garage)
  if (!garage) {
    Log.tag(LOG_TAG).warn('Garage not found', req.body)
    res.status(404).send({
      code: 404,
      message: 'Garage not found',
    })
    return
  }

  const user = await userController.getByCard(req.body.cardID)
  if (!user) {
    Log.tag(LOG_TAG).warn('User not found', req.body)
    res.status(404).send({
      code: 404,
      message: 'User not found',
    })
    return
  }

  req.validated = {
    user,
    garage,
  }

  next()
}

parkingSessionRouter.post(
  '/:garage/checkin',
  getValidateParkingSessionRequest,
  async (req, res) => {
    const { user, garage } = req.validated
    const openSession = await parkingSessionController.getOpenSession(
      user.id,
      garage.id,
    )
    if (!!openSession) {
      Log.tag(LOG_TAG).warn('User already has an open session', req.body)
      res.status(400).send({
        code: 400,
        message: 'User already has an open session',
      })
      return
    }

    if(garage.ensureUserBalance && user.balance < garage.maxRate) {
      Log.tag(LOG_TAG).warn('User does not have enough balance')
      res.status(400).send({
        code: 400,
        message: 'User does not have enough balance',
      })
      return
    }

    const session = new ParkingSession(
      user.id,
      garage.id,
      garage.hourlyRate,
      garage.maxRate,
    )
    parkingSessionController.addOne(session)
    res.status(200).send({
      code: 200,
      message: 'Session created',
      data: session,
    })
  },
)

const paySession = async (session, user) => {
    if (user.balance < session.totalCost) {
        Log.tag(LOG_TAG).warn(
            'User does not have enough balance to pay for session',
        )
        return 'User does not have enough balance to pay for session'
    }

    user.balance -= session.totalCost
    await userController.updateOne(user)

    session.pay()
    await parkingSessionController.updateOne(session)
}

parkingSessionRouter.post(
  '/:garage/checkout',
  getValidateParkingSessionRequest,
  async (req, res) => {
    const { user, garage } = req.validated
    const openSession = await parkingSessionController.getOpenSession(
      user.id,
      garage.id,
    )
    if (!openSession) {
      Log.tag(LOG_TAG).warn('User does not have an open session', req.body)
      res.status(400).send({
        code: 400,
        message: 'User does not have an open session',
      })
      return
    }
    openSession.closeSession()

    await parkingSessionController.updateOne(openSession)

    if (!garage.payOnExit) {
      res.status(200).send({
        code: 200,
        message: 'Session closed',
        data: openSession,
      })
      return
    }
    const error = await paySession(openSession, user)
    if (!!error) {
      res.status(400).send({
        code: 400,
        message: error,
      })
      return
    }

    res.status(200).send({
      code: 200,
      message: 'Session payed',
      data: openSession,
    })
  },
)

parkingSessionRouter.post('/:id/pay', async (req, res) => {
  const session = await parkingSessionController.getSingle(req.params.id)
  if (!session) {
    Log.tag(LOG_TAG).warn('Session not found', req.body)
    res.status(404).send({
      code: 404,
      message: 'Session not found',
    })
    return
  }

  const error = await paySession(session, req.user)
  if (!!error) {
    res.status(400).send({
      code: 400,
      message: error,
    })
    return
  }

  res.status(200).send({
    code: 200,
    message: 'Session paid',
    data: session,
  })
})

export default parkingSessionRouter
