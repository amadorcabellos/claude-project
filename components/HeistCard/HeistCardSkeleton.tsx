import styles from "./HeistCard.module.css"

// placeholder bars for the title and the meta rows, with varying widths
const LINES = ["w75", "w60", "w55", "w40", "w50"] as const

// purely visual; the section that renders it announces the loading state
export default function HeistCardSkeleton() {
  return (
    <div className={`${styles.card} ${styles.skeleton}`} aria-hidden="true">
      {LINES.map((width, i) => (
        <div
          key={width}
          className={`${i === 0 ? styles.skeletonTitle : styles.skeletonLine} ${styles[width]}`}
        />
      ))}
    </div>
  )
}
