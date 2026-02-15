-- AlterTable: Change Transaction.date from DATETIME to TEXT (YYYY-MM-DD)
-- SQLite doesn't support ALTER COLUMN, so we recreate the table with data migration

-- Create new table with date as TEXT
CREATE TABLE "Transaction_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Copy data, converting DateTime to YYYY-MM-DD format
-- Handles both TEXT (ISO/datetime string) and INTEGER (unix ms) storage
INSERT INTO "Transaction_new" ("id", "description", "amount", "type", "date", "createdAt", "updatedAt", "userId", "categoryId")
SELECT 
    "id",
    "description",
    "amount",
    "type",
    CASE 
        WHEN typeof("date") = 'text' THEN substr("date", 1, 10)
        WHEN typeof("date") = 'integer' THEN date(datetime("date" / 1000, 'unixepoch'))
        ELSE date('now')
    END,
    "createdAt",
    "updatedAt",
    "userId",
    "categoryId"
FROM "Transaction";

-- Drop old table
DROP TABLE "Transaction";

-- Rename new table
ALTER TABLE "Transaction_new" RENAME TO "Transaction";

-- Recreate indexes
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX "Transaction_categoryId_idx" ON "Transaction"("categoryId");
