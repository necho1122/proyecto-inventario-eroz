import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Lista de usuarios de prueba
const users = [
    {
        id: '1',
        name: 'Administrador',
        email: 'admin@example.com',
        password: 'password',
        role: 'admin'
    },
    {
        id: '2',
        name: 'Usuario Regular',
        email: 'user@example.com',
        password: 'password',
        role: 'user'
    }
];

export const { auth, signIn, signOut } = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    console.log('Faltan credenciales');
                    throw new Error('Por favor ingrese email y contraseña');
                }

                try {
                    const user = users.find(user => 
                        user.email.toLowerCase() === credentials.email.toLowerCase() && 
                        user.password === credentials.password
                    );

                    if (!user) {
                        console.log('Usuario no encontrado:', credentials.email);
                        throw new Error('Credenciales incorrectas');
                    }

                    const { password, ...userWithoutPassword } = user;
                    console.log('Login exitoso para:', user.email);
                    return userWithoutPassword;
                } catch (error) {
                    console.error('Error en autorización:', error);
                    throw error;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        }
    },
    pages: {
        signIn: '/',
        error: '/',
        signOut: '/'
    },
    debug: process.env.NODE_ENV === 'development'
});
