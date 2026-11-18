import { MongoClient, type Db, type Collection, type Document } from "mongodb";
import bcrypt from "bcryptjs";
import { DEFAULT_TIME_SLOTS } from "@/data/firm";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _mongoInitialized: Promise<void> | undefined;
}

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not configured. Set MONGODB_URI in .env.local or Vercel Environment Variables."
    );
  }

  if (!globalThis._mongoClientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });
    globalThis._mongoClientPromise = client.connect();
  }

  return globalThis._mongoClientPromise;
}

/**
 * Ensures indexes, default Sun–Thu consultation slots, and initial chamber admin
 * exist in MongoDB Atlas (idempotent, runs once per server instance).
 */
async function ensureDatabaseReady(db: Db): Promise<void> {
  if (!globalThis._mongoInitialized) {
    globalThis._mongoInitialized = (async () => {
      const appointments = db.collection("appointments");
      const availabilitySlots = db.collection("availability_slots");
      const blockedDates = db.collection("blocked_dates");
      const notifications = db.collection("admin_notifications");
      const admins = db.collection("admins");

      await Promise.all([
        appointments.createIndex({ inquiry_id: 1 }, { unique: true }),
        appointments.createIndex({ status: 1 }),
        appointments.createIndex({ preferred_date: 1 }),
        appointments.createIndex({ created_at: -1 }),
        appointments.createIndex({ lead_source: 1 }),
        appointments.createIndex(
          { preferred_date: 1, preferred_time: 1 },
          {
            unique: true,
            partialFilterExpression: { status: "confirmed" },
            name: "uniq_confirmed_slot",
          }
        ),
        availabilitySlots.createIndex(
          { day_of_week: 1, slot_time: 1 },
          { unique: true }
        ),
        blockedDates.createIndex({ blocked_date: 1 }, { unique: true }),
        notifications.createIndex({ is_read: 1, created_at: -1 }),
        admins.createIndex({ email: 1 }, { unique: true }),
      ]);

      // Seed default Sun–Thu (0..4) 3:00 PM – 7:30 PM BST slots if empty
      const slotCount = await availabilitySlots.countDocuments();
      if (slotCount === 0) {
        const docs: Document[] = [];
        for (let dow = 0; dow <= 4; dow++) {
          DEFAULT_TIME_SLOTS.forEach((slot, idx) => {
            docs.push({
              day_of_week: dow,
              slot_time: slot.slot_time,
              slot_label: slot.slot_label,
              max_bookings: 1,
              is_active: true,
              sort_order: idx + 1,
              created_at: new Date(),
            });
          });
        }
        await availabilitySlots.insertMany(docs, { ordered: false }).catch(() => {});
      }

      // Seed initial chamber super admin if admins collection is empty
      const adminCount = await admins.countDocuments();
      if (adminCount === 0) {
        const seedEmail = (
          process.env.ADMIN_SEED_EMAIL || "taxvatlawaid@gmail.com"
        )
          .trim()
          .toLowerCase();
        const seedPassword =
          process.env.ADMIN_SEED_PASSWORD || "TaxVatAdmin@2026!";
        const passwordHash = await bcrypt.hash(seedPassword, 12);

        await admins
          .updateOne(
            { email: seedEmail },
            {
              $setOnInsert: {
                email: seedEmail,
                password_hash: passwordHash,
                full_name: "Hossain Ahmed (Khan)",
                role: "super_admin",
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
              },
            },
            { upsert: true }
          )
          .catch(() => {});
      }
    })();
  }

  await globalThis._mongoInitialized;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  const dbName = process.env.MONGODB_DB || "TaxvatlawaidLandingpage";
  const db = client.db(dbName);
  await ensureDatabaseReady(db);
  return db;
}

export async function getCollection<T extends Document = Document>(
  name:
    | "appointments"
    | "availability_slots"
    | "blocked_dates"
    | "admin_notifications"
    | "admins"
): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(name);
}
