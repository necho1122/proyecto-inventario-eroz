// /api/deleteData/route.js
import { firestore } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

export async function DELETE(request) {
	try {
		const body = await request.json();
		const { id } = body;

		if (!id) {
			return new Response(JSON.stringify({ error: 'ID no proporcionado' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Referencia al documento específico en Firestore
		const documentRef = doc(firestore, 'stocks', id);

		// Eliminar el documento de Firestore
		await deleteDoc(documentRef);

		return new Response(
			JSON.stringify({
				message: `Producto con ID ${id} eliminado correctamente.`,
			}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	} catch (error) {
		console.error('Error eliminando documento de Firestore:', error);
		return new Response(
			JSON.stringify({ error: 'Error al eliminar el documento' }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
}
