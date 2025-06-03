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

  if (req.method === "POST") {
    const { username, password, role } = req.body || {};
    const user = await collection.findOne({ username, password, role });
    if (user) {
      res.status(200).json({ username: user.username, role: user.role, displayName: user.displayName });
    } else {
      res.status(401).json({ error: "Kullanıcı adı, şifre veya rol hatalı!" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
  await client.close();
};