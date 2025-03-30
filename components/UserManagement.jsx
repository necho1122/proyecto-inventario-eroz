'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import styles from './UserManagement.module.css';

export default function UserManagement() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    user: '',
    email: '',
    password: '',
    role: 'user',
  });

  // Solo permitir acceso a administradores
  if (!session?.user?.role === 'admin') {
    return (
      <div className={styles.container}>
        <h2 className={styles.errorMessage}>Acceso no autorizado</h2>
        <p className={styles.errorMessage}>Solo los administradores pueden acceder a esta página.</p>
      </div>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users/getUsers');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await fetch('/api/users/addUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        setOpenDialog(false);
        fetchUsers();
        setNewUser({ user: '', email: '', password: '', role: 'user' });
      }
    } catch (error) {
      console.error('Error al agregar usuario:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        const response = await fetch(`/api/users/deleteUser?id=${userId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchUsers();
        }
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Gestión de Usuarios</h2>
        <Button
          variant="contained"
          className={styles.addButton}
          onClick={() => setOpenDialog(true)}
        >
          Agregar Usuario
        </Button>
      </div>

      <TableContainer component={Paper} className={styles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.user}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    className={styles.deleteButton}
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            fullWidth
            value={newUser.user}
            onChange={(e) => setNewUser({ ...newUser, user: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Contraseña"
            type="password"
            fullWidth
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Rol</InputLabel>
            <Select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <MenuItem value="user">Usuario</MenuItem>
              <MenuItem value="admin">Administrador</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleAddUser} variant="contained" color="primary">
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
