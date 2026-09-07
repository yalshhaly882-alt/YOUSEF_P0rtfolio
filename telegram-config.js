// ⚠️ اختياري بالكامل: لو ظبطت الملف ده، هتوصلك رسالة تليجرام فورًا كل ما
// حد يكتب تعليق على موقعك — إشعار حقيقي على تليجرامك زي أي رسالة عادية.
//
// خطوات الإعداد (3 دقايق):
// 1) افتح تليجرام ودوّر على @BotFather وابعتله /newbot
// 2) اختار اسم للبوت (أي اسم)، وبعدين username لازم ينتهي بـ "bot" (زي
//    YoussefSiteBot أو YoussefNotifyBot)
// 3) هيبعتلك BotFather رسالة فيها "token" — انسخه وحطه مكان
//    YOUR_BOT_TOKEN تحت
// 4) ابعت أي رسالة (حتى كلمة "hi") للبوت الجديد بتاعك من حساب تليجرامك
// 5) افتح الرابط ده في المتصفح (بدّل TOKEN بالتوكن بتاعك):
//    https://api.telegram.org/botTOKEN/getUpdates
//    هتلاقي جوه الرد حاجة زي "chat":{"id":123456789, ...} — الرقم ده هو
//    الـ CHAT_ID بتاعك، انسخه مكان YOUR_CHAT_ID تحت

const TELEGRAM_BOT_TOKEN = "8604460938:AAGovB4ZDaiSUftqDi2j4rnjYtma4ZDtbvA";
const TELEGRAM_CHAT_ID = "8742284633";

window.ynNotifyTelegram = function(text){
  if(TELEGRAM_BOT_TOKEN === "YOUR_BOT_TOKEN" || TELEGRAM_CHAT_ID === "YOUR_CHAT_ID") return;
  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text })
  }).catch(()=>{});
};
