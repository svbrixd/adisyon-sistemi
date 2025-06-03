const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const { password } = req.body || {};
  if (password !== 'olamaz123') {
    res.status(401).json({ error: "Şifre hatalı" });
    return;
  }
  if (!uri) {
    res.status(500).json({ error: "MONGODB_URI tanımlı değil" });
    return;
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  await db.collection("orders").deleteMany({});
  await db.collection("active-orders").deleteMany({});
  await db.collection("debts").deleteMany({});
  await db.collection("menu").deleteMany({});
  res.status(200).json({ success: true });
  await client.close();
}; 