export interface User {
  uid: string
  email: string | null
  displayName: string | null
}

export interface AuthContextValue {
  user: User | null
  loading: boolean
}
