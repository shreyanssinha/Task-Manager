export default function Loader({ message = 'Loading...', fullScreen = false }) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-surface-700 border-t-brand-500 animate-spin" />
        <div
          className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-b-cyan-400 animate-spin"
          style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
        />
      </div>
      {message && <p className="text-surface-400 text-sm animate-pulse">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-20">{spinner}</div>;
}
