import { useContext } from "react"
import { AuthContext } from "@/context/contextauth"
import type { AuthContextType } from "@/context/AuthContext"

const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }

  return context
}

export default useAuth
