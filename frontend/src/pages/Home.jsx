import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

    const slides = [
        {
            id: 1,
            title: "Bienvenido a Veterinaria Michi",
            subtitle: "Cuidamos de tus mascotas con amor y profesionalismo",
            image: "🏥",
            description: "Centro veterinario integral con más de 10 años de experiencia"
        },
        {
            id: 2,
            title: "Atención Veterinaria Profesional",
            subtitle: "Equipo médico altamente calificado",
            image: "👨‍⚕️",
            description: "Veterinarios especializados en el cuidado de tu mejor amigo"
        },
        {
            id: 3,
            title: "Servicios Completos",
            subtitle: "Todo lo que tu mascota necesita",
            image: "🐾",
            description: "Consultas, vacunación, cirugías, hospitalización y más"
        },
        {
            id: 4,
            title: "Productos de Calidad",
            subtitle: "Alimentos, accesorios y medicinas",
            image: "🛒",
            description: "Encuentra todo para el bienestar de tu mascota"
        },
        {
            id: 5,
            title: "Agenda tu Cita Online",
            subtitle: "Portal de clientes disponible 24/7",
            image: "📱",
            description: "Registra tu mascota y agenda citas desde casa"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [slides.length]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <div className="home-container">
            <nav className="home-navbar">
                <div className="home-brand">
                    <h1>🐾 Veterinaria Michi</h1>
                </div>
                <div className="home-nav-buttons">
                    <button onClick={() => navigate('/login')} className="btn-login">
                        Iniciar Sesión
                    </button>
                    <button onClick={() => navigate('/register')} className="btn-register">
                        Registrarse
                    </button>
                </div>
            </nav>

            <div className="carousel-container">
                <div className="carousel">
                    <button className="carousel-button prev" onClick={prevSlide}>
                        ‹
                    </button>

                    <div className="carousel-content">
                        <div className="slide-icon">{slides[currentSlide].image}</div>
                        <h2 className="slide-title">{slides[currentSlide].title}</h2>
                        <h3 className="slide-subtitle">{slides[currentSlide].subtitle}</h3>
                        <p className="slide-description">{slides[currentSlide].description}</p>
                    </div>

                    <button className="carousel-button next" onClick={nextSlide}>
                        ›
                    </button>
                </div>

                <div className="carousel-indicators">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            className={`indicator ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`Ir a slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            <div className="home-features">
                <div className="feature-card">
                    <div className="feature-icon">🏥</div>
                    <h3>Consultas Médicas</h3>
                    <p>Atención personalizada para tu mascota</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">💉</div>
                    <h3>Vacunación</h3>
                    <p>Protege a tu mascota con nuestro plan de vacunas</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">🔬</div>
                    <h3>Laboratorio</h3>
                    <p>Análisis clínicos y diagnósticos precisos</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">🏨</div>
                    <h3>Hospitalización</h3>
                    <p>Cuidado intensivo las 24 horas</p>
                </div>
            </div>

            <div className="home-cta">
                <div className="cta-content">
                    <h2>¿Listo para empezar?</h2>
                    <p>Crea tu cuenta y accede al portal de clientes</p>
                    <div className="cta-buttons">
                        <button onClick={() => navigate('/register')} className="btn-primary-cta">
                            Registrarse Ahora
                        </button>
                        <button onClick={() => navigate('/portal-cliente')} className="btn-secondary-cta">
                            Portal de Clientes
                        </button>
                    </div>
                </div>
            </div>

            <footer className="home-footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>Veterinaria Michi</h4>
                        <p>Cuidando de tus mascotas desde 2014</p>
                    </div>
                    <div className="footer-section">
                        <h4>Contacto</h4>
                        <p>📞 (01) 234-5678</p>
                        <p>📧 info@veterinariamichi.com</p>
                    </div>
                    <div className="footer-section">
                        <h4>Horario</h4>
                        <p>Lunes - Viernes: 8:00 AM - 8:00 PM</p>
                        <p>Sábados: 9:00 AM - 6:00 PM</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2024 Veterinaria Michi. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}

export default Home;
