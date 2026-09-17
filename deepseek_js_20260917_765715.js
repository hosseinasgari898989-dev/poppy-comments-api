export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token'
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    // ============================================
    // STRONG WORDS — substring match (کلمات بلند و بی‌ابهام)
    // ============================================
    const STRONG_FA = [
      'کیر','کیرم','کیرت','کیرتو','کیرده','کیرخور','کیرخوار','کیرکلفت','کیرکش','کیرکشی',
      'کصخل','کصکش','کصخور','کصخوار','کصلیس','کصمادر','کصده',
      'کونده','کونکش','کونخور','کونخوار','کونلیس',
      'جنده','جنده‌زاده','مادرجنده','مادرقحبه','خواهرجنده',
      'گاییدم','گایید','گاییدن','گاییدی','گاییدنت','گاییدنی','گاینده',
      'خارکصه','خارکصده','خارکسده','خارکیر',
      'حرومزاده','حرومی','حرومزادگی',
      'مادرکصه','مادرکیر','مادرکونی','مادرسگ','مادرخوک',
      'پدرسگ','پدرکصه','پدرخوک',
      'خواهرکصه','خواهرسگ','خواهرخوک',
      'فاحشه','قحبه','قرمساق','دیوث',
      'بی‌غیرت','بیناموس','بی‌شرف','بی‌آبرو',
      'کونی‌بازی','کوندهی',
      'کص','گوه'
    ];

    const STRONG_EN = [
      'fuck','shit','bitch','asshole','bastard','cunt','dick','pussy',
      'whore','slut','nigger','nigga','faggot','motherfuck','cocksuck',
      'dickhead','asshat','dumbass','bullshit','rape','rapist','pedophil',
      'porn','masturbat','blowjob','handjob','dildo','cumming'
    ];

    const STRONG_LATIN = [
      'koskesh','koonkesh','madarjende','gohkhord','gohkhor',
      'gayidam','gayidan','haroomzade','harumzade','madarghahbe',
      'kirkoloft','bisharaf','jende','kirr','kirim','kirto'
    ];

    // ============================================
    // WEAK WORDS — exact word match
    // ============================================
    const WEAK_FA = [
      'کس','گه','خر','سگ','گاو','خوک','الاغ','میمون',
      'کون','کونی','زنا','زنازاده','زناکار',
      'احمق','احمقی','ابله','ابلهی','نادان','نادانی',
      'نفهم','نفهمی','کودن','خرفت','خرفتی',
      'کثافت','کثافتی','کثیف','کثیفی',
      'بیشعور','بیشعوری','پفیوز','پفیوزی',
      'جاکش','جاکشی','شلخته','پررو','کله‌خر','کله خر',
      'مزخرف','مزخرفات','چرت','چرتی','چرتوپرت',
      'دروغگو','خائن','خیانتکار',
      'لعنتی','زهرمار','خفه',
      'عوضی','رذل','رذالت','پست‌فطرت',
      'لخت','هوس','شاش','گوز','شهوانی','شهوت',
      'ریدم','ریدی','ریدن'
    ];

    const WEAK_EN = [
      'ass','damn','crap','cum','fag','fuk','fuq','wtf','stfu','gtfo',
      'sex','nude','naked','cock','boob','tits','piss',
      'idiot','stupid','moron','loser','fool','dumb','jerk','scumbag',
      'douchebag','prick','twat','wanker','tosser'
    ];

    const WEAK_LATIN = [
      'kos','kir','kon','koon','koni','goh','gooz','haroom','harum',
      'madar','pedar','sag','khahar','gaid','gai','gayid','fahsha',
      'jnd','jnde','gnde'
    ];

    // ============================================
    // نرمال‌سازی متن
    // ============================================
    function normalizeText(t) {
      let s = t.toString().toLowerCase();
      s = s.replace(/[^\w\s\u0600-\u06FF]/g, ' ');
      s = s.replace(/[يى]/g, 'ی').replace(/[ك]/g, 'ک');
      s = s.replace(/[آأإٱ]/g, 'ا').replace(/[ۀهة]/g, 'ه');
      s = s.replace(/[ؤو]/g, 'و').replace(/[ئ]/g, 'ی');
      s = s.replace(/[\u064B-\u065F\u0670]/g, '');
      s = s.replace(/[\u200c\u200d\u200e\u200f\u061c]/g, '');
      s = s.replace(/[\.\,\!\?\:\;\-\_\*\#\@\+\=\/\\\(\)\[\]\{\}\<\>\|\~\`\'\"\،\؛\؟]/g, ' ');
      s = s.replace(/(.)\1{3,}/g, '$1$1');
      s = s.replace(/\s+/g, ' ').trim();
      return s;
    }

    // ============================================
    // فیلتر محلی
    // ============================================
    function containsBadWordLocal(text) {
      if (!text) return false;
      const original = text.toString().toLowerCase();
      const normalized = normalizeText(text);
      const words = normalized.split(/\s+/).filter(w => w.length > 0);

      for (const w of STRONG_FA.concat(STRONG_EN).concat(STRONG_LATIN)) {
        if (original.includes(w) || normalized.includes(w)) return true;
      }

      for (const w of WEAK_FA.concat(WEAK_EN).concat(WEAK_LATIN)) {
        if (words.includes(w)) return true;
      }

      const patterns = [
        /ک[\s\.\-\_\*]{0,3}ی[\s\.\-\_\*]{0,3}ر/,
        /ک[\s\.\-\_\*]{0,3}و[\s\.\-\_\*]{0,3}ن[\s\.\-\_\*]{0,3}ی/,
        /ج[\s\.\-\_\*]{0,3}ن[\s\.\-\_\*]{0,3}د[\s\.\-\_\*]{0,3}ه/,
        /ح[\s\.\-\_\*]{0,3}ر[\s\.\-\_\*]{0,3}و[\s\.\-\_\*]{0,3}م/,
        /گ[\s\.\-\_\*]{0,2}ا[\s\.\-\_\*]{0,2}ی[\s\.\-\_\*]{0,2}ی/,
        /ک[\s\.\-\_\*]{0,2}ص[\s\.\-\_\*]{0,2}ک[\s\.\-\_\*]{0,2}ش/
      ];
      for (const p of patterns) { if (p.test(original)) return true; }

      const cleanedLatin = original
        .replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e')
        .replace(/4/g, 'a').replace(/5/g, 's').replace(/7/g, 't')
        .replace(/@/g, 'a').replace(/\$/g, 's').replace(/!/g, 'i');
      for (const w of STRONG_LATIN) {
        if (w.length >= 4 && cleanedLatin.includes(w)) return true;
      }

      if (/(.)\1{7,}/.test(original)) return true;
      if (/[a-zA-Z]{30,}/.test(original)) return true;
      if (/[\u0600-\u06FF]{60,}/.test(original)) return true;

      return false;
    }

    // ============================================
    // AI — چک فحش
    // ============================================
    async function checkWithAI(text) {
      try {
        const r = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
          messages: [
            {
              role: 'system',
              content: 'You are a strict multilingual profanity detector. Detect insults, vulgar language, sexual content, hate speech, or harassment in Persian (Farsi), English, or romanized Persian. Reply with ONLY one word: "OK" if the text is clean, or "BAD" if it contains any inappropriate content. No explanations, no punctuation.'
            },
            {
              role: 'user',
              content: `Check this comment: "${text}"`
            }
          ],
          max_tokens: 5,
          temperature: 0.1
        });
        const ans = (r.response || '').toString().toUpperCase().trim();
        return !ans.includes('BAD');
      } catch (e) {
        return true;
      }
    }

    async function checkName(name) {
      if (containsBadWordLocal(name)) return { valid: false, reason: 'local' };
      return { valid: true };
    }

    async function checkComment(comment) {
      if (containsBadWordLocal(comment)) return { valid: false, reason: 'local' };
      const aiOK = await checkWithAI(comment);
      if (!aiOK) return { valid: false, reason: 'ai' };
      return { valid: true };
    }

    // ============================================
    // ADMIN helper
    // ============================================
    function isAdmin(request) {
      const token = request.headers.get('X-Admin-Token');
      return !!(token && env.ADMIN_TOKEN && token === env.ADMIN_TOKEN);
    }

    function adminUnauthorized() {
      return Response.json({ success: false, error: 'دسترسی ندارید' }, { status: 401, headers: cors });
    }

    // ============================================
    // ADMIN ROUTES
    // ============================================

    // ---- POST /api/admin/login ----
    if (url.pathname === '/api/admin/login' && request.method === 'POST') {
      try {
        const { token } = await request.json();
        if (!token || !env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
          return Response.json({ success: false, error: 'توکن نامعتبر' }, { status: 401, headers: cors });
        }
        return Response.json({ success: true }, { headers: cors });
      } catch (e) {
        return Response.json({ success: false, error: 'خطا' }, { status: 500, headers: cors });
      }
    }

    // ---- همه‌ی /api/admin/* نیاز به توکن ----
    if (url.pathname.startsWith('/api/admin/')) {
      if (!isAdmin(request)) return adminUnauthorized();

      // ---- GET /api/admin/comments ----
      if (url.pathname === '/api/admin/comments' && request.method === 'GET') {
        try {
          const limitParam = parseInt(url.searchParams.get('limit') || '200', 10);
          const limit = Math.min(Math.max(1, limitParam), 500);

          const { results } = await env.DB.prepare(`
            SELECT c.id, c.name, c.comment, c.user_id, c.created_at, c.updated_at,
                   c.admin_reply, c.admin_reply_at,
                   CASE WHEN b.id IS NOT NULL THEN 1 ELSE 0 END AS is_banned
            FROM comments c
            LEFT JOIN bans b ON b.user_id = c.user_id
              AND (b.is_permanent = 1 OR b.banned_until > datetime('now'))
            ORDER BY c.created_at DESC
            LIMIT ?
          `).bind(limit).all();

          const comments = results.map(r => ({
            id: r.id,
            name: r.name,
            comment: r.comment,
            user_id: r.user_id,
            created_at: r.created_at,
            updated_at: r.updated_at,
            admin_reply: r.admin_reply,
            admin_reply_at: r.admin_reply_at,
            is_banned: r.is_banned === 1
          }));

          const totalRow = await env.DB.prepare('SELECT COUNT(*) AS cnt FROM comments').first();

          return Response.json({ success: true, comments, total: totalRow.cnt || 0 }, { headers: cors });
        } catch (e) {
          console.error('admin/comments error:', e.message);
          return Response.json({ success: false, error: 'خطا' }, { status: 500, headers: cors });
        }
      }

      // ---- GET /api/admin/bans ----
      if (url.pathname === '/api/admin/bans' && request.method === 'GET') {
        try {
          const { results } = await env.DB.prepare(`
            SELECT * FROM bans
            WHERE is_permanent = 1 OR banned_until > datetime('now')
            ORDER BY banned_at DESC
          `).all();
          return Response.json({ success: true, bans: results }, { headers: cors });
        } catch (e) {
          return Response.json({ success: false, error: 'خطا' }, { status: 500, headers: cors });
        }
      }

      // ---- POST /api/admin/ban ----
      if (url.pathname === '/api/admin/ban' && request.method === 'POST') {
        try {
          const { userId, duration, reason } = await request.json();
          if (!userId || !duration) {
            return Response.json({ success: false, error: 'فیلدها الزامی است' }, { status: 400, headers: cors });
          }

          let isPermanent = 0;
          let bannedUntil = null;

          if (duration === 'permanent') {
            isPermanent = 1;
          } else {
            const hoursMap = { '1h': 1, '1d': 24, '7d': 168, '30d': 720 };
            const hours = hoursMap[duration];
            if (!hours) {
              return Response.json({ success: false, error: 'مدت نامعتبر' }, { status: 400, headers: cors });
            }
            const d = new Date(Date.now() + hours * 3600 * 1000);
            bannedUntil = d.toISOString().replace('T', ' ').slice(0, 19);
          }

          await env.DB.prepare(`
            INSERT INTO bans (user_id, reason, banned_at, banned_until, is_permanent)
            VALUES (?, ?, datetime('now'), ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
              reason = excluded.reason,
              banned_at = datetime('now'),
              banned_until = excluded.banned_until,
              is_permanent = excluded.is_permanent
          `).bind(userId, reason || '', bannedUntil, isPermanent).run();

          return Response.json({ success: true }, { headers: cors });
        } catch (e) {
          console.error('admin/ban error:', e.message);
          return Response.json({ success: false, error: 'خطا' }, { status: 500, headers: cors });
        }
      }

      // ---- DELETE /api/admin/ban/:userId ----
      if (url.pathname.startsWith('/api/admin/ban/') && request.method === 'DELETE') {
        try {
          const userId = decodeURIComponent(url.pathname.split('/').pop());
          await env.DB.prepare('DELETE FROM bans WHERE user_id = ?').bind(userId).run();
          return Response.json({ success: true }, { headers: cors });
        } catch (e) {
          return Response.json({ success: false, error: 'خطا' }, { status: 500, headers: cors });
        }
      }

      // ---- POST /api/admin/reply/:id ----
      if (url.pathname.startsWith('/api/admin/reply/') && request.method === 'POST') {
        try {
          const id = url.pathname.split('/').pop();
          const { reply } = await request.json();

          if (!reply || !reply.trim()) {
            await env.DB.prepare(
              "UPDATE comments SET admin_reply = NULL, admin_reply_at = NULL WHERE id = ?"
            ).bind(id).run();
          } else {
            if (reply.length > 1000) {
              return Response.json({ success: false, error: 'طول پاسخ زیاد است' }, { status: 400, headers: cors });
            }
            await env.DB.prepare(
              "UPDATE comments SET admin_reply = ?, admin_reply_at = datetime('now') WHERE id = ?"
            ).bind(reply.trim(), id).run();
          }

          return Response.json({ success: true }, { headers: cors });
        } catch (e) {
          console.error('admin/reply error:', e.message);
          return Response.json({ success: false, error: 'خطا' }, { status: 500, headers: cors });
        }
      }

      // ---- DELETE /api/admin/comments/:id ----
      if (url.pathname.startsWith('/api/admin/comments/') && request.method === 'DELETE') {
        try {
          const id = url.pathname.split('/').pop();
          await env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(id).run();
          return Response.json({ success: true }, { headers: cors });
        } catch (e) {
          return Response.json({ success: false, error: 'خطا' }, { status: 500, headers: cors });
        }
      }

      return Response.json({ success: false, error: 'Route not found' }, { status: 404, headers: cors });
    }

    // ============================================
    // USER ROUTES
    // ============================================

    // ---- GET /api/comments ----
    if (url.pathname === '/api/comments' && request.method === 'GET') {
      try {
        const { results } = await env.DB.prepare(
          'SELECT id, name, comment, created_at, admin_reply, admin_reply_at FROM comments ORDER BY created_at DESC LIMIT 100'
        ).all();
        return Response.json({ success: true, comments: results }, { headers: cors });
      } catch (e) {
        return Response.json({ success: false, error: 'خطا' }, { status: 500, headers: cors });
      }
    }

    // ---- POST /api/comments ----
    if (url.pathname === '/api/comments' && request.method === 'POST') {
      try {
        const { name, comment, userId } = await request.json();
        if (!name || !comment || !userId) {
          return Response.json({ success: false, error: 'فیلدها الزامی است' }, { status: 400, headers: cors });
        }
        if (name.length > 50 || comment.length > 500) {
          return Response.json({ success: false, error: 'طول متن زیاد است' }, { status: 400, headers: cors });
        }

        // چک بن کاربر
        const ban = await env.DB.prepare(
          "SELECT * FROM bans WHERE user_id = ? AND (is_permanent = 1 OR banned_until > datetime('now'))"
        ).bind(userId).first();

        if (ban) {
          const until = ban.is_permanent ? 'همیشه' : ban.banned_until;
          return Response.json({
            success: false,
            error: '🚫 شما از ثبت نظر محروم شده‌اید. پایان: ' + until,
            banned: true
          }, { status: 403, headers: cors });
        }

        const nc = await checkName(name);
        if (!nc.valid) {
          return Response.json({ success: false, error: '❌ نام وارد شده مناسب نیست. لطفاً نام مناسب وارد کنید.' }, { status: 400, headers: cors });
        }

        const cc = await checkComment(comment);
        if (!cc.valid) {
          return Response.json({ success: false, error: '❌ پیام شما نباید دارای فحش یا توهین باشد.' }, { status: 400, headers: cors });
        }

        const existing = await env.DB.prepare('SELECT id FROM comments WHERE user_id = ?').bind(userId).first();
        if (existing) {
          return Response.json({ success: false, error: 'شما قبلاً نظر ثبت کرده‌اید.' }, { status: 403, headers: cors });
        }

        await env.DB.prepare('INSERT INTO comments (name, comment, user_id) VALUES (?, ?, ?)').bind(name, comment, userId).run();
        return Response.json({ success: true, message: 'ثبت شد' }, { status: 201, headers: cors });
      } catch (e) {
        return Response.json({ success: false, error: 'خطا در ثبت' }, { status: 500, headers: cors });
      }
    }

    // ---- PUT /api/comments/:id ----
    if (url.pathname.startsWith('/api/comments/') && request.method === 'PUT') {
      try {
        const id = url.pathname.split('/').pop();
        const { comment, userId } = await request.json();
        if (!comment || !userId) {
          return Response.json({ success: false, error: 'فیلدها الزامی' }, { status: 400, headers: cors });
        }

        const check = await checkComment(comment);
        if (!check.valid) {
          return Response.json({ success: false, error: '❌ پیام شما نباید دارای فحش یا توهین باشد.' }, { status: 400, headers: cors });
        }

        const ex = await env.DB.prepare('SELECT user_id FROM comments WHERE id = ?').bind(id).first();
        if (!ex || ex.user_id !== userId) {
          return Response.json({ success: false, error: 'دسترسی ندارید' }, { status: 403, headers: cors });
        }

        await env.DB.prepare("UPDATE comments SET comment = ?, updated_at = datetime('now') WHERE id = ?").bind(comment, id).run();
        return Response.json({ success: true }, { headers: cors });
      } catch (e) {
        return Response.json({ success: false, error: 'خطا' }, { status: 500, headers: cors });
      }
    }

    // ---- DELETE /api/comments/:id ----
    if (url.pathname.startsWith('/api/comments/') && request.method === 'DELETE') {
      try {
        const id = url.pathname.split('/').pop();
        const { userId } = await request.json();
        const ex = await env.DB.prepare('SELECT user_id FROM comments WHERE id = ?').bind(id).first();
        if (!ex || ex.user_id !== userId) {
          return Response.json({ success: false, error: 'دسترسی ندارید' }, { status: 403, headers: cors });
        }
        await env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(id).run();
        return Response.json({ success: true }, { headers: cors });
      } catch (e) {
        return Response.json({ success: false, error: 'خطا' }, { status: 500, headers: cors });
      }
    }

    // ---- GET /api/comments/check/:userId ----
    if (url.pathname.startsWith('/api/comments/check/') && request.method === 'GET') {
      try {
        const userId = url.pathname.split('/').pop();

        const ex = await env.DB.prepare(
          'SELECT id, comment, name, admin_reply, admin_reply_at FROM comments WHERE user_id = ?'
        ).bind(userId).first();

        const ban = await env.DB.prepare(
          "SELECT * FROM bans WHERE user_id = ? AND (is_permanent = 1 OR banned_until > datetime('now'))"
        ).bind(userId).first();

        return Response.json({
          success: true,
          hasComment: !!ex,
          comment: ex || null,
          banned: !!ban,
          banInfo: ban
            ? { until: ban.is_permanent ? 'همیشه' : ban.banned_until, reason: ban.reason }
            : null
        }, { headers: cors });
      } catch (e) {
        return Response.json({ success: false, error: 'خطا' }, { status: 500, headers: cors });
      }
    }

    return Response.json({ success: true, message: 'API is running' }, { headers: cors });
  }
};