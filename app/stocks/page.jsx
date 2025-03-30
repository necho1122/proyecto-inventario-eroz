'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import { DeleteIcon, EditIcon } from '@/components/Icons';
import { HomeIcon } from '@/components/Icons';
import { useSession } from 'next-auth/react';
import { jsPDF } from 'jspdf';

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
	const [busqueda, setBusqueda] = useState('');
	const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
	const { data: session } = useSession();
	const isAdmin = session?.user?.role === 'admin';

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

	const handleDownloadPDF = async () => {
		// Importar dinámicamente jspdf-autotable
		const autoTable = (await import('jspdf-autotable')).default;
		const doc = new jsPDF();
		
		// Configurar el título
		doc.setFontSize(18);
		doc.text('Inventario JCellPC', 14, 20);
		doc.setFontSize(11);
		doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);

		// Preparar los datos para la tabla
		const tableData = ventas
			.filter((venta) =>
				categoriaSeleccionada === '' ? true : venta.categoria === categoriaSeleccionada
			)
			.filter((venta) =>
				venta.producto.toLowerCase().includes(busqueda.toLowerCase())
			)
			.map(item => [
				item.producto,
				item.categoria,
				item.cantidad.toString(),
				`$${item.precioUnitario}`,
			]);

		// Generar la tabla
		autoTable(doc, {
			startY: 40,
			head: [['Producto', 'Categoría', 'Cantidad', 'Precio Unitario']],
			body: tableData,
			theme: 'striped',
			headStyles: {
				fillColor: [0, 123, 255],
				textColor: 255,
				fontSize: 12,
				halign: 'center'
			},
			styles: {
				fontSize: 10,
				cellPadding: 3,
				halign: 'left'
			},
			columnStyles: {
				2: { halign: 'center' },
				3: { halign: 'right' }
			}
		});

		// Guardar el PDF
		doc.save('inventario-jcellpc.pdf');
	};

	const filteredVentas = ventas
		.filter((venta) =>
			categoriaSeleccionada === '' ? true : venta.categoria === categoriaSeleccionada
		)
		.filter((venta) =>
			venta.producto.toLowerCase().includes(busqueda.toLowerCase())
		);

	return (
		<div className={styles.container}>
			<div className={styles.heading}>
				<Link href='/home'>
					<HomeIcon />
				</Link>
				<h1>Inventario</h1>
				<div className={styles.headerButtons}>
					{isAdmin && (
						<Link href='/addItem' className={styles.addButton}>
							Agregar Producto
						</Link>
					)}
					<button onClick={handleDownloadPDF} className={styles.downloadButton}>
						Descargar PDF
					</button>
				</div>
			</div>

			<div className={styles.filterContainer}>
				<label htmlFor='filtro'>Filtrar por categoría:</label>
				<select
					id='filtro'
					value={categoriaSeleccionada}
					onChange={(e) => setCategoriaSeleccionada(e.target.value)}
				>
					<option value=''>Todos</option>
					<option value='Accesorios'>Accesorios</option>
					<option value='Telefonos'>Teléfonos</option>
				</select>
				<input
					type='text'
					placeholder='Buscar producto...'
					value={busqueda}
					onChange={(e) => setBusqueda(e.target.value)}
					className={styles.searchInput}
				/>
			</div>

			<div className={styles.tableContainer}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th>Producto</th>
							<th>Cantidad</th>
							<th>Marca</th>
							<th>Categoría</th>
							<th>Precio Unitario</th>
							{isAdmin && <th>Acciones</th>}
						</tr>
					</thead>
					<tbody>
						{filteredVentas.map((venta) => (
							<tr key={venta.id}>
								<td>{venta.producto}</td>
								<td>{venta.cantidad}</td>
								<td>{venta.marca}</td>
								<td>{venta.categoria}</td>
								<td>${venta.precioUnitario}</td>
								{isAdmin && (
									<td className={styles.actionButton}>
										<Link href={`/stocks/${venta.id}`}>
											<EditIcon />
										</Link>
										<button
											onClick={() => handleEliminar(venta.id)}
											className={styles.deleteButton}
										>
											<DeleteIcon />
										</button>
									</td>
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default Page;
