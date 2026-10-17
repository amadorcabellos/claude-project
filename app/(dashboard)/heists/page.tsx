"use client"

// react
import type { ComponentType } from "react"

// hooks
import { useHeists } from "@/lib/hooks"
import type { UseHeistsReturn } from "@/lib/hooks"

// components
import HeistCard, { HeistCardSkeleton } from "@/components/HeistCard"
import ExpiredHeistCard, {
  ExpiredHeistCardSkeleton,
} from "@/components/ExpiredHeistCard"

// types
import type { Heist } from "@/types/firestore"

import styles from "./page.module.css"

// one row of placeholders while a section loads
const SKELETON_COUNT = 3

interface HeistSectionProps extends UseHeistsReturn {
  className: string
  title: string
  emptyMessage: string
  // active and assigned heists use HeistCard, expired heists ExpiredHeistCard,
  // each with its matching skeleton while loading
  Card: ComponentType<{ heist: Heist }>
  Skeleton: ComponentType
}

function HeistSection({
  className,
  title,
  emptyMessage,
  Card,
  Skeleton,
  heists,
  loading,
  error,
}: HeistSectionProps) {
  return (
    <div className={`${className} ${styles.section}`}>
      <h2 className={styles.sectionTitle}>{title}</h2>

      {/* one loading announcement per section; the skeletons are aria-hidden */}
      {loading && (
        <div className={styles.grid} role="status">
          <span className="sr-only">Loading {title}…</span>
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className={styles.errorMessage}>
          Error: {error}
        </p>
      )}

      {!loading && !error && heists.length === 0 && (
        <p className={styles.emptyState}>{emptyMessage}</p>
      )}

      {!loading && !error && heists.length > 0 && (
        <div className={styles.grid}>
          {heists.map((heist) => (
            <Card key={heist.id} heist={heist} />
          ))}
        </div>
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
        emptyMessage="No active heists assigned to you"
        Card={HeistCard}
        Skeleton={HeistCardSkeleton}
        {...active}
      />
      <HeistSection
        className="assigned-heists"
        title="Heists You have Assigned"
        emptyMessage="No heists you've assigned"
        Card={HeistCard}
        Skeleton={HeistCardSkeleton}
        {...assigned}
      />
      <HeistSection
        className="expired-heists"
        title="All Expired Heists"
        emptyMessage="No expired heists"
        Card={ExpiredHeistCard}
        Skeleton={ExpiredHeistCardSkeleton}
        {...expired}
      />
    </div>
  )
}
