'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import { DeleteIcon, EditIcon } from '@/components/Icons';
import { HomeIcon } from '@/components/Icons';

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
	const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');

	const obtenerVentas = async () => {
		try {
			const response = await fetch('/api/stocks/getItems', { method: 'GET' });
			if (!response.ok) throw new Error('Error al obtener las ventas');
			const data = await response.json();
			setVentas(data);
		} catch (error) {
			console.error('Error al cargar ventas:', error.message);
		}
	};

	const handleEliminar = async (id) => {
		const confirmDelete = window.confirm(
			'¿Seguro que deseas eliminar este producto?'
		);
		if (confirmDelete) {
			const success = await eliminarProducto(id);
			if (success) {
				setVentas((prevVentas) =>
					prevVentas.filter((venta) => venta.id !== id)
				);
			}
		}
	};

	useEffect(() => {
		obtenerVentas();
	}, []);

	const ventasFiltradas =
		categoriaFiltro === 'Todos'
			? ventas
			: ventas.filter((venta) => venta.categoria === categoriaFiltro);

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

				<div className={styles.filterContainer}>
					<label htmlFor='filtro'>Filtrar por categoría:</label>
					<select
						id='filtro'
						value={categoriaFiltro}
						onChange={(e) => setCategoriaFiltro(e.target.value)}
					>
						<option value='Todos'>Todos</option>
						<option value='Accesorios'>Accesorios</option>
						<option value='Telefonos'>Teléfonos</option>
					</select>
				</div>

				<table className={styles.table}>
					<thead>
						<tr>
							<th>Producto</th>
							<th>Cantidad</th>
							<th>Marca</th>
							<th>Categoría</th>
							<th>Precio Unitario</th>
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody>
						{ventasFiltradas.map((venta) => (
							<tr key={venta.id}>
								<td>{venta.producto}</td>
								<td>{venta.cantidad}</td>
								<td>{venta.marca}</td>
								<td>{venta.categoria}</td>
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
