export interface User {
  email: string
  role: "Admin" | "Department Officer"
  department?: string
  name?: string
  avatar?: string
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

// Mock authentication - in production this would connect to a real auth service
export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  // Hardcoded credentials as specified
  if (email === "admin@civiclens.com" && password === "admin123") {
    return {
      email,
      role: "Admin",
      name: "Admin User",
    }
  }

  if (email === "dept@civiclens.com" && password === "dept123") {
    return {
      email,
      role: "Department Officer",
      department: "Sanitation Dept",
      name: "Department Officer",
    }
  }

  return null
}
