import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useLocation, useNavigate } from "react-router-dom"
import api from "@/api/axiosConfig"
import ThreeBackground from "../register/ThreeBackground"
import useAuth from "@/hooks/useAuth"
import { AxiosError } from "axios"

// Zod validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email"), 
   password: z.string()
   .min(6, "Password must be at least 6 characters"),
})

type LoginFormData = z.infer<typeof loginSchema>

const LoginForm = () => {
  const {setAuth}=useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const location=useLocation()
const from =location.state?.from?.pathname ||"/"
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange", // live validation
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true)
      setError("")
const payload={
    ...data
}
      const response = await api.post("/login", payload)
      setAuth(response.data)
      console.log("Login success:", response.data)
localStorage.setItem("user",JSON.stringify(response.data))
      // Redirect after login
      navigate(from,{replace:true})
    } catch (err: unknown) {
  if (err instanceof AxiosError) {
    setError(err.response?.data?.error || "Login failed")
  } else {
    setError("Something went wrong")
  }
}
finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-transparent">
        <ThreeBackground/>
      <Card className="p-8 w-full max-w-md shadow-lg  border-0  rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">Login</h2>
        <p className="text-gray-500 text-center mb-6">
          Enter your credentials to access your account
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col py-1">
            <Label className="py-1">Email</Label>
            <Input type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col ">
            <Label className="py-1">Password</Label>
            <div className=" relative flex justify-center items-center">
            <Input
          autoComplete="passsword"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm "
            >
              {showPassword ? "Hide" : "Show"}
            </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}

         <Button type="submit"  className="mt-4 " disabled={loading}>
           <div className="w-full p-3 border border-amber-300 rounded-2xl bg-blue-400 text-2xl text-white hover:bg-transparent hover:text-black"> {loading ? "Logging in..." : "Login"}</div>
          </Button>
       

          {/* Error message */}
          {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        </form>

        {/* Footer */}
        <div className="mt-4 text-center text-gray-500 text-sm">
          Don’t have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => navigate("/register")}
          >
            Sign Up
          </span>
        </div>
      </Card>
    </div>
  )
}

export default LoginForm
