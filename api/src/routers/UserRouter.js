import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import UserController from '../controllers/UserController.js'
import User from '../models/User.js'
import { Log } from '../utils/logger.js'

const LOG_TAG = 'UserRouter'

const userRouter = Router()
const userController = new UserController()

// Set user cardId and initial balance
userRouter.put('/:id', async (req, res) => {
  if (!['cardID', 'balance'].every((key) => key in req.body)) {
    Log.tag(LOG_TAG).warn(
      'Failed to update user, some required fields are missing',
    )
    res.status(400).send({
      code: 400,
      message: 'Some fields are missing',
    })
    return
  }
  const id = req.params.id
  const userExists = userController.userExists(id)
  if (!userExists) {
    Log.tag(LOG_TAG).warn(`User with id ${id} does not exist`)
    res.status(400).send({
      code: 400,
      message: `User with id ${id} does not exist`,
    })
    return
  }

  const { cardID, balance } = req.body
  const user = userController.getSingle(id)
  user.cardID = cardID
  user.balance = balance
  userController.updateOne(user)
  res.sendStatus(200)
})

userRouter.get('/toRegister', async (req, res) => {
  if(!req.user.isAdmin) {
    res.status(403).send({
      code: 403,
      message: 'You are not authorized to perform this action',
    })
    return
  }
    const users = await userController.getUsersToRegister()
    res.send(users)
})

export default userRouter
