import './config/instrument.js'
import express from 'express'
import * as Sentry from '@sentry/node'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import {clearksWebhooks} from './controllers/webhooks.js'
//Intilize express
const app=express()

//Midleware
app.use(cors())
app.use(express.json())
//Connect to Database
await connectDB()
//Routes
app.get('/',(req,res)=>res.send("API Working"))
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});
app.post('/webhhoks',clearksWebhooks)
//Port

const PORT = process.env.PORT||5000

Sentry.setupExpressErrorHandler(app);
app.listen(PORT,()=>{
    console.log(`Server is running at port ${PORT}`)
})

// UZjYLxVXxzM7bfC2
//lalit220101_db_user