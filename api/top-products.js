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

  if (req.method === "GET") {
    const orders = await collection.find({}).toArray();
    const productMap = {};
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        if (!productMap[item.name]) productMap[item.name] = 0;
        productMap[item.name] += item.quantity || 1;
      });
    });
    const topProducts = Object.entries(productMap)
      .map(([name, adet]) => ({ name, adet }))
      .sort((a, b) => b.adet - a.adet)
      .slice(0, 10);
    res.status(200).json({ topProducts });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
  await client.close();
}; 