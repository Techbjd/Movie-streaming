
// -------------------- Interfaces --------------------


import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import useAuth from "@/hooks/useAuth";


export interface Genreinterface {
  genre_id: number;
  genre_name: string;
}

export interface Rankinginterface {
  ranking_value: number;
  ranking_name: string;
}

export interface Movieinterface {
  _id: string;
  imdb_id: string;
  title: string;
  poster_path: string;
  youtube_id: string;
  genre: Genreinterface[];
  admin_review: string;
  ranking: Rankinginterface;
}

export interface MovieCardProps {
  data: Movieinterface;
  loc?:unknown
}

// -------------------- Styles --------------------

const rankingStyles: Record<number, string> = {
  1: "from-yellow-400 to-yellow-600",
  2: "from-gray-300 to-gray-500",
  3: "from-orange-400 to-orange-600",
  4: "from-blue-400 to-blue-600",
  5: "from-slate-400 to-slate-600",
};

const critics: Record<number, string> = {
  1: "★★★★★",
  2: "★★★★",
  3: "★★★",
  4: "★★",
  5: "★",
};

// -------------------- Component --------------------

const MovieCard = ({ data,loc }: MovieCardProps) => {
  const visibleGenres = data.genre.slice(0, 2);
  const remainingGenres = data.genre.length - 2;
const navigate=useNavigate()
  const openreview=()=>{
    navigate(`updatereview/${data.imdb_id}`)
  }
  const {auth}=useAuth();
    const location = useLocation()
    const openstream=()=>{

      navigate(`/stream/${data.youtube_id}`)
    }
 

  return (
    <div className="group w-full max-w-sm h-140 rounded-2xl overflow-hidden bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 flex flex-col">
      
      {/* Poster Section */}
      <div  key={data._id} className="relative h-80 w-full overflow-hidden">
        <img
          src={data.poster_path}
          alt={data.title}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src =
              "https://placehold.co/400x600/e2e8f0/64748b?text=No+Image";
          }}
        />

        {/* Trailer Overlay */}
        <div
          onClick={openstream}
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
            <span className="text-black text-2xl font-bold cursor-pointer">▶</span>
          </div>
        </div>

        {/* Ranking Badge */}
        {data.ranking?.ranking_name && (
          <div
            className={`absolute top-4 right-4 bg-linear-to-r ${
              rankingStyles[data.ranking.ranking_value] ||
              "from-amber-400 to-amber-600"
            } text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1`}
          >
            <span>#{data.ranking.ranking_value}</span>
            <span>•</span>
            <span>{data.ranking.ranking_name}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1">

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 min-h-14 mb-3">
          {data.title}
        </h3>

        {/* Genres */}
        <div className="flex items-center  flex-wrap gap-2 mb-4 min-h-8">
          {visibleGenres.map((genre) => (
            <span
              key={genre.genre_id}
              className="text-xs font-medium text-indigo-700 bg-linear-to-r from-yellow-600 to-yellow-300 px-2.5 py-1 rounded-full whitespace-nowrap"
            >
              {genre.genre_name}
            </span>
          ))}

          {remainingGenres > 0 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full whitespace-nowrap">
              +{remainingGenres}
            </span>
          )}
        </div>

        {/* Admin Review (Reserved Space Always) */}
        <div className="mb-4 min-h-12">
          {data.admin_review ? (
            <p className="text-sm text-gray-700 line-clamp-2 italic">
              "{data.admin_review}"
            </p>
          ) : (
            <p className="text-sm text-transparent">
              Placeholder review space
            </p>
          )}
        </div>

        {/* Footer (Always Bottom) */}
        <div className="mt-auto flex items-end justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <span className="font-semibold">IMDb:</span>
            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
              {data.imdb_id}
            </span>
          </div>

          {data.ranking && (
            <div className="flex items-center text-amber-500 text-lg font-bold">
              {critics[data.ranking.ranking_value]}
            </div>
          )}
        
       

        </div>
          {auth?.role == "ADMIN" && loc !== location && (
            <Button variant={"outline"}  className="cursor-pointer m-2 " onClick={openreview} >
              Give review
            </Button>
          )}
      </div>
    </div>
  );
};

export default MovieCard;
