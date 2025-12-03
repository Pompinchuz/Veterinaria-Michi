import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Mascotas from './pages/Mascotas';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    
                    <Route 
                        path="/dashboard" 
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } 
                    />

                    <Route 
                        path="/clientes" 
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'veterinario', 'enfermera', 'recepcionista']}>
                                <Clientes />
                            </ProtectedRoute>
                        } 
                    />

                    <Route 
                        path="/mascotas" 
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'veterinario', 'enfermera', 'recepcionista']}>
                                <Mascotas />
                            </ProtectedRoute>
                        } 
                    />

                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;