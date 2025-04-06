'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HomeIcon } from '@/components/Icons';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';

function ReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    producto: '',
    cantidad: '',
    razon: '',
    fecha: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fadeOut, setFadeOut] = useState(false);
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  // Obtener productos y devoluciones al cargar la página
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener lista de productos
        const productsResponse = await fetch('/api/stocks/getItems');
        if (!productsResponse.ok) throw new Error('Error al obtener productos');
        const productsData = await productsResponse.json();
        setProducts(productsData);
        
        // Obtener lista de devoluciones
        const returnsResponse = await fetch('/api/returns/getReturns');
        if (!returnsResponse.ok) throw new Error('Error al obtener devoluciones');
        const returnsData = await returnsResponse.json();
        setReturns(returnsData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar datos. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Efecto para manejar la desaparición de mensajes
  useEffect(() => {
    if (error || success) {
      // Configurar el temporizador para iniciar el fadeOut después de 4.5 segundos
      const fadeOutTimer = setTimeout(() => {
        setFadeOut(true);
      }, 4500);
      
      // Configurar el temporizador para eliminar el mensaje después de 5 segundos
      const removeTimer = setTimeout(() => {
        setError('');
        setSuccess('');
        setFadeOut(false);
      }, 5000);
      
      // Limpiar temporizadores al desmontar o cuando cambian los mensajes
      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [error, success]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'cantidad' ? parseInt(value, 10) || '' : value
    });
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar datos
    if (!formData.producto || !formData.cantidad || !formData.razon || !formData.fecha) {
      setError('Todos los campos son requeridos');
      return;
    }

    try {
      // Registrar la devolución
      const response = await fetch('/api/returns/addReturn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al registrar devolución');
      }

      const result = await response.json();
      
      // Actualizar la cantidad en stock (restar la cantidad devuelta)
      const updateStockResponse = await fetch('/api/stocks/updateQuantity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: formData.producto,
          quantityChange: -formData.cantidad // Valor negativo para restar del stock
        })
      });
      
      if (!updateStockResponse.ok) {
        const updateErrorData = await updateStockResponse.json();
        console.error('Error al actualizar stock:', updateErrorData);
        // Continuar a pesar del error en la actualización del stock
      }
      
      // Actualizar la lista de devoluciones
      const newReturn = {
        id: result.id,
        ...formData,
        createdAt: new Date().toISOString()
      };
      
      setReturns([...returns, newReturn]);
      
      // Actualizar la lista de productos con la nueva cantidad
      setProducts(products.map(product => {
        if (product.producto === formData.producto) {
          return {
            ...product,
            cantidad: product.cantidad - formData.cantidad
          };
        }
        return product;
      }));
      
      // Limpiar formulario
      setFormData({
        producto: '',
        cantidad: '',
        razon: '',
        fecha: new Date().toISOString().split('T')[0]
      });
      
      setSuccess('Devolución registrada exitosamente y stock actualizado');
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Error al registrar devolución');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <Link href='/home'>
          <HomeIcon />
        </Link>
        <h1>Gestión de Devoluciones</h1>
      </div>

      {/* Mensajes de notificación */}
      {error && (
        <div className={`${styles.errorMessage} ${fadeOut ? styles.fadeOut : ''}`}>
          {error}
        </div>
      )}
      {success && (
        <div className={`${styles.successMessage} ${fadeOut ? styles.fadeOut : ''}`}>
          {success}
        </div>
      )}

      {/* Formulario para agregar devoluciones */}
      <div className={styles.formContainer}>
        <h2>Registrar Nueva Devolución</h2>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="producto">Producto:</label>
            <select
              id="producto"
              name="producto"
              value={formData.producto}
              onChange={handleChange}
              className={styles.select}
              required
            >
              <option value="">Seleccionar producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.producto}>
                  {product.producto} - Stock: ({product.cantidad})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cantidad">Cantidad:</label>
            <input
              type="number"
              id="cantidad"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              min="1"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="razon">Razón de devolución:</label>
            <textarea
              id="razon"
              name="razon"
              value={formData.razon}
              onChange={handleChange}
              className={styles.textarea}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="fecha">Fecha:</label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Registrar Devolución
          </button>
        </form>
      </div>

      {/* Tabla de devoluciones */}
      <div className={styles.tableContainer}>
        <h2>Historial de Devoluciones</h2>
        
        {loading ? (
          <p>Cargando datos...</p>
        ) : returns.length === 0 ? (
          <p>No hay devoluciones registradas</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Razón</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((item) => (
                <tr key={item.id}>
                  <td>{item.producto}</td>
                  <td>{item.cantidad}</td>
                  <td>{item.razon}</td>
                  <td>{new Date(item.fecha).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ReturnsPage;
