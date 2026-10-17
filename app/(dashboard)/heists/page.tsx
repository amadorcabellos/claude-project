"use client"

// hooks
import { useHeists } from "@/lib/hooks"
import type { UseHeistsReturn } from "@/lib/hooks"

interface HeistSectionProps extends UseHeistsReturn {
  className: string
  title: string
  emptyMessage: string
}

function HeistSection({
  className,
  title,
  emptyMessage,
  heists,
  loading,
  error,
}: HeistSectionProps) {
  return (
    <div className={className}>
      <h2>{title}</h2>
      {loading && <p>Loading...</p>}
      {error && <p role="alert">Error: {error}</p>}
      {!loading && !error && heists.length === 0 && <p>{emptyMessage}</p>}
      {!loading && !error && heists.length > 0 && (
        <ul>
          {heists.map((heist) => (
            <li key={heist.id}>{heist.title}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function HeistsPage() {
  const active = useHeists("active")
  const assigned = useHeists("assigned")
  const expired = useHeists("expired")

  return (
    <div className="page-content">
      <HeistSection
        className="active-heists"
        title="Your Active Heists"
        emptyMessage="No active heists"
        {...active}
      />
      <HeistSection
        className="assigned-heists"
        title="Heists You have Assigned"
        emptyMessage="You haven't assigned any heists"
        {...assigned}
      />
      <HeistSection
        className="expired-heists"
        title="All Expired Heists"
        emptyMessage="No expired heists"
        {...expired}
      />
    </div>
  )
}
