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
    if (req.method === 'POST') {
      const { action, username, password, newUsername, newPassword } = req.body;

      const adminRes = await fetch(`${DB_URL}/adminConfig.json`);
      let adminData = await adminRes.json();

      // اگر هنوز دیتابیس ساخته نشده بود، از مقادیر پیش‌فرض استفاده کن
      if (!adminData || !adminData.username) {
        adminData = { username: "slider", password: "1234" };
      }

      if (action === 'login') {
        const inputUser = (username || '').trim().toLowerCase();
        const inputPass = (password || '').trim().toLowerCase();
        const targetUser = (adminData.username || 'slider').trim().toLowerCase();
        const targetPass = (adminData.password || '1234').trim().toLowerCase();

        if (inputUser === targetUser && inputPass === targetPass) {
          return res.status(200).json({ success: true, message: "ورود موفقیت‌آمیز بود" });
        } else {
          return res.status(400).json({ success: false, message: "نام کاربری یا رمز عبور اشتباه است" });
        }
      }

      if (action === 'update') {
        if (!newUsername || !newPassword) {
          return res.status(400).json({ success: false, message: "اطلاعات جدید کامل نیست" });
        }

        const updatedData = {
          username: newUsername.trim(),
          password: newPassword.trim()
        };

        await fetch(`${DB_URL}/adminConfig.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData)
        });

        return res.status(200).json({ success: true, message: "اطلاعات مدیر با موفقیت به‌روزرسانی شد" });
      }
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "خطای سرور: " + error.message });
  }
}
