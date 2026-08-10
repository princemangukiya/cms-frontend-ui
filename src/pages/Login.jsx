import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const [loginData, setLoginData] = useState({
        emailId: '',
        password: ''
    });

    const [focusedInput, setFocusedInput] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const canvasRef = useRef(null);

    // Dynamic Mesh Particle Canvas Background
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();

        const particleCount = 70;
        const particles = Array.from({ length: particleCount }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.6,
            speedY: (Math.random() - 0.5) * 0.6,
            alpha: Math.random() * 0.5 + 0.3
        }));

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particleCount; i++) {
                for (let j = i + 1; j < particleCount; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 110) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(168, 85, 247, ${0.15 * (1 - distance / 110)})`;
                        ctx.lineWidth = 0.8;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            particles.forEach((p) => {
                p.x += p.speedX;
                p.y += p.speedY;

                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.fillStyle = `rgba(192, 132, 252, ${p.alpha})`;
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#c084fc';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        window.addEventListener('resize', resizeCanvas);
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/dashboard");
        }
    }, [navigate]);

    const handleChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "http://localhost:8080/api/users/login",
                loginData
            );

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            alert("Login Successful!");
            navigate("/dashboard");

        } catch (error) {
            console.error(error);
            alert("Invalid Email or Password!");
        }
    };

    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            width: '100vw',
            backgroundColor: '#020617',
            backgroundImage: `
                radial-gradient(circle at 10% 10%, rgba(99, 102, 241, 0.3) 0%, transparent 45%),
                radial-gradient(circle at 90% 90%, rgba(236, 72, 153, 0.25) 0%, transparent 45%),
                radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.2) 0%, transparent 60%)
            `,
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            padding: '20px',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden'
        },
        canvas: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
        },
        glow1: {
            position: 'absolute',
            top: '15%',
            left: '15%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(90px)',
            pointerEvents: 'none',
            zIndex: 2
        },
        glow2: {
            position: 'absolute',
            bottom: '10%',
            right: '15%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(100px)',
            pointerEvents: 'none',
            zIndex: 2
        },
        cardWrapper: {
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: '440px'
        },
        card: {
            width: '100%',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            padding: '52px 40px 48px 40px',
            borderRadius: '32px',
            boxShadow: `
                0 30px 80px -20px rgba(0, 0, 0, 0.9),
                0 0 0 1px rgba(255, 255, 255, 0.15),
                inset 0 1px 1px rgba(255, 255, 255, 0.3)
            `,
            textAlign: 'center',
            boxSizing: 'border-box'
        },
        title: {
            margin: '0 0 8px 0',
            color: '#ffffff',
            fontSize: '34px',
            fontWeight: '800',
            letterSpacing: '-1px',
            lineHeight: '1.2'
        },
        subtitle: {
            color: '#94a3b8',
            fontSize: '14px',
            marginBottom: '36px',
            lineHeight: '1.5'
        },
        inputGroup: {
            textAlign: 'left',
            marginBottom: '22px'
        },
        label: {
            display: 'block',
            color: '#f1f5f9',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '8px',
            letterSpacing: '0.3px'
        },
        input: (isFocused) => ({
            width: '100%',
            padding: '16px 20px',
            borderRadius: '16px',
            background: isFocused ? 'rgba(15, 23, 42, 0.9)' : 'rgba(3, 7, 18, 0.75)',
            border: isFocused
                ? '1.5px solid #c084fc'
                : '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: isFocused
                ? '0 0 0 4px rgba(192, 132, 252, 0.3), 0 0 30px rgba(192, 132, 252, 0.4)'
                : 'none',
            outline: 'none',
            fontSize: '15px',
            color: '#ffffff',
            boxSizing: 'border-box',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            cursor: 'pointer'
        }),
        button: {
            width: '100%',
            padding: '17px',
            marginTop: '12px',
            background: isHovered
                ? 'linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #db2777 100%)'
                : 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '16px',
            fontSize: '17px',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: isHovered
                ? '0 20px 40px rgba(168, 85, 247, 0.7), 0 0 20px rgba(236, 72, 153, 0.5)'
                : '0 10px 25px rgba(168, 85, 247, 0.35)',
            transform: isHovered ? 'translateY(-3px) scale(1.02)' : 'translateY(0) scale(1)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            letterSpacing: '0.6px'
        },
        footer: {
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '14px',
            color: '#94a3b8'
        },
        link: {
            color: '#38bdf8',
            fontWeight: '600',
            textDecoration: 'none',
            marginLeft: '6px',
            transition: 'color 0.2s ease'
        }
    };

    return (
        <div style={styles.container}>
            <canvas ref={canvasRef} style={styles.canvas} />
            <div style={styles.glow1} />
            <div style={styles.glow2} />

            <div style={styles.cardWrapper}>
                <div style={styles.card}>
                    <h2 style={styles.title}>Welcome Back</h2>
                    <p style={styles.subtitle}>Enter your details to sign in to your workspace</p>

                    <form onSubmit={handleLogin}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email Address</label>
                            <input
                                type="email"
                                name="emailId"
                                value={loginData.emailId}
                                onChange={handleChange}
                                onFocus={() => setFocusedInput('emailId')}
                                onBlur={() => setFocusedInput(null)}
                                required
                                style={styles.input(focusedInput === 'emailId')}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={loginData.password}
                                onChange={handleChange}
                                onFocus={() => setFocusedInput('password')}
                                onBlur={() => setFocusedInput(null)}
                                required
                                style={styles.input(focusedInput === 'password')}
                            />
                        </div>

                        <button
                            type="submit"
                            style={styles.button}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            Login
                        </button>
                    </form>

                    <div style={styles.footer}>
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            style={styles.link}
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;