import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './index.css';

function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <Login onLogin={(data) => setUser(data)} />;
  }

  return <Dashboard user={user} onLogout={() => setUser(null)} />;
}

export default App;
