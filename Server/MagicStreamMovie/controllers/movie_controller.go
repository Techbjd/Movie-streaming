package controllers

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/joho/godotenv"
	"google.golang.org/genai"

	"github.com/Techbjd/Movie_Streaming/Server/MagicStreamMovie/database"
	"github.com/Techbjd/Movie_Streaming/Server/MagicStreamMovie/models"
	"github.com/Techbjd/Movie_Streaming/Server/MagicStreamMovie/utils"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// var moviesCollection *mongo.Collection = database.OpenCollection("movies",)
// var rankingCollection *mongo.Collection = database.OpenCollection("rankings",client)

var (
	ErrMissingAPIKey        = errors.New("SERPER_API_KEY is missing")
	ErrMissingPrompt        = errors.New("BASE_PROMPT_TEMPLATE is missing")
	ErrInvalidLLMResponse   = errors.New("LLM returned invalid ranking")
	ErrNoRankingMatched     = errors.New("no ranking matched LLM response")
	ErrRankingConfigInvalid = errors.New("ranking configuration invalid")
)

func GetMovies(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c, 100*time.Second)
		defer cancel()
		var moviesCollection *mongo.Collection = database.OpenCollection("movies", client)
		var movies []models.Movie

		cursor, err := moviesCollection.Find(ctx, bson.M{})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch movies."})
			return
		}
		defer cursor.Close(ctx)
		if err = cursor.All(ctx, &movies); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error() /* "error": "Failed to fetch movies."" */})
			return
		}
		c.JSON(http.StatusOK, movies)
	}

}

func GetMovieByID(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c, 100*time.Second)
		defer cancel()

		movieID := c.Param("imdb_id")

		if movieID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Movie ID is required"})
			return
		}
		var movie models.Movie
		var moviesCollection *mongo.Collection = database.OpenCollection("movies", client)
		err := moviesCollection.FindOne(ctx, bson.M{"imdb_id": movieID}).Decode(&movie)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Can not find the movie"})
			return
		}

		c.JSON(http.StatusOK, movie)

	}
}

var validate = validator.New()

func AddMovies(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c, 100*time.Second)
		defer cancel()
		var movie models.Movie
		if err := c.ShouldBindJSON(&movie); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid Input"})
			return
		}
		if err := validate.Struct(movie); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Valdation failed", "details": err.Error()})
			return
		}
		var moviesCollection *mongo.Collection = database.OpenCollection("movies", client)
		result, err := moviesCollection.InsertOne(ctx, movie)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add movie"})
			return
		}
		c.JSON(http.StatusCreated, result)

	}
}

func AdminReviewupdate(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Implementation for admin review update

		role, err := utils.GetRoleFromContext(c)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "can not get the role from context"})
			return
		}
		if role != "ADMIN" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User must be part of admin role"})
			return
		}

		movieId := c.Param("imdb_id")
		if movieId == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Movie ID is required"})
			return
		}
		var req struct {
			AdminReview string `json:"admin_review" validate:"required"`
		}
		var resp struct {
			RankingName string `json:"ranking_name"`
			AdminReview string `json:"admin_review"`
		}
		if err := c.ShouldBind(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Input"})
			return
		}
		sentiment, rankval, err := GetReviewRanking(req.AdminReview, client, c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get review ranking"})
			return
		}
		filter := bson.M{
			"imdb_id": movieId,
		}
		update := bson.M{
			"$set": bson.M{
				"admin_review": req.AdminReview,
				"ranking": bson.M{
					"ranking_name":  sentiment,
					"ranking_value": rankval,
				},
			},
		}
		var ctx, cancel = context.WithTimeout(c, 100*time.Second)
		defer cancel()

		var moviesCollection *mongo.Collection = database.OpenCollection("movies", client)
		result, err := moviesCollection.UpdateOne(ctx, filter, update)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update movie review"})
			return
		}
		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Movie not found"})
			return
		}
		resp.RankingName = sentiment
		resp.AdminReview = req.AdminReview
		c.JSON(http.StatusOK, resp)
	}

}

