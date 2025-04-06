import { firestore } from '@/lib/firebase';
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function POST(request) {
  try {
    const { sellId } = await request.json();

    if (!sellId) {
      return new Response(
        JSON.stringify({ error: 'ID de venta es requerido' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Obtener la venta a cancelar
    const sellDocRef = doc(firestore, 'sells', sellId);
    const sellDoc = await getDoc(sellDocRef);

    if (!sellDoc.exists()) {
      return new Response(
        JSON.stringify({ error: 'Venta no encontrada' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const sellData = sellDoc.data();
    const { productos } = sellData;

    // Actualizar el stock de cada producto
    const updatedProducts = [];
    for (const producto of productos) {
      const stockCollection = collection(firestore, 'stocks');
      const q = query(stockCollection, where("producto", "==", producto.producto));
      const stockSnapshot = await getDocs(q);

      if (!stockSnapshot.empty) {
        const stockDoc = stockSnapshot.docs[0];
        const currentStock = stockDoc.data();
        const newStock = {
          ...currentStock,
          cantidad: parseInt(currentStock.cantidad) + parseInt(producto.cantidad)
        };

        await updateDoc(stockDoc.ref, newStock);
        updatedProducts.push({ nombre: producto.producto, cantidad: newStock.cantidad });
      }
    }

    // Eliminar la venta
    await deleteDoc(sellDocRef);

    return new Response(
      JSON.stringify({ 
        success: true,
        updatedProducts: updatedProducts.map(p => `${p.nombre}: ${p.cantidad}`)
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error al cancelar venta:', error);
    return new Response(
      JSON.stringify({ error: 'Error al cancelar la venta' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
