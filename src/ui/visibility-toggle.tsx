interface Props {
  visible: boolean
  onToggle: () => void
}

/** Small eye / eye-off icon button toggling a part's 3D viewport visibility. */
export function VisibilityToggle({ visible, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={visible ? 'Hide in viewport' : 'Show in viewport'}
      className={`grid h-7 w-7 place-items-center rounded transition pointer-coarse:h-11 pointer-coarse:w-11 ${
        visible ? 'text-white/70 hover:bg-white/10' : 'text-white/30 hover:bg-white/10'
      }`}
    >
      {visible ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3l18 18" />
          <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c7 0 10.5 7 10.5 7a13.2 13.2 0 0 1-3.1 3.9M6.6 6.6C3.6 8.5 1.5 12 1.5 12s3.5 7 10.5 7a10.4 10.4 0 0 0 4.4-.9" />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </svg>
      )}
    </button>
  )
}
