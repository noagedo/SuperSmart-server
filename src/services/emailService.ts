import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
   host: "smtp.gmail.com",   
  port: 465,       
  service: "gmail",
  auth: {
    user: "yuval056@gmail.com",
    pass: process.env.EMAIL_PASS, 
  },
});


interface CartItem {
  name?: string;
  productName?: string;
  title?: string;
  quantity?: number;
  price?: number;
  store?: string;
  storeName?: string;
  storeLocation?: string;
}

transporter.verify()
  .then(() => console.log("✅ Email transporter verified"))
  .catch((err) => console.error("❌ Verification failed", err));

export async function sendCartEmail(email: string, cart: (string | CartItem)[]) {
  const subject = "🛒 העגלה שלך מהאפליקציה";
  
 
  const itemTexts = cart.map(item => {
    
    if (typeof item === 'string') {
      return `- ${item}`;
    }

    else if (item && typeof item === 'object') {
      const name = item.name || item.productName || item.title || 'פריט';
      const quantity = item.quantity ? ` (כמות: ${item.quantity})` : '';
      const price = item.price ? ` - ₪${item.price}` : '';
      
    
      const storeName = item.store || item.storeName || '';
      const storeInfo = storeName ? ` [${storeName}${item.storeLocation ? ` - ${item.storeLocation}` : ''}]` : '';
      
      return `- ${name}${quantity}${price}${storeInfo}`;
    }
 
    return `- פריט לא מזוהה`;
  });
  
  const body = "שלום! זאת העגלה ששמרת:\n\n" + itemTexts.join("\n");

  await transporter.sendMail({
    from: `"Smart Supermarket" <yuval056@gmail.com>`,
    to: email,
    subject,
    text: body,
  });
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const subject = "🔒 איפוס סיסמה - Smart Supermarket";
  
  const body = `שלום!

קיבלנו בקשה לאיפוס הסיסמה שלך.

לחץ על הקישור הבא כדי לאפס את הסיסמה שלך:
${resetLink}

הקישור תקף למשך שעה אחת בלבד.

אם לא ביקשת לאפס את הסיסמה, אנא התעלם מהמייל הזה.

בברכה,
צוות Smart Supermarket`;

  await transporter.sendMail({
    from: `"Smart Supermarket" <yuval056@gmail.com>`,
    to: email,
    subject,
    text: body,
  });
}


