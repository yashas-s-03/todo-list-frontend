require('dotenv').config(); // This line should be at the absolute top of your file
// ... rest of your requires and code
import.meta.env.VITE_APP_API_URL
import React, { useState, useEffect, useRef } from 'react';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';
import DailyCalendar from './components/DailyCalendar';
import './App.css';

const formatDateToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- API Base URL ---
const API_BASE_URL = 'https://todo-website-zai2.onrender.com'; // Make sure this matches your backend PORT

function App() {
  const [user, setUser] = useState(null); // Stores logged-in user info
  const [token, setToken] = useState(localStorage.getItem('authToken')); // Store token in localStorage
  const [isLoginView, setIsLoginView] = useState(true); // Toggle between login/register
  const [authMessage, setAuthMessage] = useState(''); // Messages for auth forms

  // Existing task states (will be fetched from backend)
  const [dailyTasks, setDailyTasks] = useState([]);
  const [todaysTasks, setTodaysTasks] = useState([]);
  const [dailyCompletionLog, setDailyCompletionLog] = useState(new Set());
  const [nextId, setNextId] = useState(0); // This ID is less critical with backend DB
  const todoInputRef = useRef(null);

  // --- Auth & Data Fetching Effects ---
  useEffect(() => {
    if (token) {
      // Validate token or fetch user details on app load
      // For simplicity, we just assume token is valid and set user.
      // In production, you'd have a /api/verifyToken or /api/me endpoint
      // and fetch tasks only after successful verification.
      fetchTasks();
    }
  }, [token]);

  // Save/Load dailyCompletionLog (Still useful for frontend visualization logic)
  useEffect(() => {
    localStorage.setItem('dailyCompletionLog', JSON.stringify(Array.from(dailyCompletionLog)));
  }, [dailyCompletionLog]);

  // Global keydown/paste listeners (as before)
  useEffect(() => {
    const handleKeyDown = (event) => { /* ... (same as before) ... */ };
    const handlePaste = (event) => { /* ... (same as before) ... */ };
    if (user) { // Only enable global typing if user is logged in
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('paste', handlePaste);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [user]); // Re-run effect when user state changes

  // --- API Utility Function ---
  const authenticatedFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 || response.status === 403) {
      // Token expired or invalid, force logout
      logout();
      throw new Error('Unauthorized or session expired. Please log in again.');
    }
    return response;
  };

  // --- Authentication Handlers ---
  const handleAuth = async (username, password, type) => {
    setAuthMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (response.ok) {
        if (type === 'login') {
          localStorage.setItem('authToken', data.accessToken);
          setToken(data.accessToken);
          // In a real app, you'd decode JWT to get user info or have a /me endpoint
          setUser({ username }); // Simplistic user object
          setAuthMessage('Login successful!');
          // Fetch tasks after successful login
          fetchTasks();
        } else { // register
          setAuthMessage('Registration successful! Please login.');
          setIsLoginView(true); // Switch to login form
        }
      } else {
        setAuthMessage(data.message || `Error during ${type}.`);
      }
    } catch (error) {
      console.error(`Auth error (${type}):`, error);
      setAuthMessage('Network error or server unavailable.');
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setDailyTasks([]);
    setTodaysTasks([]);
    setDailyCompletionLog(new Set());
    setAuthMessage('Logged out.');
  };

  // --- Task Fetching ---
  const fetchTasks = async () => {
    if (!token) return; // Only fetch if logged in

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/tasks`);
      const data = await response.json();

      if (response.ok) {
        const fetchedDailyTasks = data.filter(task => task.isDaily);
        const fetchedTodaysTasks = data.filter(task => !task.isDaily);
        setDailyTasks(fetchedDailyTasks);
        setTodaysTasks(fetchedTodaysTasks);

        // Reconstruct dailyCompletionLog from fetched daily tasks
        const newDailyCompletionLog = new Set();
        fetchedDailyTasks.forEach(task => {
          if (task.status === 'done') { // Assuming task objects can store completion date
             // If backend stored a specific `completedDate` for each done task,
             // you'd use that here: newDailyCompletionLog.add(task.completedDate);
             // For now, we'll mark today if it's done.
             newDailyCompletionLog.add(formatDateToYYYYMMDD(new Date()));
          }
        });
        setDailyCompletionLog(newDailyCompletionLog);

      } else {
        setAuthMessage(data.message || 'Failed to fetch tasks.');
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setAuthMessage(error.message || 'Error fetching tasks.');
    }
  };

  // --- Task Operations (Modified to use authenticatedFetch) ---
  const addTodo = async (taskText, isDaily) => {
    if (!user || !taskText.trim()) return;

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        body: JSON.stringify({ text: taskText, isDaily, status: 'pending' }),
      });
      const newTask = await response.json();
      if (response.ok) {
        if (isDaily) {
          setDailyTasks(prev => [...prev, newTask]);
        } else {
          setTodaysTasks(prev => [...prev, newTask]);
        }
      } else {
        setAuthMessage(newTask.message || 'Failed to add task.');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      setAuthMessage(error.message || 'Error adding task.');
    }
  };

  const updateTaskStatus = async (id, status, isDaily) => {
    if (!user) return;
    try {
      const updatedTask = { status }; // Only sending status change
      const response = await authenticatedFetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedTask),
      });
      const data = await response.json(); // Backend sends back the updated task

      if (response.ok) {
        if (isDaily) {
          setDailyTasks(prev => prev.map(t => t.id === id ? { ...t, status: data.status } : t));
          if (data.status === 'done') {
            setDailyCompletionLog(prevLog => new Set(prevLog).add(formatDateToYYYYMMDD(new Date())));
          }
        } else {
          setTodaysTasks(prev => prev.map(t => t.id === id ? { ...t, status: data.status } : t));
        }
      } else {
        setAuthMessage(data.message || 'Failed to update task.');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setAuthMessage(error.message || 'Error updating task.');
    }
  };

  const deleteTask = async (id, isDaily) => {
    if (!user) return;
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) { // 204 No Content response
        if (isDaily) {
          setDailyTasks(prev => prev.filter(t => t.id !== id));
        } else {
          setTodaysTasks(prev => prev.filter(t => t.id !== id));
        }
      } else {
        const data = await response.json(); // Get error message if not 204
        setAuthMessage(data.message || 'Failed to delete task.');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setAuthMessage(error.message || 'Error deleting task.');
    }
  };

  const moveTask = async (id, fromDaily, toDaily) => {
    if (!user) return;
    let taskToMove;
    if (fromDaily) {
      taskToMove = dailyTasks.find(task => task.id === id);
    } else {
      taskToMove = todaysTasks.find(task => task.id === id);
    }

    if (taskToMove) {
      const updatedTask = { ...taskToMove, isDaily: toDaily, status: 'pending' }; // Reset status on move
      try {
        const response = await authenticatedFetch(`${API_BASE_URL}/tasks/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updatedTask),
        });
        const data = await response.json();

        if (response.ok) {
          // Update local state after successful backend update
          if (fromDaily) {
            setDailyTasks(prev => prev.filter(t => t.id !== id));
          } else {
            setTodaysTasks(prev => prev.filter(t => t.id !== id));
          }
          if (toDaily) {
            setDailyTasks(prev => [...prev, data]);
          } else {
            setTodaysTasks(prev => [...prev, data]);
          }
        } else {
          setAuthMessage(data.message || 'Failed to move task.');
        }
      } catch (error) {
        console.error('Error moving task:', error);
        setAuthMessage(error.message || 'Error moving task.');
      }
    }
  };

  // --- Auth Forms ---
  const AuthForm = ({ type }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      handleAuth(username, password, type);
    };

    return (
      <div className="auth-form-container">
        <h2>{type === 'login' ? 'Login' : 'Register'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{type === 'login' ? 'Login' : 'Register'}</button>
        </form>
        {authMessage && <p className="auth-message">{authMessage}</p>}
        <p className="toggle-auth">
          {type === 'login' ? (
            <>Don't have an account? <span onClick={() => setIsLoginView(false)}>Register here.</span></>
          ) : (
            <>Already have an account? <span onClick={() => setIsLoginView(true)}>Login here.</span></>
          )}
        </p>
      </div>
    );
  };

  // --- Render based on authentication status ---
  if (!user) {
    return (
      <div className="app-container auth-page">
        {isLoginView ? <AuthForm type="login" /> : <AuthForm type="register" />}
      </div>
    );
  }

  // --- Render Main App if Authenticated ---
  return (
    <div className="app-container">
      <div className="app-header">
        <h1>My Categorized To-Do List</h1>
        <p>Welcome, {user.username}!</p>
        <button onClick={logout} className="logout-button">Logout</button>
      </div>
      <TodoInput addTodo={addTodo} ref={todoInputRef} />

      <div className="main-content-area">
        <div className="task-columns">
          <div className="task-column daily-tasks-column">
            <h2>Daily Tasks</h2>
            <TodoList
              todos={dailyTasks}
              updateTodoStatus={(id, status) => updateTaskStatus(id, status, true)}
              deleteTask={(id) => deleteTask(id, true)}
              isDaily={true}
              moveTask={moveTask}
            />
            <DailyCalendar completedDatesSet={dailyCompletionLog} />
          </div>

          <div className="task-column todays-tasks-column">
            <h2>Today's Tasks</h2>
            <TodoList
              todos={todaysTasks}
              updateTodoStatus={(id, status) => updateTaskStatus(id, status, false)}
              deleteTask={(id) => deleteTask(id, false)}
              isDaily={false}
              moveTask={moveTask}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;