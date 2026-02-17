import MovieCard, { type Movieinterface } from "../movie/Movie";

interface MoviesProps {
  moviesdata: Movieinterface[];
  message:string;
}


const Movies = ({ moviesdata ,message}: MoviesProps) => {
  

  return (
    <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 justify-items-center px-0 mx-0 ">
      {moviesdata && moviesdata.length > 0 ?moviesdata.map((movie) => (
        <div className="w-[90%] border-2 border-blue-300 flex justify-center items-center my-2 py-2 rounded-2xl">
        <MovieCard key={movie._id} data={movie} />
        </div>
      )):<h2>{message}</h2>}
    </div>
  );
};

export default Movies;
