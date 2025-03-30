// filepath: c:\Users\Administrador\Desktop\Web Dev\Customers\Eroz\Universidad\proyecto-inventario\pages\api\auth\[...nextauth].js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				console.log('Verificando credenciales:', credentials); // Log para depuración
				if (
					credentials.email === 'admin@example.com' &&
					credentials.password === 'password'
				) {
					return { id: 1, name: 'Usuario', email: credentials.email };
				}
				console.log('Credenciales incorrectas');
				return null;
			},
		}),
	],
	pages: {
		signIn: '/', // Página de inicio de sesión
	},
	debug: true, // Habilitar logs de depuración
};

export default NextAuth(authOptions);
