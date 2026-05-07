const BADGE_MAP = {
  todo:        { text: 'To Do',       className: 'badge-todo' },
  in_progress: { text: 'In Progress', className: 'badge-in-progress' },
  done:        { text: 'Done',        className: 'badge-done' },
};

export default function TaskStatusBadge({ status }) {
  const badge = BADGE_MAP[status] || BADGE_MAP.todo;
  return <span className={badge.className}>{badge.text}</span>;
}
