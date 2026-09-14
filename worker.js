// ============================================
// Poppy Playtime Comments API - Cloudflare Worker
// ============================================

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-User-Id",
  "Access-Control-Max-Age": "86400",
};

// ============================================
// فیلتر محلی فحش (فارسی + انگلیسی + لاتین)
// ============================================
const BAD_WORDS_FA = [
  "کص", "کسکش", "کصکش", "کیر", "کیری", "کیرم", "کون", "کونی", "کونکش",
  "جنده", "جنده‌زاده", "حرومی", "حرومزاده", "مادرجنده", "مادرقحبه",
  "قحبه", "قحبا", "فاحشه", "روسپی", "لاشی", "لاشخور",
  "خارکصه", "خارکسده", "خارکسه", "خارکصده",
  "گاییدم", "گایید", "گاییدن", "گاییدنی",
  "سگمادر", "سگ‌مادر", "سگ مادر", "سگ‌زاده", "سگزاده",
  "پدرسگ", "پدر سگ", "پدر‌سگ", "مادرسگ", "مادر سگ",
  "دیوث", "دیوس", "بی‌ناموس", "بی ناموس", "بیناموس",
  "بی‌شرف", "بی شرف", "بیشرف", "بی‌غیرت", "بی غیرت",
  "نناموس", "ناموست", "ناموس‌فروش",
  "آشغال", "اشغال", "چرت", "چرتوپرت",
  "کثافت", "کثافط", "کثیف", "کثیفه",
  "عن", "عنه", "عنه‌تر", "عوضی",
  "مزخرف", "مزخرفات", "چخ", "چخی",
  "خفه شو", "خفه‌شو", "خفهشو",
  "بیشعور", "بی شعور", "بیشعور",
  "احمق", "احمقی", "احمقا", "نفهم", "نفهمی",
  "کمه‌عقل", "کمه عقل", "کم‌عقل",
  "پفیوز", "پفوز", "پفیوزی",
  "دلقک", "دلقکی",
  "جاکش", "جا‌کش", "جاکشی",
  "پاچال", "پاچالی",
  "شاش", "شاشو", "شاشیدم",
  "گه", "گهی", "گه‌خور", "گه‌خور",
  "توحال", "تو‌حال", "تو حال",
];

const BAD_WORDS_EN = [
  "fuck", "fucking", "fucker", "fucked", "fucks", "fuk", "fuking",
  "shit", "shits", "shitty", "shitting",
  "bitch", "bitches", "bitchy",
  "ass", "asses", "asshole", "assholes",
  "damn", "dammit", "damned",
  "cunt", "cunts",
  "dick", "dicks", "dickhead",
  "pussy", "pussies",
  "cock", "cocks", "cocksucker",
  "bastard", "bastards",
  "whore", "whores",
  "slut", "sluts", "slutty",
  "nigger", "nigga", "niggas",
  "faggot", "fag", "fags",
  "retard", "retarded",
  "motherfucker", "motherfucking",
  "sonofabitch", "son of a bitch",
  "bullshit", "bullshits",
  "piss", "pissed", "pissing",
  "crap", "crappy",
  "wtf", "stfu", "gtfo",
];

const BAD_WORDS_LATIN = [
  "kos", "koskesh", "kirkes", "kir", "kiri", "kirim", "koon", "koni", "koonkesh",
  "jende", "jendeye", "jendehzade", "haroomi", "haroomzade",
  "madarjende", "madarghahbe", "ghahbe", "ghahba",
  "fahsha", "rospi", "lashi", "lashkhor",
  "kharkose", "kharkosde", "kharkose",
  "gayidam", "gayid", "gayidan",
  "sagemadar", "sagezade", "pedarsag", "madarsag",
  "dayoos", "dayyus", "binamoos", "binamous",
  "bisharaf", "bisherfet", "bighairat",
  "ashghal", "osghol",
  "kasafat", "kasif", "kasi",
  "mazkharf", "chakh", "chakhi",
  "khefesho", "khefe sho",
  "bishooor", "bishoor",
  "ahmagh", "ahmaghi", "nafahm",
  "kamaghl", "kam aghl",
  "pafyuz", "pafyuzi",
  "dalghak", "dalghaki",
  "jakosh", "jakoshi",
  "pachal", "pachali",
  "shash", "shasho", "shashidam",
  "goh", "gohi", "gohkhor",
  "tohal", "to hal",
  "jakesh", "jakeshi",
];

