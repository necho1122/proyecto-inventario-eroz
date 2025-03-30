'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Link from 'next/link';
import Image from 'next/image';

const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const router = useRouter();

	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const result = await signIn('credentials', {
				redirect: true,
				email,
				password,
				callbackUrl: '/home'
			});
		} catch (error) {
			setError('Error al iniciar sesión');
			setLoading(false);
		}
	};

	return (
		<div className={styles.container}>
			<form
				className={styles.form}
				onSubmit={handleLogin}
			>
				<Image
					src='/logo.jpg'
					alt='Logo'
					width={100}
					height={100}
				/>
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
