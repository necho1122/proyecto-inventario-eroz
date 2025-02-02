'use client';

import { useState } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import { HomeIcon } from '@/components/Icons';

async function agregarVenta(venta) {
	try {
		const response = await fetch('/api/stocks/addItem', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(venta),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Error del servidor: ${errorText}`);
		}

		const data = await response.json();
		console.log('Venta agregada con éxito:', data);
	} catch (error) {
		console.error('Error al agregar venta:', error);
	}
}

function AddVentaComponent() {
	const [venta, setVenta] = useState({
		producto: '',
		cantidad: '',
		precioUnitario: '',
		marca: '',
		categoria: '',
	});

	const handleChange = (e) => {
		const { id, value } = e.target;
		setVenta((prevVenta) => ({
			...prevVenta,
			[id]: value, // Actualiza el campo correspondiente
		}));
	};

	const handleAddVenta = async () => {
		if (
			!venta.producto ||
			!venta.cantidad ||
			!venta.precioUnitario ||
			!venta.marca ||
			!venta.categoria
		) {
			alert('Por favor, completa todos los campos.');
			return;
		}
		await agregarVenta(venta); // Llama a la función para agregar la venta
		setVenta({
			producto: '',
			cantidad: '',
			precioUnitario: '',
			marca: '',
			categoria: '',
		}); // Limpia los campos
	};

	return (
		<div
			style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}
		>
			<div className={styles.container}>
				<Link href='/home'>
					<HomeIcon />
				</Link>
				<h1>Agregar nuevo producto</h1>
				<div className={styles.formGroup}>
					<label htmlFor='producto'>Producto:</label>
					<input
						type='text'
						id='producto'
						value={venta.producto}
						onChange={handleChange}
					/>
				</div>
				<div className={styles.formGroup}>
					<label htmlFor='cantidad'>Cantidad:</label>
					<input
						type='number'
						id='cantidad'
						value={venta.cantidad}
						onChange={handleChange}
					/>
				</div>
				<div className={styles.formGroup}>
					<label htmlFor='precioUnitario'>Precio Unitario:</label>
					<input
						type='number'
						id='precioUnitario'
						value={venta.precioUnitario}
						onChange={handleChange}
					/>
				</div>
				<div className={styles.formGroup}>
					<label htmlFor='marca'>Marca:</label>
					<input
						type='text'
						id='marca'
						value={venta.marca}
						onChange={handleChange}
					/>
				</div>
				<div className={styles.formGroup}>
					<label htmlFor='categoria'>Categoría:</label>
					<select
						id='categoria'
						value={venta.categoria}
						onChange={handleChange}
					>
						<option value='Accesorios'>Accesorios</option>
						<option value='Telefonos'>Teléfonos</option>
					</select>
				</div>

				<button onClick={handleAddVenta}>Agregar Producto</button>
				<Link
					href='/stocks'
					className={styles.link}
				>
					Volver
				</Link>
			</div>
		</div>
	);
}

export default AddVentaComponent;
