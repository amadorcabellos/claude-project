// icons
import { Calendar, CircleCheck, CircleX, User } from "lucide-react"
import type { LucideIcon } from "lucide-react"

// utils
import { formatTimestamp } from "@/lib/utils/formatTimestamp"

// types
import type { Heist, HeistFinalStatus } from "@/types/firestore"

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

export default function ExpiredHeistCard({ heist }: ExpiredHeistCardProps) {
  // unknown or missing statuses render without an icon or badge; hasOwn keeps
  // bad data like "toString" from matching inherited Object properties
  const status =
    heist.finalStatus && Object.hasOwn(STATUS, heist.finalStatus)
      ? STATUS[heist.finalStatus]
      : undefined
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
            <p className={styles.metaItem}>
              <Calendar size={12} className={styles.icon} />
              <span className="sr-only">Deadline: </span>
              <time dateTime={heist.deadline.toISOString()}>
                {formatTimestamp(heist.deadline)}
              </time>
            </p>
          )}
          {status && (
            <span>
              <span className="sr-only">Outcome: </span>
              <span className={`${styles.badge} ${status.badgeClass}`}>
                {status.label}
              </span>
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
