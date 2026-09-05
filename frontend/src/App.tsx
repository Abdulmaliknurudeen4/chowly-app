import { useState } from 'react';
import CustomerView from './components/CustomerView';
import WaiterView from './components/WaiterView';
import ManagerView from './components/ManagerView'; // Import the new view
import './App.css';

// 1. Add 'MANAGER' to the Role type
type Role = 'CUSTOMER' | 'WAITER' | 'MANAGER';

function App() {
  const [role, setRole] = useState<Role>('CUSTOMER');

  return (
    <div className="app-container">
      <nav style={{ padding: '1rem', background: '#eee', display: 'flex', justifyContent: 'space-between' }}>
        <h1>Chowly 🍽️</h1>
        <div>
          <button 
            onClick={() => setRole('CUSTOMER')}
            disabled={role === 'CUSTOMER'}
          >
            Customer Mode
          </button>
          <button 
            onClick={() => setRole('WAITER')}
            disabled={role === 'WAITER'}
            style={{ marginLeft: '10px' }}
          >
            Waiter Mode
          </button>
          {/* 2. Add the Manager button */}
          <button 
            onClick={() => setRole('MANAGER')}
            disabled={role === 'MANAGER'}
            style={{ marginLeft: '10px' }}
          >
            Manager Mode
          </button>
        </div>
      </nav>

      <main style={{ padding: '2rem' }}>
        {/* 3. Render the correct view based on the role */}
        {role === 'CUSTOMER' && <CustomerView />}
        {role === 'WAITER' && <WaiterView />}
        {role === 'MANAGER' && <ManagerView />}
      </main>
    </div>
  );
}

export default App;