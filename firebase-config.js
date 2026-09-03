// ⚠️ الملف ده مسؤول بس عن حاجتين: الإيموجي المشترك بين كل الزوار،
// والتعليقات العامة اللي تقدر ترد عليها. باقي الموقع (النصوص، الصور،
// السوشيال ميديا، الأغاني) شغالة من غير الملف ده خالص عن طريق content.json.
//
// الزوار عمرهم ما هيحتاجوا يعملوا حساب أو يسجلوا دخول لأي حاجة هنا —
// الإعداد ده بتعمله انت مرة واحدة بس، ومجاني بالكامل.
//
// خطوات سريعة (5 دقايق):
// 1) روح https://console.firebase.google.com وسجّل دخول بحساب جوجل
// 2) اعمل "Add project" واختار اسم زي youssef-portfolio
// 3) من القائمة الجانبية: Build → Realtime Database → Create Database
//    - اختار أي منطقة قريبة، وابدأ في "Test mode"
// 4) من Project settings → عام → لحد ما توصل لـ "Your apps"، دوس على أيقونة </>
//    (Web app) وسمّيه أي اسم، وهيديك الكود اللي تحت — انسخ القيم هنا بدل النقط
// 5) من تبويب "Rules" في Realtime Database، الصق القواعد دي واحفظ:
//    {
//      "rules": {
//        "reactions": { ".read": true, ".write": true },
//        "comments": { ".read": true, ".write": true },
//        "visits": { ".read": true, ".write": true },
//        "content": { ".read": true, ".write": true }
//      }
//    }
//    (القواعد دي كافية لموقع بورتفوليو شخصي. مفيش تسجيل دخول حقيقي هنا، فأي
//    حد يعرف الكود يقدر يكتب بيانات في القاعدة دي بشكل مباشر لو حاول عمدًا —
//    ده قبول معقول لموقع شخصي صغير، مش حاجة تتخزن فيها بيانات حساسة).

const firebaseConfig = {
  apiKey: "AIzaSyDc9OeR0i8n-u3KJ2QkE3D1-q2UuEgZ-Rw",
  authDomain: "yousef-portfolio-3b2f5.firebaseapp.com",
  databaseURL: "https://yousef-portfolio-3b2f5-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "yousef-portfolio-3b2f5",
  storageBucket: "yousef-portfolio-3b2f5.firebasestorage.app",
  messagingSenderId: "173920054951",
  appId: "1:173920054951:web:07a56385298cbc74ccf582"
};

// لو القيم لسه YOUR_API_KEY يعني لسه معملتش الإعداد — الموقع هيفضل شغال
// عادي تمامًا، بس الإيموجي هيفضل عداد شخصي لكل جهاز، والتعليقات مش هتظهر.
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
  firebase.initializeApp(firebaseConfig);
  window.db = firebase.database();
}
