package main

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	passwords := []string{"Demo1234", "admin123"}
	for _, p := range passwords {
		hash, err := bcrypt.GenerateFromPassword([]byte(p), 10)
		if err != nil {
			fmt.Printf("error: %v\n", err)
			return
		}
		fmt.Printf("%s -> %s\n", p, string(hash))
	}
}
