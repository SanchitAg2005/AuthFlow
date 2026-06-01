import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  // Core Data States
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [stats, setStats] = useState({ total: 0, todo: 0, progress: 0, done: 0 });
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Query States (Filtering, Searching, Pagination)
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal / Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null); // null for create; task object for edit
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [submitting, setSubmitting] = useState(false);

  // Fetch tasks and statistics
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch tasks list with active search, filters, and pages
      let queryParams = `?page=${currentPage}&limit=6`;
      if (statusFilter) queryParams += `&status=${statusFilter}`;
      if (search) queryParams += `&search=${encodeURIComponent(search)}`;

      const tasksRes = await api.get(`/tasks${queryParams}`);
      const fetchedTasks = tasksRes.data.data.tasks;
      setTasks(fetchedTasks);
      setPagination(tasksRes.data.pagination);

      // 2. Fetch statistics dynamically by compiling status tallies
      // (To keep backend API clean, we can fetch all tasks once or sum current data or make a separate request.
      // A clean way for an MVP is to fetch all active owned/global tasks to count categories accurately!)
      const allTasksRes = await api.get(`/tasks?limit=1000`);
      const allTasks = allTasksRes.data.data.tasks;
      
      const todoCount = allTasks.filter(t => t.status === 'TODO').length;
      const progressCount = allTasks.filter(t => t.status === 'IN_PROGRESS').length;
      const doneCount = allTasks.filter(t => t.status === 'DONE').length;

      setStats({
        total: allTasks.length,
        todo: todoCount,
        progress: progressCount,
        done: doneCount
      });
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to fetch tasks.' });
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when queries change
  useEffect(() => {
    fetchDashboardData();
  }, [currentPage, statusFilter]);

  // Handle search dynamically with a small delay (debounce)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setCurrentPage(1);
      fetchDashboardData();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  // Open modal for task creation
  const handleOpenCreateModal = () => {
    setActiveTask(null);
    setTitle('');
    setDescription('');
    setStatus('TODO');
    setAlert(null);
    setIsModalOpen(true);
  };

  // Open modal for task editing
  const handleOpenEditModal = (task) => {
    setActiveTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setAlert(null);
    setIsModalOpen(true);
  };

  // Handle Create or Edit submission
  const handleSubmitTask = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!title.trim()) {
      setAlert({ type: 'error', message: 'Task title is required.' });
      return;
    }

    setSubmitting(true);
    try {
      if (activeTask) {
        // Edit Operation
        await api.put(`/tasks/${activeTask._id || activeTask.id}`, { title, description, status });
        setAlert({ type: 'success', message: 'Task updated successfully.' });
      } else {
        // Create Operation
        await api.post('/tasks', { title, description, status });
        setAlert({ type: 'success', message: 'Task created successfully.' });
      }
      setIsModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to save task.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setAlert(null);

    try {
      await api.delete(`/tasks/${taskId}`);
      setAlert({ type: 'success', message: 'Task deleted successfully.' });
      fetchDashboardData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to delete task.' });
    }
  };

  return (
    <div>
      <div className="glow-effect" />

      {/* Visual Success/Error Alert Widgets */}
      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ maxWidth: '1000px', margin: '0 auto 2rem' }}>
          {alert.message}
        </div>
      )}

      {/* 1. Dynamic Statistics Metric Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span>Total Tasks</span>
            <span className="stat-indicator indicator-all" />
          </div>
          <span className="stat-value">{stats.total}</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>To Do</span>
            <span className="stat-indicator indicator-todo" />
          </div>
          <span className="stat-value">{stats.todo}</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>In Progress</span>
            <span className="stat-indicator indicator-progress" />
          </div>
          <span className="stat-value">{stats.progress}</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Completed</span>
            <span className="stat-indicator indicator-done" />
          </div>
          <span className="stat-value">{stats.done}</span>
        </div>
      </section>

      {/* 2. Toolbar: Search Bar, Status Filter, and Action Buttons */}
      <section className="toolbar-section">
        <div className="search-filter-group">
          {/* Search box */}
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search tasks by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status filter dropdown */}
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setCurrentPage(1);
              setStatusFilter(e.target.value);
            }}
          >
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Completed</option>
          </select>
        </div>

        {/* Task create trigger */}
        <button onClick={handleOpenCreateModal} className="btn btn-primary">
          ➕ Create Task
        </button>
      </section>

      {/* 3. Paginated Task Kanban/Card Grid Board */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <p style={{ color: '#94a3b8', fontWeight: 600 }}>Loading active task list...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <h3 className="empty-state-title">No tasks found</h3>
          <p>Create a task or adjust your query criteria to begin.</p>
        </div>
      ) : (
        <div>
          <div className="tasks-grid">
            {tasks.map((task) => (
              <article key={task._id || task.id} className="task-card">
                <div className="task-badge-row">
                  <span className={`task-status-badge ${task.status}`}>
                    {task.status === 'IN_PROGRESS' ? 'In Progress' : task.status === 'DONE' ? 'Completed' : 'To Do'}
                  </span>
                  
                  {/* Action buttons (Edit & Delete) */}
                  <div className="task-actions">
                    <button
                      onClick={() => handleOpenEditModal(task)}
                      className="action-btn action-btn-edit"
                      title="Edit Task"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task._id || task.id)}
                      className="action-btn action-btn-delete"
                      title="Delete Task"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <h4 className="task-title">{task.title}</h4>
                <p className="task-desc">{task.description || 'No description provided.'}</p>

                <div className="task-footer">
                  {/* Owner Metadata: Displayed for Admins */}
                  <div className="task-owner-meta">
                    {user?.role === 'admin' && task.owner ? (
                      <div>
                        <span style={{ display: 'block', fontWeight: 600, color: '#f8fafc' }}>
                          Owner: {task.owner.name || 'Unknown'}
                        </span>
                        <span>{task.owner.email}</span>
                      </div>
                    ) : (
                      <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* 4. Active Pagination Controls Widget */}
          {pagination.pages > 1 && (
            <div className="pagination-container">
              <span className="pagination-info">
                Page {pagination.page} of {pagination.pages} | {pagination.total} total items
              </span>
              <div className="pagination-buttons">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={pagination.page === 1}
                  className="pagination-btn"
                >
                  ◀ Prev
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                  disabled={pagination.page === pagination.pages}
                  className="pagination-btn"
                >
                  Next ▶
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Dynamic Create / Edit Task Modal Forms Overlay */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <header className="modal-header">
              <h3 className="modal-title">{activeTask ? '✏️ Edit Task' : '➕ Create Task'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close">
                &times;
              </button>
            </header>

            <form onSubmit={handleSubmitTask}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Task Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Add details about this task..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Completed</option>
                  </select>
                </div>
              </div>

              <footer className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : activeTask ? 'Save Changes' : 'Create Task'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
