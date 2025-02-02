import Link from 'next/link';
import styles from './Navbar.module.css';
import Image from 'next/image';

const Navbar = () => {
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
					<Link
						href='/'
						className={styles.link}
					>
						Home
					</Link>
				</li>
				<li>
					<Link
						href='/about'
						className={styles.link}
					>
						Sobre nosotros
					</Link>
				</li>
				<li>
					<Link
						href='/services'
						className={styles.link}
					>
						Servicios
					</Link>
				</li>
				<li>
					<Link
						href='/contact'
						className={styles.link}
					>
						Contacto
					</Link>
				</li>
			</ul>
		</nav>
	);
};

export default Navbar;
