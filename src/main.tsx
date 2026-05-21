import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import './index.css'
import App from './App.tsx'

// Dev-only helper สำหรับ Playwright testing (emulator mode เท่านั้น)
if (import.meta.env.VITE_USE_EMULATOR === 'true') {
  import('./firebase/firebaseConfig').then(({ auth }) => {
    import('firebase/auth').then(({ signInWithEmailAndPassword, signOut }) => {
      (window as any).__devLogin = (email: string, password: string) =>
        signInWithEmailAndPassword(auth, email, password);
      (window as any).__devSignOut = () => signOut(auth);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
