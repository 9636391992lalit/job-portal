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
import adminRoutes from './routes/adminRoutes.js';
// --- NEW: Socket.io Imports ---
import { createServer } from 'http'; // Node's built-in HTTP module
import { Server } from 'socket.io';   // Socket.io Server class
//Intilize express
const app=express()

//Midleware

// --- NEW: Create HTTP server and Socket.io server ---
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173", // Your frontend URL
        methods: ["GET", "POST"]
    }
});
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
app.use('/api/admin', adminRoutes);
//Port
io.on('connection', (socket) => {
    console.log(`🟢 User connected: ${socket.id}`);

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`🔴 User disconnected: ${socket.id}`);
    });
    socket.on('error', (error) => {
        console.error(`❌ Socket Error for ${socket.id}:`, error);
    });
    // You can add more specific event listeners here if needed later
});
const PORT = process.env.PORT||5000

Sentry.setupExpressErrorHandler(app);
httpServer.listen(PORT, () => {
    console.log(`🚀 Server with Socket.io is running at http://localhost:${PORT}`);
});
export { io };
