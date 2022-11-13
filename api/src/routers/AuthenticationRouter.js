import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import UserController from '../controllers/UserController.js'
import User from '../models/User.js'
import { Log } from '../utils/logger.js'

const LOG_TAG = 'AuthRouter'

const authRouter = Router()
const userController = new UserController()

// TODO Add expiration and refresh token
const generateAccessToken = (user) =>
  jwt.sign(user, process.env.TOKEN_SECRET)

export const authenticated = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')?.[1]

  if (token == null) {
    Log.tag(LOG_TAG).warn('No authentication token provided')
    return res.status(401).send()
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) {
      Log.tag(LOG_TAG).error('Error while logging in', err)
      return res.status(403).send()
    }

    req.user = user

    next()
  })
}

// TODO Do authentication for Sockets, especially the Broker
export const authenticatedSocket = (socket, next) => {
  if (!(socket.handshake.query && socket.handshake.query.token)) {
    next(new Error('Authentication error'))
    return
  }

  jwt.verify(
    socket.handshake.query.token,
    process.env.TOKEN_SECRET,
    (err, user) => {
      if (err) {
        Log.tag(LOG_TAG + '-Socket').error('Error while logging in', err)
        return next(new Error('Authentication error'))
      }

      socket.user = user

      next()
    },
  )
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
      field: "username",
      message: `User with username "${req.body.username}" does already exist`,
    })
    return
  }
  // TODO Check that user is not taken already

  const salt = randomBytes(16).toString('hex')
  const hashedPassword = scryptSync(req.body.password, salt, 64).toString('hex')
  const newUser = new User(req.body.username, `${salt}:${hashedPassword}`)

  const user = await userController.addOne(newUser)
  Log.tag(LOG_TAG).info("User", user.id, "was created")

  res.sendStatus(200)
})

authRouter.post('/login', async (req, res) => {
  if (['username', 'password'].some((key) => !(key in req.body))) {
    Log.tag(LOG_TAG).warn('Failed to login, some required fields are missing', req.body)
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

  const token = generateAccessToken(user.serialised)
  res.status(200).send({ token, user })
})

authRouter.get('/me', authenticated, async (req, res) => {
  const {username, isAdmin} = req.user
  res.status(200).send({username, isAdmin})
})

export default authRouter
