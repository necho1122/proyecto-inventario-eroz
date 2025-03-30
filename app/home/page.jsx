'use client';

import Link from 'next/link';
import styles from './page.module.css';

import Image from 'next/image';
import { useSession } from 'next-auth/react';

function Page() {
	const { data: session } = useSession();

	return (
		<>
			<div className={styles.container}>
				<div className={styles.content}>
					<h1 className={styles.title}>
						Bienvenido {session?.user?.name ? `${session.user.name} a` : 'a'} JCellPC
					</h1>
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
				<div className={styles.imageContainer}>
					<Image
						src='/logo.jpg'
						alt='Imagen de una computadora y un celular'
						width={200}
						height={200}
					/>
				</div>
			</div>
		</>
	);
}

export default Page;
