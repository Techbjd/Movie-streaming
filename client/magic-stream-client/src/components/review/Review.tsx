import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import { type Movieinterface } from "../movie/Movie";
import MovieCard from "../movie/Movie";

/* =========================
   API RESPONSE TYPES
========================= */


interface UpdateReviewResponse {
  ranking_name?: string;
  admin_review: string;
}

/* =========================
   COMPONENT
========================= */

const Review = () => {
  const [movie, setMovie] = useState<Movieinterface | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [reviewText, setReviewText] = useState<string>("");

  const { imdb_id } = useParams<{ imdb_id: string }>();
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
   const location = useLocation()

  /* =========================
     FETCH MOVIE
  ========================= */

  useEffect(() => {
    const fetchMovie = async () => {
      if (!imdb_id) return;

      setLoading(true);

      try {
        const response = await axiosPrivate.get<
          Movieinterface>(`/movie/${imdb_id}`);

        const movieData = response.data;
console.log(movieData,"moviedata")
        setMovie(movieData);
        setReviewText(movieData.admin_review || "");
      } catch (error) {
        console.error("Error fetching movie:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [imdb_id, axiosPrivate]);

  /* =========================
     UPDATE REVIEW
  ========================= */

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!imdb_id) return;

    setLoading(true);

    try {
      const response =
        await axiosPrivate.post<UpdateReviewResponse>(
          `/updatereview/${imdb_id}`,
          { admin_review: reviewText }
        );

      setMovie((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          admin_review: response.data.admin_review,
          ranking: {
            ranking_value: prev.ranking.ranking_value,
            ranking_name:
              response.data.ranking_name ??
              prev.ranking.ranking_name,
          },
        };
      });
    } catch (error) {
      console.error("Error updating review:", error);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     LOADING STATE
  ========================= */

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-lg font-semibold">
          Loading...
        </span>
      </div>
    );
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
          Admin Review
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Movie Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex items-center justify-center">
            {movie && <MovieCard data={movie}  loc={location}/>}
          </div>

          {/* Review Section */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            {auth?.role === "ADMIN" ? (
              <form
                onSubmit={handleSubmit}
                className="space-y-6 "
              >
                <textarea
                  value={reviewText}
                  onChange={(e) =>
                    setReviewText(e.target.value)
                  }
                  required
                  rows={8}
                  className="w-full  border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-blue-50 border h-full border-blue-200 text-blue-700 p-4 rounded-lg">
                {movie?.admin_review ||
                  "No review available."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
