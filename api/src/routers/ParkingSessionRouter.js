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

const doesUserHaveEnoughBalance = async (value, user) => {
    const dept = await parkingSessionController.getUserDept(user)
    return value <= (user.balance - dept)
}
const paySession = async (session, user) => {
  let userHasEnoughBalance = await doesUserHaveEnoughBalance(session.totalCost, user)
  if (!userHasEnoughBalance) {
    Log.tag(LOG_TAG).warn(
      'User does not have enough balance to pay for session',
      session,
      user,
    )
    return 'User does not have enough balance to pay for session'
  }

  user.balance -= session.pay()
  await userController.updateOne(user)
  await parkingSessionController.updateOne(session)
}

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
  '/:garage/toggleSession',
  getValidateParkingSessionRequest,
  async (req, res) => {
    const { user, garage } = req.validated
    const openSessions = await parkingSessionController.getOpenSession(
      user.id,
      garage.id,
    )
    const openSession = openSessions[0]
    if (!openSession) {
      let userHasEnoughBalance = await doesUserHaveEnoughBalance(garage.maxRate, user)
      if (garage.ensureUserBalance && !userHasEnoughBalance) {
        Log.tag(LOG_TAG).warn('User does not have enough balance', user, garage)
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
      await parkingSessionController.addOne(session)
      res.status(200).send({
        code: 200,
        message: 'Session created',
        data: session,
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

parkingSessionRouter.get('/history/:id', async (req, res) => {
  const user = await userController.getSingle(req.params.id)
  if (!user) {
    Log.tag(LOG_TAG).warn('User not found', req.body)
    res.status(404).send({
      code: 404,
      message: 'User not found',
    })
    return
  }

  const sessions = await parkingSessionController.getAllForUser(user.id).then(res => res.sort((a, b) => b.startTime - a.startTime))
  const garageIds = new Set(sessions.map((session) => session.garageId))
  const garages = await garageController.getAllByIds([...garageIds])
  const sessionsWithGarage = sessions.map((session) => {
    const garage = garages.find((garage) => garage.id === session.garageId)
    return {
      ...session,
      garage,
    }
  })

  res.status(200).send(sessionsWithGarage)
})

parkingSessionRouter.post('/pay/:id/user/:user', async (req, res) => {
  const session = await parkingSessionController.getSingle(req.params.id)
  if (!session) {
    Log.tag(LOG_TAG).warn('Session not found', req.body)
    res.status(404).send({
      code: 404,
      message: 'Session not found',
    })
    return
  }
  const user = await userController.getSingle(req.params.user)
  if (!user) {
    Log.tag(LOG_TAG).warn('User not found', req.body)
    res.status(404).send({
      code: 404,
      message: 'User not found',
    })
    return
  }

  const error = await paySession(session, user)
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
