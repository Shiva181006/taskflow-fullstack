import React, { useState } from 'react';

function TaskCard({ task, columns, onEdit, onDelete, onMove }) {
  const [busy, setBusy] = useState(false);

  const handleMoveChange = async (e) => {
    const newColId = Number(e.target.value);
    if (newColId === task.column_id) return;
    try {
      setBusy(true);
      await onMove(task.id, newColId);
    } catch (err) {
      alert(err.message || 'Failed to move task');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      setBusy(true);
      await onDelete(task.id);
    } catch (err) {
      alert(err.message || 'Failed to delete task');
      setBusy(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return dateStr; }
  };

  return (
    <div className="task-card">
      <div className="task-header">
        <h4 className="task-title">{task.title}</h4>
        <span className={`badge-priority badge-${(task.priority || 'medium').toLowerCase()}`}>
          {task.priority}
        </span>
      </div>

      {task.description && <p className="task-desc">{task.description}</p>}

      <div className="task-meta">
        <span className="task-date">Created: {formatDate(task.created_at)}</span>
      </div>

      <div className="task-controls">
        <div className="move-control">
          <label htmlFor={`move-${task.id}`} className="move-label">Move to:</label>
          <select
            id={`move-${task.id}`}
            value={task.column_id}
            onChange={handleMoveChange}
            disabled={busy}
            className="move-select"
          >
            {columns.map((col) => (
              <option key={col.id} value={col.id}>{col.name}</option>
            ))}
          </select>
        </div>

        <div className="card-actions">
          <button onClick={() => onEdit(task)} disabled={busy} className="btn btn-sm btn-outline">
            Edit
          </button>
          <button onClick={handleDelete} disabled={busy} className="btn btn-sm btn-danger">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
