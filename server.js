import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'

import connectDB from './config/db.js'
import taskRoutes from './routes/tasks.js'
import errorHandler from './middleware/error-handler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api/tasks', taskRoutes)

app.use(errorHandler)

const startServer = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

startServer()

export default app
