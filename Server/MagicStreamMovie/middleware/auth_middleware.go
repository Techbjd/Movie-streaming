package middleware

import (
	"log"
	"net/http"

	"github.com/Techbjd/Movie_Streaming/Server/MagicStreamMovie/utils"
	"github.com/gin-gonic/gin"
)

func AuthMiddleWare() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := utils.GetAccessToken(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}
		log.Printf("Token received: %q\n", token)
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No Token provided"})
			c.Abort()
			return
		}
		claims, err := utils.ValidateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invaliad token"})
			c.Abort()
			return
		}
		
		c.Set("userId", claims.UserId)
		c.Set("role", claims.Role)

		c.Next()
	}
}
