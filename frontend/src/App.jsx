import React, { useState, useEffect } from 'react';
import { getBoard, createTask, updateTask, deleteTask, moveTask } from './api';
import Board from './components/Board';
import TaskForm from './components/TaskForm';
import EditTaskModal from './components/EditTaskModal';

function App() {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const loadBoardData = async () => {
    try {
      setError(null);
      const data = await getBoard(1);
      setBoard(data);
    } catch (err) {
      setError(err.message || 'Unable to load TaskFlow board.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoardData();
  }, []);

  const handleCreateTask = async (taskData) => {
    await createTask(taskData);
    setIsCreateFormOpen(false);
    await loadBoardData();
  };

  const handleUpdateTask = async (id, taskData) => {
    await updateTask(id, taskData);
    setEditingTask(null);
    await loadBoardData();
  };

  const handleDeleteTask = async (id) => {
    await deleteTask(id);
    await loadBoardData();
  };

  const handleMoveTask = async (id, columnId) => {
    await moveTask(id, columnId);
    await loadBoardData();
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">TaskFlow</h1>
        <p className="app-subtitle">Simple, persistent task board for teams</p>
      </header>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={loadBoardData} className="btn btn-sm btn-outline">Retry</button>
        </div>
      )}

      <main>
        <div className="filter-bar">
          <div className="filter-group">
            <label htmlFor="priority-filter" className="filter-label">Priority Filter:</label>
            <select
              id="priority-filter"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <button
            onClick={() => setIsCreateFormOpen(!isCreateFormOpen)}
            className={`btn ${isCreateFormOpen ? 'btn-secondary' : 'btn-primary'}`}
          >
            {isCreateFormOpen ? '✕ Close Form' : '+ New Task'}
          </button>
        </div>

        {isCreateFormOpen && board?.columns && (
          <TaskForm
            columns={board.columns}
            onSubmit={handleCreateTask}
            onCancel={() => setIsCreateFormOpen(false)}
          />
        )}

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading TaskFlow board...</p>
          </div>
        ) : (
          <Board
            board={board}
            selectedPriority={selectedPriority}
            onEditTask={(task) => setEditingTask(task)}
            onDeleteTask={handleDeleteTask}
            onMoveTask={handleMoveTask}
          />
        )}
      </main>

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onSave={handleUpdateTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}

export default App;
