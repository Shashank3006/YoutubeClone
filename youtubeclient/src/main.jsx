import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { StrictMode, lazy, Suspense } from 'react';
import { AuthProvider } from './utils/AuthContext.jsx';
import { BsYoutube } from 'react-icons/bs';
import NotFound from './pages/NotFound.jsx'; // 404 page
import './index.css';
import '../src/style/loader.css'

// ✅ Lazy-loaded route components
const App = lazy(() => import('./App.jsx'));
const Homepage = lazy(() => import('./pages/Homepage.jsx'));
const VideoPlayer = lazy(() => import('./pages/VideoPlayer.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const CreateChannel = lazy(() => import('./components/CreateChannel.jsx'));
const Channel = lazy(() => import('./pages/Channel.jsx'));
const Channels = lazy(() => import('./pages/Channels.jsx'));

// ✅ YouTube-style loading fallback


const LoadingFallback = () => (
  <div className="gradient-spinner-container">
    <div className="gradient-spinner">
      <div className="gradient-spinner-inner"></div>
    </div>
    <h3 className="loading-text">Preparing your content</h3>
    <p className="loading-subtext">This will just take a moment</p>
  </div>
);
// ✅ Router configuration with children and 404
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <App />
      </Suspense>
    ),
    errorElement: <NotFound />,
    children: [
      {
        path: '/',
        element: <Homepage />,
      },
      {
        path: '/video/:videoId',
        element: <VideoPlayer />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/createChannel',
        element: <CreateChannel />,
      },
      {
        path: '/channel',
        element: <Channel />,
      },
      {
        path: '/channels/:id',
        element: <Channels />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

// ✅ App entry point with AuthProvider
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
