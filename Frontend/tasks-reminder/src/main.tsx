import { createRoot } from 'react-dom/client';
// import App from './App.tsx'
import './styles/index.css';
import App from "./FullApp";

createRoot(document.getElementById('root')!).render(
    <App />
)