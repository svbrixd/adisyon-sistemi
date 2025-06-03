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
  const collection = db.collection("users");

  if (req.method === "GET") {
    const users = await collection.find({}).toArray();
    res.status(200).json({ users });
  } else if (req.method === "POST") {
    const { username, password, role, displayName } = req.body || {};
    if (!username || !password || !role) {
      res.status(400).json({ error: "Eksik bilgi" });
      return;
    }
    await collection.insertOne({ username, password, role, displayName });
    res.status(201).json({ success: true });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
  await client.close();
};