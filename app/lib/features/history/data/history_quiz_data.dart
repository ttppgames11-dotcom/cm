import '../models/history_models.dart';
import 'history_part2_data.dart';

/// Quiz question bank for the app.
///
/// The website also offers a server "bank" of 20,500 questions
/// (`quiz_questions`), but it is template-generated: only ~8,000 are distinct,
/// the wrong options are generic, some questions contain their own answer, and
/// its "100% verified" label is not backed by any review. It is therefore not
/// used. Instead the app uses the website's 10 hand-written questions plus the
/// questions below, each built only from facts stated on the website's History
/// pages (the page is named in `source`).
class HistoryQuizData {
  HistoryQuizData._();

  static const List<QuizQuestion> all = [
    ...HistoryPart2Data.websiteQuizQuestions,
    ..._fromHistoryPages,
  ];

  /// Categories that actually have questions, in the website's order.
  static List<String> get categories {
    final used = {for (final q in all) q.category};
    return [
      for (final id in HistoryPart2Data.quizCategoryLabels.keys)
        if (used.contains(id)) id,
    ];
  }

  static const _dates = 'Connect Maratha: ऐतिहासिक दिनविशेष';
  static const _battles = 'Connect Maratha: मराठा युद्धे व रणव्यूह दालन';
  static const _warriors = 'Connect Maratha: स्वराज्याचे अमर वीर';
  static const _navy = 'Connect Maratha: मराठा आरमार';
  static const _admin = 'Connect Maratha: शिवकालीन स्वराज्य प्रशासन';
  static const _library = 'Connect Maratha: मराठा महाग्रंथालय';
  static const _balidan = 'Connect Maratha: बलिदान मास';

