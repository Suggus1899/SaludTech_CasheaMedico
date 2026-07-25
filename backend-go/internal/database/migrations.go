package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

// EnsureMigrations creates the schema_migrations table if it does not exist,
// then applies every V*.sql file in sql/schema/ that has not been recorded yet.
// Files are applied in numeric version order (V1, V2, ... V10, V11, ...).
// If encryptionKey is non-empty, it is set as app.encryption_key GUC inside
// each migration transaction so pgp_sym_encrypt calls in V21 can backfill.
func EnsureMigrations(ctx context.Context, pool *pgxpool.Pool, schemaDir string, encryptionKey string) error {
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
	// Sort by numeric version (V1, V2, ... V10, V11, ...) instead of lexical
	sort.Slice(files, func(i, j int) bool {
		vi := extractVersionNum(files[i])
		vj := extractVersionNum(files[j])
		return vi < vj
	})

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

		// Set encryption key GUC for this transaction so pgp_sym_encrypt works
		if encryptionKey != "" {
			if _, err := tx.Exec(ctx, "SET LOCAL app.encryption_key = $1", encryptionKey); err != nil {
				tx.Rollback(ctx)
				return fmt.Errorf("set encryption key for %s: %w", file, err)
			}
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

// extractVersionNum parses the numeric part of a migration filename.
// e.g. "V10__add_triage.sql" -> 10, "V1__initial_schema.sql" -> 1.
func extractVersionNum(filename string) int {
	// Strip "V" prefix and everything after the first "_"
	parts := strings.SplitN(strings.TrimPrefix(filename, "V"), "_", 2)
	n, err := strconv.Atoi(parts[0])
	if err != nil {
		return 0
	}
	return n
}
