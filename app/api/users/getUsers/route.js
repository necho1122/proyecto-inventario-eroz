// /api/getStocksData/route.js
import { firestore } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
	try {
		const collectionRef = collection(firestore, 'users');
		const snapshot = await getDocs(collectionRef);

		// Agregar el ID del documento a los datos
		const data = snapshot.docs.map((doc) => ({
			id: doc.id, // Incluye el ID de Firestore
			...doc.data(),
		}));

		return new Response(JSON.stringify(data), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('Error obteniendo datos:', error);
		return new Response(JSON.stringify({ error: 'Error al obtener datos' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
