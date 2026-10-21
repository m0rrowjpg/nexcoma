import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AdminDashboard } from './components/AdminDashboard';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

const isAdminRoute = window.location.pathname.startsWith('/admin');
createRoot(document.getElementById('root')!).render(
  isAdminRoute ? (
    <ThemeProvider><AdminDashboard /></ThemeProvider>
  ) : (
    <App />
  ),
);
