import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskStatusBadge from '../components/tasks/TaskStatusBadge';
import Loader from '../components/ui/Loader';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const [statsResponse, tasksResponse] = await Promise.all([
        api.get('/tasks/stats'),
        api.get('/tasks/my'),
      ]);
      setStats(statsResponse.data.stats);
      setTasks(tasksResponse.data.tasks);
    } catch {
      toast.error('Couldn\'t load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      toast.success('Status updated');
      loadDashboard();
    } catch {
      toast.error('Couldn\'t update that task');
    }
  };

  const isPastDue = (task) => task.status !== 'done' && new Date(task.dueDate) < new Date();

  const prettyDate = (d) => new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  if (loading) return <Loader message="Pulling together your dashboard..." />;

  const overdueTasks = tasks.filter(isPastDue);

  const metricCards = [
    { label: 'Total',       value: stats?.total || 0,      emoji: '📋', gradient: 'from-brand-500 to-brand-600' },
    { label: 'Done',        value: stats?.completed || 0,   emoji: '✅', gradient: 'from-emerald-500 to-emerald-600' },
    { label: 'In Progress', value: stats?.inProgress || 0,  emoji: '🔄', gradient: 'from-blue-500 to-blue-600' },
    { label: 'Pending',     value: stats?.pending || 0,     emoji: '⏳', gradient: 'from-amber-500 to-amber-600' },
    { label: 'Overdue',     value: stats?.overdue || 0,     emoji: '🔥', gradient: 'from-red-500 to-red-600' },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-surface-100">
          Hey, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-surface-400 mt-1">
          {isAdmin ? 'Here\'s what\'s happening across all projects' : 'Here are the tasks on your plate right now'}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {metricCards.map((card, idx) => (
          <div key={card.label} className="glass-card p-4 animate-slide-up" style={{ animationDelay: `${idx * 80}ms` }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{card.emoji}</span>
              <div className={`w-8 h-1 rounded-full bg-gradient-to-r ${card.gradient}`} />
            </div>
            <p className="text-2xl font-bold text-surface-100">{card.value}</p>
            <p className="text-xs text-surface-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {overdueTasks.length > 0 && (
        <div className="glass-card border-red-500/30 bg-red-500/5 p-5">
          <h3 className="font-semibold text-red-400 mb-3">
            🔥 {overdueTasks.length} task{overdueTasks.length > 1 ? 's are' : ' is'} past the deadline
          </h3>
          <div className="space-y-2">
            {overdueTasks.slice(0, 5).map((task) => (
              <div key={task._id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-red-500/10">
                <div>
                  <p className="text-sm font-medium text-surface-200">{task.title}</p>
                  <p className="text-xs text-surface-400">Was due {prettyDate(task.dueDate)}</p>
                </div>
                <span className="badge-overdue">Overdue</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-surface-200 mb-4">
          {isAdmin ? 'All Tasks Across Projects' : 'Tasks Assigned to You'}
        </h2>

        {tasks.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-surface-400">Nothing here yet - tasks will show up once you're assigned some</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task._id} className={`glass-card-hover p-4 ${isPastDue(task) ? 'border-red-500/30' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-surface-100 truncate">{task.title}</h3>
                      {isPastDue(task) && <span className="badge-overdue">Overdue</span>}
                    </div>
                    {task.description && <p className="text-sm text-surface-400 line-clamp-1">{task.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-surface-400">
                      <span>📁 {task.project?.title || 'N/A'}</span>
                      <span>📅 {prettyDate(task.dueDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TaskStatusBadge status={task.status} />
                    <select
                      value={task.status}
                      onChange={(e) => changeStatus(task._id, e.target.value)}
                      className="text-xs bg-surface-700/50 border border-surface-600/50 rounded-lg px-2 py-1.5 text-surface-300 focus:outline-none focus:border-brand-500/50 cursor-pointer"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
