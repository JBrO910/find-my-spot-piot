import {config} from 'dotenv'
config()

import cors from 'cors'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import authRouter, { authenticated } from './routers/AuthenticationRouter.js'
import garageRouter from './routers/GarageRouter.js'
import setupRealtimeRouter from './routers/setupRealtimeRouter.js'
import { Log } from './utils/logger.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
  Log.trace(req.method, req.originalUrl)
  next()
})

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: true,
  },
})

setupRealtimeRouter(io)
app.use('/garage', authenticated, garageRouter)
app.use('/auth', authRouter)

const port = 3000
httpServer.listen(port)
Log.info('Server listening on port', port)
