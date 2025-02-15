'use client';

import { use, useState, useEffect } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import { HomeIcon } from '@/components/Icons';

async function obtenerProducto(id) {
	try {
		const response = await fetch(`/api/stocks/getItems?id=${id}`);
		if (!response.ok) {
			throw new Error('No se pudo obtener el producto');
		}
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error al obtener el producto:', error);
		throw error;
	}
}

async function editarProducto(id, producto) {
	try {
		const response = await fetch('/api/stocks/editItem', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ id, ...producto }),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Error del servidor: ${errorText}`);
		}

		const data = await response.json();
		console.log('Producto actualizado con éxito:', data);
		return data;
	} catch (error) {
		console.error('Error al actualizar producto:', error);
		throw error;
	}
}

function EditProduct({ params }) {
	const { id } = use(params); // Accede al id del producto desde el enrutamiento dinámico
	const [producto, setProducto] = useState({
		producto: '',
		cantidad: '',
		precioUnitario: '',
	});
	const [search, setSearch] = useState([]);

	const handleSearchProducto = async (e) => {
		const response = await fetch('/api/stocks/getItems');
		const data = await response.json();
		const producto = data.find((item) => item.id === id);
		setSearch(producto);
	};

	useEffect(() => {
		if (id) {
			obtenerProducto(id)
				.then((data) => {
					setProducto({
						producto: data.producto || '',
						cantidad: data.cantidad || '',
						precioUnitario: data.precioUnitario || '',
					});
				})
				.catch((error) => {
					console.error('Error al cargar el producto:', error);
				});
		}
		handleSearchProducto();
	}, [id]);

	const handleChange = (e) => {
		const { id, value } = e.target;
		setProducto((prevProducto) => ({
			...prevProducto,
			[id]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!producto.producto || !producto.cantidad || !producto.precioUnitario) {
			alert('Por favor, completa todos los campos.');
			return;
		}

		try {
			await editarProducto(id, producto); // Editar producto en Firestore
			alert('Producto actualizado exitosamente');
		} catch (error) {
			alert('Error al actualizar el producto');
		}
	};

	return (
		<div className={styles.container}>
			<Link href='/home'>
				<HomeIcon />
			</Link>
			<h1>Editar Producto</h1>
			<form onSubmit={handleSubmit}>
				<div className={styles.formGroup}>
					<label htmlFor='producto'>Producto:</label>
					<input
						type='text'
						id='producto'
						value={producto.producto}
						onChange={handleChange}
						placeholder={search.producto}
						required
					/>
				</div>
				<div className={styles.formGroup}>
					<label htmlFor='cantidad'>Cantidad:</label>
					<input
						type='number'
						id='cantidad'
						value={producto.cantidad}
						onChange={handleChange}
						placeholder={search.cantidad}
						required
					/>
				</div>
				<div className={styles.formGroup}>
					<label htmlFor='precioUnitario'>Precio Unitario:</label>
					<input
						type='number'
						id='precioUnitario'
						value={producto.precioUnitario}
						onChange={handleChange}
						placeholder={search.precioUnitario}
						required
					/>
				</div>
				<button type='submit'>Actualizar Producto</button>
				<Link
					href='/stocks'
					className={styles.link}
				>
					Volver
				</Link>
			</form>
		</div>
	);
}

export default EditProduct;
