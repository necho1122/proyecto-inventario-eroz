import { firestore } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(request) {
	try {
		const body = await request.json();

		// Obtener referencia a la colección de Firestore
		const collectionRef = collection(firestore, 'users');

		// Agregar el nuevo documento a Firestore sin necesidad de asignar un ID manual
		const docRef = await addDoc(collectionRef, {
            user: body.user,
            role: body.role,
			email: body.email,
			password: body.password,
		});

		console.log('Usuario agregado con ID:', docRef.id); // Firestore asignará el ID automáticamente

		return new Response(
			JSON.stringify({ message: 'Usuario agregado con éxito.', id: docRef.id }), // También puedes devolver el ID generado
			{
				status: 201,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	} catch (error) {
		console.error('Error al procesar la solicitud:', error);
		return new Response(
			JSON.stringify({ error: 'Error al agregar el usuario' }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
}
