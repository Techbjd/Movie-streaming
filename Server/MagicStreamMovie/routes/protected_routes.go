package routes

import (
	"github.com/Techbjd/Movie_Streaming/Server/MagicStreamMovie/controllers"
	"github.com/Techbjd/Movie_Streaming/Server/MagicStreamMovie/middleware"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func SetupProtectedRoutes(router *gin.Engine, client *mongo.Client) {
	protected :=router.Group("/")
	protected.Use(middleware.AuthMiddleWare())

	protected.GET("/movie/:imdb_id", controllers.GetMovieByID(client))
	protected.POST("/addmovie", controllers.AddMovies(client))
	protected.GET("/recommendedmovies", controllers.GetRecommendedMovies(client))
	protected.POST("/updatereview/:imdb_id", controllers.AdminReviewupdate(client))

}
