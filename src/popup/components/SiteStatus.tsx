/**
 * Current site status indicator component
 */

interface SiteStatusProps {
  hostname: string | null;
  isRegistered: boolean;
}

export function SiteStatus({ hostname, isRegistered }: SiteStatusProps) {
  if (!hostname) {
    return (
      <div className="flex items-center gap-2 p-3 bg-bg-secondary rounded-lg border border-border-default">
        <div className="w-2 h-2 rounded-full bg-text-muted" />
        <span className="text-sm text-text-secondary">No active site</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-bg-secondary rounded-lg border border-border-default">
      <div
        className={`w-2 h-2 rounded-full ${
          isRegistered ? 'bg-accent-primary' : 'bg-text-muted'
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-secondary">Current Site</p>
        <p className="text-sm text-text-primary truncate">{hostname}</p>
      </div>
      <span
        className={`text-xs px-2 py-1 rounded ${
          isRegistered
            ? 'bg-accent-primary/10 text-accent-primary'
            : 'bg-text-muted/10 text-text-muted'
        }`}
      >
        {isRegistered ? 'Protected' : 'Not Protected'}
      </span>
    </div>
  );
}