function normalizeText(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[\u200c\u200d\u200e\u200f]/g, "") // حذف ZWNJ و جهت‌نماها
    .replace(/[ًٌٍَُِّْ]/g, "") // حذف اعراب
    .replace(/[يى]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/[أإآا]/g, "ا")
    .replace(/[ؤو]/g, "و")
    .replace(/[ةه]/g, "ه")
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/@/g, "a")
    .replace(/\$/g, "s")
    .replace(/[.\-_*]+/g, "") // حذف نقطه و خط تیره و ستاره بین حروف
    .replace(/\s+/g, " ")
    .trim();
}

function containsBadWordLocal(text) {
  if (!text) return false;
  const normalized = normalizeText(text);

  // چک فحش‌های فارسی
  for (const word of BAD_WORDS_FA) {
    const w = normalizeText(word);
    if (w && normalized.includes(w)) return true;
  }
  // چک فحش‌های انگلیسی
  for (const word of BAD_WORDS_EN) {
    if (normalized.includes(word)) return true;
  }
  // چک فحش‌های لاتین‌نویسی فارسی
  for (const word of BAD_WORDS_LATIN) {
    if (normalized.includes(word)) return true;
  }
  return false;
}

// ============================================
// فیلتر AI (مدل جدید)
// ============================================
async function checkWithAI(env, text) {
  try {
    const response = await env.AI.run(
      "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      {
        messages: [
          {
            role: "system",
            content:
              "You are a content moderation assistant. Your job is to detect inappropriate, offensive, vulgar, insulting, or harmful language in user comments. This includes Persian (Farsi), English, and romanized Persian. Reply ONLY with 'BAD' if the text contains any inappropriate content, or 'OK' if it is clean. Do not explain. Do not add punctuation.",
          },
          {
            role: "user",
            content: `Check this comment: "${text}"`,
          },
        ],
        max_tokens: 10,
        temperature: 0.1,
      }
    );

    const result = (response?.response || "").toString().trim().toUpperCase();
    console.log("AI result:", result);
    // اگر AI گفت BAD، رد کن
    return result.includes("BAD");
  } catch (err) {
    console.error("AI error:", err);
    // در صورت خطا، پیام رو قبول کن (fail-open)
    return false;
  }
}

