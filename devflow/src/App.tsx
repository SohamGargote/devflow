import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { ProjectProvider } from './context/ProjectContext';
import Dashboard from './pages/Dashboard';
import Backlog from './pages/Backlog';
import SprintBoard from './pages/SprintBoard';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import { useUser } from '@clerk/clerk-react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkDomain = import.meta.env.VITE_CLERK_DOMAIN;

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useUser();
  
  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isSignedIn) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function App() {
  if (!clerkPubKey) {
    return <div className="flex items-center justify-center min-h-screen">Missing Clerk Publishable Key</div>;
  }

  return (
    <ClerkProvider 
      publishableKey={clerkPubKey}
      appearance={{
        baseTheme: undefined,
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
        },
      }}
    >
      <ProjectProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/backlog"
                  element={
                    <ProtectedRoute>
                      <Backlog />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sprint/:id"
                  element={
                    <ProtectedRoute>
                      <SprintBoard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </Router>
      </ProjectProvider>
    </ClerkProvider>
  );
}

export default App; 