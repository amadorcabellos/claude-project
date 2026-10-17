// welcome page for signed-out visitors (signed-in users are sent to /heists by the public layout)

import Link from "next/link"
import { Clock8 } from "lucide-react"

// styles
import styles from "./splash.module.css"

const steps = [
  {
    title: "Plan a heist",
    text: "Give it a title and a short brief. Keep it small and harmless.",
  },
  {
    title: "Hand it off",
    text: "Assign it to a teammate. They only see your codename.",
  },
  {
    title: "Beat the clock",
    text: "They have 48 hours to pull it off before it's marked a success or a failure.",
  },
]

export default function Home() {
  return (
    <div className={styles.splash}>
      <p className={styles.brand}>
        <Clock8 aria-hidden="true" size={20} strokeWidth={2.75} />
        Pocket Heist
      </p>

      <section className={styles.hero}>
        <div>
          <h1 className={styles.tagline} aria-label="In. Out. Gone.">
            <span>In.</span>
            <span>Out.</span>
            <span>Gone.</span>
          </h1>
          <p className={styles.pitch}>
            Pocket Heist is a game for your office. Plan small, harmless
            missions, hand them to a teammate and give them 48 hours to pull it
            off. Everyone plays under a codename.
          </p>
          <div className={styles.actions}>
            <Link href="/signup" className={`btn ${styles.register}`}>
              Register
            </Link>
            <p className={styles.login}>
              Already have an account? <Link href="/login">Log in</Link>
            </p>
          </div>
        </div>

        <article className={styles.briefing} aria-label="Example heist">
          <p className={styles.briefingStatus}>In progress</p>
          <h2 className={styles.briefingTitle}>
            Set the boardroom clock ten minutes fast
          </h2>
          <p className={styles.briefingDescription}>
            Before Monday&apos;s stand-up. Nobody can know it was you.
          </p>
          <dl className={styles.briefingCrew}>
            <div>
              <dt>Planned by</dt>
              <dd>SilentOnyxFox</dd>
            </div>
            <div>
              <dt>Assigned to</dt>
              <dd>MidnightJadeOtter</dd>
            </div>
          </dl>
          <dl className={styles.briefingClock}>
            <dt className="text-sm">Time left</dt>
            <dd>47:12:08</dd>
          </dl>
        </article>
      </section>

      <ol className={styles.steps}>
        {steps.map((step, index) => (
          <li key={step.title}>
            <h2>
              <span className={styles.stepNumber}>{index + 1}</span>
              {step.title}
            </h2>
            {step.text}
          </li>
        ))}
      </ol>
    </div>
  )
}
