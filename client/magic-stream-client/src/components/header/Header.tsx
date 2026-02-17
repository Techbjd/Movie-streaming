import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Button } from "../ui/button"
import { Menu, X } from "lucide-react"
import useAuth from "@/hooks/useAuth"

import api from "@/api/axiosConfig"

export const Header = () => {
  const navigate = useNavigate()
  const {auth}=useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogin = () => {
  
    navigate("/login")
    setIsOpen(false)
  }

  const handleLogout = async() => {
  try {
     const response=await api.post("/logout",{user_id:auth?.user_id})
     console.log(response.data)
       localStorage.removeItem("user")
       setIsOpen(false)
    
      navigate("/")
  } catch (error) {
    console.error('error  logging out:',error);
  }
    
  }
  return (
    <nav className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-md shadow-md">
      <div className="max-w-[89%] mx-auto px-6">

        {/* TOP BAR */}
        <div className="flex items-center justify-between h-16">

          {/* LEFT SIDE: Logo + Navigation */}
          <div className="flex items-center gap-8">

            {/* Logo */}
            <div
              onClick={() => navigate("/")}
              className="cursor-pointer font-bold text-2xl bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent"
            >
              MAGIC STREAM
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-6 text-white">

              <Button
                variant="link"
                className="hover:text-blue-400"
                onClick={() => navigate("/")}
              >
                Home
              </Button>

              <Button
                variant="link"
                className="hover:text-blue-400"
                onClick={() => navigate("/recommended")}
              >
                Recommended
              </Button>

            </div>
          </div>

          {/* RIGHT SIDE: Auth Buttons (Desktop) */}
          <div className="hidden sm:flex items-center gap-4 text-white">
            {auth ? (
              <>   
              <span>Hello,<strong>{auth.first_name}</strong></span>         
                <Button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Logout
              </Button>
              </>

            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleLogin}
                  className="border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white"
                >
                  Login
                </Button>

                <Button
                  onClick={() => navigate("/register")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="sm:hidden flex flex-col gap-4 pb-6 text-white animate-in slide-in-from-top-3">

            <Button
              variant="link"
              className="justify-start"
              onClick={() => {
                navigate("/")
                setIsOpen(false)
              }}
            >
              Home
            </Button>

            <Button
              variant="link"
              className="justify-start"
              onClick={() => {
                navigate("/recommended")
                setIsOpen(false)
              }}
            >
              Recommended
            </Button>

            {auth ? (
              <Button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white w-full"
              >
                Logout
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleLogin}
                  className="border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white w-full"
                >
                  Login
                </Button>

                <Button
                  onClick={() => {
                    navigate("/register")
                    setIsOpen(false)
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white w-full"
                >
                  Register
                </Button>
              </>
            )}
          </div>
        )}

      </div>
    </nav>
  )
}
