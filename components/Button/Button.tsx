import styles from "./Button.module.css"

interface ButtonProps {
  type?: "submit" | "button" | "reset"
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

// builds on the global .btn class from globals.css
export default function Button({
  type = "submit",
  children,
  onClick,
  disabled,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`btn ${styles.button}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
