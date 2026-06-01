import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './styles.css';
import { Layout } from '@/components/layout';
import { RouteError } from '@/routes/error';
import { Home } from '@/routes/home';
import { PetsPage, petsLoader } from '@/routes/pets';
import { PetDetailPage, petLoader } from '@/routes/pet-detail';
import { AdoptPage } from '@/routes/adopt';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'pets',
        loader: petsLoader,
        element: <PetsPage />,
        errorElement: <RouteError />,
      },
      {
        path: 'pets/:id',
        loader: petLoader,
        element: <PetDetailPage />,
        errorElement: <RouteError />,
      },
      {
        // Adoption / request-info flow reuses the single-pet loader.
        path: 'pets/:id/adopt',
        loader: petLoader,
        element: <AdoptPage />,
        errorElement: <RouteError />,
      },
    ],
  },
]);

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
