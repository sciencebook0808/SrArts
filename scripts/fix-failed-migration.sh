#!/usr/bin/env bash
# =============================================================================
# scripts/fix-failed-migration.sh
#
# Production-safe recovery for Prisma P3009 error.
#
# BASED ON OFFICIAL PRISMA v7 DOCUMENTATION (verified March 2026):
#   https://www.prisma.io/docs/orm/prisma-migrate/workflows/patching-and-hotfixing
#   https://www.prisma.io/docs/cli/migrate/resolve
#   https://www.prisma.io/docs/cli/migrate/status
#
# ERROR CONTEXT:
#   P3009 — "migrate found failed migrations in the target database,
#            new migrations will not be applied"
#   Migration: 20260323000000_community_reference_fields
#
# WHAT THIS SCRIPT DOES:
#   1. Checks the current migration status
#   2. Diagnoses whether the new columns already exist in DB
#   3. Takes the correct recovery path (--applied or --rolled-back + redeploy)
#
# USAGE:
#   DATABASE_URL="postgresql://..." bash scripts/fix-failed-migration.sh
#
# =============================================================================

set -euo pipefail

MIGRATION_NAME="20260323000000_community_reference_fields"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Prisma P3009 Recovery Script ===${NC}"
echo -e "${BLUE}Migration: ${MIGRATION_NAME}${NC}"
echo ""

# --- Guard: DATABASE_URL must be set ---
if [ -z "${DATABASE_URL:-}" ]; then
  echo -e "${RED}ERROR: DATABASE_URL environment variable is not set.${NC}"
  echo "Export it before running this script:"
  echo "  export DATABASE_URL='postgresql://user:pass@host:26257/defaultdb?sslmode=verify-full'"
  exit 1
fi

echo -e "${YELLOW}STEP 1: Checking current migration status...${NC}"
npx prisma migrate status 2>&1 || true
echo ""

echo -e "${YELLOW}STEP 2: Diagnosing _prisma_migrations table state...${NC}"
echo "Run this SQL against your database to see the failed migration record:"
cat << 'SQL'

  SELECT
    migration_name,
    started_at,
    finished_at,
    rolled_back_at,
    logs,
    applied_steps_count
  FROM "_prisma_migrations"
  WHERE migration_name = '20260323000000_community_reference_fields'
  ORDER BY started_at DESC;

SQL

echo ""
echo -e "${YELLOW}STEP 3: Diagnosing whether columns already exist in DB...${NC}"
echo "Run this SQL to check column existence:"
cat << 'SQL'

  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'CommunityPost'
    AND column_name IN (
      'referenceType', 'referenceId',
      'referenceTitle', 'referenceImage', 'referenceSlug'
    );

SQL

echo ""
echo -e "${YELLOW}STEP 4: Applying the correct recovery strategy...${NC}"
echo ""
echo -e "${BLUE}Choosing OPTION A — Mark as rolled-back, fix, then redeploy.${NC}"
echo -e "${BLUE}This is the safer path because our migration SQL uses IF NOT EXISTS,${NC}"
echo -e "${BLUE}making it safe to re-run even if partially applied.${NC}"
echo ""

echo -e "${YELLOW}Marking migration as rolled-back in _prisma_migrations...${NC}"
# Source: https://www.prisma.io/docs/cli/migrate/resolve
# "--rolled-back updates the migration record in _prisma_migrations to register
#  it as rolled back, allowing it to be applied again"
npx prisma migrate resolve --rolled-back "${MIGRATION_NAME}"

echo ""
echo -e "${GREEN}✓ Migration marked as rolled-back.${NC}"
echo ""

echo -e "${YELLOW}STEP 5: Re-deploying migration...${NC}"
npx prisma migrate deploy

echo ""
echo -e "${GREEN}✓ Migration re-deployed successfully.${NC}"
echo ""

echo -e "${YELLOW}STEP 6: Final status check...${NC}"
npx prisma migrate status

echo ""
echo -e "${GREEN}=== Recovery complete ===${NC}"
