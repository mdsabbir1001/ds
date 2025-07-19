import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LoginPage from './pages/Login';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="*" element={<LoginPage />} /> {/* Default to login page */}
      </Routes>
    </Router>
  );
}

export default App;