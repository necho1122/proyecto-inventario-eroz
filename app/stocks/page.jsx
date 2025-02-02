'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import { DeleteIcon, EditIcon } from '@/components/Icons';
import { HomeIcon } from '@/components/Icons';

// Función para eliminar un producto en Firestore
async function eliminarProducto(id) {
	try {
		const response = await fetch('/api/stocks/deleteItem', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id }),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Error del servidor: ${errorText}`);
		}

		console.log(`Producto con ID ${id} eliminado exitosamente.`);
		return true;
	} catch (error) {
		console.error('Error al eliminar producto:', error);
		return false;
	}
}

function Page() {
	const [ventas, setVentas] = useState([]);

	// Obtener la lista de ventas desde Firestore
	const obtenerVentas = async () => {
		try {
			const response = await fetch('/api/stocks/getItems', { method: 'GET' });
			if (!response.ok) throw new Error('Error al obtener las ventas');
			const data = await response.json();
			setVentas(data); // Actualiza el estado con los datos obtenidos
		} catch (error) {
			console.error('Error al cargar ventas:', error.message);
		}
	};

	console.log(ventas);

	// Manejar la eliminación de un producto
	const handleEliminar = async (id) => {
		const confirmDelete = window.confirm(
			'¿Seguro que deseas eliminar este producto?'
		);
		if (confirmDelete) {
			const success = await eliminarProducto(id);
			if (success) {
				// Actualiza la lista después de la eliminación
				setVentas((prevVentas) =>
					prevVentas.filter((venta) => venta.id !== id)
				);
			}
		}
	};

	useEffect(() => {
		obtenerVentas();
	}, []);

	return (
		<div className={styles.page}>
			<div className={styles.container}>
				<div>
					<Link href='/home'>
						<HomeIcon />
					</Link>
					<h1 className={styles.heading}>Lista de Inventario</h1>
					<Link href='/addItem'>
						<button className={styles.addButton}>Agregar nuevo producto</button>
					</Link>
				</div>
				<table className={styles.table}>
					<thead>
						<tr>
							<th>Producto</th>
							<th>Cantidad</th>
							<th>Precio Unitario</th>
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody>
						{ventas.map((venta) => (
							<tr key={venta.id}>
								<td>{venta.producto}</td>
								<td>{venta.cantidad}</td>
								<td>${venta.precioUnitario}</td>
								<td className={styles.actionButtonsContainer}>
									<Link href={`/stocks/${venta.id}`}>
										<button className={styles.actionButton}>
											<EditIcon />
										</button>
									</Link>
									<button
										className={styles.actionButton}
										onClick={() => handleEliminar(venta.id)}
									>
										<DeleteIcon />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default Page;
