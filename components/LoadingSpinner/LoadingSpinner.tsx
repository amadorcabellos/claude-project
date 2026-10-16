import { Clock8 } from "lucide-react"
import styles from "./LoadingSpinner.module.css"

export default function LoadingSpinner() {
  return (
    <div className={styles.overlay} role="status" aria-busy="true">
      <span className="sr-only">Loading...</span>
      <Clock8
        className={styles.icon}
        size={48}
        strokeWidth={2.75}
        aria-hidden="true"
      />
    </div>
  )
}
