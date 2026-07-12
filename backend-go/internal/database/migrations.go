package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

// EnsureMigrations creates the schema_migrations table if it does not exist,
// then applies every V*.sql file in sql/schema/ that has not been recorded yet.
// Files are applied in lexical order (V1, V2, ... V10, ...).
func EnsureMigrations(ctx context.Context, pool *pgxpool.Pool, schemaDir string) error {
	// 1. Create tracking table
	_, err := pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version  VARCHAR(255) PRIMARY KEY,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
	`)
	if err != nil {
		return fmt.Errorf("create schema_migrations: %w", err)
	}

	// 2. Discover migration files
	entries, err := os.ReadDir(schemaDir)
	if err != nil {
		return fmt.Errorf("read schema dir %s: %w", schemaDir, err)
	}

	var files []string
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		name := e.Name()
		if !strings.HasPrefix(name, "V") || !strings.HasSuffix(name, ".sql") {
			continue
		}
		files = append(files, name)
	}
	sort.Strings(files)

	// 3. Apply pending migrations in a single transaction per file
	for _, file := range files {
		version := strings.TrimSuffix(file, ".sql")

		var exists bool
		err := pool.QueryRow(ctx, `SELECT EXISTS (SELECT 1 FROM schema_migrations WHERE version = $1)`, version).Scan(&exists)
		if err != nil {
			return fmt.Errorf("check migration %s: %w", version, err)
		}
		if exists {
			continue
		}

		content, err := os.ReadFile(filepath.Join(schemaDir, file))
		if err != nil {
			return fmt.Errorf("read %s: %w", file, err)
		}

		tx, err := pool.Begin(ctx)
		if err != nil {
			return fmt.Errorf("begin tx for %s: %w", file, err)
		}

		if _, err := tx.Exec(ctx, string(content)); err != nil {
			tx.Rollback(ctx)
			return fmt.Errorf("apply %s: %w", file, err)
		}

		if _, err := tx.Exec(ctx, `INSERT INTO schema_migrations (version) VALUES ($1)`, version); err != nil {
			tx.Rollback(ctx)
			return fmt.Errorf("record %s: %w", file, err)
		}

		if err := tx.Commit(ctx); err != nil {
			return fmt.Errorf("commit %s: %w", file, err)
		}

		log.Printf("✅ Migration %s applied", version)
	}

	return nil
}
