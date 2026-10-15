"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import styles from "./PasswordInput.module.css"

interface PasswordInputProps {
  id: string
  name: string
  label: string
  placeholder?: string
  required?: boolean
  autoComplete?: "current-password" | "new-password"
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function PasswordInput({
  id,
  name,
  label,
  placeholder,
  required,
  autoComplete,
  value,
  onChange,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.wrapper}>
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          className={styles.input}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          className={styles.toggle}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((shown) => !shown)}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  )
}
