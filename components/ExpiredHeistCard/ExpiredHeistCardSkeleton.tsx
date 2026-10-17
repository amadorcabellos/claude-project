import styles from "./ExpiredHeistCard.module.css"

// mirrors ExpiredHeistCard's two-row layout with placeholder blocks; purely
// visual, as the section that renders it announces the loading state
export default function ExpiredHeistCardSkeleton() {
  return (
    <div
      className={`${styles.card} ${styles.skeleton}`}
      aria-hidden="true"
      data-testid="expired-heist-card-skeleton"
    >
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.skeletonIcon} />
          <div className={styles.skeletonTitle} />
        </div>
        <div className={styles.aside}>
          <div className={styles.skeletonDeadline} />
          <div className={styles.skeletonBadge} />
        </div>
      </div>

      <div className={styles.meta}>
        <div className={styles.skeletonMeta} />
        <div className={styles.skeletonMeta} />
      </div>
    </div>
  )
}
