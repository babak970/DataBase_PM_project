package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	"github.com/rs/cors"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	PhoneNumber string `json:"phone_number"`
	Password    string `json:"password"`
}

type Purchase struct {
	UserID       int    `json:"user_id"`
	ProductID    int    `json:"product_id"`
	ProductName  string `json:"product_name"`
	ProductPrice int    `json:"product_price"`
}

var db *sql.DB

func main() {
	var err error
	connStr := "postgres://postgres:babak@localhost:5432/DB_PM_project?sslmode=disable"
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Successfully connected to the database!")

	router := mux.NewRouter()
	router.HandleFunc("/register", registerHandler).Methods("POST")
	router.HandleFunc("/login", loginHandler).Methods("POST")
	router.HandleFunc("/users", getUsersHandler).Methods("GET")
	router.HandleFunc("/buy", buyHandler).Methods("POST")
	router.HandleFunc("/admin/stats", adminStatsHandler).Methods("GET")

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	})

	handler := c.Handler(router)

	log.Println("Server is running on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", handler))
}

func registerHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var user User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}
	_, err = db.Exec("INSERT INTO users (name, phone_number, password) VALUES ($1, $2, $3)", user.Name, user.PhoneNumber, string(hashedPassword))
	if err != nil {
		http.Error(w, "Failed to register user. Phone number might already exist.", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "User registered successfully!"})
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var credentials struct {
		PhoneNumber string `json:"phone_number"`
		Password    string `json:"password"`
	}
	err := json.NewDecoder(r.Body).Decode(&credentials)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if credentials.PhoneNumber == "admin" && credentials.Password == "adminpass" {
		json.NewEncoder(w).Encode(map[string]string{"message": "Admin login successful!", "role": "admin"})
		return
	}
	var user User
	err = db.QueryRow("SELECT id, name, phone_number, password FROM users WHERE phone_number = $1", credentials.PhoneNumber).Scan(&user.ID, &user.Name, &user.PhoneNumber, &user.Password)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Invalid phone number or password", http.StatusUnauthorized)
			return
		}
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(credentials.Password))
	if err != nil {
		http.Error(w, "Invalid phone number or password", http.StatusUnauthorized)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Login successful!"})
}

func getUsersHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	rows, err := db.Query("SELECT id, name, phone_number FROM users ORDER BY name ASC")
	if err != nil {
		http.Error(w, "Failed to retrieve users", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	var users []User
	for rows.Next() {
		var user User
		if err := rows.Scan(&user.ID, &user.Name, &user.PhoneNumber); err != nil {
			http.Error(w, "Failed to scan user data", http.StatusInternalServerError)
			return
		}
		users = append(users, user)
	}
	if err := rows.Err(); err != nil {
		http.Error(w, "Error iterating over user rows", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(users)
}

func buyHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var purchase Purchase
	err := json.NewDecoder(r.Body).Decode(&purchase)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	_, err = db.Exec(
		"INSERT INTO purchases (user_id, product_id, product_name, product_price) VALUES ($1, $2, $3, $4)",
		purchase.UserID, purchase.ProductID, purchase.ProductName, purchase.ProductPrice,
	)
	if err != nil {
		http.Error(w, "Failed to record purchase", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": "Purchase recorded successfully!"})
}

func adminStatsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var totalUsers int
	var newUsers int
	var purchasesToday int
	var purchasesMonthSum int
	type NameLengthStat struct {
		Length int `json:"length"`
		Count  int `json:"count"`
	}
	var nameLengthStats []NameLengthStat

	err := db.QueryRow("SELECT COUNT(*) FROM users").Scan(&totalUsers)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to get total users"})
		return
	}

	err = db.QueryRow("SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '30 days'").Scan(&newUsers)
	if err != nil {
		newUsers = -1
	}

	// Purchases made today
	err = db.QueryRow("SELECT COUNT(*) FROM purchases WHERE purchased_at::date = CURRENT_DATE").Scan(&purchasesToday)
	if err != nil {
		purchasesToday = -1
	}

	// Sum of purchases this month
	err = db.QueryRow("SELECT COALESCE(SUM(product_price), 0) FROM purchases WHERE DATE_TRUNC('month', purchased_at) = DATE_TRUNC('month', CURRENT_DATE)").Scan(&purchasesMonthSum)
	if err != nil {
		purchasesMonthSum = -1
	}

	rows, err := db.Query(`
        SELECT LENGTH(name) AS length, COUNT(*) AS count
        FROM users
        GROUP BY length
        ORDER BY count DESC
        LIMIT 5
    `)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var stat NameLengthStat
			if err := rows.Scan(&stat.Length, &stat.Count); err == nil {
				nameLengthStats = append(nameLengthStats, stat)
			}
		}
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"total_users":         totalUsers,
		"new_users_30days":    newUsers,
		"purchases_today":     purchasesToday,
		"purchases_month_sum": purchasesMonthSum,
		"top_name_lengths":    nameLengthStats,
	})
}
