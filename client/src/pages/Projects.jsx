import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/ui/Modal';
import Loader from '../components/ui/Loader';
import toast from 'react-hot-toast';

export default function Projects() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data.projects);
    } catch {
      toast.error('Couldn\'t fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/projects', formData);
      toast.success('Project created!');
      setModalOpen(false);
      setFormData({ title: '', description: '' });
      loadProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Creation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!confirm('This will permanently delete the project and every task inside it. Continue?')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      toast.success('Project removed');
      loadProjects();
    } catch {
      toast.error('Couldn\'t delete that project');
    }
  };

  if (loading) return <Loader message="Loading your projects..." />;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Projects</h1>
          <p className="text-surface-400 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} in total</p>
        </div>
        {isAdmin && (
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2" id="create-project-btn">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-4xl mb-3">📂</p>
          <h3 className="text-lg font-medium text-surface-300">No projects yet</h3>
          <p className="text-sm text-surface-400 mt-1">
            {isAdmin ? 'Start by creating your first project above' : 'Ask an admin to add you to a project'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, idx) => (
            <Link key={project._id} to={`/projects/${project._id}`}
              className="glass-card-hover p-5 animate-slide-up block group"
              style={{ animationDelay: `${idx * 60}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-cyan-500/20 flex items-center justify-center border border-brand-500/20">
                  <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                </div>
                {isAdmin && (
                  <button onClick={(e) => { e.preventDefault(); handleDelete(project._id); }}
                    className="p-1.5 rounded-lg text-surface-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                )}
              </div>
              <h3 className="font-semibold text-surface-100 group-hover:text-brand-400 transition-colors">{project.title}</h3>
              {project.description && <p className="text-sm text-surface-400 mt-1 line-clamp-2">{project.description}</p>}
              <div className="flex items-center gap-2 mt-4 text-xs text-surface-400">
                <span>👥 {project.members?.length || 0} members</span>
                <span>·</span>
                <span>Created by {project.owner?.name}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Start a New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Project Name</label>
            <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field" placeholder="e.g. Website Redesign" required id="project-title-input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field resize-none" rows={3} placeholder="What's this project about? (optional)" id="project-desc-input" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1" id="project-submit-btn">
              {saving ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
