



import { useEffect, useState } from 'react'
import api from "../../api/axiosConfig.ts"
import Movies from '../movies/movies.js'
import type { Movieinterface } from '../movie/Movie.js';


const Home = () => {
    const [movies, setMovies] = useState<Movieinterface[]>([]);
    const [loading, setLoading] = useState(Boolean);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            setMessage("")
            try {
                const response = await api.get("/movies");
        console.log(response,"response")
                if (response.status !== 200) {
                    throw new Error("Failed to fetch movies");
                }

                const data: Movieinterface[] =  response.data;
                setMovies(data);
            } catch (err) {
                console.error('error fetching movies:',err)
                setMessage("Error Fetching Movies");
            } finally {
                setLoading(false);
            }
        };
        fetchMovies()
    }, []);



    return (
        <>



     {loading ?(

        <h2>Loading....</h2>
     ):

     <div>
       
     <Movies moviesdata={movies} message={message} />
     </div>
    }
        </>
    )
}

export default Home