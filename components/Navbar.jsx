'use client';

import Link from 'next/link';
import styles from './Navbar.module.css';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { FiLogOut } from 'react-icons/fi';

const Navbar = () => {
	const { data: session } = useSession();

	const handleSignOut = async () => {
		await signOut({ redirect: true, callbackUrl: '/' });
	};

	return (
		<nav className={styles.navbar}>
			<div className={styles.logo}>
				<Link href='/home'>
					<Image
						src='/logo.jpg'
						alt='logo'
						width={40}
						height={40}
					/>
				</Link>
			</div>
			<ul className={styles.navLinks}>
				<li>
					<Link href='/home' className={styles.link}>
						Home
					</Link>
				</li>
				<li>
					<Link href='/stocks' className={styles.link}>
						Inventario
					</Link>
				</li>
				<li>
					<Link href='/sells' className={styles.link}>
						Ventas
					</Link>
				</li>
				{session?.user?.role === 'admin' && (
					<li>
						<Link href='/user/adminPage' className={styles.link}>
							Admin Panel
						</Link>
					</li>
				)}
				{session && (
					<li>
						<button onClick={handleSignOut} className={styles.signOutButton}>
							<FiLogOut /> Cerrar Sesión
						</button>
					</li>
				)}
			</ul>
		</nav>
	);
};

export default Navbar;
