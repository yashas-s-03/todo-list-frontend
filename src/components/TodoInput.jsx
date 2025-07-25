import React, { useState } from 'react';
import { findBestMatch } from '../utils/fuzzyMatch'; // Assuming this utility exists

// Define some common tasks for suggestions
const commonTasks = ['Gym', 'Study', 'Groceries', 'Work', 'Meeting', 'Read', 'Clean'];

function TodoInput({ addTodo }) {
  const [task, setTask] = useState('');
  const [suggestion, setSuggestion] = useState(null);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    setTask(inputValue);

    if (inputValue.length > 2) { // Only suggest if input is long enough
      const bestMatch = findBestMatch(inputValue, commonTasks);
      if (bestMatch && bestMatch.rating > 0.6) { // Adjust rating threshold as needed
        setSuggestion(bestMatch.target);
      } else {
        setSuggestion(null);
      }
    } else {
      setSuggestion(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addTodo(task);
    setTask(''); // Clear input after adding
    setSuggestion(null); // Clear suggestion
  };

  const applySuggestion = () => {
    if (suggestion) {
      setTask(suggestion);
      setSuggestion(null); // Clear suggestion after applying
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-input-form">
      <input
        type="text"
        value={task}
        onChange={handleChange}
        placeholder="Add a new task..."
        className="todo-input"
      />
      <button type="submit" className="add-button">Add Task</button>

      {suggestion && task !== suggestion && (
        <div className="suggestion-box">
          Did you mean: <span className="suggestion-text" onClick={applySuggestion}>{suggestion}</span>?
        </div>
      )}
    </form>
  );
}

export default TodoInput;