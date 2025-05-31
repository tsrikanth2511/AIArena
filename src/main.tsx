import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import ChallengesPage from './pages/ChallengesPage';
import ChallengePage from './pages/ChallengePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import CompanyDashboardPage from './pages/CompanyDashboardPage';
import CreateChallengePage from './pages/CreateChallengePage';
import EditChallengePage from './pages/EditChallengePage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <HomePage /> },
      {
        path: '/challenges',
        element: (
          <ProtectedRoute>
            <ChallengesPage />
          </ProtectedRoute>
        ),
      },
      { path: '/challenges/:id', element: <ChallengePage /> },
      {
        path: '/leaderboard',
        element: (
          <ProtectedRoute>
            <LeaderboardPage />
          </ProtectedRoute>
        ),
      },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/auth/callback', element: <AuthCallbackPage /> },
      {
        path: '/company/dashboard',
        element: (
          <ProtectedRoute>
            <CompanyDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/company/challenges/create',
        element: (
          <ProtectedRoute>
            <CreateChallengePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/company/challenges/edit/:id',
        element: (
          <ProtectedRoute>
            <EditChallengePage />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);