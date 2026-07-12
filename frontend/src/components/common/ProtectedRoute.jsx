import { Navigate } from 'react-router-dom';

const isAuthenticated = true; // Placeholder for future auth state

function ProtectedRoute({ children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
