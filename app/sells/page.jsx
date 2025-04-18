'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import { HomeIcon } from '@/components/Icons';

function SalesPage() {
	const [cart, setCart] = useState([]);
	const [selectedProduct, setSelectedProduct] = useState('');
	const [quantity, setQuantity] = useState(1);
	const [exchangeRate, setExchangeRate] = useState({ rate: 0, date: '' });
	const [products, setProducts] = useState([]);
	const [stock, setStock] = useState([]);
	const [customerDetails, setCustomerDetails] = useState({
		nombre: '',
		cedula: '',
		direccion: '',
	});

	const getExchangeRate = async () => {
		try {
			const response = await fetch('https://pydolarve.org/api/v1/dollar?page=bcv');
			if (!response.ok) throw new Error('Error al obtener la tasa de cambio');
			const data = await response.json();
			setExchangeRate({
				rate: data.monitors.usd.price,
				date: data.datetime.date
			});
		} catch (error) {
			console.error('Error al cargar la tasa de cambio:', error.message);
		}
	};

	const getProducts = async () => {
		try {
			const response = await fetch('/api/stocks/getItems', { method: 'GET' });
			if (!response.ok) throw new Error('Error al obtener los productos');
			const data = await response.json();
			setStock(data);

			const processedProducts = data.map((product) => ({
				...product,
				precioUnitario: parseFloat(product.precioUnitario) || 0,
			}));

			setProducts(processedProducts);
		} catch (error) {
			console.error('Error al cargar productos:', error.message);
		}
	};

	useEffect(() => {
		getProducts();
		getExchangeRate();
	}, []);

	const actualizarCantidades = async () => {
		try {
			const promises = cart.map(async (producto) => {
				const productoEnStock = stock.find((item) => item.id === producto.id);

				if (!productoEnStock) {
					console.error(
						`Producto no encontrado en stock: ${producto.producto}`
					);
					return;
				}

				console.log(`Stock antes de la venta: ${productoEnStock.cantidad}`);
				console.log(`Cantidad en carrito: ${producto.quantity}`);

				const nuevaCantidad = productoEnStock.cantidad - producto.quantity;

				console.log(`Nueva cantidad calculada: ${nuevaCantidad}`);

				if (isNaN(nuevaCantidad) || nuevaCantidad < 0) {
					alert(`Stock insuficiente para ${producto.producto}.`);
					return;
				}

				const response = await fetch('/api/stocks/editItemOnSale', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id: producto.id, nuevaCantidad }),
				});

				if (!response.ok) {
					console.error(`Error al actualizar ${producto.producto}`);
					return;
				}

				console.log(`Stock actualizado para: ${producto.producto}`);
			});

			await Promise.all(promises);
			alert('Stock actualizado exitosamente.');
		} catch (error) {
			console.error('Error al actualizar stock:', error);
		}
	};

	const handleAddToCart = () => {
		const product = products.find((item) => item.id === selectedProduct);
		if (!product || quantity <= 0) return;

		setCart((prevCart) => {
			const existingItem = prevCart.find((item) => item.id === product.id);
			if (existingItem) {
				return prevCart.map((item) =>
					item.id === product.id
						? { ...item, quantity: item.quantity + Number(quantity) }
						: item
				);
			}
			return [...prevCart, { ...product, quantity: Number(quantity) }];
		});

		setSelectedProduct('');
		setQuantity(1);
	};

	// Enviar la venta a Firebase
	const saveSellToFirebase = async () => {
		try {
			const response = await fetch('/api/sells/addSells', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					productos: cart.map((item) => ({
						id: item.id,
						producto: item.producto,
						cantidad: item.quantity,
						precioUnitario: item.precioUnitario,
						subtotal: (parseFloat(item.precioUnitario) || 0) * item.quantity,
					})),
					cliente: customerDetails,
				}),
			});

			if (!response.ok) {
				throw new Error('Error al guardar la venta en Firebase');
			}

			const data = await response.json();
			console.log('Venta guardada en Firebase:', data);
		} catch (error) {
			console.error('Error al guardar la venta:', error.message);
		}
	};

	const handlePrintInvoice = async () => {
		try {
			// Abrir la ventana ANTES de cualquier operación async
			const printWindow = window.open('', '_blank');

			if (!printWindow) {
				alert(
					'Error: No se pudo abrir la ventana de impresión. Revisa las configuraciones del navegador.'
				);
				return;
			}

			// Guardar la venta en Firebase
			await saveSellToFirebase();
			await actualizarCantidades();

			// Verificar si el elemento "invoice" existe
			const invoiceElement = document.getElementById('invoice');
			if (!invoiceElement) {
				alert('Error: No se pudo generar la factura porque falta información.');
				printWindow.close(); // Cerrar la ventana si no hay contenido
				return;
			}

			const invoiceContent = invoiceElement.innerHTML;

			// Escribir contenido en la ventana de impresión
			printWindow.document.write(`
				<html>
					<head>
						<title>Factura</title>
						<style>
							body { font-family: Arial, sans-serif; margin: 20px; }
							h1 { color: #0078d7; }
							table { width: 100%; border-collapse: collapse; }
							th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
							th { background-color: #f4f4f9; }
							.customer-details { margin-bottom: 20px; }
						</style>
					</head>
					<body>
						<div class="customer-details">
							<h3>JCellPC</h3>
							<p><strong>RIF:</strong> 18.455.219-8</p>
							<p><strong>Dirección:</strong> Malaver 2 local #105-B en San José de Guanipa 6054, Estado Anzoátegui.</p>
							<p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
							<h3>Detalles del Cliente</h3>
							<p><strong>Nombre:</strong> ${customerDetails.nombre}</p>
							<p><strong>Cédula:</strong> ${customerDetails.cedula}</p>
							<p><strong>Dirección:</strong> ${customerDetails.direccion}</p>
						</div>
						${invoiceContent}
					</body>
				</html>
			`);

			printWindow.document.close();
			printWindow.print();
		} catch (error) {
			console.error('Error al generar la factura:', error);
			alert('Ocurrió un error al intentar imprimir la factura.');
		}
	};

	const calculateTotal = () =>
		cart.reduce((total, item) => {
			const unitPrice = parseFloat(item.precioUnitario) || 0;
			return total + unitPrice * item.quantity;
		}, 0);

	const handleCustomerDetailsChange = (e) => {
		const { name, value } = e.target;
		setCustomerDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
	};

	return (
		<div className={styles.container}>
			<Link href='/home'>
				<HomeIcon />
			</Link>
			<h1>Procesar Ventas</h1>

			<div className={styles.customerDetails}>
				<h3>Detalles del Cliente</h3>
				<div className="form-group">
					<label>Nombre:</label>
					<input
						type="text"
						value={customerDetails.nombre}
						onChange={(e) => setCustomerDetails({ ...customerDetails, nombre: e.target.value })}
						placeholder="Ingrese el nombre del cliente"
					/>
				</div>
				<div className="form-group">
					<label>Cédula:</label>
					<input
						type="text"
						value={customerDetails.cedula}
						onChange={(e) => setCustomerDetails({ ...customerDetails, cedula: e.target.value })}
						placeholder="Ingrese la cédula del cliente"
					/>
				</div>
				<div className="form-group">
					<label>Dirección:</label>
					<input
						type="text"
						value={customerDetails.direccion}
						onChange={(e) => setCustomerDetails({ ...customerDetails, direccion: e.target.value })}
						placeholder="Ingrese la dirección del cliente"
					/>
				</div>
			</div>

			<div className={styles.exchangeRate}>
				<h3>Tasa del BCV</h3>
				<p>Fecha: {exchangeRate.date}</p>
				<p>1 USD = {exchangeRate.rate?.toFixed(2)} Bs</p>
			</div>

			<div className={styles.form}>
				<select
					value={selectedProduct}
					onChange={(e) => setSelectedProduct(e.target.value)}
					className={styles.select}
				>
					<option value=''>Selecciona un producto</option>
					{products.map((product) => (
						<option
							key={product.id}
							value={product.id}
						>
							{product.producto} - ${product.precioUnitario.toFixed(2)}
						</option>
					))}
				</select>
				<input
					type='number'
					min='1'
					value={quantity}
					onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
					className={styles.input}
				/>
				<button
					onClick={handleAddToCart}
					className={styles.button}
				>
					Agregar al carrito
				</button>
			</div>

			<div className={styles.cart}>
				<h2>Resumen de la Venta</h2>
				<div id='invoice'>
					<table>
						<thead>
							<tr>
								<th>Producto</th>
								<th>Cantidad</th>
								<th>Precio Unitario ($)</th>
								<th>Subtotal ($)</th>
								<th>Subtotal (Bs)</th>
							</tr>
						</thead>
						<tbody>
							{cart.map((item) => {
								const subtotalUSD = item.precioUnitario * item.quantity;
								const subtotalBs = subtotalUSD * exchangeRate.rate;
								return (
									<tr key={item.id}>
										<td>{item.producto}</td>
										<td>{item.quantity}</td>
										<td>${item.precioUnitario.toFixed(2)}</td>
										<td>${subtotalUSD.toFixed(2)}</td>
										<td>Bs {subtotalBs.toFixed(2)}</td>
									</tr>
								);
							})}
						</tbody>
						<tfoot>
							<tr>
								<td colSpan="3"><strong>Total:</strong></td>
								<td><strong>${calculateTotal().toFixed(2)}</strong></td>
								<td><strong>Bs {(calculateTotal() * exchangeRate.rate).toFixed(2)}</strong></td>
							</tr>
						</tfoot>
					</table>
				</div>
				<button
					onClick={handlePrintInvoice}
					className={styles.buttonPrint}
				>
					Procesar e Imprimir Factura
				</button>
			</div>
		</div>
	);
}

export default SalesPage;
