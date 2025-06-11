import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const API_URL = 'http://localhost:3001';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', subject: '', dueDate: '' });
  const [editingTask, setEditingTask] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todas');

  const user = JSON.parse(localStorage.getItem('auth'));

  useEffect(() => {
    fetch(`${API_URL}/tasks?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        setFilteredTasks(data);
      })
      .catch((err) => console.error('Error al cargar tareas', err));
  }, []);

  useEffect(() => {
    let result = [...tasks];

    if (search) {
      result = result.filter((t) =>
        t.subject.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterStatus !== 'todas') {
      result = result.filter((t) => t.status === filterStatus);
    }

    setFilteredTasks(result);
  }, [search, filterStatus, tasks]);

  const handleLogout = () => {
    localStorage.removeItem('auth');
    window.location.href = '/';
  };

  const handleAddTask = async (e) => {
    e.preventDefault();

    const taskToCreate = {
      ...newTask,
      status: 'pendiente',
      userId: user.id,
    };

    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskToCreate),
    });

    const createdTask = await res.json();
    setTasks([...tasks, createdTask]);
    setNewTask({ title: '', subject: '', dueDate: '' });

    Swal.fire('¡Tarea creada!', 'La tarea se agregó correctamente.', 'success');
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (confirm.isConfirmed) {
      await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
      const updated = tasks.filter((task) => task.id !== id);
      setTasks(updated);
      Swal.fire('Eliminada', 'La tarea ha sido eliminada.', 'success');
    }
  };

  const handleMarkCompleted = async (task) => {
    const updatedTask = { ...task, status: 'completada' };
    await fetch(`${API_URL}/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask),
    });

    const updated = tasks.map((t) => (t.id === task.id ? updatedTask : t));
    setTasks(updated);
  };

  const handleEditTask = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/tasks/${editingTask.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingTask),
    });

    const updatedTask = await res.json();
    const updatedList = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    setTasks(updatedList);
    setEditingTask(null);

    Swal.fire('Actualizada', 'La tarea fue editada correctamente.', 'success');
  };

  const total = tasks.length;
  const completadas = tasks.filter((t) => t.status === 'completada').length;
  const pendientes = tasks.filter((t) => t.status === 'pendiente').length;

  return (
    <div className="dashboard-container">
      <h2>Mis Tareas</h2>
      <button onClick={handleLogout}>Cerrar sesión</button>

      <h3>Resumen</h3>
      <ul>
        <li>Total: {total}</li>
        <li>Completadas: {completadas}</li>
        <li>Pendientes: {pendientes}</li>
      </ul>

      <h3>Crear nueva tarea</h3>
      <form onSubmit={handleAddTask}>
        <input
          type="text"
          placeholder="Título"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Materia"
          value={newTask.subject}
          onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
          required
        />
        <input
          type="date"
          value={newTask.dueDate}
          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
          required
        />
        <button type="submit">Agregar tarea</button>
      </form>

      {editingTask && (
        <form onSubmit={handleEditTask}>
          <h3>Editar tarea</h3>
          <input
            type="text"
            value={editingTask.title}
            onChange={(e) =>
              setEditingTask({ ...editingTask, title: e.target.value })
            }
            required
          />
          <input
            type="text"
            value={editingTask.subject}
            onChange={(e) =>
              setEditingTask({ ...editingTask, subject: e.target.value })
            }
            required
          />
          <input
            type="date"
            value={editingTask.dueDate}
            onChange={(e) =>
              setEditingTask({ ...editingTask, dueDate: e.target.value })
            }
            required
          />
          <select
            value={editingTask.status}
            onChange={(e) =>
              setEditingTask({ ...editingTask, status: e.target.value })
            }
          >
            <option value="pendiente">Pendiente</option>
            <option value="completada">Completada</option>
          </select>
          <button type="submit">Guardar cambios</button>
          <button type="button" onClick={() => setEditingTask(null)}>
            Cancelar
          </button>
        </form>
      )}

      <div>
        <input
          type="text"
          placeholder="Buscar por materia..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="todas">Todas</option>
          <option value="pendiente">Pendientes</option>
          <option value="completada">Completadas</option>
        </select>
      </div>

      <h3>Listado de tareas</h3>
      {filteredTasks.length === 0 ? (
        <p>No hay tareas para mostrar.</p>
      ) : (
        <ul>
          {filteredTasks.map((task) => (
            <li key={task.id}>
              <strong>{task.title}</strong> ({task.subject}) - {task.status}<br />
              Fecha límite: {task.dueDate}
              <br />
              {task.status !== 'completada' && (
                <button onClick={() => handleMarkCompleted(task)}>Marcar como completada</button>
              )}
              <button onClick={() => setEditingTask(task)}>Editar</button>
              <button onClick={() => handleDelete(task.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;