func GetReviewRanking(adminReview string, client *mongo.Client, c *gin.Context) (string, int, error) {
	// ---------------- 1️⃣ Load rankings ----------------
	rankings, err := GetRanking(client, c)
	if err != nil {
		return "", 0, err
	}

	if len(rankings) == 0 {
		return "", 0, ErrRankingConfigInvalid
	}

	// Build a comma-separated list of allowed rankings
	var allowedNames []string
	allowed := make(map[string]int)
	for _, r := range rankings {
		if r.RankingValue != 999 {
			name := strings.TrimSpace(r.RankingName)
			if name != "" {
				allowedNames = append(allowedNames, name)
				allowed[name] = r.RankingValue
			}
		}
	}

	rankingList := strings.Join(allowedNames, ", ")

	// ---------------- 2️⃣ Load .env and API key ----------------
	_ = godotenv.Load(".env")
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return "", 0, errors.New("GEMINI_API_KEY not found in environment")
	}

	// ---------------- 3️⃣ Build prompt ----------------
	promptTemplate := os.Getenv("BASE_PROMPT_TEMPLATE")
	if promptTemplate == "" {
		return "", 0, errors.New("BASE_PROMPT_TEMPLATE not found")
	}
	prompt := strings.Replace(promptTemplate, "{rankings}", rankingList, 1)
	finalPrompt := strings.TrimSpace(prompt) + "\n\nREVIEW:\n" + strings.TrimSpace(adminReview)

	// ---------------- 4️⃣ Initialize Gemini client ----------------
	ctx := c
	gemClient, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return "", 0, fmt.Errorf("failed to create Gemini client: %v", err)
	}

	// ---------------- 5️⃣ Generate response ----------------
	model := "gemini-2.5-flash"
	resp, err := gemClient.Models.GenerateContent(ctx, model, genai.Text(finalPrompt), nil)
	if err != nil {
		return "", 0, fmt.Errorf("Gemini generation error: %v", err)
	}

	rawResponse := strings.TrimSpace(resp.Text()) // ✅ Note: call Text() method
	log.Println("[GEMINI RESPONSE]", rawResponse)

	// ---------------- 6️⃣ Normalize & match ----------------
	response := ""
	rankVal := 0
	for name, val := range allowed {
		if strings.EqualFold(name, rawResponse) { // case-insensitive match
			response = name
			rankVal = val
			break
		}
	}

	if response == "" {
		log.Printf("[LLM_CONTRACT_VIOLATION] response=%q allowed=%v", rawResponse, allowedNames)
		return "", 0, ErrInvalidLLMResponse
	}

	return response, rankVal, nil
}

func GetRanking(client *mongo.Client, c *gin.Context) ([]models.Ranking, error) {
	var rankings []models.Ranking
	ctx, cancel := context.WithTimeout(c, 100*time.Second)
	defer cancel()
	var rankingCollection *mongo.Collection = database.OpenCollection("rankings", client)
	cursor, err := rankingCollection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	if err := cursor.All(ctx, &rankings); err != nil {
		return nil, err
	}

	return rankings, nil
}

func GetRecommendedMovies(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		userId, err := utils.GetUserIdFromContext(c)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User ID not found in context"})
			return
		}
		favGenres, err := GetUserFavoriteGenres(userId, client, c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user favorite genres"})
			return
		}

		err = godotenv.Load(".env")
		if err != nil {
			log.Println("warning: failed to load .env file:", err)
		}
		var recommendedMoviesinitialvalue int64 = 5
		recommendedMoviesinitialvalueStr := os.Getenv("RECOMMENDED_MOVIES_COUNT")
		if recommendedMoviesinitialvalueStr != "" {
			if val, err := strconv.ParseInt(recommendedMoviesinitialvalueStr, 10, 64); err == nil {
				recommendedMoviesinitialvalue = val
			}
			findOptions := options.Find()
			findOptions.SetSort(bson.D{{Key: "ranking.ranking_value", Value: 1}})
			findOptions.SetLimit(recommendedMoviesinitialvalue)
			filter := bson.M{
				"genre.genre_name": bson.M{"$in": favGenres},
			}
			var ctx, cancel = context.WithTimeout(c, 100*time.Second)
			defer cancel()
			var moviesCollection *mongo.Collection = database.OpenCollection("movies", client)
			cursor, err := moviesCollection.Find(ctx, filter, findOptions)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch recommended movies"})
				return
			}
			defer cursor.Close(ctx)
			var recommendedMovies []models.Movie
			if err = cursor.All(ctx, &recommendedMovies); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse recommended movies"})
				return
			}
			c.JSON(http.StatusOK, recommendedMovies)
		}

	}
	// Implementation for getting recommended movies

}

func GetUserFavoriteGenres(userId string, client *mongo.Client, c *gin.Context) ([]string, error) {
	var ctx, cancel = context.WithTimeout(c, 100*time.Second)
	defer cancel()

	filter := bson.M{"user_id": userId}

	projection := bson.M{
		"favourite_genres.genre_name": 1,
		"_id":                         0,
	}
	var result bson.M

	opts := options.FindOne().SetProjection(projection)
	var userCollection *mongo.Collection = database.OpenCollection("users", client)
	err := userCollection.FindOne(ctx, filter, opts).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return []string{}, nil
		}
	}
	favGenreArray, ok := result["favourite_genres"].(bson.A)
	if !ok {
		return nil, errors.New("unable to retrieve favourite_genres as primitive array")
	}
	var genreName []string
	for _, item := range favGenreArray {
		if genreMap, ok := item.(bson.D); ok {
			for _, elem := range genreMap {
				if elem.Key == "genre_name" {
					if name, ok := elem.Value.(string); ok {
						genreName = append(genreName, name)
					}

				}

			}

		}

	}
	return genreName, nil
}

func GetGenres(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(c, 100*time.Second)
		defer cancel()
		var generateCollection *mongo.Collection = database.OpenCollection("genre", client)

		cursor, err := generateCollection.Find(ctx, bson.D{})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching movie genres"})
			return
		}

		defer cursor.Close(ctx)

		var genres []models.Genre
		err = cursor.All(ctx, &genres)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, genres)
	}

}



