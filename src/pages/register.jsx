import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        emailId: '',
        mobile_no: '',
        password: '',
        role_id: ''
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

    const handleChange = (e) => {
        setFormData(prevData => ({
            ...prevData,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/users/register', formData, {
                headers: { 'Content-Type': 'application/json' }
            });
            alert("Registration Successful!");
        } catch (error) {
            alert("Registration Failed!");
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
            padding: '40px 40px',
            borderRadius: '32px',
            boxShadow: `
                0 30px 80px -20px rgba(0, 0, 0, 0.9),
                0 0 0 1px rgba(255, 255, 255, 0.15),
                inset 0 1px 1px rgba(255, 255, 255, 0.3)
            `,
            textAlign: 'left',
            boxSizing: 'border-box'
        },
        title: {
            margin: '0 0 25px 0',
            color: '#ffffff',
            fontSize: '32px',
            fontWeight: '800',
            letterSpacing: '-1px',
            lineHeight: '1.2',
            textAlign: 'center'
        },
        inputGroup: {
            marginBottom: '18px'
        },
        label: {
            display: 'block',
            color: '#f1f5f9',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '6px',
            letterSpacing: '0.3px'
        },
        input: (isFocused) => ({
            width: '100%',
            padding: '14px 18px',
            borderRadius: '16px',
            background: isFocused ? 'rgba(15, 23, 42, 0.95)' : 'rgba(3, 7, 18, 0.75)',
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
        selectOption: {
            backgroundColor: '#0f172a',
            color: '#ffffff'
        },
        button: {
            width: '100%',
            padding: '16px',
            marginTop: '10px',
            background: isHovered
                ? 'linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #db2777 100%)'
                : 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '16px',
            fontSize: '16px',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: isHovered
                ? '0 20px 40px rgba(168, 85, 247, 0.7), 0 0 20px rgba(236, 72, 153, 0.5)'
                : '0 10px 25px rgba(168, 85, 247, 0.35)',
            transform: isHovered ? 'translateY(-3px) scale(1.02)' : 'translateY(0) scale(1)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            letterSpacing: '0.6px'
        },
        backLink: {
            display: 'inline-block',
            textAlign: 'left',
            marginBottom: '15px',
            color: '#38bdf8',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
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
                    <Link to="/" style={styles.backLink}>← Back to Login</Link>

                    <h2 style={styles.title}>Create Account</h2>
                    <form onSubmit={handleSubmit} autoComplete="off">

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Full Name</label>
                            <input
                                style={styles.input(focusedInput === 'full_name')}
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                onFocus={() => setFocusedInput('full_name')}
                                onBlur={() => setFocusedInput(null)}
                                autoComplete="off"
                                required
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email Address</label>
                            <input
                                style={styles.input(focusedInput === 'emailId')}
                                name="emailId"
                                type="email"
                                value={formData.emailId}
                                onChange={handleChange}
                                onFocus={() => setFocusedInput('emailId')}
                                onBlur={() => setFocusedInput(null)}
                                autoComplete="off"
                                required
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Mobile Number</label>
                            <input
                                style={styles.input(focusedInput === 'mobile_no')}
                                name="mobile_no"
                                value={formData.mobile_no}
                                onChange={handleChange}
                                onFocus={() => setFocusedInput('mobile_no')}
                                onBlur={() => setFocusedInput(null)}
                                autoComplete="off"
                                required
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>User Role</label>
                            <select
                                style={styles.input(focusedInput === 'role_id')}
                                name="role_id"
                                value={formData.role_id}
                                onChange={handleChange}
                                onFocus={() => setFocusedInput('role_id')}
                                onBlur={() => setFocusedInput(null)}
                                required
                            >
                                <option value="" style={styles.selectOption}>Select Role</option>
                                <option value="1" style={styles.selectOption}>HOD</option>
                                <option value="2" style={styles.selectOption}>Principal</option>
                                <option value="3" style={styles.selectOption}>Professor</option>
                                <option value="4" style={styles.selectOption}>Student</option>
                            </select>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Password</label>
                            <input
                                style={styles.input(focusedInput === 'password')}
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                onFocus={() => setFocusedInput('password')}
                                onBlur={() => setFocusedInput(null)}
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            style={styles.button}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            Register Now
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;