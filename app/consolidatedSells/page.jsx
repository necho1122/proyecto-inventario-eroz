'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import { HomeIcon } from '@/components/Icons';
import { jsPDF } from 'jspdf';

function SalesList() {
	const [sales, setSales] = useState([]);
	const [expandedSales, setExpandedSales] = useState({});
	const [dateRange, setDateRange] = useState({
		startDate: '',
		endDate: ''
	});
	const [notifications, setNotifications] = useState([]);

	const fetchSales = async () => {
		try {
			const response = await fetch('/api/sells/getSells', { method: 'GET' });
			if (!response.ok) throw new Error('Error al obtener las ventas');
			const data = await response.json();
			const sortedSales = data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
			setSales(sortedSales);
		} catch (error) {
			console.error('Error al cargar ventas:', error.message);
		}
	};

	useEffect(() => {
		fetchSales();
	}, []);

	const toggleExpand = (id) => {
		setExpandedSales((prevExpanded) => ({
			...prevExpanded,
			[id]: !prevExpanded[id],
		}));
	};

	const handleDateChange = (e) => {
		const { name, value } = e.target;
		setDateRange(prev => ({
			...prev,
			[name]: value
		}));
	};

	const filteredSales = sales.filter(sale => {
		const saleDate = new Date(sale.fecha);
		const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
		const end = dateRange.endDate ? new Date(dateRange.endDate) : null;

		if (start && end) {
			return saleDate >= start && saleDate <= end;
		} else if (start) {
			return saleDate >= start;
		} else if (end) {
			return saleDate <= end;
		}
		return true;
	});

	const calculateTotal = (sale) => {
		return sale.productos.reduce((total, product) => {
			return total + (parseFloat(product.precioUnitario) * product.cantidad);
		}, 0);
	};

	const handleDownloadPDF = async () => {
		const autoTable = (await import('jspdf-autotable')).default;
		const doc = new jsPDF();
		
		// Configurar el título
		doc.setFontSize(18);
		doc.text('Reporte de Ventas - JCellPC', 14, 20);
		doc.setFontSize(11);
		
		// Agregar rango de fechas si está filtrado
		let yPos = 30;
		if (dateRange.startDate || dateRange.endDate) {
			const dateText = `Periodo: ${dateRange.startDate || 'Inicio'} hasta ${dateRange.endDate || 'Actual'}`;
			doc.text(dateText, 14, yPos);
			yPos += 10;
		}

		// Preparar los datos para la tabla
		const tableData = filteredSales.map(sale => [
			new Date(sale.fecha).toLocaleString(),
			sale.cliente?.nombre || 'N/A',
			sale.productos.length,
			`$${calculateTotal(sale).toFixed(2)}`
		]);

		// Generar la tabla
		autoTable(doc, {
			startY: yPos,
			head: [['Fecha', 'Cliente', 'Productos', 'Total']],
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
		doc.save('reporte-ventas-jcellpc.pdf');
	};

	const addNotification = (message) => {
		const id = Date.now();
		setNotifications(prev => [...prev, { id, message }]);
		
		setTimeout(() => {
			setNotifications(prev => prev.filter(n => n.id !== id));
		}, 5000);
	};

	const handleCancelSale = async (sellId) => {
		if (window.confirm('¿Estás seguro de que deseas cancelar esta venta?')) {
			try {
				const response = await fetch('/api/sells/cancelSell', { 
					method: 'POST', 
					body: JSON.stringify({ sellId }) 
				});
				const result = await response.json();
				
				if (response.ok) {
					addNotification(`Venta cancelada. Stock actualizado: ${result.updatedProducts.join(', ')}`);
					fetchSales();
				} else {
					addNotification('Error al cancelar la venta');
				}
			} catch (error) {
				addNotification('Error de conexión');
			}
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.notifications}>
				{notifications.map(notification => (
					<div key={notification.id} className={styles.notification}>
						{notification.message}
					</div>
				))}
			</div>
			<div className={styles.header}>
				<Link href='/home' className={styles.homeLink}>
					<HomeIcon />
				</Link>
				<h1 className={styles.title}>Lista de Ventas</h1>
			</div>

			<div className={styles.controls}>
				<div className={styles.dateFilters}>
					<div className={styles.dateInput}>
						<label htmlFor="startDate">Desde:</label>
						<input
							type="date"
							id="startDate"
							name="startDate"
							value={dateRange.startDate}
							onChange={handleDateChange}
						/>
					</div>
					<div className={styles.dateInput}>
						<label htmlFor="endDate">Hasta:</label>
						<input
							type="date"
							id="endDate"
							name="endDate"
							value={dateRange.endDate}
							onChange={handleDateChange}
						/>
					</div>
				</div>
				<button onClick={handleDownloadPDF} className={styles.downloadButton}>
					Descargar PDF
				</button>
			</div>

			<div className={styles.summary}>
				<div className={styles.summaryItem}>
					<span>Total Ventas:</span>
					<strong>{filteredSales.length}</strong>
				</div>
				<div className={styles.summaryItem}>
					<span>Total Ingresos:</span>
					<strong>
						${filteredSales.reduce((sum, sale) => sum + calculateTotal(sale), 0).toFixed(2)}
					</strong>
				</div>
			</div>

			<ul className={styles.salesList}>
				{filteredSales.map((sale) => (
					<li key={sale.id} className={styles.saleItem}>
						<div className={styles.saleSummary} onClick={() => toggleExpand(sale.id)}>
							<div className={styles.saleHeader}>
								<span className={styles.saleDate}>
									{new Date(sale.fecha).toLocaleString()}
								</span>
								<span className={styles.saleTotal}>
									${calculateTotal(sale).toFixed(2)}
								</span>
							</div>
							<div className={styles.saleInfo}>
								<span>
									<strong>Cliente:</strong> {sale.cliente?.nombre || 'N/A'}
								</span>
								<span>
									<strong>Productos:</strong> {sale.productos.length}
								</span>
							</div>
						</div>

						{expandedSales[sale.id] && (
							<div className={styles.saleDetails}>
								<h3>Detalles de la Venta</h3>
								<ul className={styles.productsList}>
									{sale.productos.map((product) => (
										<li key={product.id} className={styles.productItem}>
											<span className={styles.productName}>
												{product.producto}
											</span>
											<div className={styles.productDetails}>
												<span>
													Cantidad: {product.cantidad}
												</span>
												<span>
													Precio: ${parseFloat(product.precioUnitario).toFixed(2)}
												</span>
												<span className={styles.productTotal}>
													Subtotal: ${(parseFloat(product.precioUnitario) * product.cantidad).toFixed(2)}
												</span>
											</div>
										</li>
									))}
								</ul>
								<div className={styles.customerDetails}>
									<h4>Detalles del Cliente</h4>
									<p><strong>Nombre:</strong> {sale.cliente?.nombre || 'N/A'}</p>
									<p><strong>Cédula:</strong> {sale.cliente?.cedula || 'N/A'}</p>
								</div>
							</div>
						)}
						<button 
							onClick={() => handleCancelSale(sale.id)}
							className={styles.cancel}
						>
							Cancelar
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}

export default SalesList;
