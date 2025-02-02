import { firestore } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(request) {
	try {
		const body = await request.json();

		// Verificar que los datos del cliente existan y sean válidos
		if (
			!body.cliente ||
			!body.cliente.nombre ||
			!body.cliente.cedula ||
			!body.cliente.direccion
		) {
			throw new Error('Faltan datos del cliente');
		}

		// Crear un nuevo documento en la colección de ventas
		const collectionRef = collection(firestore, 'sells');
		const docRef = await addDoc(collectionRef, {
			fecha: new Date().toISOString(), // Fecha de la venta
			productos: body.productos, // Productos vendidos
			cliente: body.cliente, // Detalles del cliente
		});

		console.log('Venta agregada con ID:', docRef.id);

		return new Response(
			JSON.stringify({
				message: 'Venta agregada con éxito.',
				id: docRef.id,
			}),
			{
				status: 201,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	} catch (error) {
		console.error('Error al procesar la solicitud:', error);
		return new Response(
			JSON.stringify({ error: 'Error al agregar la venta' }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
}
