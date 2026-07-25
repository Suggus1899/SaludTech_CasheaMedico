package service

import "github.com/jackc/pgx/v5/pgtype"

func parseUUID(s string) (pgtype.UUID, error) {
	var u pgtype.UUID
	err := u.Scan(s)
	return u, err
}
