import { useParams } from "react-router-dom";
import "./StreamMovie.css";

const StreamMovie = () => {
  const { yt_id } = useParams<{ yt_id: string }>();

  console.log(yt_id, "this is the code");

  if (!yt_id) {
    return (
      <div className="react-player-container">
        <p>Video not found</p>
      </div>
    );
  }

  return (
    <div className="react-player-container">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${yt_id}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default StreamMovie;
