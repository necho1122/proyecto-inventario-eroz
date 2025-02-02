'use client';

import { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import styles from './page.module.css';

const PasswordReset = () => {
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handlePasswordReset = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage('');
		setError('');

		const auth = getAuth();

		try {
			await sendPasswordResetEmail(auth, email);
			setMessage(
				'Se ha enviado un correo para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada.'
			);
			setEmail('');
		} catch (err) {
			setError(
				'No se pudo enviar el correo de recuperación. Verifica si el correo es válido y está registrado.'
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.container}>
			<form
				className={styles.form}
				onSubmit={handlePasswordReset}
			>
				<h2 className={styles.title}>Recuperar Contraseña</h2>

				{message && <p className={styles.success}>{message}</p>}
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

				<button
					type='submit'
					className={styles.button}
					disabled={loading}
				>
					{loading ? 'Enviando...' : 'Enviar Correo de Recuperación'}
				</button>
			</form>
		</div>
	);
};

export default PasswordReset;
