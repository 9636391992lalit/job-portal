import './config/instrument.js'
import express from 'express'
import * as Sentry from '@sentry/node'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import {clearksWebhooks} from './controllers/webhooks.js'
import companyRoutes from './routes/companyRoutes.js'
import connectCloudinary from './config/cloudinary.js'
import jobRoutes from './routes/JobRoutes.js'
import userRoutes from './routes/userRoutes.js'
import {clerkMiddleware} from '@clerk/express'
//Intilize express
const app=express()

//Midleware
app.use(cors())
app.use(express.json())
app.use(clerkMiddleware())
//Connect to Database
await connectDB()
await connectCloudinary()
//Routes
app.get('/',(req,res)=>res.send("API Working"))
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

app.post('/webhooks',clearksWebhooks)

app.use('/api/company',companyRoutes)
app.use('/api/jobs',jobRoutes)
app.use('/api/users',userRoutes)

//Port
const PORT = process.env.PORT||5000

Sentry.setupExpressErrorHandler(app);
app.listen(PORT,()=>{
    console.log(`Server is running at port ${PORT}`)
})

// UZjYLxVXxzM7bfC2
//lalit220101_db_user
