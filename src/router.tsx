import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import CompanyDashboardPage from './pages/CompanyDashboardPage';
// ... other imports

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // ... other routes
      {
        path: 'company/dashboard',
        element: <CompanyDashboardPage />
      }
    ]
  }
]); 