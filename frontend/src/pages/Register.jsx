import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ⭐ IMPORTAR useAuth
import AuthService from '../services/auth.service';
import ClientesService from '../services/clientes.service';
import './Register.css';

function Register() {
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [userData, setUserData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        nombre: '',
        apellido: ''
    });

    const [clienteData, setClienteData] = useState({
        dni: '',
        telefono: '',
        direccion: ''
    });

    const navigate = useNavigate();
    const { login } = useAuth(); // ⭐ USAR login del contexto

    const handleUserDataChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClienteDataChange = (e) => {
        const { name, value } = e.target;
        setClienteData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleStep1Submit = (e) => {
        e.preventDefault();
        setError('');

        if (userData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (userData.password !== userData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setStep(2);
    };

    const handleStep2Submit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Crear usuario en Auth
            await AuthService.register({
                email: userData.email,
                password: userData.password,
                nombre: userData.nombre,
                apellido: userData.apellido,
                rol: 'cliente'
            });

            // 2. Hacer login automático usando el contexto ⭐ CAMBIO AQUÍ
            await login(userData.email, userData.password);

            // 3. Crear perfil de cliente
            await ClientesService.create({
                dni: clienteData.dni,
                nombres: userData.nombre,
                apellidos: userData.apellido,
                telefono: clienteData.telefono,
                email: userData.email,
                direccion: clienteData.direccion
            });

            // 4. Redirigir al portal del cliente
            navigate('/portal-cliente');

        } catch (err) {
            console.error('Error en registro:', err);
            setError(err.response?.data?.message || 'Error al registrarse. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <h1>🐾 Registro de Cliente</h1>
                    <p>Crea tu cuenta para gestionar las citas de tus mascotas</p>
                </div>

                <div className="steps-indicator">
                    <div className={`step ${step >= 1 ? 'active' : ''}`}>
                        <span className="step-number">1</span>
                        <span className="step-label">Cuenta</span>
                    </div>
                    <div className="step-line"></div>
                    <div className={`step ${step >= 2 ? 'active' : ''}`}>
                        <span className="step-number">2</span>
                        <span className="step-label">Datos</span>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleStep1Submit} className="register-form">
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre *</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={userData.nombre}
                                onChange={handleUserDataChange}
                                required
                                placeholder="Juan"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="apellido">Apellido *</label>
                            <input
                                type="text"
                                id="apellido"
                                name="apellido"
                                value={userData.apellido}
                                onChange={handleUserDataChange}
                                required
                                placeholder="Pérez"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={userData.email}
                                onChange={handleUserDataChange}
                                required
                                placeholder="tu@email.com"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Contraseña *</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={userData.password}
                                onChange={handleUserDataChange}
                                required
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={userData.confirmPassword}
                                onChange={handleUserDataChange}
                                required
                                placeholder="Repite tu contraseña"
                            />
                        </div>

                        <button type="submit" className="btn-primary">
                            Siguiente →
                        </button>

                        <div className="login-link">
                            ¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleStep2Submit} className="register-form">
                        <div className="form-group">
                            <label htmlFor="dni">DNI *</label>
                            <input
                                type="text"
                                id="dni"
                                name="dni"
                                value={clienteData.dni}
                                onChange={handleClienteDataChange}
                                required
                                maxLength="8"
                                placeholder="12345678"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="telefono">Teléfono *</label>
                            <input
                                type="tel"
                                id="telefono"
                                name="telefono"
                                value={clienteData.telefono}
                                onChange={handleClienteDataChange}
                                required
                                placeholder="987654321"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="direccion">Dirección *</label>
                            <textarea
                                id="direccion"
                                name="direccion"
                                value={clienteData.direccion}
                                onChange={handleClienteDataChange}
                                required
                                rows="3"
                                placeholder="Av. Principal 123, Distrito, Ciudad"
                            />
                        </div>

                        <div className="form-actions">
                            <button 
                                type="button" 
                                className="btn-secondary"
                                onClick={() => setStep(1)}
                                disabled={loading}
                            >
                                ← Atrás
                            </button>
                            <button 
                                type="submit" 
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Registrando...' : 'Crear Cuenta'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Register;