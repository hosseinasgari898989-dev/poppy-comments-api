export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    // ============ کلمات فارسی — دسته اول ============
    const badWordsFA1 = [
      'کس','کیر','کص','کون','کوس','جنده','حرومزاده','حرومی','خارکصه',
      'مادرقحبه','مادرجنده','پدرسگ','گوه','زهرمار','لعنتی','خفه','بیشعور',
      'احمق','نادان','ابله','دیوث','کونی','کصخل','کصکش','کیرکلفت','کیرم',
      'کیرتو','کیرت','کیرخور','کصخور','کسخور','کیرخوری','کصخوری','کیرخوار',
      'کصخوار','کصلیس','کسلیس','کیرده','کصده','کسده','کثکیر','کصکیر',
      'مادرتو','مادرت','خواهرتو','خواهرت','ناموست','ناموس','پدرتو','پدرت',
      'خواهرجنده','خواهرکصه','مادرکصه','مادرکیر','پدرکصه','مادرخر','خواهرخر',
      'مادرسگ','خواهرسگ','مادرخوک','پدرخوک','سکسی','سکس','لخت','شهوانی',
      'فحش','مرتیکه','پررو','پفیوز','حروم','زنا','زناکار','فاحشه','رذل',
      'رذله','هوس','شهوت','بی‌ناموس','بی ناموس','جنده‌زاده','جلاد','جاکش',
      'جاکشی','دیوثی','قرمساق','قرتی','گاییدن','گاییدم','گایید','گاییدنت',
      'بگا','بگام','بگای','گای','گایم','کونده','کون ده','کوندهی','کون دادن',
      'کون‌ده','کون‌دهی','کونی‌بازی','خرفت','خرفه','خرف','احمقی','ابلهی'
    ];

    const badWordsFA2 = [
      'نفهم','نفهمی','نادانی','بیشعوری','پست','پست‌فطرت','رذالت','کثافت',
      'کثافتی','چرتی','چرت','چرت‌گو','مزخرف','مزخرفات','مزخرفه','چاخان',
      'چاخان‌چی','دروغگو','خائن','خائنی','خیانتکار','خیانت','خیانت‌کار',
      'فتنه','فتنه‌گر','فتنه‌انگیز','کثیف','کثیفی','شلخته','کله‌خر','کله خر',
      'خر','خری','خرکی','الاغ','الاغی','گاو','گاوی','گوساله','گوساله‌ای',
      'سگ','سگی','سگ‌زاده','خوک','خوکی','خوک‌زاده','میمون','میمونی',
      'میمون‌زاده','بوزینه','بوزینه‌ای','دیوانه','دیوانه‌ای','دیوونه',
      'دیوونه‌ای','مجنون','مجنونی','عقب‌مونده','عقب مونده','کم‌عقل',
      'کم عقل','کم‌هوش','کم هوش','کودن','کودنی','بلانسبت','لاابالی',
      'ژنده','ژنده‌زاده','زنده‌زاده','حلومزاده','حلوم زاده','حروم زاده',
      'کث','کثی','کثیر','قث','قثیر','کت','کتیر','کط','کطیر',
      'گزد','گزید','گوز','گوزید','گوزی','گز','قز','قوز','گژ','گژی',
      'کسخ','کسد','کسم','کسک','کسص','کصص','کصث','کسس','شاش','شاشید',
      'شاشیدم','پیپی','پی پی','گه','گهی','خفه شو','خفه‌شو','زهرماری','گوهخ',
      'گوهخو','گوزیدم','گوزی','گاییدنی','گاینده','کونک','کونکش','کونکشی',
      'کونخور','کونخوری','کصمادر','کیرمادر','مادرکصه','مادرکیر','مادرکونی'
    ];

    const badWordsEN = [
      'fuck','shit','bitch','asshole','bastard','cunt','dick','pussy',
      'whore','slut','retard','idiot','stupid','moron','arse','bloody',
      'sex','porn','nude','naked','cock','boob','tits','piss','crap',
      'damn','nigga','nigger','faggot','fucker','fucking','fucked',
      'shitty','shitting','bitches','assholes','bastards','cunts','dicks',
      'pussies','whores','sluts','retarded','idiots','morons','fuk','fuq',
      'phuck','fuxk','sh1t','b1tch','a55','d1ck','pu55y','wh0re','porno',
      'pornography','nudes','orgasm','masturbate','masturbation','blowjob',
      'handjob','anal','vagina','penis','boobs','titties','booty','dildo',
      'condom','horny','erotic','fetish','fag','homo','queer','dyke',
      'tranny','kike','spic','chink','gook','wetback','wtf','stfu','gtfo',
      'lmfao','fml','mf','mfers','motherfucker','motherfucking','cum',
      'cumming','semen','sperm','dickhead','asshat','dumbass','jackass',
      'loser','fool','dumb','dummy','imbecile','ignoramus','jerk','scumbag',
      'douchebag','douche','prick','twat','wanker','tosser','rape','rapist',
      'raping','molest','molester','pedophile','pedo','incest','scam',
      'scammer','fraud','fraudster','cheat','cheater','liar','lying'
    ];

    const badWordsLatin = [
      'jende','jendh','jndh','jnd','gende','jend3','j3nde','j3ndh','jend3',
      'j3nd','gendeh','gend3','jendeh','gnde','gndeh','jnde','jndeh',
      'jend','jjende','jnd3','jnd3h','jendeh','gendh','gend','jendhe',
      'kos','koss','k0s','koos','kosk','koskesh','koskash','kosde','kosdeh',
      'k0sk','k0ss','koskh','kosskesh','k0sdeh','koskesh','kosskash',
      'kir','k1r','keer','kirr','kirm','kirt','kirto','kirk','kirkoloft',
      'k1rr','k1rm','k1rt','k1rto','k1rk','keerr','kirrr','kirdar','kirdam',
      'kon','koon','k0n','ko0n','koni','kooni','k0ni','kondeh','koondeh',
      'k0ondeh','ko0ni','konid','konidan','koonidan','k0nid','koni','kooni',
      'goh','gooz','goz','g0h','go0z','gohkhord','gohkhor','g0h','g0oz',
      'g00z','gozz','gohkhordan','gohkhori','gohkhord','gozkhor','gozkhori',
      'haroom','harum','hroom','haroomzade','harumzade','hroomzade',
      'hroomzadeh','haroomzadeh','harumzadeh','h0room','har0om','haroomzadh',
      'madar','madarjende','madarjndh','madarghahbe','madarqahbe','madarkos',
      'madarjnd','madarj3nde','madarjendh','madarjend','madarkir','madarkoni',
      'madarkooni','madark0ni','madarh','madarjendeh','madarjende',
      'pedar','pedarsag','pedarsg','pedarnamard','pedarsagh','pedarh',
      'pedarsg','pedarsag',
      'sag','sagzade','sagzadeh','sagkoshi','sagzadh','sagzad','sagzade',
      'khahar','khaharjende','khaharjndh','khaharjnd','khaharj3nde',
      'khaharkos','khaharkir','khaharh','khaharkoni','khaharkooni',
      'gaidan','gayidan','gaidam','begam','bega','begai','gai','gaid',
      'gayid','gayidam','begayam','begay','gayam','gayad','gayed','gayidan',
      'kooni','koonidan','koonkesh','koonkash','k0onkesh','koonkash',
      'fahsha','fahsh','fohsh','fohsha',
      'j3nde','j3ndh','j3nd','j3nd3','k1r','k0s','k0n','g0h','g0oz',
      'jjende','jendeh','jndh','jnde','jendh','jnd3','gnde','gndh',
      'jndhh','jndh','jndh','koss','koss','kirrr','ko0n','k0oni',
      'koskir','koskirm','koskirr','kirkos','kirkosr','koskirt','koskon',
      'kirkon','kirkoni','konkir','konkos','jendekos','jendekir','jendekon',
      'jendemadar','jendepedar','kirmadar','kosmadar','kirkhahar','koskhahar'
    ];

    // ============ نرمال‌سازی متن ============
    function normalizeText(t) {
      let s = t.toString().toLowerCase();
      s = s.replace(/[^\w\s\u0600-\u06FF]/g, '');
      s = s.replace(/[يى]/g, 'ی').replace(/[ك]/g, 'ک');
      s = s.replace(/[آأإٱ]/g, 'ا').replace(/[ۀهة]/g, 'ه');
      s = s.replace(/[ؤو]/g, 'و').replace(/[ئ]/g, 'ی');
      s = s.replace(/[\u064B-\u065F\u0670]/g, '');
      s = s.replace(/[\u200c\u200d\u200e\u200f\u061c]/g, '');
      s = s.replace(/[\.\,\!\?\:\;\-\_\*\#\@\+\=\/\\\(\)\[\]\{\}\<\>\|\~\`\'\"\،\؛\؟]/g, '');
      s = s.replace(/(.)\1{2,}/g, '$1');
      s = s.replace(/\s+/g, ' ').trim();
      return s;
    }

    function removeAllSpaces(t) { return normalizeText(t).replace(/\s+/g, ''); }

    // ============ واریانت‌های حروف ============
    function variantsOf(word) {
      const map = {
        'ک': ['ک','ك','ق','گ','c','k'],
        'گ': ['گ','ک','ق','ج','g'],
        'ق': ['ق','غ','ک','گ','q'],
        'ص': ['ص','س','ث','ض'],
        'س': ['س','ص','ث','ش','c','s'],
        'ث': ['ث','س','ص'],
        'ض': ['ض','ز','ذ','ظ'],
        'ز': ['ز','ض','ذ','ظ','z'],
        'ذ': ['ذ','ز','ض','ظ'],
        'ظ': ['ظ','ز','ض','ذ'],
        'ط': ['ط','ت'],
        'ت': ['ت','ط','t'],
        'ع': ['ع','ا','أ'],
        'ا': ['ا','ع','آ','أ','a'],
        'ه': ['ه','ة','ح','h'],
        'ح': ['ح','ه','h'],
        'ج': ['ج','ژ','چ','j'],
        'ژ': ['ژ','ج','ز','چ','zh'],
        'چ': ['چ','ج','ژ','ch'],
        'ی': ['ی','ي','ى','i','y'],
        'و': ['و','ؤ','u','o'],
        'ن': ['ن','n'],
        'م': ['م','m'],
        'ر': ['ر','r'],
        'ب': ['ب','b'],
        'پ': ['پ','p'],
        'ل': ['ل','l'],
        'د': ['د','d'],
        'ف': ['ف','f'],
        'خ': ['خ','kh'],
        'ش': ['ش','sh']
      };
      const variants = new Set([word]);
      for (let i = 0; i < word.length; i++) {
        const ch = word[i];
        if (map[ch]) {
          for (const v of map[ch]) {
            variants.add(word.substring(0, i) + v + word.substring(i + 1));
          }
        }
      }
      return Array.from(variants);
    }

    // ============ تشخیص فحش محلی ============
    function containsBadWordLocal(text) {
      if (!text) return false;
      const original = text.toString().toLowerCase();
      const normalized = normalizeText(text);
      const noSpace = removeAllSpaces(text);
      const words = normalized.split(' ');
      const allFA = badWordsFA1.concat(badWordsFA2);
      const allBad = allFA.concat(badWordsEN).concat(badWordsLatin);

      for (const w of allBad) {
        if (original.includes(w)) return true;
        if (normalized.includes(w)) return true;
        if (noSpace.includes(w)) return true;
      }

      for (const w of allFA.concat(badWordsEN)) {
        for (const part of words) {
          if (part.length >= 2 && w.length >= 2) {
            if (part.includes(w) || (w.includes(part) && part.length >= 3)) return true;
          }
        }
      }

      const wordsToCheck = ['کیر','کص','کون','گوه','جنده','حروم','کث','کثی','قث',
                            'کیرم','کیرت','کیرتو','کیرک','کیرخ','کیرد','کیرده',
                            'کصک','کصخ','کصد','کصم','کصلی','کصده','کثکیر','کصکیر',
                            'گای','گایید','بگا','بگام','کونی','کونده','فاحشه','زنا'];
      for (const base of wordsToCheck) {
        for (const v of variantsOf(base)) {
          if (v.length >= 3 && noSpace.includes(v)) return true;
        }
      }

      if (/(.)\1{4,}/.test(original)) return true;
      if (/[a-zA-Z]{15,}/.test(original)) return true;
      if (/[\u0600-\u06FF]{30,}/.test(original)) return true;

      const patterns = [
        /ک[\s\.\-\_\*\#\@\+\=\/\\]*ی[\s\.\-\_\*\#\@\+\=\/\\]*ر/,
        /ک[\s\.\-\_\*\#\@\+\=\/\\]*[صسثض][\s\.\-\_\*\#\@\+\=\/\\]*ک[\s\.\-\_\*\#\@\+\=\/\\]*ی[\s\.\-\_\*\#\@\+\=\/\\]*ر/,
        /ج[\s\.\-\_\*\#\@\+\=\/\\]*ن[\s\.\-\_\*\#\@\+\=\/\\]*د[\s\.\-\_\*\#\@\+\=\/\\]*ه/,
        /ح[\s\.\-\_\*\#\@\+\=\/\\]*ر[\s\.\-\_\*\#\@\+\=\/\\]*و[\s\.\-\_\*\#\@\+\=\/\\]*م/,
        /گ[\s\.\-\_\*\#\@\+\=\/\\]*ا[\s\.\-\_\*\#\@\+\=\/\\]*ی/,
        /ک[\s\.\-\_\*\#\@\+\=\/\\]*و[\s\.\-\_\*\#\@\+\=\/\\]*ن/,
        /ف[\s\.\-\_\*\#\@\+\=\/\\]*ا[\s\.\-\_\*\#\@\+\=\/\\]*ح[\s\.\-\_\*\#\@\+\=\/\\]*ش[\s\.\-\_\*\#\@\+\=\/\\]*ه/
      ];
      for (const p of patterns) { if (p.test(original)) return true; }

      const latinMap = {
        'a':'ا','b':'ب','c':'ک','d':'د','e':'','f':'ف','g':'گ','h':'ه',
        'i':'ی','j':'ج','k':'ک','l':'ل','m':'م','n':'ن','o':'و','p':'پ',
        'q':'ق','r':'ر','s':'س','t':'ت','u':'و','v':'و','w':'و','x':'کس',
        'y':'ی','z':'ز','0':'','1':'','2':'','3':'','4':'','5':'','6':'',
        '7':'','8':'','9':''
      };
      let lat = '';
      for (const ch of original) lat += (latinMap[ch] !== undefined ? latinMap[ch] : ch);
      for (const w of allFA) {
        if (w.length >= 3 && lat.includes(w)) return true;
      }
      const latNoVowel = lat.replace(/[هیو]/g, '');
      for (const w of ['جند','حروم','کس','کیر','کون','گوه','فاحش','جنده']) {
        if (latNoVowel.includes(w)) return true;
        if (lat.includes(w)) return true;
      }

      return false;
    }

    // ============ AI ============
    async function checkWithAI(text, type) {
      try {
        const prompt = type === 'name'
          ? `Is "${text}" a real person's name? Reply ONLY "OK" or "BAD".`
          : `Does this text contain profanity or insults in Persian or English? Reply ONLY "OK" or "BAD". Text: "${text}"`;
        const r = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
          messages: [
            { role: 'system', content: 'You are a strict moderator. Reply ONLY "OK" or "BAD".' },
            { role: 'user', content: prompt }
          ]
        });
        const ans = (r.response || '').toString().toUpperCase();
        console.log('AI response:', ans);
        return !ans.includes('BAD');
      } catch (e) {
        console.log('AI ERROR:', e.message);
        return true;
      }
    }

    async function checkText(text, type) {
      if (containsBadWordLocal(text)) {
        console.log('>>> LOCAL FILTER BLOCKED:', text);
        return { valid: false, reason: 'local' };
      }
      console.log('>>> Local filter passed, calling AI...');
      const aiOK = await checkWithAI(text, type);
      if (!aiOK) return { valid: false, reason: 'ai' };
      return { valid: true };
    }

    // ============ GET: دریافت نظرات ============
    if (url.pathname === '/api/comments' && request.method === 'GET') {
      try {
        const { results } = await env.DB.prepare('SELECT id, name, comment, created_at FROM comments ORDER BY created_at DESC LIMIT 100').all();
        return Response.json({ success: true, comments: results }, { headers: cors });
      } catch (e) { return Response.json({ success: false, error: 'خطا' }, { status: 500, headers: cors }); }
    }

    // ============ POST: ثبت نظر ============
    if (url.pathname === '/api/comments' && request.method === 'POST') {
      try {
        const { name, comment, userId } = await request.json();
        if (!name || !comment || !userId) return Response.json({ success: false, error: 'فیلدها الزامی است' }, { status: 400, headers: cors });
        if (name.length > 50 || comment.length > 500) return Response.json({ success: false, error: 'طول متن زیاد است' }, { status: 400, headers: cors });

        const nc = await checkText(name, 'name');
        if (!nc.valid) return Response.json({ success: false, error: '❌ نام وارد شده مناسب نیست. لطفاً نام واقعی خود را وارد کنید.' }, { status: 400, headers: cors });

        const cc = await checkText(comment, 'comment');
        if (!cc.valid) return Response.json({ success: false, error: '❌ پیام شما نباید دارای فحش یا توهین باشد.' }, { status: 400, headers: cors });

        const existing = await env.DB.prepare('SELECT id FROM comments WHERE user_id = ?').bind(userId).first();
        if (existing) return Response.json({ success: false, error: 'شما قبلاً نظر ثبت کرده‌اید.' }, { status: 403, headers: cors });

        await env.DB.prepare('INSERT INTO comments (name, comment, user_id) VALUES (?, ?, ?)').bind(name, comment, userId).run();
        return Response.json({ success: true, message: 'ثبت شد' }, { status: 201, headers: cors });
      } catch (e) { return Response.json({ success: false, error: 'خطا در ثبت' }, { status: 500, headers: cors }); }
    }

    // ============ PUT: ویرایش ============
    if (url.pathname.startsWith('/api/comments/') && request.method === 'PUT') {
      try {
        const id = url.pathname.split('/').pop();
        const { comment, userId } = await request.json();
        if (!comment || !userId) return Response.json({ success: false, error: 'فیلدها الزامی' }, { status: 400, headers: cors });

        const check = await checkText(comment, 'comment');
        if (!check.valid) return Response.json({ success: false, error: '❌ پیام شما نباید دارای فحش یا توهین باشد.' }, { status: 400, headers: cors });

        const ex = await env.DB.prepare('SELECT user_id FROM comments WHERE id = ?').bind(id).first();
        if (!ex || ex.user_id !== userId) return Response.json({ success: false, error: 'دسترسی ندارید' }, { status: 403, headers: cors });
        await env.DB.prepare("UPDATE comments SET comment = ?, updated_at = datetime('now') WHERE id = ?").bind(comment, id).run();
        return Response.json({ success: true }, { headers: cors });
      } catch (e) { return Response.json({ success: false, error: 'خطا' }, { status: 500, headers: cors }); }
    }

    // ============ DELETE: حذف نظر ============
    if (url.pathname.startsWith('/api/comments/') && request.method === 'DELETE') {
      try {
        const id = url.pathname.split('/').pop();
        const { userId } = await request.json();
        const ex = await env.DB.prepare('SELECT user_id FROM comments WHERE id = ?').bind(id).first();
        if (!ex || ex.user_id !== userId) return Response.json({ success: false, error: 'دسترسی ندارید' }, { status: 403, headers: cors });
        await env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(id).run();
        return Response.json({ success: true }, { headers: cors });
      } catch (e) { return Response.json({ success: false, error: 'خطا' }, { status: 500, headers: cors }); }
    }

    // ============ چک وضعیت کاربر ============
    if (url.pathname.startsWith('/api/comments/check/') && request.method === 'GET') {
      try {
        const userId = url.pathname.split('/').pop();
        const ex = await env.DB.prepare('SELECT id, comment, name FROM comments WHERE user_id = ?').bind(userId).first();
        return Response.json({ success: true, hasComment: !!ex, comment: ex || null }, { headers: cors });
      } catch (e) { return Response.json({ success: false, error: 'خطا' }, { status: 500, headers: cors }); }
    }

    return Response.json({ success: true, message: 'API is running' }, { headers: cors });
  }
};
