import './config/instrument.js'
import express from 'express'
import * as Sentry from '@sentry/node' // <-- CAPITAL 'S' HERE
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import {clearksWebhooks} from './controllers/webhooks.js'


const app = express();

await connectDB();
// --- Basic Middleware ---
app.use(cors());
app.use(express.json()); 

// --- Database & Cloudinary Connection ---



// --- PUBLIC & WEBHOOK ROUTES (Define BEFORE Clerk Middleware & express.json()) ---
app.get('/', (req, res) => res.send("API Working"));
app.get("/debug-sentry", (req, res) => { throw new Error("My first Sentry error!"); });

// **Clerk webhook MUST come before express.json() and use express.raw()**
app.post('/webhooks', express.raw({type: 'application/json'}), clearksWebhooks);

// --- MAIN MIDDLEWARE (for all other routes) ---
// Now, use express.json() for all *other* routes

// **Public job listing route MUST come before clerkMiddleware**

// --- Error Handling & Server Start ---
const PORT = process.env.PORT || 5000;
Sentry.setupExpressErrorHandler(app); // <-- CAPITAL 'S' HERE
app.listen(PORT, () => {
    console.log(`🚀 Server with Socket.io is running at http://localhost:${PORT}`);
});

