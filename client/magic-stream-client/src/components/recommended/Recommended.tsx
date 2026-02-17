import useAxiosPrivate from '@/hooks/useAxiosPrivate'

import { AxiosError } from 'axios';
import { useEffect, useState } from 'react'
import Movies from '../movies/movies';
import type { Movieinterface } from '../movie/Movie';





function Recommended() {
  const [movies,setMovies]=useState<Movieinterface[]>([]);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("")
 const axiosPrivate= useAxiosPrivate();


useEffect(()=>{
  const fetchRecommendMovies=async()=>{
    setLoading(true)
    setMessage("")
    try {
      
      const response=await axiosPrivate.get<Movieinterface[]>('/recommendedmovie')
      setLoading(false)
      setMovies(response.data);
    } catch (err:unknown) {
    if (err instanceof AxiosError) {
        console.error(err.response?.data?.error || "Login failed")
      } else {
        console.error("Something went wrong")
      }
      
    }
    finally{
  setLoading(false)
    }

  }
  fetchRecommendMovies()
},[])

  return (
  <>

  {
    loading ?(
      <h2>
      ...loading
      </h2>
    ):(
      <Movies moviesdata={movies} message={message} />
    )
  }
   </>
  )
 
}

export default Recommended
