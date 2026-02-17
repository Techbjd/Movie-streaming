import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import api from "@/api/axiosConfig"
import Select from "react-select"
import type { MultiValue } from "react-select"
import { useNavigate } from "react-router-dom"
interface GenreType {
  genre_id: string
  genre_name: string
}

interface SelectOption {
  value: string
  label: string
}

// Zod schema
const registerSchema = z.object({
  first_name: z.string().nonempty("Required first name"),
  last_name: z.string().nonempty("Required last name"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  favourite_genres: z.array(
  z.object({
    genre_id: z.number(),
    genre_name: z.string(),
  })
).min(1, "Select at least one genre"),

}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword","password"],
})

type RegisterFormData = z.infer<typeof registerSchema>

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [genres, setGenres] = useState<GenreType[]>([])
  const [error, setError] = useState("null")
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues:{
     favourite_genres: [],
    },
      mode: "onChange",
  })


  const [selectedGenres, setSelectedGenres] = useState<MultiValue<SelectOption>>([])

  const [loading, setLoading] = useState(false)

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await api.get("/genres")
        setGenres(response.data)
      } catch (error) {
        console.log("Error fetching genres", error)
      }
    }
    fetchGenres()
  }, [])

  const genreOptions: SelectOption[] = genres.map((g) => ({
    value: g.genre_id,
    label: g.genre_name,
  }))

  const onSubmit = async (data: RegisterFormData) => {
    // Add selected genres
    try {
      setLoading(true)
      setError("")
      // const genreIds = selectedGenres.map((g) => g.value)
      const payload = {
        ...data,
        role: "USER",

      }
      console.log(payload,"payload data")
      const Registerdata = await api.post("/register", payload)
      console.log("Registered:", Registerdata.data)
      navigate("/login")


    } catch (error: any) {
      setError(error.Registerdata?.data?.message || "Registration failed")
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-2">Registration</h2>
      <p className="text-gray-500 mb-6 text-xl">
        Create your account to get Started with Magic Stream
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5"
   
      >
        {/* First Name */}
        <div>
          <Label className="py-1">First Name</Label>
          <Input type="text" {...register("first_name")} />
          {errors.first_name && (
            <p className="text-red-500 text-sm">{errors.first_name.message}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <Label className="py-1">Last Name</Label>
          <Input type="text" {...register("last_name")} />
          {errors.last_name && (
            <p className="text-red-500 text-sm">{errors.last_name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label className="py-1">Email</Label>
          <Input type="email" {...register("email")} />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col">
          <Label className="py-1">Password</Label>
          <div className="relative">
            <Input
            autoComplete="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col">
          <Label className="py-1">Confirm Password</Label>
          <div className="relative">
            <Input
            autoComplete="password"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              className="pr-16"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Multi-Select Genres */}
        <div className="flex flex-col">
          <Label className="py-1">Select Favrioute Genres</Label>
          <Select
            options={genreOptions}
            isMulti
            value={selectedGenres}
            onChange={(selected) => {
              setSelectedGenres(selected)
              const formattedGenres=selected?selected.map((g)=>({
                genre_id:Number(g.value),
                genre_name:g.label
              })):[]

              setValue("favourite_genres",formattedGenres,
              { shouldValidate: true } 
              )
            }}

            className="basic-multi-select flex-row  "
            classNamePrefix="select"
            placeholder="Select genres..."
            aria-label="genre"
          />
        </div>

        {/* Submit Button */}
        <div className="w-full flex justify-center items-center">
          {loading ? (
            <span className="w-fit">Registering...</span>
          ) : (
            <Button
              disabled={loading}
              type="submit"
              variant={"outline"}
              className="w-fit mt-4 bg-amber-600 hover:bg-linear-100 from-orange-400 to-red-300"
            >
              Register
            </Button>
          )}
        </div>
      </form>

      {/* Display selected genres */}
      {/*    {selectedGenres.length > 0 && (
        <div className="mt-4">
          <Label>Selected Genres:</Label>
          <div className="flex flex-row flex-wrap gap-2 mt-1">
            {selectedGenres.map((g) => (
              <span
                key={g.value}
                className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-sm"
              >
                {g.label}
              </span>
            ))}
          </div>
        </div>
      )} */}
    </div>
  )
}

export default RegisterForm
