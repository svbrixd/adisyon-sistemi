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
  const collection = db.collection("orders");

  if (req.method === "POST") {
    let body = req.body;
    if (!body || typeof body === "string") {
      body = JSON.parse(req.body);
    }
    const result = await collection.insertOne(body);
    res.status(201).json({ insertedId: result.insertedId });
  } else if (req.method === "GET") {
    const orders = await collection.find({}).toArray();
    res.status(200).json({ orders });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
  await client.close();
};