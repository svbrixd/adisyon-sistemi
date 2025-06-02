import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (!uri) {
    res.status(500).json({ error: "MONGODB_URI tanımlı değil" });
    return;
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(); // default db
    const collections = await db.listCollections().toArray();
    res.status(200).json({ collections });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await client.close();
  }
}