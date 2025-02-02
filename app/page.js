'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Hook para redirección
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Importa la instancia de Firebase Auth
import styles from './page.module.css';
import Link from 'next/link';

const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const router = useRouter(); // Inicializa el hook useRouter

	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			await signInWithEmailAndPassword(auth, email, password);
			router.push('/home'); // Redirige al usuario
		} catch (err) {
			setError('Credenciales incorrectas o usuario no registrado.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.container}>
			<form
				className={styles.form}
				onSubmit={handleLogin}
			>
				<h2 className={styles.title}>Iniciar Sesión</h2>

				{error && <p className={styles.error}>{error}</p>}

				<div className={styles.inputGroup}>
					<label htmlFor='email'>Correo Electrónico</label>
					<input
						type='email'
						id='email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder='Ingresa tu correo'
						required
					/>
				</div>

				<div className={styles.inputGroup}>
					<label htmlFor='password'>Contraseña</label>
					<input
						type='password'
						id='password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder='Ingresa tu contraseña'
						required
					/>
				</div>

				<button
					type='submit'
					className={styles.button}
					disabled={loading}
				>
					{loading ? 'Cargando...' : 'Iniciar Sesión'}
				</button>
				<Link
					href='/user/password-recovery'
					className={styles.forgotPassword}
				>
					¿Olvidaste tu contraseña?
				</Link>
			</form>
		</div>
	);
};

export default Login;
