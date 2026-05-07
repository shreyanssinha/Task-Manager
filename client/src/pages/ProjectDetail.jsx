import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/ui/Modal';
import TaskStatusBadge from '../components/tasks/TaskStatusBadge';
import Loader from '../components/ui/Loader';
import toast from 'react-hot-toast';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: '', description: '', dueDate: '', assignee: '', status: 'todo',
  });
  const [pickedUser, setPickedUser] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadEverything(); }, [id]);

  const loadEverything = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/projects/${id}/tasks`),
      ]);
      setProject(projRes.data.project);
      setTasks(taskRes.data.tasks);

      if (isAdmin) {
        const usersRes = await api.get('/users');
        setAllUsers(usersRes.data.users);
      }
    } catch {
      toast.error('Couldn\'t load project details');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/tasks/projects/${id}/tasks`, taskForm);
      toast.success('Task added to the project!');
      setTaskModalOpen(false);
      setTaskForm({ title: '', description: '', dueDate: '', assignee: '', status: 'todo' });
      loadEverything();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Couldn\'t create the task');
    } finally {
      setSaving(false);
    }
  };

  const changeTaskStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      toast.success('Status changed');
      loadEverything();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const removeTask = async (taskId) => {
    if (!confirm('Delete this task permanently?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task removed');
      loadEverything();
    } catch {
      toast.error('Couldn\'t delete that task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!pickedUser) return;
    try {
      await api.post(`/projects/${id}/members`, { userId: pickedUser });
      toast.success('Team member added!');
      setMemberModalOpen(false);
      setPickedUser('');
      loadEverything();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Couldn\'t add that member');
    }
  };

  const kickMember = async (userId) => {
    if (!confirm('Remove this person from the project?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      toast.success('Member removed from the project');
      loadEverything();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Removal failed');
    }
  };

  const isPastDue = (t) => t.status !== 'done' && new Date(t.dueDate) < new Date();
  const prettyDate = (d) => new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  if (loading) return <Loader message="Loading project..." />;
  if (!project) return null;

  const currentMemberIds = project.members?.map((m) => m._id) || [];
  const availableUsers = allUsers.filter((u) => !currentMemberIds.includes(u._id));

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button onClick={() => navigate('/projects')}
            className="text-sm text-surface-400 hover:text-surface-200 mb-2 flex items-center gap-1 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            All Projects
          </button>
          <h1 className="text-2xl font-bold text-surface-100">{project.title}</h1>
          {project.description && <p className="text-surface-400 text-sm mt-1">{project.description}</p>}
        </div>
        {isAdmin && (
          <div className="flex gap-3">
            <button onClick={() => setMemberModalOpen(true)} className="btn-secondary flex items-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
              Add Member
            </button>
            <button onClick={() => setTaskModalOpen(true)} className="btn-primary flex items-center gap-2 text-sm" id="create-task-btn">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Task
            </button>
          </div>
        )}
      </div>

      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-surface-300 mb-3">Team ({project.members?.length} members)</h2>
        <div className="flex flex-wrap gap-2">
          {project.members?.map((member) => (
            <div key={member._id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-700/50 border border-surface-600/30 text-sm group">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-xs font-semibold text-white">
                {member.name?.charAt(0)?.toUpperCase()}
              </div>
              <span className="text-surface-300">{member.name}</span>
              {isAdmin && member._id !== project.owner?._id && (
                <button onClick={() => kickMember(member._id)}
                  className="ml-1 text-surface-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-surface-200 mb-4">Tasks ({tasks.length})</h2>
        {tasks.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <p className="text-3xl mb-2">📝</p>
            <p className="text-surface-400">
              {isAdmin ? 'No tasks yet - click "New Task" to get started' : 'No tasks in this project yet'}
            </p>
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
                      <span>👤 {task.assignee?.name || 'Nobody assigned'}</span>
                      <span>📅 {prettyDate(task.dueDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TaskStatusBadge status={task.status} />
                    <select value={task.status} onChange={(e) => changeTaskStatus(task._id, e.target.value)}
                      className="text-xs bg-surface-700/50 border border-surface-600/50 rounded-lg px-2 py-1.5 text-surface-300 focus:outline-none cursor-pointer">
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    {isAdmin && (
                      <button onClick={() => removeTask(task._id)}
                        className="p-1.5 rounded-lg text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={taskModalOpen} onClose={() => setTaskModalOpen(false)} title="Add a New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">What needs to be done?</label>
            <input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              className="input-field" placeholder="e.g. Design the homepage mockup" required id="task-title-input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Details (optional)</label>
            <textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="input-field resize-none" rows={3} placeholder="Any extra context or requirements" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Deadline</label>
              <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Starting Status</label>
              <select value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })} className="select-field">
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Assign to</label>
            <select value={taskForm.assignee} onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
              className="select-field" required>
              <option value="">Pick a team member</option>
              {project.members?.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setTaskModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1" id="task-submit-btn">
              {saving ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={memberModalOpen} onClose={() => setMemberModalOpen(false)} title="Bring Someone Onto the Team">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Pick a user</label>
            <select value={pickedUser} onChange={(e) => setPickedUser(e.target.value)} className="select-field" required>
              <option value="">Choose someone...</option>
              {availableUsers.map((u) => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setMemberModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Add to Project</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
