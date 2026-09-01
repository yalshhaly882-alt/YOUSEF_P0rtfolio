// ⚠️ عبّي القيم دي من مشروعك على Firebase Console
// Firebase Console → Project settings → عام (General) → Your apps → SDK setup and configuration
//
// خطوات إنشاء المشروع (مجاني بالكامل):
// 1) روح https://console.firebase.google.com وسجّل دخول بحساب جوجل
// 2) اعمل "Add project" واختار اسم زي youssef-portfolio
// 3) من القائمة الجانبية: Build → Realtime Database → Create Database
//    - اختار أي منطقة قريبة، وابدأ في "Test mode" (هنظبط الصلاحيات بعدين)
// 4) من Project settings → عام → لحد ما توصل لـ "Your apps"، دوس على أيقونة </>
//    (Web app) وسمّيه أي اسم، وهيديك الكود اللي تحت — انسخ القيم هنا بدل النقط
// 5) من تبويب "Rules" في Realtime Database، الصق القواعد دي واحفظ:
//    {
//      "rules": {
//        "reactions": { ".read": true, ".write": true },
//        "content": { ".read": true, ".write": true },
//        "messages": { ".read": true, ".write": true },
//        "admin": { ".read": true, ".write": true }
//      }
//    }
//    (ملحوظة: القواعد دي كافية لموقع بورتفوليو شخصي بسيط. الباسورد بيتخزن
//    كنص عادي في قاعدة البيانات — تمام تمامًا لموقع تجريبي/شخصي، بس متستخدمش
//    نفس الباسورد ده في أي حساب مهم عندك، لأن أي حد يعرف يقرا كود الموقع
//    يقدر يوصله من غير تسجيل دخول حقيقي).

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// لو القيم لسه YOUR_API_KEY يعني لسه معملتش الإعداد — الموقع هيفضل شغال
// عادي، بس الإيموجيز ولوحة التحكم مش هيتفعّلوا غير بعد ما تحط بياناتك
// الحقيقية هنا.
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
  firebase.initializeApp(firebaseConfig);
  window.db = firebase.database();
}
