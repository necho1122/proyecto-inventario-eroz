import { firestore } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return new Response(
                JSON.stringify({ error: 'ID de usuario no proporcionado' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        // Eliminar el documento de Firestore
        const docRef = doc(firestore, 'users', id);
        await deleteDoc(docRef);

        return new Response(
            JSON.stringify({ message: 'Usuario eliminado con éxito' }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        return new Response(
            JSON.stringify({ error: 'Error al eliminar el usuario' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
