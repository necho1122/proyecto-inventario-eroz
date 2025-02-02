'use client';

import Link from 'next/link';
import styles from './page.module.css';
import Navbar from '@/components/Navbar';

function Page() {
	return (
		<>
			<Navbar />
			<div className={styles.container}>
				<div className={styles.content}>
					<h1 className={styles.title}>Bienvenido a JCellPC</h1>
					<p className={styles.subtitle}>
						Tu solución profesional para la reparación de celulares y
						computadores.
					</p>
					<div className={styles.linksContainer}>
						<Link
							href='/stocks'
							className={styles.link}
						>
							Ir a la lista de inventarios
						</Link>
						<Link
							href='/consolidatedSells'
							className={styles.link}
						>
							Ir al registro de ventas
						</Link>
						<Link
							href='/sells'
							className={styles.link}
						>
							Ir a la sección de nueva venta
						</Link>
					</div>
				</div>
			</div>
		</>
	);
}

export default Page;
