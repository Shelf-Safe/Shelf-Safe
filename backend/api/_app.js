import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: { version: ServerApiVersion.v1 },
});

let db;
async function getDb() {
  if (!db) {
    await client.connect();
    db = client.db("shelfsafe");
    console.log("✅ Connected to MongoDB Atlas");
  }
  return db;
}

app.get("/", async (req, res) => {
  await getDb();
  res.json({ ok: true, message: "API connected" });
});

app.get("/health", async (req, res) => {
  await getDb();
  res.json({ ok: true, message: "API is healthy + DB connected" });
});

app.get("/products", async (req, res) => {
  const database = await getDb();
  const products = await database.collection("products").find({}).toArray();
  res.json(products);
});

app.get("/inventoryLots", async (req, res) => {
  const database = await getDb();
  const lots = await database.collection("inventoryLots").find({}).toArray();
  res.json(lots);
});

app.get("/attachments", async (req, res) => {
  const database = await getDb();
  const { entityType, entityId } = req.query;

  const filter = { isDeleted: false };

  if (entityType) filter.entityType = entityType;

  if (entityId) {
    filter.entityId = entityId; 
  }

  const attachments = await database
    .collection("attachments")
    .find(filter)
    .toArray();

  res.json(attachments);
});


export default app;
