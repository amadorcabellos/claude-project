"use client"

// hooks
import { useHeists } from "@/lib/hooks"
import type { UseHeistsReturn } from "@/lib/hooks"

// components
import HeistCard, { HeistCardSkeleton } from "@/components/HeistCard"

import styles from "./page.module.css"

// one row of placeholders while a card section loads
const SKELETON_COUNT = 3

interface HeistSectionProps extends UseHeistsReturn {
  className: string
  title: string
  emptyMessage: string
  // active and assigned heists show as cards, expired heists as a plain list
  variant: "cards" | "list"
}

function HeistSection({
  className,
  title,
  emptyMessage,
  variant,
  heists,
  loading,
  error,
}: HeistSectionProps) {
  const isCards = variant === "cards"

  return (
    <div className={`${className} ${styles.section}`}>
      <h2 className={styles.sectionTitle}>{title}</h2>

      {loading &&
        (isCards ? (
          <div className={styles.grid}>
            {Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <HeistCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <p>Loading...</p>
        ))}

      {error && (
        <p role="alert" className={styles.errorMessage}>
          Error: {error}
        </p>
      )}

      {!loading && !error && heists.length === 0 && (
        <p className={styles.emptyState}>{emptyMessage}</p>
      )}

      {!loading &&
        !error &&
        heists.length > 0 &&
        (isCards ? (
          <div className={styles.grid}>
            {heists.map((heist) => (
              <HeistCard key={heist.id} heist={heist} />
            ))}
          </div>
        ) : (
          <ul>
            {heists.map((heist) => (
              <li key={heist.id}>{heist.title}</li>
            ))}
          </ul>
        ))}
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
        emptyMessage="No active heists assigned to you"
        variant="cards"
        {...active}
      />
      <HeistSection
        className="assigned-heists"
        title="Heists You have Assigned"
        emptyMessage="No heists you've assigned"
        variant="cards"
        {...assigned}
      />
      <HeistSection
        className="expired-heists"
        title="All Expired Heists"
        emptyMessage="No expired heists"
        variant="list"
        {...expired}
      />
    </div>
  )
}