// ============================================
// هندلر اصلی
// ============================================
export default {
  async fetch(request, env, ctx) {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // ========== GET /comments ==========
      if (request.method === "GET" && path === "/comments") {
        const { results } = await env.DB.prepare(
          "SELECT id, user_id, name, text, created_at, updated_at, edit_count FROM comments ORDER BY created_at DESC"
        ).all();
        return json({ success: true, comments: results || [] });
      }

      // ========== POST /comments ==========
      if (request.method === "POST" && path === "/comments") {
        const body = await request.json();
        const { user_id, name, text } = body || {};

        if (!user_id || !name || !text) {
          return json({ success: false, error: "missing_fields" }, 400);
        }

        const cleanName = String(name).trim().slice(0, 40);
        const cleanText = String(text).trim().slice(0, 1000);

        if (cleanName.length < 2) {
          return json({ success: false, error: "name_too_short" }, 400);
        }
        if (cleanText.length < 2) {
          return json({ success: false, error: "text_too_short" }, 400);
        }

        // فیلتر محلی
        if (containsBadWordLocal(cleanName) || containsBadWordLocal(cleanText)) {
          return json({ success: false, error: "bad_word_local" }, 400);
        }

        // فیلتر AI
        const aiBad = await checkWithAI(env, `${cleanName} ${cleanText}`);
        if (aiBad) {
          return json({ success: false, error: "bad_word_ai" }, 400);
        }

        // چک کن کاربر قبلاً نظر داده
        const existing = await env.DB.prepare(
          "SELECT id FROM comments WHERE user_id = ?"
        )
          .bind(user_id)
          .first();

        if (existing) {
          return json({ success: false, error: "already_commented" }, 400);
        }

        const now = Date.now();
        const result = await env.DB.prepare(
          "INSERT INTO comments (user_id, name, text, created_at, updated_at, edit_count) VALUES (?, ?, ?, ?, ?, 0)"
        )
          .bind(user_id, cleanName, cleanText, now, now)
          .run();

        return json({
          success: true,
          comment: {
            id: result.meta.last_row_id,
            user_id,
            name: cleanName,
            text: cleanText,
            created_at: now,
            updated_at: now,
            edit_count: 0,
          },
        });
      }

      // ========== PUT /comments/:id ==========
      if (request.method === "PUT" && path.startsWith("/comments/")) {
        const id = path.split("/")[2];
        const body = await request.json();
        const { user_id, text } = body || {};

        if (!id || !user_id || !text) {
          return json({ success: false, error: "missing_fields" }, 400);
        }

        const cleanText = String(text).trim().slice(0, 1000);
        if (cleanText.length < 2) {
          return json({ success: false, error: "text_too_short" }, 400);
        }

        // چک وجود و مالکیت
        const comment = await env.DB.prepare(
          "SELECT user_id, edit_count FROM comments WHERE id = ?"
        )
          .bind(id)
          .first();

        if (!comment) {
          return json({ success: false, error: "not_found" }, 404);
        }
        if (comment.user_id !== user_id) {
          return json({ success: false, error: "not_owner" }, 403);
        }
        if (comment.edit_count >= 3) {
          return json({ success: false, error: "edit_limit" }, 400);
        }

        // فیلتر محلی
        if (containsBadWordLocal(cleanText)) {
          return json({ success: false, error: "bad_word_local" }, 400);
        }

        // فیلتر AI
        const aiBad = await checkWithAI(env, cleanText);
        if (aiBad) {
          return json({ success: false, error: "bad_word_ai" }, 400);
        }

        const now = Date.now();
        await env.DB.prepare(
          "UPDATE comments SET text = ?, updated_at = ?, edit_count = edit_count + 1 WHERE id = ?"
        )
          .bind(cleanText, now, id)
          .run();

        return json({ success: true, updated_at: now });
      }

      // ========== DELETE /comments/:id ==========
      if (request.method === "DELETE" && path.startsWith("/comments/")) {
        const id = path.split("/")[2];
        const userId = request.headers.get("X-User-Id");

        if (!id || !userId) {
          return json({ success: false, error: "missing_fields" }, 400);
        }

        const comment = await env.DB.prepare(
          "SELECT user_id FROM comments WHERE id = ?"
        )
          .bind(id)
          .first();

        if (!comment) {
          return json({ success: false, error: "not_found" }, 404);
        }
        if (comment.user_id !== userId) {
          return json({ success: false, error: "not_owner" }, 403);
        }

        await env.DB.prepare("DELETE FROM comments WHERE id = ?")
          .bind(id)
          .run();

        return json({ success: true });
      }

      // ========== Health check ==========
      if (path === "/" || path === "/health") {
        return json({ success: true, message: "Poppy Comments API is alive 🎀" });
      }

      return json({ success: false, error: "not_found" }, 404);
    } catch (err) {
      console.error("Worker error:", err);
      return json({ success: false, error: "server_error", detail: String(err) }, 500);
    }
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
    },
  });
}
