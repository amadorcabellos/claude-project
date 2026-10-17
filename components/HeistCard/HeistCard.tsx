// next
import Link from "next/link"

// icons
import { Calendar, Clock, User, Users } from "lucide-react"

// types
import type { Heist } from "@/types/firestore/heist"

import styles from "./HeistCard.module.css"

const HOUR_MS = 60 * 60 * 1000

interface HeistCardProps {
  heist: Heist
}

function plural(count: number, unit: string) {
  return `${count} ${unit}${count === 1 ? "" : "s"}`
}

function formatDeadline(deadline: Date): { text: string; isOverdue: boolean } {
  const remaining = deadline.getTime() - Date.now()
  if (remaining <= 0) return { text: "Overdue", isOverdue: true }

  const hours = Math.ceil(remaining / HOUR_MS)
  if (hours < 24)
    return { text: `${plural(hours, "hour")} left`, isOverdue: false }

  return {
    text: `${plural(Math.floor(hours / 24), "day")} left`,
    isOverdue: false,
  }
}

function formatTimestamp(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function HeistCard({ heist }: HeistCardProps) {
  // the deadline can be missing while a new heist's server data resolves
  const hasDeadline =
    heist.deadline instanceof Date && !isNaN(heist.deadline.getTime())
  const status = hasDeadline ? formatDeadline(heist.deadline) : null

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.titleHeading}>
          <Link href={`/heists/${heist.id}`} className={styles.title}>
            {heist.title}
          </Link>
        </h3>
        <Clock size={20} className={styles.clockIcon} />
      </div>

      <div className={styles.meta}>
        <p className={styles.assigneeRow}>
          <User size={16} className={styles.icon} />
          <span>
            To:{" "}
            <span className={styles.usernamePrimary}>
              @{heist.assignedToCodename}
            </span>
          </span>
        </p>

        <p className={styles.assigneeRow}>
          <Users size={16} className={styles.icon} />
          <span>
            By:{" "}
            <span className={styles.usernameSecondary}>
              @{heist.createdByCodename}
            </span>
          </span>
        </p>

        {hasDeadline && status && (
          <p className={styles.timestamp}>
            <Calendar size={16} className={styles.icon} />
            <span>{formatTimestamp(heist.deadline)}</span>
            <span aria-hidden="true">•</span>
            <span
              className={
                status.isOverdue
                  ? styles.deadlineOverdue
                  : styles.deadlineNormal
              }
            >
              {status.text}
            </span>
          </p>
        )}
      </div>
    </article>
  )
}
