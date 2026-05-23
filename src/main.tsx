import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'

// Dev-only helper สำหรับ Playwright testing (emulator mode เท่านั้น)
if (import.meta.env.VITE_USE_EMULATOR === 'true') {
  import('./firebase/firebaseConfig').then(({ auth }) => {
    import('firebase/auth').then(({ signInWithEmailAndPassword, signOut, onAuthStateChanged }) => {
      (window as any).__devLogin = async (email: string, password: string) => {
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        // Wait for onAuthStateChanged to propagate so React state is ready before Playwright continues
        await new Promise<void>((resolve) => {
          const unsub = onAuthStateChanged(auth, (u) => {
            if (u && u.uid === user.uid) { unsub(); resolve(); }
          });
        });
      };
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
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={3500}
      toastOptions={{
        style: {
          fontFamily: 'var(--font-sans, inherit)',
          fontSize: '0.875rem',
        },
      }}
    />
  </StrictMode>,
)
