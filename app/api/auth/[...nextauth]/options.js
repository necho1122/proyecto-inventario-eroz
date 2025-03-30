import CredentialsProvider from 'next-auth/providers/credentials';
import { firestore } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export const options = {
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
                    // Buscar usuario en Firebase por email
                    const usersRef = collection(firestore, 'users');
                    const q = query(usersRef, where("email", "==", credentials.email));
                    const querySnapshot = await getDocs(q);

                    if (querySnapshot.empty) {
                        throw new Error('Credenciales inválidas');
                    }

                    const userDoc = querySnapshot.docs[0];
                    const user = userDoc.data();

                    // Verificar contraseña
                    if (user.password !== credentials.password) {
                        throw new Error('Credenciales inválidas');
                    }

                    // Devolver el usuario con su ID y rol
                    return {
                        id: userDoc.id,
                        name: user.user,
                        email: user.email,
                        role: user.role
                    };
                } catch (error) {
                    console.error('Error en autenticación:', error);
                    throw new Error('Error en la autenticación');
                }
            }
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.name = user.name;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.role = token.role;
                session.user.name = token.name;
            }
            return session;
        }
    },
    pages: {
        signIn: '/',
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development'
};
