import styles from "./Input.module.css"

interface InputProps {
  id: string
  name: string
  type: "text" | "email"
  label: string
  placeholder?: string
  required?: boolean
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function Input({
  id,
  name,
  type,
  label,
  placeholder,
  required,
  value,
  onChange,
}: InputProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        className={styles.input}
        placeholder={placeholder}
        required={required}
        autoComplete={type === "email" ? "email" : undefined}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}
