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
  const collection = db.collection("activeOrders");

  if (req.method === "GET") {
    const activeOrders = await collection.find({}).toArray();
    res.status(200).json({ activeOrders });
  } else if (req.method === "POST") {
    const { tableNumber, items } = req.body || {};
    if (!tableNumber) {
      res.status(400).json({ error: "tableNumber gerekli" });
      return;
    }
    await collection.updateOne(
      { tableNumber },
      { $set: { tableNumber, items } },
      { upsert: true }
    );
    res.status(200).json({ success: true });
  } else if (req.method === "DELETE") {
    const { tableNumber } = req.body || {};
    if (!tableNumber) {
      res.status(400).json({ error: "tableNumber gerekli" });
      return;
    }
    await collection.deleteOne({ tableNumber });
    res.status(200).json({ success: true });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
  await client.close();
};