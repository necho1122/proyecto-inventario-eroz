import { firestore } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(request) {
	try {
		const body = await request.json();

		// Obtener referencia a la colección de Firestore
		const collectionRef = collection(firestore, 'stocks');

		// Agregar el nuevo documento a Firestore sin necesidad de asignar un ID manual
		const docRef = await addDoc(collectionRef, {
			producto: body.producto,
			cantidad: body.cantidad,
			precioUnitario: body.precioUnitario,
		});

		console.log('Venta agregada con ID:', docRef.id); // Firestore asignará el ID automáticamente

		return new Response(
			JSON.stringify({ message: 'Venta agregada con éxito.', id: docRef.id }), // También puedes devolver el ID generado
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
