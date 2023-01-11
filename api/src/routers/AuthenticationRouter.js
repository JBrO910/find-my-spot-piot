import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import ApiController from '../controllers/ApiController.js'
import GarageController from '../controllers/GarageController.js'
import UserController from '../controllers/UserController.js'
import User from '../models/User.js'
import { Log } from '../utils/logger.js'

const LOG_TAG = 'AuthRouter'

const authRouter = Router()
const userController = new UserController()
const apiController = new ApiController()
const garageController = new GarageController()

const generateAccessToken = (user) => jwt.sign(user, process.env.TOKEN_SECRET)

export const authenticated = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  if(!authHeader) {
    Log.tag(LOG_TAG).warn('No authentication header present')
    return res.status(401).send()
  }
  const [method, token] = authHeader.split(' ')

  if (!token || !method) {
    Log.tag(LOG_TAG).warn('No authentication token provided')
    return res.status(401).send()
  }

  if(!['Bearer', 'ApiKey'].includes(method)) {
    Log.tag(LOG_TAG).warn('Invalid authentication method provided')
    return res.status(401).send()
  }

  if(method === "ApiKey") {
    const apiKey = await apiController.get(token)
    if(!apiKey) {
      Log.tag(LOG_TAG).warn('Invalid API key provided')
      return res.status(401).send()
    }
    req.garage = await garageController.getSingle(apiKey.garage)
    return next()
  }

  jwt.verify(token, process.env.TOKEN_SECRET, async (err, userID) => {
    if (err) {
      Log.tag(LOG_TAG).error('Error while logging in', err)
      return res.status(403).send()
    }

    req.user = await userController.getSingle(userID)
    next()
  })
}

export const authenticatedSocket = async (socket, next) => {
  const authHeader = socket.handshake.auth.token
  if(!authHeader) {
    Log.tag(LOG_TAG).warn('Socket No authentication header present')
    return next(new Error())
  }
  const [method, token] = authHeader.split(' ')

  if (!token || !method) {
    Log.tag(LOG_TAG).warn('Socket No authentication token provided')
    return next(new Error())
  }

  if(!['Bearer', 'ApiKey'].includes(method)) {
    Log.tag(LOG_TAG).warn('Socket Invalid authentication method provided')
    return next(new Error())
  }

  if(method === "ApiKey") {
    const apiKey = await apiController.get(token)
    if(!apiKey) {
      Log.tag(LOG_TAG).warn('Socket Invalid API key provided')
      return next(new Error())
    }
    return next()
  }

  jwt.verify(token, process.env.TOKEN_SECRET, async (err) => {
    if (err) {
      Log.tag(LOG_TAG).error('Socket Error while logging in', err)
      return next(new Error())
    }

    next()
  })
}

authRouter.post('/register', async (req, res) => {
  if (['username', 'password'].some((key) => !(key in req.body))) {
    Log.tag(LOG_TAG).warn(
      'Failed to register user, some required fields are missing',
    )
    res.status(400).send({
      code: 400,
      message: 'Some fields are missing',
    })
    return
  }
  const existingUser = await userController.getByUsername(req.body.username)
  if (!!existingUser) {
    Log.tag(LOG_TAG).warn(
      `User with username "${req.body.username}" does already exist`,
    )
    res.status(400).send({
      code: 400,
      field: 'username',
      message: `User with username "${req.body.username}" does already exist`,
    })
    return
  }

  const salt = randomBytes(16).toString('hex')
  const hashedPassword = scryptSync(req.body.password, salt, 64).toString('hex')
  const newUser = new User(req.body.username, `${salt}:${hashedPassword}`)

  const user = await userController.addOne(newUser)
  Log.tag(LOG_TAG).info('User', user.id, 'was created')

  res.sendStatus(200)
})

authRouter.post('/login', async (req, res) => {
  if (['username', 'password'].some((key) => !(key in req.body))) {
    Log.tag(LOG_TAG).warn(
      'Failed to login, some required fields are missing',
      req.body,
    )
    res.status(400).send({
      code: 400,
      message: 'Some fields are missing',
    })
    return
  }

  const user = await userController.getByUsername(req.body.username)

  if (!user) {
    Log.tag(LOG_TAG).warn('Invalid username or password provided')
    res.status(400).send({
      code: 400,
      message: 'Invalid username or password provided',
    })
    return
  }

  const [salt, key] = user.password.split(':')
  const hashedBuffer = scryptSync(req.body.password, salt, 64)
  const isPasswordCorrect = timingSafeEqual(
    hashedBuffer,
    Buffer.from(key, 'hex'),
  )

  if (!isPasswordCorrect) {
    Log.tag(LOG_TAG).warn('Invalid username or password provided')
    res.status(400).send({
      code: 400,
      message: 'Invalid username or password provided',
    })
    return
  }

  const token = generateAccessToken(user.id)
  res.status(200).send({ token, user })
})

authRouter.get('/me', authenticated, async (req, res) => {
  res.status(200).send(req.user?.me)
})

export default authRouter
