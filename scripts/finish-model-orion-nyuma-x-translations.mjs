#!/usr/bin/env node
/**
 * Finish remaining hi/ar/ja/bn translations for model-a, orion, nyuma-x.
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");
const locales = ["hi", "ar", "ja", "bn"];

const modelAGallery = {
  hi: {
    eyebrow: "उत्पाद इंजीनियरिंग",
    title: "एक नज़र में GLYDE हार्डवेयर",
    subtitle:
      "मॉड्यूल-फ्रेम रेलों पर पेटेंटेड डुअल-पास सफाई, स्वायत्त डॉकिंग और यूटिलिटी-स्केल फिक्स्ड-टिल्ट प्लांटों के लिए फ्लीट कनेक्टिविटी।",
    primaryAlt:
      "Taypro GLYDE TR-150 स्वचालित सफाई रोबोट, रेलों और डुअल-पास सफाई तत्वों का प्लान व्यू",
    primaryCaption:
      "GLYDE TR-150 पेटेंटेड डुअल-पास माइक्रोफाइबर सफाई के साथ मॉड्यूल फ्रेम पर चलता है।",
    mechanismAlt:
      "Taypro GLYDE डुअल-पास घूमता माइक्रोफाइबर सफाई ड्रम, पहिए और वायरलेस एंटीना का क्लोज-अप",
    mechanismCaption:
      "घूमता सेल्फ-क्लीनिंग माइक्रोफाइबर ड्रम, फ्रेम-माउंटेड यात्रा और रिमोट मॉनिटरिंग एंटीना।",
    dockingAlt:
      "स्वायत्त दैनिक चक्रों के लिए एकीकृत सोलर चार्जिंग वाला Taypro GLYDE छाया-मुक्त डॉकिंग स्टेशन",
    dockingCaption:
      "स्व-निहित डॉकिंग सोलर-सहायता चार्जिंग के साथ; प्रति एरे बाहरी बिजली कनेक्शन की आवश्यकता नहीं।",
  },
  ar: {
    eyebrow: "هندسة المنتج",
    title: "نظرة سريعة على عتاد GLYDE",
    subtitle:
      "تنظيف ثنائي المرور ببراءة اختراع على قضبان إطار الوحدة، إرساء ذاتي واتصال أسطول لمحطات الميل الثابت على نطاق المرافق.",
    primaryAlt:
      "روبوت Taypro GLYDE TR-150 للتنظيف التلقائي، منظر علوي يظهر القضبان وعناصر التنظيف ثنائي المرور",
    primaryCaption: "GLYDE TR-150 يتحرك على إطار الوحدة بتنظيف ميكروفايبر ثنائي المرور ببراءة اختراع.",
    mechanismAlt:
      "لقطة مقربة لأسطوانة تنظيف ميكروفايبر دوارة ثنائية المرور من Taypro GLYDE والعجلات والهوائي اللاسلكي",
    mechanismCaption:
      "أسطوانة ميكروفايبر دوارة ذاتية التنظيف، حركة على الإطار وهوائي مراقبة عن بُعد.",
    dockingAlt:
      "محطة إرساء Taypro GLYDE بلا ظل مع شحن شمسي مدمج لدورات يومية ذاتية",
    dockingCaption:
      "إرساء مستقل مع شحن بمساعدة شمسية؛ لا حاجة لاتصال كهرباء خارجي لكل مصفوفة.",
  },
  ja: {
    eyebrow: "製品エンジニアリング",
    title: "GLYDEハードウェア概要",
    subtitle:
      "モジュールフレームレール上の特許デュアルパス清掃、自律ドッキング、大規模固定傾斜向けフリート接続。",
    primaryAlt:
      "Taypro GLYDE TR-150自動清掃ロボット、レールとデュアルパス清掃要素の平面図",
    primaryCaption:
      "GLYDE TR-150は特許デュアルパスマイクロファイバー清掃でモジュールフレーム上を走行。",
    mechanismAlt:
      "Taypro GLYDEデュアルパス回転マイクロファイバー清掃ドラム、車輪、無線アンテナのクローズアップ",
    mechanismCaption:
      "回転自己洗浄マイクロファイバードラム、フレーム走行、遠隔監視アンテナ。",
    dockingAlt:
      "自律日次サイクル向け統合ソーラー充電付きTaypro GLYDE影のないドッキングステーション",
    dockingCaption:
      "ソーラー補助充電の自立ドック；アレイごとに外部電源不要。",
  },
  bn: {
    eyebrow: "পণ্য প্রকৌশল",
    title: "এক নজরে GLYDE হার্ডওয়্যার",
    subtitle:
      "মডিউল-ফ্রেম রেলে পেটেন্টেড ডুয়াল-পাস পরিষ্কার, স্বায়ত্তশাসিত ডকিং ও ইউটিলিটি-স্কেল ফিক্সড-টিল্ট প্ল্যান্টের জন্য ফ্লিট সংযোগ।",
    primaryAlt:
      "Taypro GLYDE TR-150 অটোমেটিক পরিষ্কার রোবট, রেল ও ডুয়াল-পাস পরিষ্কার উপাদানের প্ল্যান ভিউ",
    primaryCaption:
      "GLYDE TR-150 পেটেন্টেড ডুয়াল-পাস মাইক্রোফাইবার পরিষ্কারে মডিউল ফ্রেম বরাবর চলে।",
    mechanismAlt:
      "Taypro GLYDE ডুয়াল-পাস ঘূর্ণায়মান মাইক্রোফাইবার পরিষ্কার ড্রাম, চাকা ও ওয়্যারলেস অ্যান্টেনার ক্লোজ-আপ",
    mechanismCaption:
      "ঘূর্ণায়মান সেল্ফ-ক্লিনিং মাইক্রোফাইবার ড্রাম, ফ্রেম-মাউন্টেড চলাচল ও রিমোট মনিটরিং অ্যান্টেনা।",
    dockingAlt:
      "স্বায়ত্তশাসিত দৈনিক চক্রের জন্য একীভূত সোলার চার্জিং সহ Taypro GLYDE ছায়ামুক্ত ডকিং স্টেশন",
    dockingCaption:
      "স্ব-নির্ভর ডকিং সোলার-সহায়তা চার্জিং সহ; প্রতি অ্যারেতে বাহ্যিক বিদ্যুৎ সংযোগ প্রয়োজন নেই।",
  },
};

const modelAHeroTitle = {
  hi: "GLYDE — फिक्स्ड-टिल्ट प्लांटों के लिए पूर्ण स्वचालित सोलर पैनल सफाई रोबोट",
  ar: "GLYDE — روبوت تنظيف ألواح شمسية أوتوماتيكي بالكامل لمحطات الميل الثابت",
  ja: "GLYDE — 固定傾斜プラント向け完全自動ソーラーパネル清掃ロボット",
  bn: "GLYDE — ফিক্সড-টিল্ট প্ল্যান্টের জন্য সম্পূর্ণ স্বয়ংক্রিয় সোলার প্যানেল পরিষ্কার রোবট",
};

const modelAH1Line1 = {
  hi: "GLYDE — पूर्ण स्वचालित सोलर पैनल सफाई रोबोट, ",
  ar: "GLYDE — روبوت تنظيف ألواح شمسية أوتوماتيكي بالكامل, ",
  ja: "GLYDE — 完全自動ソーラーパネル清掃ロボット, ",
  bn: "GLYDE — সম্পূর্ণ স্বয়ংক্রিয় সোলার প্যানেল পরিষ্কার রোবট, ",
};

const modelAH1Line2 = {
  hi: "फिक्स्ड-टिल्ट प्लांटों के लिए",
  ar: "لمحطات الميل الثابت",
  ja: "固定傾斜プラント向け",
  bn: "ফিক্সড-টিল্ট প্ল্যান্টের জন্য",
};

const modelAProductImageAlt = {
  hi: "समानांतर सफाई रेलों पर Taypro GLYDE स्वचालित सोलर पैनल सफाई रोबोट का ऊपरी दृश्य",
  ar: "منظر علوي لروبوت Taypro GLYDE على قضبان تنظيف متوازية",
  ja: "平行清掃レール上のTaypro GLYDE自動ソーラーパネル清掃ロボットの上面図",
  bn: "সমান্তরাল পরিষ্কার রেলে Taypro GLYDE অটোমেটিক রোবটের উপরের দৃশ্য",
};

const modelADualPassAlt = {
  hi: "घूमते माइक्रोफाइबर ड्रम के साथ Taypro GLYDE डुअल-पास वॉटरलेस सफाई तंत्र",
  ar: "آلية تنظيف Taypro GLYDE ثنائي المرور بدون ماء بأسطوانة ميكروفايبر دوارة",
  ja: "回転マイクロファイバードラム付きTaypro GLYDEデュアルパス無水清掃機構",
  bn: "ঘূর্ণায়মান মাইক্রোফাইবার ড্রাম সহ Taypro GLYDE ডুয়াল-পাস জলবিহীন পরিষ্কার ব্যবস্থা",
};

const modelADockingAlt = {
  hi: "सफाई चक्रों के बीच स्वायत्त रोबोट चार्जिंग के लिए एकीकृत सोलर पैनल वाला Taypro GLYDE डॉकिंग स्टेशन",
  ar: "محطة إرساء Taypro GLYDE مع لوح شمسي مدمج لشحن الروبوت الذاتي بين دورات التنظيف",
  ja: "清掃サイクル間の自律充電用統合ソーラーパネル付きTaypro GLYDEドッキングステーション",
  bn: "পরিষ্কার চক্রের মধ্যে স্বায়ত্তশাসিত রোবট চার্জিংয়ের জন্য একীভূত সোলার প্যানেল সহ Taypro GLYDE ডকিং স্টেশন",
};

const modelAOverviewP2 = {
  ar: {
    p2BeforeStrong: "بشحنة واحدة، ينظف GLYDE حتى ",
    p2Strong: "2.2 كم من طول الجري، حوالي 3,600 وحدة شمسية",
    p2AfterStrong:
      ". يُفضّل جدولة دورات التنظيف خارج ساعات إنتاج الطاقة ويمكن برمجتها عن بُعد عبر NECTYR دون التأثير على توليد المحطة.",
    p3: "كشف الحواف والعوائق المتقدم يتيح لـ GLYDE عبور الألواح بأمان دون خطر السقوط، بينما يعدّل تتبع تموج السطح أداء المحرك صفاً بصف لجودة تنظيف متسقة. مراقبة البطارية في الوقت الفعلي تضمن أن الروبوت يغطي فقط المسافة التي يمكنه إكمالها ويعود بأمان إلى محطة الإرساء. الجسور الخفيفة تمكّن الحركة السلسة من طاولة إلى أخرى عبر الموقع.",
  },
  ja: {
    p2BeforeStrong: "1充電でGLYDEは最大 ",
    p2Strong: "2.2 kmの走行長、約3,600ソーラーモジュール",
    p2AfterStrong:
      " を清掃。清掃サイクルは発電時間外にスケジュールするのが最適で、NECTYRから遠隔プログラム可能、発電への影響ゼロ。",
    p3: "高度なエッジ・障害物検知によりGLYDEは安全にパネルを走行。表面うねり追従で行ごとにモーター性能を調整し清掃品質を維持。リアルタイムバッテリー監視で完了可能な距離のみ走行しドックへ安全復帰。軽量ブリッジでテーブル間を途切れなくカバー。",
  },
  bn: {
    p2BeforeStrong: "এক চার্জে GLYDE সর্বোচ্চ ",
    p2Strong: "2.2 km রানিং দৈর্ঘ্য, প্রায় 3,600 সোলার মডিউল",
    p2AfterStrong:
      " পরিষ্কার করে। পরিষ্কার চক্র উৎপাদন সময়ের বাইরে শিডিউল করা ভালো এবং NECTYR থেকে দূর থেকে প্রোগ্রাম করা যায়, প্ল্যান্ট জেনারেশনে প্রভাব নেই।",
    p3: "উন্নত এজ ও বাধা শনাক্তকরণ GLYDE-কে নিরাপদে প্যানেল পার করতে দেয়; সারি অনুযায়ী মোটর পারফরম্যান্স সমন্বয় করে ধারাবাহিক পরিষ্কার। রিয়েল-টাইম ব্যাটারি মনিটরিং নিরাপদ দূরত্ব নিশ্চিত করে ডকে ফিরে আসা। হালকা ব্রিজ পুরো সাইটে নিরবচ্ছিন্ন কভারেজ দেয়।",
  },
};

const modelACertifications = {
  ar: {
    card0: {
      title: "معتمد من TÜV NORD",
      body: "اختبار واعتماد مستقل لحماية IP55 والتحقق من أداء الرطوبة-الحرارة والجفاف-الحرارة من TÜV NORD.",
    },
    card1: {
      title: "مُختبر لتحمل العواصف الرملية",
      body: "مُتحقق منه تحت دورات تنظيف خارجية محاكاة، بما في ذلك 12 حدث عاصفة رملية سنوياً بتحميل رمل 10 g/m² لكل دورة.",
    },
    card2: {
      title: "تنظيف آمن للألواح",
      body: "يشمل الاختبار تحليل الشقوق الدقيقة وقياسات الانعكاس البصري وتقييم المعاملات الكهربائية والحفاظ على طلاء مضاد للانعكاس (ARC).",
    },
  },
  ja: {
    card0: {
      title: "TÜV NORD認証",
      body: "IP55保護の独立試験・認証、TÜV NORDによる耐湿熱・耐乾熱性能の検証。",
    },
    card1: {
      title: "砂嵐耐久試験済み",
      body: "年12回の砂嵐イベント、1サイクルあたり10 g/m²の砂負荷を含む屋外清掃サイクル模擬で検証。",
    },
    card2: {
      title: "パネル安全清掃",
      body: "マイクロクラック分析、光学反射率、電気パラメータ評価、反射防止コーティング（ARC）保全を試験。",
    },
  },
  bn: {
    card0: {
      title: "TÜV NORD প্রত্যয়িত",
      body: "IP55 সুরক্ষার জন্য স্বাধীন পরীক্ষা ও প্রত্যয়ন; TÜV NORD দ্বারা আর্দ্র-তাপ/শুষ্ক-তাপ পারফরম্যান্স যাচাই।",
    },
    card1: {
      title: "ধূলোঝড় সহনশীলতা পরীক্ষিত",
      body: "বার্ষিক 12 ধূলোঝড়, প্রতি চক্রে 10 g/m² বালি লোডিং সহ অনুকরিত বহিরঙ্গন পরিষ্কার চক্রে যাচাই।",
    },
    card2: {
      title: "প্যানেল-নিরাপদ পরিষ্কার",
      body: "মাইক্রো-ক্র্যাক, অপটিক্যাল রিফ্লেকট্যান্স, বৈদ্যুতিক প্যারামিটার ও ARC (Anti-Reflective Coating) সংরক্ষণ পরীক্ষা।",
    },
  },
};

const modelAModelCards = {
  ar: {
    title: "هل تبحث عن المزيد من الحلول؟",
    cardTitleTemplate: "{label} روبوت تنظيف ألواح شمسية",
  },
  ja: {
    title: "他のソリューションをお探しですか？",
    cardTitleTemplate: "{label} ソーラーパネル清掃ロボット",
  },
  bn: {
    title: "আরও সমাধান খুঁজছেন?",
    cardTitleTemplate: "{label} সোলার প্যানেল পরিষ্কার রোবট",
  },
};

const modelARoiAfterSpan = {
  ar: "، استخدم حاسبة العائد لموقعك.",
  ja: ", サイト用ROI計算機をご利用ください。",
  bn: ", আপনার সাইটের জন্য ROI ক্যালকুলেটর ব্যবহার করুন।",
};

const orionKeywordsExtra = {
  hi: [
    "सोलर PR मॉनिटरिंग",
    "भारत में सोलर O&M एनालिटिक्स",
    "सोलर SCADA एनालिटिक्स",
    "यूटिलिटी स्केल सोलर मॉनिटरिंग",
  ],
  ar: [
    "مراقبة نسبة الأداء للطاقة الشمسية",
    "تحليلات تشغيل وصيانة الطاقة الشمسية في الهند",
    "تحليلات SCADA للطاقة الشمسية",
    "مراقبة الطاقة الشمسية على نطاق المرافق",
  ],
  ja: [
    "太陽光パフォーマンス比監視",
    "インド太陽光O&M分析",
    "太陽光SCADA分析",
    "大規模太陽光監視",
  ],
  bn: [
    "সোলার পারফরম্যান্স রেশিও মনিটরিং",
    "ভারতে সোলার O&M অ্যানালিটিক্স",
    "সোলার SCADA অ্যানালিটিক্স",
    "ইউটিলিটি স্কেল সোলার মনিটরিং",
  ],
};

const nyumaXH1Line1 = {
  hi: "सिंगल-एक्सिस ट्रैकर्स के लिए सोलर पैनल सफाई रोबोट, ",
  ar: "روبوت تنظيف الألواح الشمسية لأجهزة التتبع أحادية المحور, ",
  ja: "単軸トラッカー用ソーラーパネル清掃ロボット, ",
  bn: "একক-অক্ষ ট্র্যাকারদের জন্য সোলার প্যানেল পরিষ্কারের রোবট, ",
};

const nyumaXMetaTitles = {
  hi: {
    openGraphTitle: "PBT ट्रैकर सोलर पैनल सफाई रोबोट, Taypro NYUMA-X",
    twitterTitle: "PBT ट्रैकर सोलर पैनल सफाई रोबोट, Taypro NYUMA-X",
  },
  ar: {
    openGraphTitle: "روبوت تنظيف ألواح PBT لأجهزة التتبع أحادية المحور, Taypro NYUMA-X",
    twitterTitle: "روبوت تنظيف ألواح PBT لأجهزة التتبع أحادية المحور, Taypro NYUMA-X",
  },
  ja: {
    openGraphTitle: "PBTトラッカー用ソーラーパネル清掃ロボット, Taypro NYUMA-X",
    twitterTitle: "PBTトラッカー用ソーラーパネル清掃ロボット, Taypro NYUMA-X",
  },
  bn: {
    openGraphTitle: "PBT ট্র্যাকার সোলার প্যানেল পরিষ্কারের রোবট, Taypro NYUMA-X",
    twitterTitle: "PBT ট্র্যাকার সোলার প্যানেল পরিষ্কারের রোবট, Taypro NYUMA-X",
  },
};

const nyumaXRoiBand = {
  hi: {
    title: "ट्रैकर सफाई रोबोट लागत और ROI",
    bodyBeforeSpan: "अपनी साइट के लिए ",
    bodySpan: "सिंगल-एक्सिस ट्रैकर सोलर पैनल सफाई",
    bodyAfterSpan: " अर्थशास्त्र, NYUMA-X कोटेशन से पहले कैलकुलेटर चलाएं।",
  },
  ar: {
    title: "تكلفة وعائد روبوت تنظيف المتتبع",
    bodyBeforeSpan: "اقتصاديات ",
    bodySpan: "تنظيف ألواح المتتبع أحادي المحور",
    bodyAfterSpan: " لموقعك, استخدم الحاسبة قبل عرض سعر NYUMA-X.",
  },
  ja: {
    title: "トラッカー清掃ロボットのコストとROI",
    bodyBeforeSpan: "サイトの",
    bodySpan: "単軸トラッカーソーラーパネル清掃",
    bodyAfterSpan: "の経済性, NYUMA-X見積もり前に計算機で試算してください。",
  },
  bn: {
    title: "ট্র্যাকার পরিষ্কার রোবট খরচ ও ROI",
    bodyBeforeSpan: "আপনার সাইটের ",
    bodySpan: "একক-অক্ষ ট্র্যাকার সোলার প্যানেল পরিষ্কার",
    bodyAfterSpan: " অর্থনীতি, NYUMA-X কোটেশনের আগে ক্যালকুলেটর চালান।",
  },
};

function patchModelA(loc) {
  const path = join(root, `messages/pages/${loc}/model-a.json`);
  const data = JSON.parse(readFileSync(path, "utf8"));
  const page = data.ModelAPage;

  page.hero.title = modelAHeroTitle[loc];
  page.hero.h1Line1 = modelAH1Line1[loc];
  page.hero.h1Line2 = modelAH1Line2[loc];
  page.overview.productImageAlt = modelAProductImageAlt[loc];
  Object.assign(page.gallery, modelAGallery[loc]);
  page.howToSection.dualPassStepImageAlt = modelADualPassAlt[loc];
  page.installSection.dockingImageAlt = modelADockingAlt[loc];

  if (modelAOverviewP2[loc]) {
    Object.assign(page.overview, modelAOverviewP2[loc]);
  }
  if (modelACertifications[loc]) {
    for (const [card, vals] of Object.entries(modelACertifications[loc])) {
      Object.assign(page.certifications.cards[card], vals);
    }
  }
  if (modelAModelCards[loc]) {
    Object.assign(page.modelCards, modelAModelCards[loc]);
  }
  if (modelARoiAfterSpan[loc]) {
    page.roiBand.bodyAfterSpan = modelARoiAfterSpan[loc];
  }

  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function patchOrion(loc) {
  const path = join(root, `messages/pages/${loc}/orion.json`);
  const data = JSON.parse(readFileSync(path, "utf8"));
  data.OrionPage.meta.keywords.push(...orionKeywordsExtra[loc]);
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function patchNyumaX(loc) {
  const path = join(root, `messages/pages/${loc}/nyuma-x.json`);
  const data = JSON.parse(readFileSync(path, "utf8"));
  const page = data.NyumaXPage;

  page.hero.h1Line1 = nyumaXH1Line1[loc];
  Object.assign(page.meta, nyumaXMetaTitles[loc]);
  Object.assign(page.roiBand, nyumaXRoiBand[loc]);
  if (loc === "ja") {
    page.misc.callbackLine1 = "単軸トラッカー向けオンラインデモを予約";
  }

  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function patchEnNyumaX() {
  const path = join(root, "messages/pages/en/nyuma-x.json");
  const data = JSON.parse(readFileSync(path, "utf8"));
  data.NyumaXPage.hero.h1Line1 =
    "NYUMA-X — Solar Panel Cleaning Robot for Single-Axis Trackers, ";
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

for (const loc of locales) {
  patchModelA(loc);
  patchOrion(loc);
  patchNyumaX(loc);
  console.log("patched", loc);
}
patchEnNyumaX();
console.log("patched en nyuma-x h1Line1");
