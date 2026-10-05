import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { routes } from './routes'
import { STATIC_BUILD, staticRoute } from './lib/staticSite'
import './index.css'

// The static package has one HTML file per page and no server to read a URL
// path from, so each file opens the router on its own route.
const router = STATIC_BUILD
  ? createMemoryRouter(routes, { initialEntries: [staticRoute()] })
  : createBrowserRouter(routes)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
