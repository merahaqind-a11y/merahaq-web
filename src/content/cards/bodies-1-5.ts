import type { CardBodies } from './types';

/**
 * Card bodies, cards 1–5.
 *
 * Hindi and Hinglish are the card masters, condensed for the page (the masters are a
 * sourcing document, not page copy, the Build Manual's rule is one next step and no
 * more than three destinations per card). English is authored plain English for the
 * supporter, never transliterated.
 *
 * Every «असली ज़िंदगी» line ends in its verdict, because the verdict is the point: she
 * is being told that a thing everyone around her calls normal is not, in fact, allowed.
 */
export const BODIES_1_5: CardBodies = {
  C1: {
    hi: {
      kanoon: [
        'शादी के वक़्त या आस-पास मिले गहने, तोहफ़े, नक़द और सामान, चाहे मायके से हों या ससुराल से, हमेशा के लिए सिर्फ़ आपके हैं। इसी को स्त्रीधन कहते हैं।',
        'सुप्रीम कोर्ट ने प्रतिभा रानी केस (1985) में साफ़ कहा: स्त्रीधन पूरी तरह पत्नी का है। पति या ससुराल वाले उसे बस संभालने वाले हैं, मालिक नहीं।',
        'स्त्रीधन लौटाने से मना करना अमानत में ख़यानत हो सकता है, IPC धारा 406 / भारतीय न्याय संहिता 2023 धारा 316।',
        'आपका स्त्रीधन बेचना या ख़र्च कर देना घरेलू हिंसा क़ानून (PWDVA 2005) की धारा 3 में आर्थिक हिंसा है। मजिस्ट्रेट धारा 12 और 19(8) से वापस दिलाने का आदेश दे सकते हैं।',
        'दहेज निषेध क़ानून 1961, धारा 6: जो भी दहेज किसी और के पास है, वह औरत को देना ही होगा। यह हक़ अलग होने या तलाक़ के बाद भी बना रहता है।',
      ],
      asli: [
        '«हम गहने लॉकर में सेफ़ रख रहे हैं», किसी और के पास सेफ़ रखने से मालिक नहीं बदलता। आप कभी भी वापस मांग सकती हैं। यह सही नहीं है।',
        '«लड़के वालों से मिले तोहफ़े उनके परिवार के हैं», जो भी आपको मिला, किसी भी तरफ़ से, वह स्त्रीधन है। यह सही नहीं है।',
        'पति आपके गहने बिना पूछे गिरवी रखे, बेचे या इन्वेस्ट करे। यह घरेलू छूट नहीं, अमानत में ख़यानत है। यह सही नहीं है।',
        '«घर छोड़ा तो गहने भी छोड़े», घर छोड़ने से स्त्रीधन नहीं छूटता। तलाक़ के बाद भी वापस मिल सकता है। यह सही नहीं है।',
        'बैंक लॉकर सिर्फ़ पति या सास के नाम पर, जबकि उसमें आपका स्त्रीधन हो। यह सही नहीं है।',
        'अपनी ही चीज़ों की लिस्ट रखने पर «लालची» कहना। लिस्ट बनाना आपका हक़ है, शर्म की बात नहीं। यह सही नहीं है।',
        'ऐसे किसी पेपर पर साइन करवाना जिसमें लिखा हो कि तोहफ़े परिवार के हैं। यह सही नहीं है।',
      ],
      sambhaal: [
        'हर चीज़ की सिंपल लिस्ट बनाएं, क्या है, कितना वज़न, किसने दिया, तारीख़ और फ़ोटो के साथ।',
        'लिस्ट फ़ोन में रखें और अपने ईमेल पर बैकअप करें; एक कॉपी किसी भरोसे वाले को दें।',
        'ख़रीदारी की रसीदें और शादी के फ़ोटो-वीडियो संभालें, यह सबूत हैं कि चीज़ें आपको मिली थीं।',
        'लॉकर अपने या जॉइंट नाम पर लें। चीज़ें किसी और के पास हों तो WhatsApp पर रसीद मांग लें।',
        'वापस देने से मना हो तो पहले लिखित मांग करें, शिकायत से पहले रिकॉर्ड बन जाता है।',
      ],
      ekKadam: 'आज अपने गहनों की लिस्ट बनाएँ, फोटो लें, तारीख़ डालें।',
      authority: {
        office:
          'ज़िला विधिक सेवा प्राधिकरण (DLSA), ज़िला कोर्ट के अंदर · वन स्टॉप सेंटर · प्रोटेक्शन ऑफ़िसर',
        askFor: 'DLSA फ़्रंट ऑफ़िस; प्रोटेक्शन ऑफ़िसर',
      },
    },
    hinglish: {
      kanoon: [
        'Shaadi ke waqt ya aas-paas mile gehne, tohfe, nakad aur saamaan, chahe maayke se hon ya sasural se, hamesha ke liye sirf aapke hain. Isi ko streedhan kehte hain.',
        'Supreme Court ne Pratibha Rani case (1985) mein saaf kaha: streedhan poori tarah patni ka hai. Pati ya sasural waale usse bas sambhaalne waale hain, maalik nahin.',
        'Streedhan lautane se mana karna amanat mein khayanat ho sakta hai, IPC dhara 406 / Bharatiya Nyaya Sanhita 2023 dhara 316.',
        'Aapka streedhan bechna ya kharch kar dena gharelu hinsa kanoon (PWDVA 2005) ki dhara 3 mein aarthik hinsa hai. Magistrate dhara 12 aur 19(8) se wapas dilane ka order de sakte hain.',
        'Dahej Nishedh Kanoon 1961, dhara 6: jo bhi dahej kisi aur ke paas hai, woh aurat ko dena hi hoga. Yeh haq alag hone ya talaq ke baad bhi bana rehta hai.',
      ],
      asli: [
        '«Hum gehne locker mein safe rakh rahe hain», kisi aur ke paas safe rakhne se maalik nahin badalta. Aap kabhi bhi wapas maang sakti hain. Yeh sahi nahin hai.',
        '«Ladke waalon se mile tohfe unke parivaar ke hain», jo bhi AAPKO mila, kisi bhi taraf se, woh streedhan hai. Yeh sahi nahin hai.',
        'Pati aapke gehne bina poochhe girvi rakhe, beche ya invest kare. Yeh gharelu chhoot nahin, amanat mein khayanat hai. Yeh sahi nahin hai.',
        '«Ghar chhoda toh gehne bhi chhode», ghar chhodne se streedhan nahin chhootta. Talaq ke baad bhi wapas mil sakta hai. Yeh sahi nahin hai.',
        'Bank locker sirf pati ya saas ke naam par, jabki usmein aapka streedhan ho. Yeh sahi nahin hai.',
        'Apni hi cheezon ki list rakhne par «lalchi» kehna. List banana aapka haq hai, sharm ki baat nahin. Yeh sahi nahin hai.',
        'Aise kisi paper par sign karwana jisme likha ho ki tohfe parivaar ke hain. Yeh sahi nahin hai.',
      ],
      sambhaal: [
        'Har cheez ki simple list banayein, kya hai, kitna wazan, kisne diya, tareekh aur photo ke saath.',
        'List phone mein rakhein aur apne email par backup karein; ek copy kisi bharose waale ko dein.',
        'Kharidari ki raseedein aur shaadi ke photo-video sambhaalein, yeh saboot hain ki cheezein aapko mili thin.',
        'Locker apne ya joint naam par lein. Cheezein kisi aur ke paas hon toh WhatsApp par raseed maang lein.',
        'Wapas dene se mana ho toh pehle likhit maang karein, shikayat se pehle record ban jaata hai.',
      ],
      ekKadam: 'Aaj apne gehnon ki list banayein, photo lein, tareekh daalein.',
      authority: {
        office:
          'District Legal Services Authority (DLSA), zila court ke andar · One Stop Centre · Protection Officer',
        askFor: 'DLSA Front Office; Protection Officer',
      },
    },
    en: {
      kanoon: [
        'Jewellery, gifts, cash and goods given to a woman at or around her marriage, from either family, are her own property, permanently. This is called streedhan.',
        'The Supreme Court held in Pratibha Rani (1985) that streedhan belongs absolutely to the wife. A husband or in-laws holding it are trustees, not owners.',
        'Refusing to return it can amount to criminal breach of trust, IPC s.406 / Bharatiya Nyaya Sanhita 2023 s.316.',
        'Selling or spending her streedhan is economic abuse under s.3 of the domestic violence law (PWDVA 2005). A magistrate can order its return under s.12 and s.19(8).',
        'Dowry Prohibition Act 1961, s.6: dowry held by anyone else must be transferred to the woman. The right survives separation and divorce.',
      ],
      asli: [
        '"We are keeping the jewellery safe in the locker." Safekeeping by someone else does not change who owns it, and she can ask for it back at any time. This is not right.',
        '"Gifts from the groom\'s side belong to his family." Anything given to HER, from either side, is streedhan. This is not right.',
        'A husband pawning, selling or investing her jewellery without asking. That is not a domestic liberty, it is breach of trust. This is not right.',
        '"She left the house, so she left the jewellery." Leaving does not forfeit streedhan; it is recoverable after separation and after divorce. This is not right.',
        "A bank locker held only in the husband's or mother-in-law's name while her streedhan sits inside it. This is not right.",
        'Calling her greedy for keeping a list of her own belongings. Making a list is her right, not something to be ashamed of. This is not right.',
        'Getting her to sign a paper stating that the gifts belong to the family. This is not right.',
      ],
      sambhaal: [
        'Make a simple list of every item, what it is, its weight, who gave it, dated, with photographs.',
        'Keep the list on the phone and back it up to an email account that is hers; give a copy to someone she trusts.',
        'Keep purchase receipts and wedding photographs and video. They prove the items existed and were given to her.',
        'Hold the locker in her own or a joint name. If items are with someone else, ask for a written or WhatsApp acknowledgement.',
        'If return is refused, make the request in writing first. That creates a record before any complaint.',
      ],
      ekKadam: 'Make a dated list of your jewellery today, with photographs.',
      authority: {
        office:
          'District Legal Services Authority (DLSA), inside the district court · One Stop Centre · Protection Officer',
        askFor: 'DLSA Front Office; Protection Officer',
      },
    },
    numbers: ['15100', '181', '14490'],
    portals: [
      { label: 'scourtapp.nic.in/lsams', href: 'https://scourtapp.nic.in/lsams' },
      { label: 'ncwapps.nic.in', href: 'https://ncwapps.nic.in/onlinecomplaintsv2' },
    ],
  },

  C2: {
    hi: {
      kanoon: [
        'PWDVA 2005 की धारा 3 कहती है: घरेलू हिंसा सिर्फ़ मार-पीट नहीं होती।',
        'घर-ख़र्च, दवाई या बच्चों की पढ़ाई के पैसे रोकना, आपकी चीज़ें या स्त्रीधन बेच देना, कमाई छीन लेना, काम करने से रोकना, यह सब आर्थिक हिंसा है।',
        'इसी क़ानून से मिल सकता है: प्रोटेक्शन ऑर्डर (धारा 18), घर में रहने का ऑर्डर (धारा 19), ख़र्चे और गुज़ारे का ऑर्डर (धारा 20), मुआवज़ा (धारा 22)।',
        'धारा 12 की अर्ज़ी मुफ़्त है, प्रोटेक्शन ऑफ़िसर के ज़रिए हो सकती है, और शुरू करने के लिए वकील ज़रूरी नहीं। मजिस्ट्रेट को 60 दिन में निपटाने की कोशिश करनी होती है।',
        'आपकी कमाई सिर्फ़ आपकी है। बराबर काम का बराबर दाम अब क़ानून है (Code on Wages, 2019)।',
      ],
      asli: [
        '«वह मेरी पूरी सैलरी ले लेता है», कमाई ले लेना पति का हक़ नहीं। क़ानून इसे घरेलू हिंसा कहता है। यह सही नहीं है।',
        'खाने, दवाई या बच्चों की स्कूल ज़रूरतों के पैसे सज़ा के तौर पर रोकना। यह सही नहीं है।',
        'नौकरी करने से रोकना, या चल रही नौकरी छुड़वा देना। यह सही नहीं है।',
        'ATM कार्ड, पासबुक या बैंकिंग वाला फ़ोन ज़ब्त कर लेना; आपका खाता «आपके लिए» ख़ुद चलाना। यह सही नहीं है।',
        'घर का सामान या आपकी चीज़ें बिना पूछे बेच देना। यह सही नहीं है।',
        'जिस पैसे पर आप निर्भर हैं, उसकी जानकारी से जान-बूझ कर दूर रखना। यह सही नहीं है।',
        'आपके नाम पर आई सरकारी योजना की रक़म कोई और ले ले। यह सही नहीं है।',
      ],
      sambhaal: [
        'चुपचाप तारीख़ वाला नोट रखें, कब, क्या, कितना। प्राइवेट नोटबुक या अपने ईमेल ड्राफ़्ट में।',
        'सैलरी स्लिप और मैसेज संभालें।',
        'सैलरी और सरकारी पैसा ऐसे खाते में जाए जो सिर्फ़ आप चलाती हैं। PIN और OTP परिवार में भी सीक्रेट।',
        'घर के बाहर किसी भरोसे वाले के पास ज़रूरत के वक़्त के लिए थोड़ा पैसा अलग रखें।',
        'एक भरोसे वाले इंसान को उसी वक़्त बता दें, वह गवाह बन जाता है।',
        'प्रोटेक्शन ऑफ़िसर को शिकायत मुफ़्त है, और इसके लिए शादी तोड़ना ज़रूरी नहीं।',
      ],
      ekKadam: 'आज से एक छोटी डायरी रखें, कब, क्या, कितना।',
      authority: {
        office: 'प्रोटेक्शन ऑफ़िसर (हर ज़िले में) · वन स्टॉप सेंटर (सखी) · DLSA',
        askFor: 'प्रोटेक्शन ऑफ़िसर; OSC केस वर्कर',
      },
    },
    hinglish: {
      kanoon: [
        'PWDVA 2005 ki dhara 3 kehti hai: gharelu hinsa sirf maar-peet nahin hoti.',
        'Ghar-kharch, dawai ya bachchon ki padhai ke paise rokna, aapki cheezein ya streedhan bech dena, kamai chheen lena, kaam karne se rokna, yeh sab aarthik hinsa hai.',
        'Isi kanoon se mil sakta hai: protection order (dhara 18), ghar mein rehne ka order (dhara 19), kharche aur guzare ka order (dhara 20), muaawza (dhara 22).',
        'Dhara 12 ki arzi muft hai, Protection Officer ke zariye ho sakti hai, aur shuru karne ke liye vakil zaroori nahin. Magistrate ko 60 din mein niptane ki koshish karni hoti hai.',
        'Aapki kamai sirf aapki hai. Barabar kaam ka barabar daam ab kanoon hai (Code on Wages, 2019).',
      ],
      asli: [
        '«Woh meri poori salary le leta hai», kamai le lena pati ka haq nahin. Kanoon ise gharelu hinsa kehta hai. Yeh sahi nahin hai.',
        'Khaane, dawai ya bachchon ki school zarooraton ke paise saza ke taur par rokna. Yeh sahi nahin hai.',
        'Naukri karne se rokna, ya chal rahi naukri chhudwa dena. Yeh sahi nahin hai.',
        'ATM card, passbook ya banking waala phone zabt kar lena; aapka khaata «aapke liye» khud chalana. Yeh sahi nahin hai.',
        'Ghar ka saamaan ya aapki cheezein bina poochhe bech dena. Yeh sahi nahin hai.',
        'Jis paise par aap nirbhar hain, uski jaankari se jaan-boojh kar door rakhna. Yeh sahi nahin hai.',
        'Aapke naam par aayi sarkari yojana ki rakam koi aur le le. Yeh sahi nahin hai.',
      ],
      sambhaal: [
        'Chupchaap tareekh waala note rakhein, kab, kya, kitna. Private notebook ya apne email draft mein.',
        'Salary slip aur messages sambhaalein.',
        'Salary aur sarkari paisa aise khaate mein jaaye jo sirf aap chalati hain. PIN aur OTP parivaar mein bhi secret.',
        'Ghar ke bahar kisi bharose waale ke paas zaroorat ke waqt ke liye thoda paisa alag rakhein.',
        'Ek bharose waale insaan ko usi waqt bata dein, woh gawah ban jaata hai.',
        'Protection Officer ko shikayat muft hai, aur iske liye shaadi todna zaroori nahin.',
      ],
      ekKadam: 'Aaj se ek chhoti diary rakhein, kab, kya, kitna.',
      authority: {
        office: 'Protection Officer (har zile mein) · One Stop Centre (Sakhi) · DLSA',
        askFor: 'Protection Officer; OSC Case Worker',
      },
    },
    en: {
      kanoon: [
        'Section 3 of the PWDVA 2005 states that domestic violence is not only physical.',
        "Withholding money for the household, medicine or children's schooling, selling her belongings or streedhan, taking her earnings, or preventing her from working are all economic abuse.",
        'The same law provides a protection order (s.18), a residence order (s.19), monetary relief for expenses and maintenance (s.20), and compensation (s.22).',
        'A s.12 application is free, can be filed through the Protection Officer, and needs no lawyer to begin. The magistrate is required to try to dispose of it within 60 days.',
        'Her earnings are hers alone. Equal pay for equal work is now statutory (Code on Wages, 2019).',
      ],
      asli: [
        '"He takes my whole salary." Taking her earnings is not a husband\'s entitlement; the law names it domestic violence. This is not right.',
        'Withholding money for food, medicine or school needs as a punishment. This is not right.',
        'Preventing her from working, or making her give up a job she has. This is not right.',
        'Confiscating her ATM card, passbook or the phone her banking runs on, and operating her account "for her". This is not right.',
        'Selling household goods or her belongings without asking. This is not right.',
        'Deliberately keeping her uninformed about the money she depends on. This is not right.',
        'Someone else taking a government benefit paid in her name. This is not right.',
      ],
      sambhaal: [
        'Keep a quiet dated note, when, what, how much, in a private notebook or in her own email drafts.',
        'Keep salary slips and messages.',
        'Have wages and benefits paid into an account only she operates. PIN and OTP stay secret, including within the family.',
        'Keep a small amount of money outside the house with someone she trusts, for when it is needed.',
        'Tell one trusted person at the time it happens. That person becomes a witness.',
        'A complaint to the Protection Officer is free, and it does not require ending the marriage.',
      ],
      ekKadam: 'Start a small dated record today, when, what, how much.',
      authority: {
        office: 'Protection Officer (every district) · One Stop Centre (Sakhi) · DLSA',
        askFor: 'Protection Officer; OSC Case Worker',
      },
    },
    numbers: ['181', '112', '15100', '14454'],
    portals: [
      { label: 'missionshakti.wcd.gov.in', href: 'https://missionshakti.wcd.gov.in' },
      { label: 'scourtapp.nic.in/lsams', href: 'https://scourtapp.nic.in/lsams' },
    ],
  },

  C3: {
    hi: {
      kanoon: [
        'PWDVA धारा 17: घरेलू रिश्ते में हर औरत को साझा घर में रहने का हक़ है, चाहे घर उसके नाम पर हो या न हो। बिना क़ानूनी प्रक्रिया के उसे निकाला नहीं जा सकता।',
        'धारा 19 में मजिस्ट्रेट आदेश दे सकते हैं: आपको निकाला नहीं जाएगा, घर बेचा नहीं जाएगा, सताने वाले को घर से हटाया जाए, या वैसे ही स्तर का दूसरा घर दिया जाए।',
        'सुप्रीम कोर्ट (सतीश चंदर आहूजा बनाम स्नेहा आहूजा, 2020) ने साझा घर का दायरा बढ़ाया: इसमें ससुराल का वह घर भी आ सकता है जहाँ आप रहती आई हैं। घर पति के नाम पर होना ज़रूरी नहीं।',
      ],
      asli: [
        '«घर मेरे नाम पर नहीं है, तो निकल जाओ», काग़ज़ पर आपका नाम हो या न हो, रहने के हक़ से इसका लेना-देना नहीं। यह सही नहीं है।',
        'आप मायके गई हों और पीछे से ताला बदल देना; झगड़े के वक़्त लॉक कर देना। यह सही नहीं है।',
        'आपका सामान बाहर फेंक देना, या दबाव बनाने के लिए स्टोर-रूम में भेज देना। यह सही नहीं है।',
        '«यह मेरे माँ-बाप का घर है, इसका कोई हक़ नहीं», 2020 के फ़ैसले के बाद वह भी साझा घर हो सकता है। यह सही नहीं है।',
        'दबाव में «मैं अपनी मर्ज़ी से घर छोड़ रही हूँ» जैसा कोई काग़ज़ साइन करवाना। यह सही नहीं है।',
        'मेंटेनेंस या PWDVA केस चलते वक़्त निकालने की धमकी देना। यह सही नहीं है।',
      ],
      sambhaal: [
        'रहने का सबूत संभालें: उस पते वाला आधार, राशन कार्ड, बिजली-पानी के बिल, बच्चों के स्कूल रिकॉर्ड।',
        'ताला लग जाए या निकाल दिया जाए तो उसी हफ़्ते शिकायत करें, देरी आपके ख़िलाफ़ पढ़ी जाती है।',
        'घर छोड़ने से जुड़ा कोई भी काग़ज़ बिना DLSA की मुफ़्त सलाह के साइन न करें।',
        'सामान और कमरों की फ़ोटो रखें; निकाला जाए तो अंदर क्या छूटा उसकी लिस्ट बनाएं।',
      ],
      ekKadam: 'उस पते वाले काग़ज़ इकट्ठे करें, आधार, राशन कार्ड, बिजली का बिल।',
      authority: {
        office: 'प्रोटेक्शन ऑफ़िसर → मजिस्ट्रेट (धारा 19 का ऑर्डर) · वन स्टॉप सेंटर · पुलिस',
        askFor: 'प्रोटेक्शन ऑफ़िसर',
      },
    },
    hinglish: {
      kanoon: [
        'PWDVA dhara 17: gharelu rishtey mein har aurat ko saajha ghar mein rehne ka haq hai, chahe ghar uske naam par ho ya na ho. Bina kanooni prakriya ke use nikala nahin ja sakta.',
        'Dhara 19 mein Magistrate order de sakte hain: aapko nikala nahin jayega, ghar becha nahin jayega, satane waale ko ghar se hataya jaye, ya waise hi star ka doosra ghar diya jaye.',
        'Supreme Court (Satish Chander Ahuja v. Sneha Ahuja, 2020) ne saajha ghar ka daayra badhaya: isme sasural ka woh ghar bhi aa sakta hai jahan aap rehti aayi hain. Ghar pati ke naam par hona zaroori nahin.',
      ],
      asli: [
        '«Ghar mere naam par nahin hai, toh nikal jao», kaagaz par aapka naam ho ya na ho, rehne ke haq se iska lena-dena nahin. Yeh sahi nahin hai.',
        'Aap maayke gayi hon aur peechhe se taala badal dena; jhagde ke waqt lock kar dena. Yeh sahi nahin hai.',
        'Aapka saamaan bahar phenk dena, ya dabav banane ke liye store-room mein bhej dena. Yeh sahi nahin hai.',
        '«Yeh mere maa-baap ka ghar hai, iska koi haq nahin», 2020 ke faisle ke baad woh bhi saajha ghar ho sakta hai. Yeh sahi nahin hai.',
        'Dabav mein «main apni marzi se ghar chhod rahi hoon» jaisa koi kaagaz sign karwana. Yeh sahi nahin hai.',
        'Maintenance ya PWDVA case chalte waqt nikaalne ki dhamki dena. Yeh sahi nahin hai.',
      ],
      sambhaal: [
        'Rehne ka saboot sambhaalein: us pate waala Aadhaar, ration card, bijli-paani ke bill, bachchon ke school records.',
        'Taala lag jaye ya nikaal diya jaye toh usi hafte shikayat karein, deri aapke khilaaf padhi jaati hai.',
        'Ghar chhodne se juda koi bhi kaagaz bina DLSA ki muft salaah ke sign na karein.',
        'Saamaan aur kamron ki photo rakhein; nikala jaye toh andar kya chhoota uski list banayein.',
      ],
      ekKadam: 'Us pate waale kaagaz ikatthe karein, Aadhaar, ration card, bijli ka bill.',
      authority: {
        office: 'Protection Officer → Magistrate (dhara 19 ka order) · One Stop Centre · Police',
        askFor: 'Protection Officer',
      },
    },
    en: {
      kanoon: [
        'PWDVA s.17: every woman in a domestic relationship has the right to reside in the shared household, whether or not it is in her name. She cannot be put out without due process.',
        'Under s.19 a magistrate can order that she not be evicted, that the house not be sold, that the person harassing her be removed, or that alternative accommodation of the same standard be provided.',
        'The Supreme Court in Satish Chander Ahuja v. Sneha Ahuja (2020) widened "shared household" to include an in-laws\' home she has lived in. It need not be in the husband\'s name.',
      ],
      asli: [
        '"The house isn\'t in your name, so leave." Whether her name is on the papers has nothing to do with the right to reside. This is not right.',
        "Changing the locks while she is away at her parents' home, or locking her out during a quarrel. This is not right.",
        'Putting her belongings outside, or moving her to a store room to apply pressure. This is not right.',
        '"This is my parents\' house, she has no claim." Since the 2020 judgment that home can also be a shared household. This is not right.',
        'Getting her to sign, under pressure, a paper saying she is leaving of her own accord. This is not right.',
        'Threatening eviction while a maintenance or PWDVA case is running. This is not right.',
      ],
      sambhaal: [
        "Keep proof of residence: Aadhaar with that address, ration card, utility bills, children's school records.",
        'If she is locked out or evicted, complain the same week. Delay is read against her.',
        'Never sign anything connected to leaving the house without free advice from DLSA first.',
        'Keep photographs of the rooms and belongings; if evicted, list what was left inside.',
      ],
      ekKadam: 'Gather papers showing that address, Aadhaar, ration card, an electricity bill.',
      authority: {
        office: 'Protection Officer → Magistrate (s.19 residence order) · One Stop Centre · Police',
        askFor: 'Protection Officer',
      },
    },
    numbers: ['181', '112', '15100'],
    portals: [
      { label: 'scourtapp.nic.in/lsams', href: 'https://scourtapp.nic.in/lsams' },
      { label: 'ncwapps.nic.in', href: 'https://ncwapps.nic.in/onlinecomplaintsv2' },
    ],
  },

  C4: {
    hi: {
      kanoon: [
        'अगर आप अपना ख़र्चा नहीं उठा सकतीं, तो पति से हर महीने गुज़ारे का पैसा लेना आपका क़ानूनी हक़ है, CrPC धारा 125, अब BNSS 2023 धारा 144।',
        'बच्चे और निर्भर माँ-बाप भी मांग सकते हैं। अलग रह रही औरत बिना तलाक़ के भी मांग सकती है; तलाक़ के बाद भी, जब तक दूसरी शादी न हो।',
        'सुप्रीम कोर्ट (राजनेश बनाम नेहा, 2020): दोनों को अपनी कमाई और संपत्ति का सच लिख कर देना होगा। पैसा उस दिन से मिलता है जिस दिन अर्ज़ी दी, और केस के बीच का ख़र्चा पहले तय होता है।',
        'सुप्रीम कोर्ट (मोहम्मद अब्दुल समद, 2024): तलाक़शुदा मुस्लिम महिला भी धारा 125 में गुज़ारे का पैसा मांग सकती है।',
        'DLSA से अर्ज़ी देना बिल्कुल मुफ़्त है। घरेलू हिंसा क़ानून (धारा 20) से भी ख़र्चे का ऑर्डर अलग से मिल सकता है।',
      ],
      asli: [
        '«तलाक़ नहीं हुआ तो पैसा नहीं मिलता», अलग रह रही औरत बिना तलाक़ के मांग सकती है। यह सही नहीं है।',
        '«वह थोड़ा-बहुत कमा लेती है, तो कुछ नहीं बनता», थोड़ी कमाई से हक़ ख़त्म नहीं होता। यह सही नहीं है।',
        '«उसकी कोई कमाई नहीं» कहना, जबकि धंधा या खेती रिश्तेदार के नाम पर चल रही हो। कोर्ट आर-पार देख सकती है। यह सही नहीं है।',
        'दबाव में, बिना मुफ़्त सलाह के, एकमुश्त पैसा ले कर «पूरा हिसाब ख़त्म» वाला काग़ज़ साइन करना। यह सही नहीं है।',
        'बच्चों की फ़ीस और दवाई को सिर्फ़ माँ की ज़िम्मेदारी कहना, बच्चों का हक़ अलग से बनता है। यह सही नहीं है।',
        'सालों इंतज़ार करते रहना, पैसा अर्ज़ी की तारीख़ से जुड़ता है, इसलिए देरी सीधा पैसे का नुक़सान है। यह सही नहीं है।',
      ],
      sambhaal: [
        'शादी का सबूत, बच्चों के बर्थ सर्टिफ़िकेट, और पति की कमाई या संपत्ति की जो भी जानकारी हो, सब संभालें।',
        'DLSA से मुफ़्त अर्ज़ी दें और पहले ही दिन केस के बीच के ख़र्चे की मांग ज़रूर करें।',
        'महीने के ख़र्चे का सीधा हिसाब रखें, किराया, खाना, स्कूल, दवाई। इसी से रक़म तय होती है।',
        'केस नंबर से eCourts ऐप पर ख़ुद अपना केस देखते रहें।',
      ],
      ekKadam: 'महीने के खर्चे का हिसाब लिखना आज से शुरू करें।',
      authority: {
        office: 'DLSA (मुफ़्त फ़ाइलिंग) · फ़ैमिली कोर्ट / मजिस्ट्रेट · लोक अदालत',
        askFor: 'DLSA फ़्रंट ऑफ़िस; लीगल एड काउंसल',
      },
    },
    hinglish: {
      kanoon: [
        'Agar aap apna kharcha nahin utha saktein, toh pati se har mahine guzare ka paisa lena aapka kanooni haq hai, CrPC dhara 125, ab BNSS 2023 dhara 144.',
        'Bachche aur nirbhar maa-baap bhi maang sakte hain. Alag reh rahi aurat bina talaq ke bhi maang sakti hai; talaq ke baad bhi, jab tak doosri shaadi na ho.',
        'Supreme Court (Rajnesh v. Neha, 2020): dono ko apni kamai aur sampatti ka sach likh kar dena hoga. Paisa us din se milta hai jis din arzi di, aur case ke beech ka kharcha pehle tay hota hai.',
        'Supreme Court (Mohd. Abdul Samad, 2024): talaq-shuda Muslim mahila bhi dhara 125 mein guzare ka paisa maang sakti hai.',
        'DLSA se arzi dena bilkul muft hai. Gharelu hinsa kanoon (dhara 20) se bhi kharche ka order alag se mil sakta hai.',
      ],
      asli: [
        '«Talaq nahin hua toh paisa nahin milta», alag reh rahi aurat bina talaq ke maang sakti hai. Yeh sahi nahin hai.',
        '«Woh thoda-bahut kama leti hai, toh kuchh nahin banta», thodi kamai se haq khatam nahin hota. Yeh sahi nahin hai.',
        '«Uski koi kamai nahin» kehna, jabki dhandha ya kheti rishtedaar ke naam par chal rahi ho. Court aar-paar dekh sakti hai. Yeh sahi nahin hai.',
        'Dabav mein, bina muft salaah ke, ek-musht paisa le kar «poora hisaab khatam» waala kaagaz sign karna. Yeh sahi nahin hai.',
        'Bachchon ki fees aur dawai ko sirf maa ki zimmedari kehna, bachchon ka haq alag se banta hai. Yeh sahi nahin hai.',
        'Saalon intezaar karte rehna, paisa arzi ki tareekh se judta hai, isliye deri seedha paise ka nuksaan hai. Yeh sahi nahin hai.',
      ],
      sambhaal: [
        'Shaadi ka saboot, bachchon ke birth certificate, aur pati ki kamai ya sampatti ki jo bhi jaankari ho, sab sambhaalein.',
        'DLSA se muft arzi dein aur pehle hi din case ke beech ke kharche ki maang zaroor karein.',
        'Mahine ke kharche ka seedha hisaab rakhein, kiraya, khana, school, dawai. Isi se rakam tay hoti hai.',
        'Case number se eCourts app par khud apna case dekhte rahein.',
      ],
      ekKadam: 'Mahine ke kharche ka hisaab likhna aaj se shuru karein.',
      authority: {
        office: 'DLSA (muft filing) · Family Court / Magistrate · Lok Adalat',
        askFor: 'DLSA Front Office; Legal Aid Counsel',
      },
    },
    en: {
      kanoon: [
        'A woman who cannot maintain herself has a legal right to monthly maintenance from her husband, CrPC s.125, now BNSS 2023 s.144.',
        'Children and dependent parents can claim too. A separated woman can claim without a divorce, and after divorce until she remarries.',
        'The Supreme Court in Rajnesh v. Neha (2020) required both parties to file truthful affidavits of income and assets, set maintenance from the date of application, and required interim maintenance to be decided first.',
        'The Supreme Court in Mohd. Abdul Samad (2024) held that a divorced Muslim woman may also claim maintenance under s.125.',
        'Filing through DLSA is completely free. A separate monetary order is also available under s.20 of the domestic violence law.',
      ],
      asli: [
        '"No divorce, so no money." A separated woman can claim without a divorce. This is not right.',
        '"She earns a little from stitching, so nothing is due." A small income does not extinguish the right. This is not right.',
        "Claiming he has no income while a business or land runs in a relative's name. A court can look through that, so note what is known. This is not right.",
        'Signing a "full and final settlement" for a lump sum, under pressure, without free advice first. This is not right.',
        "Treating children's fees and medicine as the mother's responsibility alone. The children's claim is separate. This is not right.",
        'Waiting years. Maintenance runs from the date of application, so delay is money permanently lost. This is not right.',
      ],
      sambhaal: [
        "Keep proof of marriage, the children's birth certificates, and whatever is known of the husband's income, job or property.",
        'File free through DLSA, and ask for interim maintenance on the very first day.',
        'Keep a plain monthly record of expenses, rent, food, school, medicine. The amount is set from this.',
        'Track the case on the eCourts app using the case number.',
      ],
      ekKadam: 'Start writing down your monthly household costs today.',
      authority: {
        office: 'DLSA (free filing) · Family Court / Magistrate · Lok Adalat',
        askFor: 'DLSA Front Office; Legal Aid Counsel',
      },
    },
    numbers: ['15100', '14454'],
    portals: [{ label: 'scourtapp.nic.in/lsams', href: 'https://scourtapp.nic.in/lsams' }],
  },

  C5: {
    hi: {
      kanoon: [
        'हिंदू उत्तराधिकार अधिनियम 1956, धारा 6 (2005 का संशोधन): बेटी जन्म से ही पैतृक संपत्ति में बेटे के बराबर हिस्सेदार है।',
        'सुप्रीम कोर्ट (विनीता शर्मा बनाम राकेश शर्मा, 2020): यह हक़ तब भी है जब पिता 9.9.2005 को जीवित न रहे हों।',
        'बिना वसीयत के गुज़र जाने पर ख़ुद की कमाई हुई संपत्ति क्लास I वारिसों में बराबर बंटती है, पत्नी, माँ, बेटे और बेटियाँ। शादी से बेटी का हिस्सा कम नहीं होता।',
        'यह नियम हिंदू, बौद्ध, जैन और सिख पर लगता है। मुस्लिम, ईसाई और पारसी के नियम अलग हैं।',
        'धोखे या दबाव में साइन करवाया गया हक़-त्याग पेपर रद्द करवाया जा सकता है, पर असली बचाव एक ही है: साइन से पहले मुफ़्त सलाह।',
      ],
      asli: [
        '«शादी हो गई, अब मायके की ज़मीन से क्या लेना», क़ानून उल्टा कहता है; शादीशुदा बेटियाँ बराबर की वारिस हैं। यह सही नहीं है।',
        'किसी फ़ैमिली फ़ंक्शन पर «बस फ़ॉर्मैलिटी है» कह कर पेपर साइन करवाना, अक्सर वही आपका हिस्सा ख़त्म करने वाला काग़ज़ होता है। यह सही नहीं है।',
        '«भाई संभाल लेंगे, तुम्हारे नाम की क्या ज़रूरत», भाई का संभालना उनका मालिक बन जाना नहीं है। यह सही नहीं है।',
        'रजिस्टर्ड हक़ छोड़ने के बदले ज़ुबानी वादे। यह सही नहीं है।',
        'बिना पढ़े «गवाह के तौर पर» साइन करना, गवाही के पन्ने सहमति के पन्ने बना दिए जाते हैं। यह सही नहीं है।',
        '«वसीयत में नाम नहीं, अब कुछ नहीं हो सकता» मान लेना, शक वाली वसीयत को चुनौती दी जा सकती है। यह सही नहीं है।',
      ],
      sambhaal: [
        'मोटा-मोटा पता रखें कि संपत्ति क्या-क्या है, ज़मीन, घर, डिपॉज़िट। जो काग़ज़ रख सकती हैं, उनकी कॉपियाँ रखें।',
        'अपने राज्य के लैंड रिकॉर्ड पोर्टल पर रिकॉर्ड ख़ुद देखें। देखने के लिए किसी की इजाज़त नहीं चाहिए।',
        'विरासत मिलने पर म्यूटेशन करवाएं ताकि रिकॉर्ड में आपका नाम चढ़े।',
        'कोई भी हक़-त्याग काग़ज़ बिना DLSA की मुफ़्त सलाह के कभी साइन न करें।',
        'डेथ सर्टिफ़िकेट और लीगल-हेयर सर्टिफ़िकेट की कॉपियाँ संभाल कर रखें।',
      ],
      ekKadam: 'कोई भी काग़ज़ साइन करने से पहले 15100 पर मुफ़्त सलाह लें।',
      authority: {
        office: 'DLSA (साइन से पहले मुफ़्त सलाह) · तहसील / रेवेन्यू ऑफ़िस (म्यूटेशन) · लोक अदालत',
        askFor: 'DLSA फ़्रंट ऑफ़िस; तहसीलदार / पटवारी',
      },
    },
    hinglish: {
      kanoon: [
        'Hindu Succession Act 1956, dhara 6 (2005 ka sanshodhan): beti janm se hi paitrik sampatti mein bete ke barabar hissedar hai.',
        'Supreme Court (Vineeta Sharma v. Rakesh Sharma, 2020): yeh haq tab bhi hai jab pita 9.9.2005 ko jeevit na rahe hon.',
        'Bina vasiyat ke guzar jaane par khud ki kamai hui sampatti Class I waarison mein barabar bat-ti hai, patni, maa, bete aur betiyan. Shaadi se beti ka hissa kam nahin hota.',
        'Yeh niyam Hindu, Bauddh, Jain aur Sikh par lagta hai. Muslim, Isai aur Parsi ke niyam alag hain.',
        'Dhokhe ya dabav mein sign karwaya gaya haq-tyag paper radd karwaya ja sakta hai, par asli bachav ek hi hai: sign se pehle muft salaah.',
      ],
      asli: [
        '«Shaadi ho gayi, ab maayke ki zameen se kya lena», kanoon ulta kehta hai; shaadi-shuda betiyan barabar ki waaris hain. Yeh sahi nahin hai.',
        'Kisi family function par «bas formality hai» keh kar paper sign karwana, aksar wahi aapka hissa khatam karne waala kaagaz hota hai. Yeh sahi nahin hai.',
        '«Bhai sambhal lenge, tumhare naam ki kya zaroorat», bhai ka sambhalna unka maalik ban jaana nahin hai. Yeh sahi nahin hai.',
        'Registered haq chhodne ke badle zubaani vaade. Yeh sahi nahin hai.',
        'Bina padhe «gawah ke taur par» sign karna, gawahi ke panne sehmati ke panne bana diye jaate hain. Yeh sahi nahin hai.',
        '«Vasiyat mein naam nahin, ab kuchh nahin ho sakta» maan lena, shak waali vasiyat ko chunauti di ja sakti hai. Yeh sahi nahin hai.',
      ],
      sambhaal: [
        'Mota-mota pata rakhein ki sampatti kya-kya hai, zameen, ghar, deposits. Jo kaagaz rakh sakti hain, unki copies rakhein.',
        'Apne state ke land record portal par records khud dekhein. Dekhne ke liye kisi ki ijaazat nahin chahiye.',
        'Virasat milne par mutation karwayein taaki record mein aapka naam chadhe.',
        'Koi bhi haq-tyag kaagaz bina DLSA ki muft salaah ke kabhi sign na karein.',
        'Death certificate aur legal-heir certificate ki copies sambhaal kar rakhein.',
      ],
      ekKadam: 'Koi bhi kaagaz sign karne se pehle 15100 par muft salaah lein.',
      authority: {
        office:
          'DLSA (sign se pehle muft salaah) · Tehsil / Revenue office (mutation) · Lok Adalat',
        askFor: 'DLSA Front Office; Tehsildar / Patwari',
      },
    },
    en: {
      kanoon: [
        'Hindu Succession Act 1956, s.6 (as amended in 2005): a daughter is a coparcener in ancestral property by birth, equally with a son.',
        'The Supreme Court in Vineeta Sharma v. Rakesh Sharma (2020) held this applies even if the father died before 9 September 2005.',
        "Where a man dies without a will, his self-acquired property is divided equally among Class I heirs, widow, mother, sons and daughters. Marriage does not reduce a daughter's share.",
        'These rules apply to Hindus, Buddhists, Jains and Sikhs. Muslim, Christian and Parsi succession is governed separately.',
        'A relinquishment signed under fraud or pressure can be set aside, but the real protection is free advice before signing.',
      ],
      asli: [
        '"You\'re married now, what claim do you have to your parents\' land?" The law says the opposite; married daughters are equal heirs. This is not right.',
        'Getting a paper signed at a family function because "it\'s only a formality". That paper is often the release deed that ends her share. This is not right.',
        '"Your brothers will look after it, why put it in your name?" Looking after it is not the same as owning it. This is not right.',
        'A verbal promise of money later in exchange for a registered relinquishment. This is not right.',
        'Signing "as a witness" without reading. Witness pages are turned into consent pages. This is not right.',
        'Accepting that nothing can be done because she is not named in a will. A suspicious will can be challenged. This is not right.',
      ],
      sambhaal: [
        'Know roughly what property exists, land, house, deposits, and keep copies of any papers she can lawfully hold.',
        "Check the records herself on the state land-record portal. No one's permission is needed to look.",
        'On inheriting, get mutation done so her name enters the revenue record.',
        'Never sign a relinquishment without free DLSA advice first.',
        'Keep copies of the death certificate and the legal-heir certificate.',
      ],
      ekKadam: 'Before signing any paper, call 15100 for free advice.',
      authority: {
        office:
          'DLSA (free advice before signing) · Tehsil / Revenue office (mutation) · Lok Adalat',
        askFor: 'DLSA Front Office; Tehsildar / Patwari',
      },
    },
    numbers: ['15100', '14454'],
    portals: [
      { label: 'dilrmp.gov.in', href: 'https://dilrmp.gov.in' },
      { label: 'scourtapp.nic.in/lsams', href: 'https://scourtapp.nic.in/lsams' },
    ],
  },
};
