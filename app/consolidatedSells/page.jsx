'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import { HomeIcon } from '@/components/Icons';

function SalesList() {
	const [sales, setSales] = useState([]);
	const [expandedSales, setExpandedSales] = useState({}); // Controla qué venta está expandida

	// Obtener las ventas desde Firebase
	const fetchSales = async () => {
		try {
			const response = await fetch('/api/sells/getSells', { method: 'GET' });
			if (!response.ok) throw new Error('Error al obtener las ventas');
			const data = await response.json();
			setSales(data);
		} catch (error) {
			console.error('Error al cargar ventas:', error.message);
		}
	};

	useEffect(() => {
		fetchSales();
	}, []);

	// Manejar el clic para expandir/contraer detalles de la venta
	const toggleExpand = (id) => {
		setExpandedSales((prevExpanded) => ({
			...prevExpanded,
			[id]: !prevExpanded[id], // Alternar entre expandido y contraído
		}));
	};

	return (
		<div className={styles.container}>
			<Link href='/home'>
				<HomeIcon />
			</Link>
			<h1>Lista de Ventas</h1>
			<ul className={styles.salesList}>
				{sales.map((sale) => (
					<li
						key={sale.id}
						className={styles.saleItem}
					>
						<div
							className={styles.saleSummary}
							onClick={() => toggleExpand(sale.id)}
						>
							<span>
								<strong>Fecha:</strong> {new Date(sale.fecha).toLocaleString()}
							</span>
							<span>
								<strong>Total Productos:</strong> {sale.productos.length}
							</span>
							<span>
								<strong>Cliente:</strong> {sale.cliente?.nombre || 'N/A'}
							</span>
						</div>
						{expandedSales[sale.id] && (
							<div className={styles.saleDetails}>
								<h3>Detalles de la Venta</h3>
								<ul>
									{sale.productos.map((product) => (
										<li
											key={product.id}
											className={styles.productItem}
										>
											<span>
												<strong>Producto:</strong> {product.producto}
											</span>
											<span>
												<strong>Cantidad:</strong> {product.cantidad}
											</span>
											<span>
												<strong>Precio Unitario:</strong> $
												{parseFloat(product.precioUnitario).toFixed(2)}
											</span>
											<span>
												<strong>Subtotal:</strong> $
												{(
													parseFloat(product.precioUnitario) * product.cantidad
												).toFixed(2)}
											</span>
										</li>
									))}
								</ul>
								<div className={styles.customerDetails}>
									<h4>Detalles del Cliente</h4>
									<p>
										<strong>Nombre:</strong> {sale.cliente?.nombre || 'N/A'}
									</p>
									<p>
										<strong>Cédula:</strong> {sale.cliente?.cedula || 'N/A'}
									</p>
									<p>
										<strong>Dirección:</strong>{' '}
										{sale.cliente?.direccion || 'N/A'}
									</p>
								</div>
							</div>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}

export default SalesList;
