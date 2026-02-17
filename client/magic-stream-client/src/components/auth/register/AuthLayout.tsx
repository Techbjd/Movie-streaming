import React from "react"
import ThreeBackground from "./ThreeBackground"

interface AuthLayoutProps {
  children: React.ReactNode
  image: string
}

const AuthLayout = ({ children, image }: AuthLayoutProps) => {
  return (
    <div className="min-h-[90vh] flex items-center justify-center p-6 ">
    <ThreeBackground />
      <div className="bg-white  border border-amber-400 h-full rounded-2xl shadow-2xl overflow-hidden max-w-5xl w-full grid md:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="p-10  flex items-center justify-center">
          {children}
        </div>

        {/* RIGHT SIDE */}
        <div className="bg-gray-50 sm:flex p-3 hidden">
          <img
            src={image}
            alt="Auth Illustration"
            className="max-w-full w-full rounded-2xl"
          />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
