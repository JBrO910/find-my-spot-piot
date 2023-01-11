import cors from 'cors'
import { config } from 'dotenv'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import authRouter, { authenticated } from './routers/AuthenticationRouter.js'
import garageRouter from './routers/GarageRouter.js'
import parkingSessionRouter from './routers/ParkingSessionRouter.js'
import setupRealtimeGarageRouter from './routers/setupRealtimeGarageRouter.js'
import userRouter from './routers/UserRouter.js'
import { Log } from './utils/logger.js'

config()

const app = express()

app.use(cors())
app.use(express.json())

const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: true,
    },
})

app.use((req, res, next) => {
    Log.tag('Router')
        .trace(req.method, req.originalUrl)
    next()
})

app.use('/auth', authRouter)
app.use('/user', authenticated, userRouter)
app.use('/garage', authenticated, garageRouter)
app.use('/parkingSession', authenticated, parkingSessionRouter)

setupRealtimeGarageRouter(io)

const port = process.env.PORT || 3000
httpServer.listen(port)
Log.info('Server listening on port', port)
