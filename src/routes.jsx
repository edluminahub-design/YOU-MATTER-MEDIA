import Layout from './components/Layout'
import AboutPage from './pages/AboutPage'
import ClientsPage from './pages/ClientsPage'
import ContactPage from './pages/ContactPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import ServicesPage from './pages/ServicesPage'
import WorkPage from './pages/WorkPage'

/**
 * Route table. Pages are imported eagerly rather than lazily: the whole site
 * is ~60 kB of script, and a lazy chunk still loading when the transition
 * curtain lifts would uncover a blank page — the one thing the transition
 * exists to prevent.
 */
export const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'work', element: <WorkPage /> },
      { path: 'clients', element: <ClientsPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
