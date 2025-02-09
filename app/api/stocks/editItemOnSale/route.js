import { firestore } from '@/lib/firebase'; // Asegúrate de que 'db' está correctamente importado
import { doc, updateDoc } from 'firebase/firestore';

export async function PUT(request) {
	try {
		const body = await request.json();
		const { id, nuevaCantidad } = body;

		if (isNaN(nuevaCantidad) || nuevaCantidad < 0) {
			return new Response(
				JSON.stringify({ error: 'Cantidad inválida o negativa.' }),
				{ status: 400, headers: { 'Content-Type': 'application/json' } }
			);
		}

		// Obtener referencia al documento en Firestore
		const docRef = doc(firestore, 'stocks', id);

		// Actualizar la cantidad en Firestore
		await updateDoc(docRef, {
			cantidad: nuevaCantidad,
		});

		console.log(
			`Producto con ID ${id} actualizado con la nueva cantidad: ${nuevaCantidad}`
		);

		return new Response(
			JSON.stringify({ message: 'Cantidad actualizada exitosamente.' }),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	} catch (error) {
		console.error('Error al procesar la solicitud:', error);
		return new Response(
			JSON.stringify({ error: 'Error al actualizar el producto' }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
}
