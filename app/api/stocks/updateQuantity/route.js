// /api/stocks/updateQuantity/route.js
import { firestore } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';

export async function POST(request) {
	try {
		const { productName, quantityChange } = await request.json();
		
		if (!productName || quantityChange === undefined) {
			return new Response(
				JSON.stringify({ error: 'Nombre del producto y cambio de cantidad son requeridos' }),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				}
			);
		}

		// Buscar el producto por nombre
		const stocksCollection = collection(firestore, 'stocks');
		const q = query(stocksCollection, where("producto", "==", productName));
		const querySnapshot = await getDocs(q);
		
		if (querySnapshot.empty) {
			return new Response(
				JSON.stringify({ error: 'Producto no encontrado' }),
				{
					status: 404,
					headers: { 'Content-Type': 'application/json' },
				}
			);
		}
		
		// Obtener el primer documento que coincide (debería ser único por nombre de producto)
		const productDoc = querySnapshot.docs[0];
		const currentQuantity = productDoc.data().cantidad;
		
		// Calcular la nueva cantidad
		const newQuantity = currentQuantity + quantityChange;
		
		// Validar que la nueva cantidad no sea negativa
		if (newQuantity < 0) {
			return new Response(
				JSON.stringify({ error: 'La cantidad resultante no puede ser negativa' }),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				}
			);
		}
		
		// Actualizar la cantidad en Firestore
		const productRef = doc(firestore, 'stocks', productDoc.id);
		await updateDoc(productRef, {
			cantidad: newQuantity
		});
		
		return new Response(
			JSON.stringify({
				success: true,
				message: 'Cantidad actualizada correctamente',
				newQuantity
			}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	} catch (error) {
		console.error('Error al actualizar cantidad:', error);
		return new Response(
			JSON.stringify({ error: 'Error al procesar la solicitud' }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
}
