# Archived CockroachDB migrations (superseded)

These are the original migrations from when this project targeted **CockroachDB**.
They are kept for history only and are **not** valid PostgreSQL:

* `STRING` column type — PostgreSQL has no `STRING` type (use `TEXT`).
* `gen_random_uuid()::STRING` — invalid cast on PostgreSQL.
* `ALTER TABLE … ADD CONSTRAINT IF NOT EXISTS` — CockroachDB-only syntax.

They were also **incomplete**: the set contained only incremental `ALTER`
statements and never created the core tables (`Artwork`, `BlogPost`, `Profile`,
`Category`, `Commission`, `ArtworkLike`, `Comment`, `CommunityPost`,
`CommunityLike`, `StaticPage`), so `prisma migrate deploy` against an empty
database could never have succeeded.

They are replaced by a single PostgreSQL baseline in `prisma/migrations/`,
generated from `prisma/schema.prisma`.
