// // import React from 'react';
// // import ReactDOM from 'react-dom/client';
// // import { BrowserRouter, useNavigate } from 'react-router-dom';
// // import App from './App';
// // import './index.css';
// // import { Auth0Provider } from '@auth0/auth0-react';

// // // ⬇️ Auth0 wrapper to handle redirect after login/signup
// // const Auth0ProviderWithRedirect = () => {
// //   const navigate = useNavigate();

// //   const onRedirectCallback = (appState) => {
// //     navigate(appState?.returnTo || '/dashboard');
// //   };

// //   return (
// //     <Auth0Provider
// //       domain="dev-nytcex5ikw4as2iq.us.auth0.com"
// //       clientId="wD5wcnh9Nkbj5QkJi7SOyxLwpkW0MFil"
// //       authorizationParams={{
// //         redirect_uri: window.location.origin,
// //       }}
// //       onRedirectCallback={onRedirectCallback}
// //     >
// //       <App />
// //     </Auth0Provider>
// //   );
// // };

// // ReactDOM.createRoot(document.getElementById('root')).render(
// //   <BrowserRouter>
// //     <Auth0ProviderWithRedirect />
// //   </BrowserRouter>
// // );



// // import React from 'react';
// // import ReactDOM from 'react-dom/client';
// // import { BrowserRouter } from 'react-router-dom';
// // import App from './App';


// // ReactDOM.createRoot(document.getElementById('root')).render(
// //   <BrowserRouter>
// //     <App />
// //   </BrowserRouter>
// // );


// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App";
// import { BrowserRouter } from "react-router-dom";
// import './Login.css';

// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(
//   <BrowserRouter>
//     <App />
//   </BrowserRouter>
// );





import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  BrowserRouter,
} from "react-router-dom";
import App from "./App";
import './Login.css'; // Your Tailwind CSS
import InterviewRoomLayout from './layouts/InterviewRoomLayout';
import Dashboard from './pages/Dashboard'; // Create a simple Dashboard page
import AdminPanel from './pages/AdminPanel'; // Create a simple AdminPanel page
import Monitoring from './pages/Monitoring'; // Create a simple Monitoring page
import LandingPage from './pages/LandingPage'; // Create a simple LandingPage page
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";

// simple-peer requires a Node-like global in some bundles; ensure it exists in browsers
if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
  window.global = window;
}

// Global error handler to suppress browser extension errors
window.addEventListener('error', (event) => {
  // Suppress errors from browser extensions (content-all.js, etc.)
  if (
    event.filename?.includes('content-all.js') ||
    event.filename?.includes('content-script') ||
    event.filename?.includes('extension://') ||
    event.message?.includes('menu item') ||
    event.message?.includes('save-page') ||
    event.message?.includes('chrome-extension://') ||
    event.message?.includes('moz-extension://')
  ) {
    event.preventDefault();
    return false;
  }
}, true);

// Handle unhandled promise rejections from extensions
window.addEventListener('unhandledrejection', (event) => {
  // Suppress promise rejections from browser extensions
  if (
    event.reason?.message?.includes('menu item') ||
    event.reason?.message?.includes('save-page') ||
    event.reason?.stack?.includes('content-all.js') ||
    event.reason?.stack?.includes('content-script') ||
    event.reason?.stack?.includes('extension://') ||
    event.reason?.stack?.includes('chrome-extension://') ||
    event.reason?.stack?.includes('moz-extension://')
  ) {
    event.preventDefault();
    return false;
  }
}, true);

// Simple placeholder pages
const HomePage = () => <div>Home Page</div>;
const NotFoundPage = () => <div>404 Not Found</div>;

// Create simple placeholder components for other pages for routing
const DashboardPage = () => <Dashboard />; // Replace with your actual Dashboard component if needed
const AdminPanelPage = () => <AdminPanel />; // Replace with your actual AdminPanel component
const MonitoringPage = () => <Monitoring />; // Replace with your actual Monitoring component
const LandingPageContent = () => <LandingPage />; // Replace with your actual LandingPage component

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPageContent />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/login", // <--- Add this route
    element: <LoginPage />, // <--- Render your login component here
  },
  {
    path: "/signup", // <--- Add this route
    element: <SignUpPage />, // <--- Render your login component here
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
  {
    path: "/interview",
    element: <InterviewRoomLayout />,
  },
  {
    path: "/admin",
    element: <AdminPanelPage />,
  },
  {
    path: "/monitoring",
    element: <MonitoringPage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);