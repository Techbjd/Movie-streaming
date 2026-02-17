import React, {  useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './contextauth'
export interface Genre {
  genre_id: number
  genre_name: string
}

export interface User {
  user_id: string
  first_name: string
  last_name: string
  email: string
  role: "USER" | "ADMIN"
  token: string
  refresh_token: string
  favourite_genres: Genre[]
}

 export interface AuthContextType {
  auth:User|null
  setAuth: React.Dispatch<React.SetStateAction<User|null>>
  loading:boolean
}


interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
const [auth, setAuth] = useState<User | null>(null)
const[loading,setloading]=useState(true)

useEffect(()=>{
  const storeuser=localStorage.getItem("user")
  if (storeuser){
    try {
      const parsedUser:User|null=JSON.parse(storeuser)
      setAuth(parsedUser)
   
    } catch (error) {
      console.error("failed to parse   user from  authentication ",error)
    }
    finally{
      setloading(false)
    }
  }
},[])
useEffect(()=>{
        if (auth){
            localStorage.setItem('user', JSON.stringify(auth));
        }
        else{
            localStorage.removeItem('user');
        }
    },[auth])




  return (
    <AuthContext.Provider value={{ auth, setAuth,loading }}>
      {children}
    </AuthContext.Provider>
  )
}
