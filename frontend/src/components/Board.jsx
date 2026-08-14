import React from 'react';
import Column from './Column';

function Board({ board, selectedPriority, onEditTask, onDeleteTask, onMoveTask }) {
  if (!board?.columns?.length) {
    return <div className="empty-state">No columns found on this board.</div>;
  }

  return (
    <div className="board-grid">
      {board.columns.map((column) => (
        <Column
          key={column.id}
          column={column}
          allColumns={board.columns}
          selectedPriority={selectedPriority}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onMoveTask={onMoveTask}
        />
      ))}
    </div>
  );
}

export default Board;