  static const _fromHistoryPages = [
    QuizQuestion(
      id: 'CM-DATES-01',
      category: 'Important Dates & Chronology',
      question:
          'सोळाव्या वर्षी शिवरायांनी सवंगड्यांसह हिंदवी स्वराज्य स्थापनेची शपथ कोठे घेतली?',
      options: [
        'किल्ले शिवनेरी',
        'रायरेश्वर मंदिर',
        'किल्ले तोरणा',
        'किल्ले रायगड',
      ],
      correct: 1,
      explanation:
          '२६ एप्रिल १६४५ — सोळाव्या वर्षी रायरेश्वराच्या साक्षीने शिवरायांनी सवंगड्यांसह हिंदवी स्वराज्य स्थापनेची प्रतिज्ञा घेतली.',
      source: _dates,
    ),
    QuizQuestion(
      id: 'CM-DATES-02',
      category: 'Important Dates & Chronology',
      question:
          'छत्रपती शिवाजी महाराजांचे महापरिनिर्वाण कोणत्या दिवशी व कोठे झाले?',
      options: [
        '६ जून १६७४, रायगड',
        '१९ फेब्रुवारी १६३०, शिवनेरी',
        '३ एप्रिल १६८०, रायगड',
        '११ मार्च १६८९, तुळापूर',
      ],
      correct: 2,
      explanation:
          '३ एप्रिल १६८० — हिंदवी स्वराज्याच्या महासंस्थापकांचे रायगडावर निर्वाण.',
      source: _dates,
    ),
    QuizQuestion(
      id: 'CM-DATES-03',
      category: 'Chhatrapati Sambhaji Maharaj',
      question: 'छत्रपती संभाजी महाराजांचा जन्म कोणत्या किल्ल्यावर झाला?',
      options: [
        'किल्ले पुरंदर',
        'किल्ले पन्हाळा',
        'किल्ले रायगड',
        'किल्ले शिवनेरी',
      ],
      correct: 0,
      explanation:
          '१४ मे १६५७ — धर्मवीर छत्रपती संभाजी महाराजांचा पुरंदर किल्ल्यावर जन्म.',
      source: _dates,
    ),
    QuizQuestion(
      id: 'CM-DATES-04',
      category: 'Chhatrapati Sambhaji Maharaj',
      question: 'छत्रपती संभाजी महाराज बलिदान दिन कोणता?',
      options: [
        '४ फेब्रुवारी १६७०',
        '११ मार्च १६८९',
        '१३ जुलै १६६०',
        '२८ फेब्रुवारी १७२८',
      ],
      correct: 1,
      explanation:
          '११ मार्च १६८९ — तुळापूर / वधू बुद्रुक: औरंगजेबाच्या अमानुष छळाला न झुकता मातृभूमी व धर्मासाठी सर्वोच्च आत्मबलिदान.',
      source: _dates,
    ),
    QuizQuestion(
      id: 'CM-BAL-01',
      category: 'Chhatrapati Sambhaji Maharaj',
      question:
          'छत्रपती संभाजी महाराज आपल्या राजवटीत किती लढायांमध्ये अपराजित राहिले?',
      options: ['४१', '७', '१२८', '५६'],
      correct: 2,
      explanation:
          'छत्रपती संभाजी महाराजांनी आपल्या ९ वर्षांच्या राजवटीत पाचही शत्रूंविरुद्ध अखंड लढा दिला आणि १२८ लढायांमध्ये एकाही लढाईत पराभव स्वीकारला नाही.',
      source: _balidan,
    ),
    QuizQuestion(
      id: 'CM-BAT-01',
      category: 'Battles & Military Campaigns',
      question:
          'प्रतापगड युद्धात (१० नोव्हेंबर १६५९) कोणत्या विजापुरी सरदाराचा वध झाला?',
      options: ['सिद्दी मसूद', 'अफझलखान', 'दिलेरखान', 'उदयभानू राठोड'],
      correct: 1,
      explanation:
          'जावळीच्या खोऱ्यात अफझलखानाचा वध करून शिवरायांनी विजापूरच्या सेनेचा धुव्वा उडवला.',
      source: _dates,
    ),
    QuizQuestion(
      id: 'CM-BAT-02',
      category: 'Battles & Military Campaigns',
      question:
          'पावनखिंडीत बाजीप्रभू देशपांडे व बांदल मावळ्यांनी कोणाच्या फौजेला थोपवून धरले?',
      options: [
        'शाइस्तेखान',
        'सिद्धी मसूद',
        'मिर्झाराजे जयसिंह',
        'निजाम-उल-मुल्क',
      ],
      correct: 1,
      explanation:
          'बाजीप्रभू देशपांडे, फुलाजी प्रभू व ३०० बांदल मावळ्यांनी सिद्धी मसूदच्या ४,००० फौजेला खिंडीत तोफांचे आवाज येईपर्यंत थोपवून धरले.',
      source: _battles,
    ),
    QuizQuestion(
      id: 'CM-BAT-03',
      category: 'Peshwas',
      question:
          'पालखेडच्या लढाईनंतर (१७२८) निजामाला कोणता तह करण्यास भाग पाडले?',
      options: ['पुरंदरचा तह', 'वडगावचा तह', 'मुंगी-पैठणचा तह', 'वसईचा तह'],
      correct: 2,
      explanation:
          'बाजीराव पेशव्यांनी केवळ वेगवान हालचालींनी निजामाला पालखेडच्या मैदानात कोंडले व मुंगी-पैठणचा तह करण्यास भाग पाडले.',
      source: _battles,
    ),
    QuizQuestion(
      id: 'CM-BAT-04',
      category: 'Peshwas',
      question:
          'पोर्तुगीजांविरुद्धची वसईची प्रसिद्ध मोहीम (१७३९) कोणाच्या नेतृत्वाखाली झाली?',
      options: [
        'चिमाजी अप्पा',
        'सदाशिवराव भाऊ',
        'महादजी शिंदे',
        'कान्होजी आंग्रे',
      ],
      correct: 0,
      explanation:
          'पोर्तुगीजांच्या अत्याचारांविरुद्ध चिमाजी अप्पांच्या नेतृत्वाखालील दोन वर्षांचा प्रदीर्घ वेढा; उत्तर कोकणातून पोर्तुगीज सत्तेचा अंत.',
      source: _battles,
    ),
    QuizQuestion(
      id: 'CM-BAT-05',
      category: 'Battles & Military Campaigns',
      question: 'पानिपतची तिसरी लढाई कोणत्या दिवशी झाली?',
      options: [
        '१४ जानेवारी १७६१',
        '१२ मे १७३९',
        '१२-१३ जानेवारी १७७९',
        '२८ फेब्रुवारी १७२८',
      ],
      correct: 0,
      explanation:
          '१४ जानेवारी १७६१ — सदाशिवराव भाऊ विरुद्ध अहमद शाह अब्दाली; मराठ्यांचा राष्ट्रीय बलिदानाचा इतिहास.',
      source: _battles,
    ),
    QuizQuestion(
      id: 'CM-BAT-06',
      category: 'Maratha Empire / Later History',
      question:
          'पहिल्या इंग्रज-मराठा युद्धात ब्रिटिशांचा भारतात झालेला पहिला मोठा पराभव कोणता?',
      options: [
        'पालखेडची लढाई',
        'वडगावची लढाई',
        'वसईची मोहीम',
        'पानिपतची लढाई',
      ],
      correct: 1,
      explanation:
          'महादजी शिंदे व तुकोजी होळकर यांच्या संयुक्त फौजांनी तळेगाव-वडगावमध्ये ब्रिटिश सैन्याला शरणागती पत्करायला लावली — वडगावचा प्रसिद्ध तह.',
      source: _battles,
    ),
    QuizQuestion(
      id: 'CM-WAR-01',
      category: 'Maratha Warriors & Commanders',
      question:
          'दिलेरखानाच्या वेढ्यात पुरंदरचे किल्लेदार म्हणून वज्रगडावरून प्रतिहल्ला कोणी केला?',
      options: [
        'फिरंगोजी नरसाळा',
        'मुरारबाजी देशपांडे',
        'हंबीरराव मोहिते',
        'शिवा काशिद',
      ],
      correct: 1,
      explanation:
          'किल्लेदार मुरारबाजी देशपांडे यांनी मूठभर मावळ्यांसह वज्रगडावरून दिलेरखानाच्या फौजेवर अद्वितीय प्रतिहल्ला केला.',
      source: _battles,
    ),
    QuizQuestion(
      id: 'CM-WAR-02',
      category: 'Maratha Warriors & Commanders',
      question:
          'शाइस्तेखानाच्या फौजेविरुद्ध चाकणच्या भुईकोट किल्ल्यात ५६ दिवस झुंज कोणी दिली?',
      options: [
        'फिरंगोजी नरसाळा',
        'संताजी घोरपडे',
        'बाजीप्रभू देशपांडे',
        'तानाजी मालुसरे',
      ],
      correct: 0,
      explanation:
          'फिरंगोजी नरसाळा यांनी अवघ्या ३०० जवानांसह तब्बल ५६ दिवस झुंज दिली. त्यांच्या शौर्याने मोगलही थक्क झाले.',
      source: _warriors,
    ),
    QuizQuestion(
      id: 'CM-WAR-03',
      category: 'Maratha Warriors & Commanders',
      question:
          'पन्हाळगडाच्या वेढ्यात शिवरायांचे रूप घेऊन पालखीत बसणारे वीर कोण?',
      options: [
        'मुरारबाजी देशपांडे',
        'फुलाजी प्रभू',
        'शिवा काशिद',
        'धनाजी जाधव',
      ],
      correct: 2,
      explanation:
          'वीर शिवा काशिद यांनी शिवरायांचे रूप घेऊन शत्रूला भ्रमात ठेवत स्वतःचे प्राण स्वराज्यासाठी अर्पण केले.',
      source: _warriors,
    ),
    QuizQuestion(
      id: 'CM-WAR-04',
      category: 'Chhatrapati Rajaram Maharaj',
      question:
          'छत्रपती राजाराम महाराजांच्या काळात मोगल सैन्याला सळो की पळो करून सोडणारे गनिमी सेनापती कोण?',
      options: [
        'हंबीरराव मोहिते व मोरोपंत पिंगळे',
        'संताजी घोरपडे व धनाजी जाधव',
        'बाजीप्रभू व फुलाजी प्रभू',
        'चिमाजी अप्पा व मानाजी आंग्रे',
      ],
      correct: 1,
      explanation:
          'संताजी घोरपडे व धनाजी जाधव — "पाण्यात संताजी-धनाजी दिसतात!" असे मोगल फौजेचे कर्दनकाळ.',
      source: _warriors,
    ),
    QuizQuestion(
      id: 'CM-NAVY-01',
      category: 'Maratha Navy',
      question: '"गुराब" हे मराठा आरमारातील कोणत्या प्रकारचे जहाज होते?',
      options: [
        'रसद पुरवठा व टेहळणी नौका',
        '३०० ते ४०० टनांचे, १५ ते २० तोफांचे प्रमुख युद्धजहाज',
        '३० ते ४० वल्ह्यांची वेगवान नौका',
        'मासेमारी नौका',
      ],
      correct: 1,
      explanation:
          'गुराब — ३०० ते ४०० टन वजनाचे, ३ डोलकाठ्यांचे आणि १५ ते २० तोफांनी सज्ज असलेले प्रमुख युद्धनौका जहाज.',
      source: _navy,
    ),
    QuizQuestion(
      id: 'CM-NAVY-02',
      category: 'Maratha Navy',
      question:
          'पाण्याखालील गुप्त भिंत (Undersea Wall) कोणत्या जलदुर्गाची खास संरक्षण रचना आहे?',
      options: [
        'किल्ले सिंधुदुर्ग',
        'किल्ले विजयदुर्ग',
        'किल्ले पद्मदुर्ग',
        'खांदेरी',
      ],
      correct: 1,
      explanation:
          'किल्ले विजयदुर्ग (घेरिया) — मराठा आरमाराची मुख्य राजधानी व गोदी; पाण्याखालील गुप्त भिंत ही संरक्षणाची अद्भुत रचना.',
      source: _navy,
    ),
    QuizQuestion(
      id: 'CM-NAVY-03',
      category: 'Maratha Navy',
      question:
          'सिद्दीच्या जंजिऱ्याला शह देण्यासाठी शिवरायांनी कोणता "प्रति-जंजिरा" उभारला?',
      options: [
        'किल्ले सुवर्णदुर्ग',
        'खांदेरी-उंदेरी',
        'किल्ले पद्मदुर्ग (कासा)',
        'किल्ले विजयदुर्ग',
      ],
      correct: 2,
      explanation:
          'किल्ले पद्मदुर्ग (कासा) — सिद्दीच्या जंजिऱ्याला शह देण्यासाठी समुद्रात खडकावर उभा केलेला प्रति-जंजिरा.',
      source: _navy,
    ),
    QuizQuestion(
      id: 'CM-NAVY-04',
      category: 'Maratha Navy',
      question:
          'खांदेरी-उंदेरी बेटांवर ब्रिटिशांना रोखणारे शिवकालीन आरमारी सेनापती कोण?',
      options: [
        'कान्होजी आंग्रे',
        'मायनाक भंडारी',
        'मानाजी आंग्रे',
        'हंबीरराव मोहिते',
      ],
      correct: 1,
      explanation:
          'छत्रपती शिवरायांच्या नेतृत्वाखाली खांदेरी-उंदेरी बेटांवर ब्रिटिशांना रोखणारे मायनाक भंडारी यांनी मराठा आरमाराचा पाया रचला.',
      source: _navy,
    ),
    QuizQuestion(
      id: 'CM-ADM-01',
      category: 'Maratha Administration',
      question:
          'अष्टप्रधान मंडळातील "सरसेनापती (सरनोबत)" पदावरील प्रथम अधिकारी कोण?',
      options: [
        'मोरोपंत त्र्यंबक पिंगळे',
        'अण्णाजी दत्तो',
        'हंसाजी (हंबीरराव) मोहिते',
        'निराजी रावजी',
      ],
      correct: 2,
      explanation:
          'सरसेनापती (सरनोबत) — हंसाजी (हंबीरराव) मोहिते: घोडदळ व पायदळ यांचे सर्वोच्च नेतृत्व.',
      source: _admin,
    ),
    QuizQuestion(
      id: 'CM-ADM-02',
      category: 'Maratha Administration',
      question: 'शिवशाही काठीने स्वराज्यातील शेतजमिनीची मोजणी करणारे सचिव कोण?',
      options: [
        'अण्णाजी दत्तो',
        'रामचंद्र त्रिंबक डबीर',
        'दत्ताजी त्रिंबक वाकनीस',
        'रघुनाथराव पंडितराव',
      ],
      correct: 0,
      explanation:
          'पंत सचिव अण्णाजी दत्तो यांनी प्रत्यक्ष शेतात जाऊन शिवशाही काठीने अचूक मोजणी केली आणि पिकाच्या वास्तविक उत्पन्नावर सारा ठरवला.',
      source: _admin,
    ),
    QuizQuestion(
      id: 'CM-ADM-03',
      category: 'Maratha Administration',
      question: 'शिवशाही महसूल व्यवस्थेत पिकाची हक्काची वाटणी कशी होती?',
      options: [
        '४०% रयत : ६०% सरकार',
        '५०% रयत : ५०% सरकार',
        '६०% रयत : ४०% सरकार',
        '८०% रयत : २०% सरकार',
      ],
      correct: 2,
      explanation: '६०% रयत : ४०% सरकार — ३/५ वाटा शेतकऱ्याला, २/५ सरकारला.',
      source: _admin,
    ),
    QuizQuestion(
      id: 'CM-ADM-04',
      category: 'Maratha Administration',
      question: 'शिवशाही मोजणीत १ बिघा क्षेत्रफळ म्हणजे किती?',
      options: [
        '१०० चौरस काठ्या',
        '४०० चौरस काठ्या (२० × २०)',
        '१२० चौरस काठ्या',
        '८० तसू',
      ],
      correct: 1,
      explanation:
          '१ बिघा = ४०० चौरस काठ्या (२० काठ्या लांब × २० काठ्या रुंद).',
      source: _admin,
    ),
    QuizQuestion(
      id: 'CM-ADM-05',
      category: 'Forts & Fort Architecture',
      question:
          'किल्ल्याच्या सर्व दरवाजांच्या चाव्यांचा प्रत्यक्ष ताबा कोणत्या अधिकाऱ्याकडे असे?',
      options: ['सबनीस', 'कारखानीस', 'हवालदार (किल्लेदार)', 'तटसरनोबत'],
      correct: 2,
      explanation:
          'हवालदार (किल्लेदार) — गडाचा सर्वोच्च लष्करी अधिकारी; सर्व दरवाजांच्या चाव्यांचा प्रत्यक्ष ताबा हवालदाराकडे असे.',
      source: _admin,
    ),
    QuizQuestion(
      id: 'CM-ADM-06',
      category: 'Maratha Administration',
      question: 'स्वराज्याचे गुप्तहेर प्रमुख कोण होते?',
      options: [
        'बहिर्जी नाईक',
        'दत्ताजी त्रिंबक वाकनीस',
        'शिवा काशिद',
        'रामचंद्र त्रिंबक डबीर',
      ],
      correct: 0,
      explanation:
          'स्वराज्याचे गुप्तहेर प्रमुख बहिर्जी नाईक यांच्या हाताखाली ३००० पेक्षा जास्त वाकबगार गुप्तहेर कार्यरत होते.',
      source: _admin,
    ),
    QuizQuestion(
      id: 'CM-ADM-07',
      category: 'Maratha Administration',
      question: 'शिवकालीन "शिवराई" हे नाणे कोणत्या धातूचे होते?',
      options: ['सोने', 'चांदी', 'तांबे', 'पितळ'],
      correct: 2,
      explanation:
          'शिवराई (तांबे) — सर्वसामान्य व्यवहारांसाठी; होन हे उच्च दर्जाच्या शुद्ध सोन्याचे नाणे होते.',
      source: _admin,
    ),
    QuizQuestion(
      id: 'CM-ADM-08',
      category: 'Maratha Administration',
      question:
          'आंबा-फणस आदी वृक्ष तोडण्यास मनाई करणारे "आज्ञापत्र" कोणी लिहिले?',
      options: [
        'कृष्णाजी अनंत सभासद',
        'रामचंद्रपंत अमात्य',
        'कवींद्र परमानंद',
        'गोविंद सखाराम सरदेसाई',
      ],
      correct: 1,
      explanation:
          'रामचंद्रपंत अमात्यांचे आज्ञापत्र — "आरमारास लाकूड पाहिजे म्हणून आंबा, फणस आदी वृक्ष तोडू नयेत…"',
      source: _admin,
    ),
    QuizQuestion(
      id: 'CM-LIT-01',
      category: 'Literature, Sources & Culture',
      question: '"सभासद बखर" कोणी लिहिली?',
      options: [
        'कृष्णाजी अनंत सभासद',
        'कवींद्र परमानंद नेवासकर',
        'रामचंद्रपंत अमात्य',
        'छत्रपती संभाजी महाराज',
      ],
      correct: 0,
      explanation:
          'सभासद बखर — कृष्णाजी अनंत सभासद (इ.स. १६९७); जिंजी येथे छत्रपती राजाराम महाराजांच्या आज्ञेवरून लिहिली गेली.',
      source: _library,
    ),
    QuizQuestion(
      id: 'CM-LIT-02',
      category: 'Literature, Sources & Culture',
      question:
          'शिवरायांच्या आज्ञेवरून रचलेले संस्कृत ऐतिहासिक महाकाव्य कोणते?',
      options: ['बुधभूषणम्', 'शिवभारत', 'आज्ञापत्र', 'मराठी रियासत'],
      correct: 1,
      explanation:
          'शिवभारत — कवींद्र परमानंद नेवासकर यांनी रचलेले संस्कृत महाकाव्य; शिवजन्मापासून पुरंदर तहापर्यंतचा इतिहास.',
      source: _library,
    ),
    QuizQuestion(
      id: 'CM-LIT-03',
      category: 'Literature, Sources & Culture',
      question: '"मराठी रियासत" या बहुखंडीय ग्रंथाचे लेखक कोण?',
      options: [
        'वि. का. राजवाडे',
        'गोविंद सखाराम सरदेसाई',
        'कृष्णाजी अनंत सभासद',
        'सर जदुनाथ सरकार',
      ],
      correct: 1,
      explanation:
          'मराठी रियासत — रियासतकार गोविंद सखाराम सरदेसाई; १६०० ते १८४८ पर्यंतचा सविस्तर ऐतिहासिक आढावा.',
      source: _library,
    ),
  ];
}
