export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const DB_URL = "https://phop-cccce-default-rtdb.firebaseio.com";

  try {
    if (req.method === 'GET') {
      const response = await fetch(`${DB_URL}/products.json`);
      const data = await response.json();
      return res.status(200).json(data || {});
    }

    if (req.method === 'POST') {
      const product = req.body;
      const response = await fetch(`${DB_URL}/products.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      const data = await response.json();
      return res.status(200).json({ success: true, id: data.name });
    }

    if (req.method === 'PUT') {
      const { id, ...productData } = req.body;
      await fetch(`${DB_URL}/products/${id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await fetch(`${DB_URL}/products/${id}.json`, {
        method: 'DELETE'
      });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "خطای سرور: " + error.message });
  }
}
