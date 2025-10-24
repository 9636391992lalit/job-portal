import  { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import ApplyJob from './pages/ApplyJob'
import Applications from './pages/Applications'
import RecruiterLogin from './components/RecruiterLogin'
import { AppContext } from './context/AppContext'
import Dashboard from './pages/Dashboard'
import { Link } from 'react-router-dom'
import AddJob from './pages/AddJob'
import ManageJobs from './pages/ManageJobs'
import ViewApplications from './pages/ViewApplications'
import 'quill/dist/quill.snow.css'
// eslint-disable-next-line no-unused-vars
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import SavedJobs from './pages/SavedJobs'
import CompanyProtectedRoute from './components/CompanyProtectedRoute';
import CompanyProfile from './pages/CompanyProfile';
import CompanyProfileSettings from './pages/CompanyProfileSettings';
const App = () => {
  const { showRecruiterLogin  } = useContext(AppContext)
  return (

    <div>

      {showRecruiterLogin ? <RecruiterLogin /> : <></>}
      <ToastContainer position="bottom-right" autoClose={3000} />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/apply-job/:id' element={<ApplyJob />} />
        <Route path='/applications' element={<Applications />} />
        <Route path='/saved-jobs' element={<SavedJobs />} />
        <Route path='/company/:id' element={<CompanyProfile />} />
        <Route element={<CompanyProtectedRoute />}>
          <Route path='/dashboard' element={<Dashboard />}>
            <Route path='add-job' element={<AddJob />} />
            <Route path='manage-jobs' element={<ManageJobs />} />
            <Route path='view-applications' element={<ViewApplications />} />
            <Route path='profile' element={<CompanyProfileSettings />} />
          </Route>
        </Route>
        <Route path='/admin/login' element={<AdminLogin />} />
        <Route element={<AdminProtectedRoute />}> {/* Wrap protected routes */}
          <Route path='/admin/dashboard' element={<AdminDashboard />} />
          {/* Add more admin routes here inside AdminProtectedRoute */}
        </Route>
        <Route path="*" element={<div><h2>404 Not Found</h2><Link to="/">Go Home</Link></div>} />
      </Routes>
    </div>
  )
}

export default App
