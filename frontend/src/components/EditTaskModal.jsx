import React, { useState } from 'react';

function EditTaskModal({ task, onSave, onClose }) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState(task?.priority || 'Medium');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    try {
      setSubmitting(true);
      await onSave(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        priority,
      });
    } catch (err) {
      setError(err.message || 'Failed to update task');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Task</h3>
          <button onClick={onClose} className="close-btn" aria-label="Close">×</button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="edit-title">Title *</label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-desc">Description</label>
            <textarea
              id="edit-desc"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-priority">Priority</label>
            <select id="edit-priority" value={priority} onChange={(e) => setPriority(e.target.value)} disabled={submitting}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTaskModal;
