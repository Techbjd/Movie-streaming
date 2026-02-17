package routes

import (
	"github.com/Techbjd/Movie_Streaming/Server/MagicStreamMovie/controllers"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func SetupUnProtectedRoutes(router *gin.Engine, client *mongo.Client) {
	// UnProtected routes will be defined here

	router.GET("/movies", controllers.GetMovies(client))
	router.POST("/register", controllers.RegisterUser(client))
	router.POST("/login", controllers.Login(client))
	router.POST("/logout", controllers.Logout(client))
	router.GET("/genres", controllers.GetGenres(client))
	router.POST("/refresh", controllers.RefreshTokenHAndler(client))

}
