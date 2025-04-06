// /api/returns/addReturn/route.js
import { firestore } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(request) {
	try {
		const data = await request.json();
		
		// Validar datos requeridos
		if (!data.producto || !data.cantidad || !data.razon || !data.fecha) {
			return new Response(
				JSON.stringify({ error: 'Todos los campos son requeridos' }),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				}
			);
		}

		// Crear referencia a la colección "returns"
		const returnsCollection = collection(firestore, 'returns');
		
		// Agregar el documento a la colección
		const docRef = await addDoc(returnsCollection, {
			producto: data.producto,
			cantidad: data.cantidad,
			razon: data.razon,
			fecha: data.fecha,
			createdAt: new Date().toISOString(),
		});

		return new Response(
			JSON.stringify({
				id: docRef.id,
				message: 'Devolución registrada exitosamente',
			}),
			{
				status: 201,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	} catch (error) {
		console.error('Error al agregar devolución:', error);
		return new Response(
			JSON.stringify({ error: 'Error al procesar la solicitud' }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
}
