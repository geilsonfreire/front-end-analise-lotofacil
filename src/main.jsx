// Import Biblioteas
import { createRoot } from 'react-dom/client'
import { ToastContainer } from 'react-toastify';
import { BrowserRouter as Router } from 'react-router-dom';

// Imports CSS
import 'react-toastify/dist/ReactToastify.css'
import './style/customToast.css'

// Import Components
import App from './App.jsx'


createRoot(document.getElementById('root')).render(
    <Router>
        <App />
        <ToastContainer className="custom-toast" />
    </Router>
)
