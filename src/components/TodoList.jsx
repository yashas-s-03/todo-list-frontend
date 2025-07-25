import React from 'react';
import { getEmojiForTask } from '../utils/emoji';

// Added isDaily and moveTask props
function TodoList({ todos, updateTodoStatus, deleteTask, isDaily, moveTask }) {
  return (
    <ul className="todo-list">
      {todos.length === 0 ? (
        <p className="no-tasks">No tasks yet.</p>
      ) : (
        todos.map(todo => (
          <li key={todo.id} className={`todo-item status-${todo.status}`}>
            <span className="task-text">
              {getEmojiForTask(todo.text)} {todo.text}
            </span>

            <div className="task-status-controls">
              <label>
                <input
                  type="radio"
                  name={`status-${todo.id}`}
                  value="done"
                  checked={todo.status === 'done'}
                  onChange={() => updateTodoStatus(todo.id, 'done')}
                /> Done
              </label>
              <label>
                <input
                  type="radio"
                  name={`status-${todo.id}`}
                  value="not_done"
                  checked={todo.status === 'not_done'}
                  onChange={() => updateTodoStatus(todo.id, 'not_done')}
                /> Not Done
              </label>
              <label>
                <input
                  type="radio"
                  name={`status-${todo.id}`}
                  value="pending"
                  checked={todo.status === 'pending'}
                  onChange={() => updateTodoStatus(todo.id, 'pending')}
                /> Pending
              </label>
            </div>

            <div className="task-actions">
                {/* Optional: Button to move task between lists */}
                <button
                    onClick={() => moveTask(todo.id, isDaily, !isDaily)}
                    className="move-button"
                    title={isDaily ? "Move to Today's Tasks" : "Move to Daily Tasks"}
                >
                    {isDaily ? '➡️ Today' : '⬅️ Daily'}
                </button>
                <button onClick={() => deleteTask(todo.id)} className="delete-button">
                    Delete
                </button>
            </div>
          </li>
        ))
      )}
    </ul>
  );
}

export default TodoList;