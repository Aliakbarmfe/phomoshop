export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { image } = req.body || {};

    if (!image) {
      return res.status(400).json({ success: false, message: 'تصویری ارسال نشده است' });
    }

    const apiKey = "4462208250e0e04c12872ffc3efd540d";
    
    // پاک‌سازی فرمت Base64
    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, "");

    const formData = new URLSearchParams();
    formData.append('image', cleanBase64);

    const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    const data = await imgbbRes.json();

    if (data && data.success) {
      return res.status(200).json({ success: true, url: data.data.url });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: data.error ? data.error.message : 'خطا در سرویس ImgBB' 
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای سرور: ' + error.message });
  }
}
