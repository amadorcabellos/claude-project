import styles from "./Avatar.module.css"

interface AvatarProps {
  name: string
}

// PascalCase names (e.g. "SneakyFox") use their first two capitals, otherwise the first letter
function getInitials(name: string) {
  const trimmed = name.trim()
  const capitals = trimmed.match(/[A-Z]/g) ?? []

  if (/^[A-Z]/.test(trimmed) && capitals.length >= 2) {
    return capitals.slice(0, 2).join("")
  }

  return trimmed.charAt(0).toUpperCase()
}

export default function Avatar({ name }: AvatarProps) {
  return (
    <div className={styles.avatar} role="img" aria-label={name}>
      <span aria-hidden="true">{getInitials(name)}</span>
    </div>
  )
}
