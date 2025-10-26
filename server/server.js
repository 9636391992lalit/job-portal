import './config/instrument.js'
import express from 'express'
import * as Sentry from '@sentry/node' // <-- CAPITAL 'S' HERE
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import { clearksWebhooks } from './controllers/webhooks.js'
import companyRoutes from './routes/companyRoutes.js'
import connectCloudinary from './config/cloudinary.js'
import jobRoutes from './routes/JobRoutes.js'
import userRoutes from './routes/userRoutes.js'
import { clerkMiddleware } from '@clerk/express'
import adminRoutes from './routes/adminRoutes.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// --- Basic Middleware ---
app.use(cors());

// --- Database & Cloudinary Connection ---
await connectDB();
await connectCloudinary();

// --- PUBLIC & WEBHOOK ROUTES (Define BEFORE Clerk Middleware & express.json()) ---
app.get('/', (req, res) => res.send("API Working"));
app.get("/debug-sentry", (req, res) => { throw new Error("My first Sentry error!"); });

// *Clerk webhook MUST come before express.json() and use express.raw()*
app.post('/webhooks', express.raw({ type: 'application/json' }), clearksWebhooks);

// --- MAIN MIDDLEWARE (for all other routes) ---
// Now, use express.json() for all other routes
app.use(express.json());

// *Public job listing route MUST come before clerkMiddleware*
app.use('/api/jobs', jobRoutes);

// --- CLERK MIDDLEWARE (Applies to all routes BELOW this line) ---
app.use(clerkMiddleware());

// --- PROTECTED ROUTES (Require Authentication) ---
app.use('/api/company', companyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// --- Socket.io Connection Logic ---
// --- Socket.io Connection Logic ---
io.on('connection', (socket) => {
    console.log(`🟢 User connected: ${socket.id}`); // Corrected: using backticks (`)
    socket.on('disconnect', () => {
        console.log(`🔴 User disconnected: ${socket.id}`); // Corrected: using backticks (`)
    });
    socket.on('error', (error) => {
        console.error(`❌ Socket Error for ${socket.id}:`, error); // Corrected: using backticks (`)
    });
});
// --- Error Handling & Server Start ---
const PORT = process.env.PORT || 5000;
Sentry.setupExpressErrorHandler(app); // <-- CAPITAL 'S' HERE
httpServer.listen(PORT, () => {
    console.log(`🚀 Server with Socket.io is running at http://localhost:${PORT}`);
});

export { io }; // Export io if needed elsewhere
export default httpServer;