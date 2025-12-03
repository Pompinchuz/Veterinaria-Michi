import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PortalCliente from './pages/PortalCliente';
import Clientes from './pages/Clientes';
import Mascotas from './pages/Mascotas';
import Productos from './pages/Productos';
import Citas from './pages/Citas';
import Trabajadores from './pages/Trabajadores';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Rutas públicas */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Portal del Cliente */}
                    <Route 
                        path="/portal-cliente" 
                        element={
                            <ProtectedRoute allowedRoles={['cliente']}>
                                <PortalCliente />
                            </ProtectedRoute>
                        } 
                    />

                    {/* Dashboard del Personal */}
                    <Route 
                        path="/dashboard" 
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'veterinario', 'enfermera', 'recepcionista']}>
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

                    <Route 
                        path="/productos" 
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'veterinario', 'enfermera', 'recepcionista']}>
                                <Productos />
                            </ProtectedRoute>
                        } 
                    />

                    <Route 
                        path="/citas" 
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'veterinario', 'enfermera', 'recepcionista']}>
                                <Citas />
                            </ProtectedRoute>
                        } 
                    />

                    <Route 
                        path="/trabajadores" 
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <Trabajadores />
                            </ProtectedRoute>
                        } 
                    />

                    {/* Redirección por defecto */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;