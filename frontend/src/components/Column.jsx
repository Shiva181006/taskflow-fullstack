import React from 'react';
import TaskCard from './TaskCard';

function Column({ column, allColumns, selectedPriority, onEditTask, onDeleteTask, onMoveTask }) {
  const tasks = column.tasks || [];
  const visibleTasks = selectedPriority === 'All'
    ? tasks
    : tasks.filter((t) => t.priority === selectedPriority);

  const displayCount = visibleTasks.length;

  return (
    <div className="board-column">
      <div className="column-header">
        <h3 className="column-title">
          {column.name} <span className="column-count">({displayCount})</span>
        </h3>
      </div>

      <div className="column-tasks">
        {visibleTasks.length === 0 ? (
          <div className="empty-state">
            {selectedPriority !== 'All' ? `No ${selectedPriority} priority tasks.` : 'No tasks yet.'}
          </div>
        ) : (
          visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columns={allColumns}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onMove={onMoveTask}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Column;
