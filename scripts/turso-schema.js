const { createClient } = require('@libsql/client');

async function main() {
  const db = createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_TOKEN,
  });

  const sql = `
    CREATE TABLE IF NOT EXISTS "Category" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "image" TEXT NOT NULL DEFAULT '',
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "isActive" BOOLEAN NOT NULL DEFAULT 1,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");

    CREATE TABLE IF NOT EXISTS "Product" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "description" TEXT NOT NULL DEFAULT '',
      "unit" TEXT NOT NULL DEFAULT '1 pc',
      "price" REAL NOT NULL DEFAULT 0,
      "mrp" REAL NOT NULL DEFAULT 0,
      "stock" INTEGER NOT NULL DEFAULT 0,
      "minQuantity" INTEGER NOT NULL DEFAULT 1,
      "image" TEXT NOT NULL DEFAULT '',
      "isAvailable" BOOLEAN NOT NULL DEFAULT 1,
      "isFeatured" BOOLEAN NOT NULL DEFAULT 0,
      "isBestSelling" BOOLEAN NOT NULL DEFAULT 0,
      "categoryId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug");

    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "mobile" TEXT NOT NULL,
      "businessName" TEXT NOT NULL DEFAULT '',
      "email" TEXT NOT NULL DEFAULT '',
      "isAdmin" BOOLEAN NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "User_mobile_key" ON "User"("mobile");

    CREATE TABLE IF NOT EXISTS "Order" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "orderId" TEXT NOT NULL,
      "customerName" TEXT NOT NULL,
      "mobile" TEXT NOT NULL,
      "businessName" TEXT NOT NULL DEFAULT '',
      "totalAmount" REAL NOT NULL,
      "paymentMethod" TEXT NOT NULL DEFAULT 'Cash at Shop',
      "paymentStatus" TEXT NOT NULL DEFAULT 'Pending',
      "orderStatus" TEXT NOT NULL DEFAULT 'Pending',
      "pickupStatus" TEXT NOT NULL DEFAULT 'Not Ready',
      "specialNote" TEXT NOT NULL DEFAULT '',
      "pickupDate" TEXT NOT NULL DEFAULT '',
      "userId" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderId_key" ON "Order"("orderId");

    CREATE TABLE IF NOT EXISTS "OrderItem" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "productName" TEXT NOT NULL,
      "quantity" INTEGER NOT NULL,
      "price" REAL NOT NULL,
      "total" REAL NOT NULL,
      "orderId" TEXT NOT NULL,
      "productId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );
  `;

  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);

  for (const stmt of statements) {
    try {
      await db.execute(stmt);
      console.log('OK');
    } catch (e) {
      console.error('Error:', e.message);
    }
  }

  const tables = await db.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  console.log('\nTables in Turso:');
  tables.rows.forEach(row => console.log(' -', row[0]));
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });