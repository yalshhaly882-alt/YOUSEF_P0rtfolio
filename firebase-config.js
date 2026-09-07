// ⚠️ الملف ده مسؤول عن: الإيموجي المشترك، التعليقات العامة، عداد الزيارات،
// محتوى الموقع اللي بتعدّله من اللوحة (نص/صورة/سوشيال ميديا/أغاني/فنانين)،
// وتسجيل دخولك انت كأدمن بشكل آمن حقيقي.
//
// الزوار العاديين عمرهم ما هيحتاجوا يعملوا حساب أو يسجلوا دخول لأي حاجة —
// الحساب اللي هتعمله في الخطوات دي خاص بيك انت بس كصاحب الموقع.
//
// خطوات الإعداد (10 دقايق تقريبًا):
//
// 1) روح https://console.firebase.google.com وسجّل دخول بحساب جوجل، وافتح
//    مشروعك (أو اعمل واحد جديد لو لسه معملتوش).
//
// 2) فعّل قاعدة البيانات: من القائمة الجانبية → Build → Realtime Database
//    → Create Database → اختار منطقة قريبة → ابدأ في "Test mode".
//
// 3) فعّل تسجيل الدخول الحقيقي بتاعك: من القائمة الجانبية → Build →
//    Authentication → Get started → فعّل provider "Email/Password" →
//    من تاب "Users" → Add user → حط إيميلك وباسورد قوي (ده اللي هتدخل بيه
//    على admin.html، وتقدر تغيّر الباسورد من جوه اللوحة بعدين).
//
// 4) هات بيانات الاتصال: Project settings (⚙️) → انزل لـ "Your apps" →
//    أيقونة </> (Web) → سمّيه أي اسم → Register app → انسخ القيم اللي
//    هتظهرلك في الكود ده بدل القيم الموجودة تحت.
//
// 5) من تبويب "Rules" في Realtime Database، الصق القواعد دي بالظبط واحفظ
//    (Publish) — القواعد دي هي اللي بتمنع أي حد غيرك من العبث بالموقع:
//    {
//      "rules": {
//        "content": {
//          ".read": true,
//          ".write": "auth != null"
//        },
//        "reactions": {
//          ".read": true,
//          "$emoji": { ".write": true }
//        },
//        "comments": {
//          ".read": true,
//          "$commentId": {
//            ".write": "auth != null || !data.exists()"
//          }
//        },
//        "visits": {
//          ".read": "auth != null",
//          ".write": true
//        }
//      }
//    }
//    القواعد دي معناها: أي زائر يقدر يقرأ الموقع، يدوس إيموجي، يكتب تعليق
//    جديد، وتتسجل زيارته — لكن محدش غيرك (auth != null) يقدر يعدّل محتوى
//    الموقع، يمسح أو يعدّل تعليق حد تاني، أو يشوف سجل الزيارات.

const firebaseConfig = {
  apiKey: "AIzaSyDc9OeR0i8n-u3KJ2QkE3D1-q2UuEgZ-Rw",
  authDomain: "yousef-portfolio-3b2f5.firebaseapp.com",
  databaseURL: "https://yousef-portfolio-3b2f5-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "yousef-portfolio-3b2f5",
  storageBucket: "yousef-portfolio-3b2f5.firebasestorage.app",
  messagingSenderId: "173920054951",
  appId: "1:173920054951:web:07a56385298cbc74ccf582"
};

if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
  firebase.initializeApp(firebaseConfig);
  window.db = firebase.database();
}
