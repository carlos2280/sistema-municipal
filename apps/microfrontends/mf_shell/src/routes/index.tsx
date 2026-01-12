// src/routes/router.tsx
import { useRoutes } from 'react-router-dom';

import ProtectedRoute from '../component/ProtectedRoute';
import { useMenu } from '../hook/useMenu';
import AppLayout from '../layout/AppLayout';
import DashboardPage from '../pages/DashboardPage';
import Login from '../pages/login/Login';
import { generateRoutesFromMenu } from '../utils/generateRoutesFromMenu';

export const AppRoutes = () => {
  const { menu } = useMenu();

  const routes = [
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/',
      element: <ProtectedRoute />,
      children: [
        {
          path: '/',
          element: <AppLayout />,
          children: [
            { index: true, element: <DashboardPage /> },
            ...generateRoutesFromMenu(menu),
          ],
        },
      ],
    },
  ];

  return useRoutes(routes);
};
