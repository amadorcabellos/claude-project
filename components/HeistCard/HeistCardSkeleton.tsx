import styles from "./HeistCard.module.css"

// placeholder bars for the title and the meta rows, with varying widths
const LINES = ["w75", "w60", "w55", "w40", "w50"] as const

export default function HeistCardSkeleton() {
  return (
    <div
      className={`${styles.card} ${styles.skeleton}`}
      role="status"
      aria-busy="true"
    >
      <span className="sr-only">Loading...</span>
      {LINES.map((width, i) => (
        <div
          key={width}
          className={`${i === 0 ? styles.skeletonTitle : styles.skeletonLine} ${styles[width]}`}
        />
      ))}
    </div>
  )
}
