import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (!uri) {
    res.status(500).json({ error: "MONGODB_URI tanımlı değil" });
    return;
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(); // default db
  const collection = db.collection("orders");

  if (req.method === "POST") {
    // Sipariş ekle
    const order = req.body;
    const result = await collection.insertOne(order);
    res.status(201).json({ insertedId: result.insertedId });
  } else if (req.method === "GET") {
    // Siparişleri listele
    const orders = await collection.find({}).toArray();
    res.status(200).json({ orders });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
  await client.close();
}