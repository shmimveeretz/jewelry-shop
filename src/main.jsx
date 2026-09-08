import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// Tailwind first: index.css must win where the two define the same class name
// (.text-center, .animate-pulse, .animate-bounce, .delay-*).
import './styles/tailwind.css'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
