import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserLogin from './pages/UserLogin';
import UserRegister from './pages/UserRegister';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserRegister />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
