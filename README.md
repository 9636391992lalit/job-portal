# 🎯 Job Application Portal

A comprehensive full-stack job application portal built with **React**, **Node.js**, **Express**, **MongoDB**, and **Clerk Authentication**.

## 📋 Features

### For Job Seekers
- 🔍 Browse and search job listings
- 📝 Apply for jobs with resume upload
- 💾 Save favorite jobs
- 📊 Track application status
- 👤 User profile management
- 🔐 Secure authentication via Clerk

### For Recruiters/Companies
- ➕ Post job listings
- 📋 Manage posted jobs
- 👥 View and manage applications
- ✅ Approve/reject applications
- 🏢 Company profile management
- 📊 Dashboard with analytics

### For Admins
- 🏢 Approve/reject company registrations
- 👥 Manage users and companies
- 📊 System-wide analytics
- 🔐 Separate admin authentication

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **React Router Dom** - Routing
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Clerk** - Authentication
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **Quill** - Rich text editor
- **Socket.io Client** - Real-time updates

### Backend
- **Node.js** - Runtime
- **Express 5** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Clerk Express** - Authentication middleware
- **Cloudinary** - Image/file storage
- **Socket.io** - WebSocket support
- **JWT** - Admin token authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Sentry** - Error tracking

## 📁 Project Structure

```
JobApplication/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context
│   │   ├── assets/        # Images and static files
│   │   └── App.jsx        # Main app component
│   ├── public/
│   └── package.json
│
├── server/                # Backend Node.js application
│   ├── config/           # Configuration files
│   │   ├── db.js         # MongoDB connection
│   │   ├── cloudinary.js # Cloudinary setup
│   │   ├── multer.js     # File upload config
│   │   └── instrument.js # Sentry setup
│   ├── controllers/      # Route controllers
│   │   ├── userControllers.js
│   │   ├── companyControllers.js
│   │   ├── JobController.js
│   │   └── webhooks.js
│   ├── middleware/       # Custom middleware
│   │   └── authMiddleware.js
│   ├── models/           # Mongoose models
│   │   ├── User.js
│   │   ├── Company.js
│   │   ├── Job.js
│   │   ├── JobApplication.js
│   │   └── PendingCompany.js
│   ├── routes/           # API routes
│   │   ├── userRoutes.js
│   │   ├── companyRoutes.js
│   │   ├── JobRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/            # Utility functions
│   └── server.js         # Entry point
│
├── package.json          # Root package.json with scripts
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** database (local or Atlas)
- **Cloudinary** account for file storage
- **Clerk** account for authentication
- **Sentry** account (optional, for error tracking)

### 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd JobApplication
   ```

2. **Install all dependencies**
   ```bash
   npm install
   ```
   This will install dependencies for root, client, and server.

   Alternatively, install manually:
   ```bash
   # Install client dependencies
   cd client
   npm install
   cd ..

   # Install server dependencies
   cd server
   npm install
   cd ..
   ```

### ⚙️ Environment Configuration

#### Server Environment Variables

Create `server/.env` file with the following:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobapplication

# Cloudinary Configuration (for file uploads)
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key

# Clerk Authentication (https://clerk.com)
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
CLERK_SECRET_KEY=your_clerk_secret_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_for_admin_authentication

# Sentry Configuration (Optional - for error tracking)
SENTRY_DSN=your_sentry_dsn_url

# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:5173

# Admin Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_admin_password
```

#### Client Environment Variables

Create `client/.env` file with the following:

```env
# Backend API URL
VITE_BACKEND_URL=http://localhost:5000

# Clerk Authentication - Get from https://clerk.com
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### 🎯 Setting Up External Services

#### 1. MongoDB Setup
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string and add it to `MONGODB_URI`

#### 2. Cloudinary Setup
- Sign up at [Cloudinary](https://cloudinary.com/)
- Get your cloud name, API key, and API secret from the dashboard
- Add them to the server `.env` file

#### 3. Clerk Authentication Setup
- Sign up at [Clerk](https://clerk.com/)
- Create a new application
- Get your publishable key and secret key
- Configure webhook endpoint: `https://your-domain.com/webhooks`
- Select events: `user.created`, `user.updated`, etc.
- Add the webhook secret and keys to environment files

#### 4. Sentry Setup (Optional)
- Sign up at [Sentry](https://sentry.io/)
- Create a new project
- Get your DSN and add it to `SENTRY_DSN`

### 🎬 Running the Application

#### Development Mode

**Run both client and server concurrently:**
```bash
npm run dev
```

**Or run separately:**

Terminal 1 (Backend):
```bash
npm run dev:server
```

Terminal 2 (Frontend):
```bash
npm run dev:client
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

#### Production Build

**Build the client:**
```bash
npm run build
```

This creates an optimized production build in `client/dist/`

**Start the server:**
```bash
npm run start:server
```

## 📦 Deployment

### Deploying to Vercel

#### Deploy Frontend (Client)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Set root directory to `client`
5. Add environment variables:
   - `VITE_BACKEND_URL` (your backend URL)
   - `VITE_CLERK_PUBLISHABLE_KEY`
6. Deploy!

#### Deploy Backend (Server)

1. In Vercel, create a new project
2. Import the same repository
3. Set root directory to `server`
4. Add all server environment variables
5. Deploy!

**Note:** The `vercel.json` files are already configured in both directories.

### Alternative Deployment Options

- **Frontend**: Netlify, Cloudflare Pages, AWS Amplify
- **Backend**: Render, Railway, Heroku, AWS EC2
- **Database**: MongoDB Atlas (recommended)

## 🔒 Security Considerations

1. **Never commit `.env` files** - They are already in `.gitignore`
2. **Use strong passwords** for admin accounts
3. **Keep dependencies updated** - Run `npm audit` regularly
4. **Use HTTPS** in production
5. **Configure CORS** properly for your domain
6. **Implement rate limiting** for API routes
7. **Validate all user inputs** on both client and server

## 🧪 Testing

```bash
# Lint client code
npm run lint:client

# Preview production build locally
npm run preview:client
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your `MONGODB_URI` is correct
   - Ensure your IP is whitelisted in MongoDB Atlas
   - Verify network connectivity

2. **Clerk Authentication Issues**
   - Verify publishable key and secret key are correct
   - Check webhook is configured properly
   - Ensure webhook URL is accessible

3. **Build Errors**
   - Clear node_modules: `npm run clean`
   - Reinstall dependencies: `npm install`
   - Check Node.js version: `node --version`

4. **CORS Errors**
   - Update `CLIENT_URL` in server `.env`
   - Check CORS configuration in `server.js`

5. **File Upload Issues**
   - Verify Cloudinary credentials
   - Check file size limits in multer config
   - Ensure proper file permissions

## 📝 Available Scripts

### Root Directory
- `npm install` - Install all dependencies (root, client, server)
- `npm run dev` - Run both client and server in development mode
- `npm run build` - Build client for production
- `npm run clean` - Remove all node_modules and build files

### Client Directory
- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Server Directory
- `npm run server` - Start server with nodemon (auto-restart)
- `npm start` - Start server in production mode

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

[Your Name/Team Name]

## 🙏 Acknowledgments

- Clerk for authentication
- MongoDB Atlas for database hosting
- Cloudinary for file storage
- Vercel for deployment platform

---

**Happy Coding! 🚀**

For issues and questions, please open an issue on GitHub.

