import useAuth from '@/hooks/useAuth'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

function RequiredAuth() {
    const{auth}=useAuth()
    const location =useLocation()
  return  auth?(
   <Outlet/>
  ):(
    <Navigate to ='/login' state={{from:location}} replace />
  )
}

export default RequiredAuth
