import { Inter, Roboto_Mono } from 'next/font/google';
import Providers from './providers';
import Navbar from '@/components/Navbar';
import './globals.css';

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
});

const robotoMono = Roboto_Mono({
	variable: '--font-roboto-mono',
	subsets: ['latin'],
});

export const metadata = {
    title: 'JCellPC',
    description: 'Tienda de celulares, computadoras y accesorios',
};

export default function RootLayout({ children }) {
	return (
		<html lang='en'>
			<body className={`${inter.variable} ${robotoMono.variable}`}>
				<Providers>
					<Navbar />
					{children}
				</Providers>
			</body>
		</html>
	);
}
