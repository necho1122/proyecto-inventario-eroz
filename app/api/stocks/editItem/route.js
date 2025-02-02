import { firestore } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function PUT(request) {
	try {
		const body = await request.json();
		const { id, producto, cantidad, precioUnitario } = body;

		// Obtener referencia al documento que se quiere actualizar
		const docRef = doc(firestore, 'stocks', id);

		// Actualizar el documento en Firestore
		await updateDoc(docRef, {
			producto,
			cantidad,
			precioUnitario,
		});

		console.log('Producto actualizado con ID:', id);

		return new Response(
			JSON.stringify({ message: 'Producto actualizado con éxito.' }),
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
