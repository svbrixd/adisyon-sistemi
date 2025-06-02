const { MongoClient } = require("mongodb");
const dayjs = require("dayjs");

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
    const now = dayjs();
    let gunluk = 0, haftalik = 0, aylik = 0, toplam = 0;
    const startOfWeek = now.startOf('week').add(1, 'day');
    const endOfWeek = startOfWeek.add(6, 'day');
    const startOfMonth = now.startOf('month');
    const endOfMonth = now.endOf('month');
    orders.forEach(o => {
      const tarih = dayjs(o.date, 'YYYY-MM-DD HH:mm:ss');
      toplam += o.total || 0;
      if (tarih.format('YYYY-MM-DD') === now.format('YYYY-MM-DD')) gunluk += o.total || 0;
      if ((tarih.isAfter(startOfWeek, 'day') || tarih.isSame(startOfWeek, 'day')) && (tarih.isBefore(endOfWeek, 'day') || tarih.isSame(endOfWeek, 'day'))) haftalik += o.total || 0;
      if ((tarih.isAfter(startOfMonth, 'day') || tarih.isSame(startOfMonth, 'day')) && (tarih.isBefore(endOfMonth, 'day') || tarih.isSame(endOfMonth, 'day'))) aylik += o.total || 0;
    });
    res.status(200).json({ gunluk, haftalik, aylik, toplam });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
  await client.close();
}; 