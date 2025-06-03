const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

module.exports = async function handler(req, res) {
  if (!uri) {
    res.status(500).json({ error: "MONGODB_URI tanımlı değil" });
    return;
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const collection = db.collection("menu");

  if (req.method === "GET") {
    const menu = await collection.find({}).toArray();
    res.status(200).json({ menu });
  } else if (req.method === "POST") {
    const { name, price, category } = req.body || {};
    if (!name || !price || !category) {
      res.status(400).json({ error: "Eksik bilgi" });
      return;
    }
    // Otomatik id ver
    const last = await collection.find().sort({ id: -1 }).limit(1).toArray();
    const id = last.length > 0 ? last[0].id + 1 : 1;
    await collection.insertOne({ id, name, price, category });
    res.status(201).json({ success: true });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
  await client.close();
}; 