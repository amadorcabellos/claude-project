// icons
import { Calendar, CircleCheck, CircleX, User } from "lucide-react"
import type { LucideIcon } from "lucide-react"

// types
import type { Heist, HeistFinalStatus } from "@/types/firestore/heist"

import styles from "./ExpiredHeistCard.module.css"

interface ExpiredHeistCardProps {
  heist: Heist
}

interface StatusConfig {
  label: string
  Icon: LucideIcon
  iconClass: string
  badgeClass: string
}

const STATUS: Record<HeistFinalStatus, StatusConfig> = {
  failure: {
    label: "Failed",
    Icon: CircleX,
    iconClass: styles.failure,
    badgeClass: styles.badgeFailure,
  },
  success: {
    label: "Success",
    Icon: CircleCheck,
    iconClass: styles.success,
    badgeClass: styles.badgeSuccess,
  },
}

function formatTimestamp(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function ExpiredHeistCard({ heist }: ExpiredHeistCardProps) {
  // unknown or missing statuses render without an icon or badge
  const status = heist.finalStatus ? STATUS[heist.finalStatus] : undefined
  const hasDeadline =
    heist.deadline instanceof Date && !isNaN(heist.deadline.getTime())

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          {status && (
            <status.Icon
              size={16}
              className={`${styles.statusIcon} ${status.iconClass}`}
            />
          )}
          <h3 className={styles.titleHeading}>{heist.title}</h3>
        </div>

        <div className={styles.aside}>
          {hasDeadline && (
            <p className={styles.deadline}>
              <Calendar size={12} className={styles.icon} />
              <span>{formatTimestamp(heist.deadline)}</span>
            </p>
          )}
          {status && (
            <span className={`${styles.badge} ${status.badgeClass}`}>
              {status.label}
            </span>
          )}
        </div>
      </div>

      <div className={styles.meta}>
        <p className={styles.metaItem}>
          <User size={12} className={styles.icon} />
          <span>
            To:{" "}
            <span className={styles.usernamePrimary}>
              @{heist.assignedToCodename}
            </span>
          </span>
        </p>
        <p className={styles.metaItem}>
          <User size={12} className={styles.icon} />
          <span>
            By:{" "}
            <span className={styles.usernameSecondary}>
              @{heist.createdByCodename}
            </span>
          </span>
        </p>
      </div>
    </article>
  )
}
