import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        
        // Proteger rutas de administración
        if (req.nextUrl.pathname.startsWith('/api/stocks/')) {
            const isAdminRoute = 
                req.nextUrl.pathname.includes('/addItem') ||
                req.nextUrl.pathname.includes('/editItem') ||
                req.nextUrl.pathname.includes('/deleteItem');

            if (isAdminRoute && token?.role !== 'admin') {
                return new NextResponse(JSON.stringify({ 
                    error: 'Acceso denegado: Se requieren permisos de administrador' 
                }), { 
                    status: 403,
                    headers: { 'content-type': 'application/json' }
                });
            }
        }

        // Permitir acceso a rutas protegidas si el usuario está autenticado
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        },
        pages: {
            signIn: '/'
        }
    }
);

// Proteger solo las rutas necesarias
export const config = {
    matcher: [
        '/api/stocks/:path*',
        '/stocks/:path*',
        '/addItem',
        '/home',
        '/stocks',
        '/stocks/:id',
        '/sells',
        '/sells/:id'
    ]
};
