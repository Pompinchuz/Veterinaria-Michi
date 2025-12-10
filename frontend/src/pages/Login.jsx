import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

   const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const response = await login(email, password);
        
        // Redirigir según el rol
        if (response.data.usuario.rol === 'cliente') {
            navigate('/portal-cliente');
        } else {
            navigate('/dashboard');
        }
    } catch (err) {
        setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>🏥 Veterinaria</h1>
                    <p>Sistema de Gestión</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn-login"
                        disabled={loading}
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

<div className="register-link">
    ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
</div>
                <div className="login-footer">
                    <p className="users-demo">Usuarios de prueba:</p>
                    <ul className="demo-users">
                        <li><strong>Admin:</strong> admin@vetclinic.com / admin123</li>
                        <li><strong>Veterinario:</strong> carlos.mendoza@vetclinic.com / vet123</li>
                        <li><strong>Cliente:</strong> juan.perez@email.com / cliente123</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Login;