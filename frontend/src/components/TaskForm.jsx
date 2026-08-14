import React, { useState } from 'react';

function TaskForm({ columns, onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [columnId, setColumnId] = useState(columns?.[0]?.id || 1);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        priority,
        columnId: Number(columnId),
      });
    } catch (err) {
      setError(err.message || 'Failed to create task');
      setSubmitting(false);
    }
  };

  return (
    <div className="task-form-card">
      <h3 className="form-title">Create New Task</h3>
      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            placeholder="Task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="desc">Description</label>
          <textarea
            id="desc"
            placeholder="Optional details..."
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value)} disabled={submitting}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="column">Column</label>
            <select id="column" value={columnId} onChange={(e) => setColumnId(Number(e.target.value))} disabled={submitting}>
              {columns.map((col) => (
                <option key={col.id} value={col.id}>{col.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={submitting}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskForm;
