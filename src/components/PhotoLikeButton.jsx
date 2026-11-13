export default function PhotoLikeButton({ liked, count, disabled, onToggle, description, className = '', noun = 'photograph' }) {
  return (
    <button
      type="button"
      className={`photo-like ${className}`}
      aria-pressed={liked}
      aria-label={`${liked ? 'Unlike' : 'Like'} ${noun}${description ? `: ${description}` : ''}${typeof count === 'number' ? `, ${count} likes` : ''}`}
      data-count={typeof count === 'number' ? count : undefined}
      disabled={disabled}
      onClick={onToggle}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
      </svg>
      {/* A zero is noise on a photograph; the number appears with the first like. */}
      {typeof count === 'number' && count > 0 && <span aria-hidden="true">{count.toLocaleString('en-US')}</span>}
    </button>
  );
}
