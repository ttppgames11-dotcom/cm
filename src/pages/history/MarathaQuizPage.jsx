import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// 13 Official Historical Domains as approved in the 20,000-Question Blueprint
const OFFICIAL_CATEGORIES = [
  { id: 'ALL', label: '🚩 सर्वसमावेशक महाक्विझ (All Categories)', count: '२०,५००+' },
  { id: 'Chhatrapati Shivaji Maharaj', label: '👑 छत्रपती शिवाजी महाराज', count: '४,०००+' },
  { id: 'Chhatrapati Sambhaji Maharaj', label: '⚔️ धर्मवीर छत्रपती संभाजी महाराज', count: '२,५००+' },
  { id: 'Chhatrapati Rajaram Maharaj', label: '🛡️ छत्रपती राजाराम महाराज', count: '१,५००+' },
  { id: 'Maharani Tarabai', label: '🦁 महाराणी ताराबाई', count: '१,०००+' },
  { id: 'Peshwas', label: '🐎 पेशवे व साम्राज्य विस्तार', count: '२,५००+' },
  { id: 'Maratha Warriors & Commanders', label: '🗡️ मराठा शूर सरदार व सेनापती', count: '२,५००+' },
  { id: 'Forts & Fort Architecture', label: '🏰 अभेद्य दुर्ग व स्थापत्य', count: '१,५००+' },
  { id: 'Battles & Military Campaigns', label: '🔥 महापराक्रमी रणसंग्राम', count: '१,५००+' },
  { id: 'Maratha Administration', label: '⚖️ स्वराज्य प्रशासन व अष्टप्रधान', count: '७५०+' },
  { id: 'Maratha Navy', label: '⚓ मराठा आरमार व जलदुर्ग', count: '५००+' },
  { id: 'Important Dates & Chronology', label: '📅 ऐतिहासिक दिनविशेष व कालपट', count: '७५०+' },
  { id: 'Maratha Empire / Later History', label: '🗺️ मराठा महासंघ व नंतरचा इतिहास', count: '१,०००+' },
  { id: 'Literature, Sources & Culture', label: '📚 साहित्य, बखरी व संस्कृती', count: '५००+' }
];

// Offline Local Fallback Question Bank (Always ready even if network or server is offline)
const fallbackQuestions = [
  {
    id: 'SHIV-00001',
    category: 'Chhatrapati Shivaji Maharaj',
    level: 'प्राथमिक',
    question_type: 'mcq',
    question: 'छत्रपती शिवाजी महाराजांचा जन्म कोणत्या ऐतिहासिक गडावर झाला?',
    options: ['तोरणा किल्ला', 'शिवनेरी किल्ला', 'राजगड किल्ला', 'रायगड किल्ला'],
    correct: 1,
    hint: 'हा गड जुन्नर (पुणे जिल्हा) जवळ असून शिवाई देवीच्या मंदिरावरून महाराजांचे नाव ठेवण्यात आले.',
    explanation: 'छत्रपती शिवाजी महाराजांचा जन्म १९ फेब्रुवारी १६३० रोजी पुणे जिल्ह्यातील जुन्नर जवळील किल्ले शिवनेरीवर झाला. शिवाई देवीच्या आशीर्वादाने जन्म झाला म्हणून त्यांचे नाव "शिवाजी" ठेवले गेले.',
    source: 'Jedhe Shakavali, Sabhasad Bakhar'
  },
  {
    id: 'SHIV-00002',
    category: 'Chhatrapati Shivaji Maharaj',
    level: 'प्राथमिक',
    question_type: 'mcq',
    question: 'वयाच्या अवघ्या १६ व्या वर्षी शिवरायांनी कोणता किल्ला जिंकून स्वराज्याचे पहिले तोरण बांधले?',
    options: ['तोरणा (प्रचंडगड)', 'कोंढाणा', 'पुरंदर', 'रोहिडा'],
    correct: 0,
    hint: 'हा गड पुण्याच्या नैऋत्येस वेल्हे तालुक्यात असून महाराजांनी त्याचे नाव "प्रचंडगड" ठेवले होते.',
    explanation: '१६४६ मध्ये अवघ्या १६ व्या वर्षी शिवरायांनी तोरणा किल्ला जिंकून हिंदवी स्वराज्याची अधिकृत मुहूर्तमेढ रोवली आणि गडाचे नाव "प्रचंडगड" ठेवले.',
    source: 'Sabhasad Bakhar'
  },
  {
    id: 'SHIV-00003',
    category: 'Chhatrapati Shivaji Maharaj',
    level: 'मध्यम',
    question_type: 'chronology',
    question: 'छत्रपती शिवाजी महाराजांचा पहिला भव्य राज्याभिषेक सोहळा कोणत्या दिवशी व कोणत्या गडावर संपन्न झाला?',
    options: ['६ जून १६७४ — दुर्गराज रायगड', '२४ फेब्रुवारी १६७० — शिवनेरी', '१२ मे १६८० — राजगड', '६ जून १६८२ — प्रतापगड'],
    correct: 0,
    hint: 'या सोहळ्याचे मुख्य पुरोहित काशीचे महापंडित गागाभट्ट होते.',
    explanation: '६ जून १६७४ रोजी ज्येष्ठ शुद्ध त्रयोदशीला दुर्गराज रायगडावर छत्रपती शिवरायांचा वैदिक राज्याभिषेक गागाभट्टांच्या हस्ते झाला आणि स्वतंत्र सार्वभौम "हिंदवी स्वराज्य" अधिकृतरीत्या प्रस्थापित झाले.',
    source: 'Sabhasad Bakhar'
  },
  {
    id: 'SAMB-00001',
    category: 'Chhatrapati Sambhaji Maharaj',
    level: 'मध्यम',
    question_type: 'who_am_i',
    question: 'छत्रपती संभाजी महाराजांनी संस्कृत भाषेत रचलेला जगप्रसिद्ध राजनीतिपर ग्रंथ कोणता?',
    options: ['बुधभूषणम्', 'शिवभारत', 'राजनितीसार', 'राधामाधव विलास चंपू'],
    correct: 0,
    hint: 'हा ग्रंथ शंभूराजांनी वयाच्या अवघ्या १४ व्या वर्षी रचला होता.',
    explanation: 'छत्रपती संभाजी महाराज केवळ रणधुरंधर नव्हते तर प्रकांड संस्कृत पंडित होते. त्यांनी वयाच्या १४ व्या वर्षी राजनीति, समाजशास्त्र आणि राजाच्या कर्तव्यांवर "बुधभूषणम्" हा अमर ग्रंथ लिहिला.',
    source: 'Budhabhushanam, Shakavali'
  },
  {
    id: 'FORT-00001',
    category: 'Forts & Fort Architecture',
    level: 'मध्यम',
    question_type: 'fort_geo',
    question: 'अरबी समुद्रातील अजिंक्य जलदुर्ग "सिंधुदुर्ग" शिवरायांनी कोणत्या बेटावर आणि कोणत्या वर्षी उभारला?',
    options: ['कुरटे बेट (मालवण) — १६६४', 'खांदेरी बेट — १६७९', 'कासा बेट — १६८०', 'पद्मदुर्ग — १६७६'],
    correct: 0,
    hint: 'या किल्ल्याच्या बांधकामात शिराळ्याचा चुनखडी दगड व शिसे वापरले गेले असून शिवरायांच्या हाताचे व पायाचे ठसे येथे आहेत.',
    explanation: 'मालवण जवळील कुरटे बेटावर २५ नोव्हेंबर १६६४ रोजी सिंधुदुर्ग किल्ल्याची पायाभरणी झाली. हा जलदुर्ग सुमारे ४८ एकरांवर पसरलेला असून ४२ अभेद्य बुरुजांनी वेढलेला आहे.',
    source: 'Maharashtra State Gazetteer (Ratnagiri)'
  },
  {
    id: 'BATL-00001',
    category: 'Battles & Military Campaigns',
    level: 'प्रगत',
    question_type: 'mcq',
    question: 'खुद्द मोगल सैन्याविरुद्ध समोरासमोर मैदानी युद्धात मराठ्यांनी मिळवलेला सर्वात मोठा निर्णायक ऐतिहासिक विजय कोणता?',
    options: ['साल्हेरची लढाई (१६७२)', 'उंबरखिंडीची लढाई (१६६१)', 'नेत्रावतीची लढाई', 'वडगावची लढाई'],
    correct: 0,
    hint: 'नाशिक जिल्ह्यातील बागलाण प्रांतात झालेल्या या लढाईत १ लाखाहून अधिक सैन्याची समोरासमोर लढत झाली होती.',
    explanation: 'जानेवारी १६७२ ची साल्हेरची लढाई ही मराठा इतिहासातील समोरासमोर मैदानी लढाईत मोगल सैन्याला धूळ चारलेली सर्वांत मोठी लढाई मानली जाते, ज्यात प्रतापराव गुजर व मोरोपंतांनी मोगलांचा धुव्वा उडवला.',
    source: 'Jedhe Shakavali'
  },
  {
    id: 'PESH-00001',
    category: 'Peshwas',
    level: 'मध्यम',
    question_type: 'mcq',
    question: '४१ लढाया लढून एकही लढाई न हरणारे आणि शनिवार वाड्याची उभारणी करणारे पराक्रमी सेनापती कोण?',
    options: ['श्रीमंत थोरले बाजीराव पेशवे', 'चिमाजी आप्पा', 'माधवराव पेशवे', 'नानासाहेब पेशवे'],
    correct: 0,
    hint: 'पालखेड व भोपाळच्या लढाईत आपल्या वेगवान अश्वदलाने त्यांनी निजामाचा व मोगलांचा पाडाव केला.',
    explanation: 'श्रीमंत बाजीराव पेशवे (थोरले) यांनी ४१ लढायांमध्ये एकही पराभव न स्वीकारता मराठा साम्राज्याचा झेंडा नर्मदेपार नेला. १७३० मध्ये त्यांनी पुण्यात ऐतिहासिक शनिवार वाड्याची पायाभरणी केली.',
    source: 'Peshwa Chronology'
  },
  {
    id: 'ADMN-00001',
    category: 'Maratha Administration',
    level: 'मध्यम',
    question_type: 'mcq',
    question: 'छत्रपती शिवरायांच्या अष्टप्रधान मंडळात "पंत अमात्य" (मुजुमदार) यांचे मुख्य कार्य काय होते?',
    options: ['स्वराज्याचा जमाखर्च, वित्त व अर्थव्यवस्थेचे नियमन', 'केवळ तोफांची देखरेख', 'सैन्याची गुप्तहेरगिरी', 'परकीय राजांना पत्रे पाठवणे'],
    correct: 0,
    hint: 'रामचंद्र नीलकंठ अमात्य यांनी हे पद भूषविले आणि "आज्ञापत्र" हा राजनीतिपर ग्रंथ लिहिला.',
    explanation: 'पंत अमात्य (मुजुमदार) यांच्याकडे स्वराज्याचा सर्व जमाखर्च, करआकारणी आणि तिजोरीचे नियमन करण्याची सर्वोच्च जबाबदारी होती.',
    source: 'Sabhasad Bakhar'
  },
  {
    id: 'NAVY-00001',
    category: 'Maratha Navy',
    level: 'प्राथमिक',
    question_type: 'mcq',
    question: 'भारतीय आरमाराचे जनक (Father of Indian Navy) कोणास मानले जाते?',
    options: ['छत्रपती शिवाजी महाराज', 'कान्होजी आंग्रे', 'मायनाक भंडारी', 'छत्रपती संभाजी महाराज'],
    correct: 0,
    hint: 'समुद्रावरील परकीय सत्तांचा धोका ओळखून स्वतंत्र आरमार व लढाऊ जहाजांचा ताफा सर्वप्रथम यांनीच तयार केला.',
    explanation: 'छत्रपती शिवाजी महाराजांनी समुद्राचे महत्त्व ओळखून गुराब, तरांडी, पाल, मचवा अशी ५०० पेक्षा जास्त लढाऊ जहाजे तयार केली आणि स्वतंत्र नौदल उभारले. म्हणूनच त्यांना भारतीय नौदलाचे जनक मानले जाते.',
    source: 'Father of Indian Navy Commemoration'
  },
  {
    id: 'WARR-00001',
    category: 'Maratha Warriors & Commanders',
    level: 'प्राथमिक',
    question_type: 'mcq',
    question: '"गड आला पण सिंह गेला!" हे अजरामर उद्गार शिवरायांनी कोणत्या निष्ठावंत वीराच्या बलिदानानंतर काढले?',
    options: ['नरवीर तानाजी मालुसरे', 'बाजी प्रभू देशपांडे', 'मुरारबाजी देशपांडे', 'शिवा काशीद'],
    correct: 0,
    hint: '४ फेब्रुवारी १६७० रोजी कोंढाणा किल्ल्यावर उदयभान विरुद्ध लढताना त्यांना वीरमरण आले.',
    explanation: 'कोंढाणा मोहिमेवर उदयभानशी निकराने लढताना नरवीर तानाजी मालुसरे धारातीर्थी पडले. किल्ला जिंकल्याची बातमी मिळताच शिवरायांनी दुःखाने उद्गार काढले — "गड आला पण सिंह गेला!"',
    source: 'Powada Tulsidas'
  }
];

const initialLeaderboard = [
  { rank: 1, name: 'ओंकार भोसले', city: 'सातारा', score: '१००%', points: 280, badge: 'स्वराज्य इतिहास भूषण 🎖️' },
  { rank: 2, name: 'संभाजीराव जगताप', city: 'पुणे', score: '१००%', points: 275, badge: 'स्वराज्य इतिहास भूषण 🎖️' },
  { rank: 3, name: 'प्रियांका मोरे', city: 'कोल्हापूर', score: '९५%', points: 260, badge: 'रणमर्द सरदार ⚔️' },
  { rank: 4, name: 'दिग्विजय गायकवाड', city: 'छ. संभाजीनगर', score: '९०%', points: 245, badge: 'रणमर्द सरदार ⚔️' },
  { rank: 5, name: 'अनिकेत कदम', city: 'रायगड', score: '९०%', points: 240, badge: 'रणमर्द सरदार ⚔️' },
  { rank: 6, name: 'स्नेहल पवार', city: 'नाशिक', score: '८५%', points: 220, badge: 'जागृत मावळा 🛡️' }
];

export default function MarathaQuizPage() {
  // Quiz Configuration State
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('सर्व');
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [dbStats, setDbStats] = useState({ total_questions: 20500, categories: {} });
  
  // Game Play State
  const [quizStarted, setQuizStarted] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answeredState, setAnsweredState] = useState(false);
  const [userScore, setUserScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userAnswersHistory, setUserAnswersHistory] = useState([]);
  
  // Certificate State
  const [candidateName, setCandidateName] = useState('मावळा / शिवभक्त');
  const [certificateDate, setCertificateDate] = useState('');
  const [certId, setCertId] = useState('');
  
  // Daily Trivia
  const [dailyAnswered, setDailyAnswered] = useState(false);
  const [dailySelected, setDailySelected] = useState(null);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  // Fetch Database Live Stats on Load
  useEffect(() => {
    fetch('/api/quiz/stats')
      .then(res => res.json())
      .then(data => {
        if (data && data.total_questions) {
          setDbStats(data);
        }
      })
      .catch(err => console.log('Stats fallback active:', err));
  }, []);

  // Helper to initialize session
  const initializeQuizWithQuestions = (qList) => {
    setActiveQuestions(qList);
    setCurrentIndex(0);
    setUserScore(0);
    setStreak(0);
    setMaxStreak(0);
    setSelectedAnswer(null);
    setAnsweredState(false);
    setShowHint(false);
    setUserAnswersHistory([]);
    setQuizCompleted(false);
    setQuizStarted(true);
    setTimeLeft(30);
    setTimerActive(true);

    setTimeout(() => {
      const el = document.getElementById('quiz-play-box');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Start Quiz (Queries live backend with 20,500 questions or fallback)
  const startQuiz = async () => {
    setLoading(true);
    try {
      const url = `/api/quiz/questions?category=${encodeURIComponent(selectedCategory)}&difficulty=${encodeURIComponent(selectedLevel)}&count=${questionCount}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          const formatted = data.questions.map(q => ({
            id: q.question_id,
            category: q.category,
            level: q.difficulty === 'easy' ? 'प्राथमिक' : q.difficulty === 'hard' ? 'प्रगत' : 'मध्यम',
            question_type: q.question_type,
            question: q.question,
            options: [q.option_a, q.option_b, q.option_c, q.option_d],
            correct: q.correct_answer === 'option_a' ? 0 : q.correct_answer === 'option_b' ? 1 : q.correct_answer === 'option_c' ? 2 : 3,
            explanation: q.explanation,
            hint: q.historical_period || q.person || q.fort || 'महाराष्ट्र गॅझेटिअर व जेधे शकावली संदर्भ.',
            source: q.source,
            year: q.year
          }));
          setLoading(false);
          initializeQuizWithQuestions(formatted);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend API connection fallback to local:', err);
    }
    
    // Offline local fallback
    setLoading(false);
    let pool = [...fallbackQuestions];
    if (selectedCategory !== 'ALL') {
      pool = pool.filter(q => q.category.includes(selectedCategory) || selectedCategory.includes(q.category));
      if (pool.length === 0) pool = [...fallbackQuestions];
    }
    const shuffled = pool.sort(() => 0.5 - Math.random()).slice(0, Math.min(questionCount, pool.length));
    initializeQuizWithQuestions(shuffled);
  };

  // Timer countdown
  useEffect(() => {
    if (quizStarted && !quizCompleted && timerActive && !answeredState) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [quizStarted, quizCompleted, timerActive, answeredState, currentIndex]);

  const handleTimeUp = () => {
    if (!answeredState) {
      setAnsweredState(true);
      setStreak(0);
      const cur = activeQuestions[currentIndex];
      setUserAnswersHistory(prev => [
        ...prev,
        {
          question: cur.question,
          options: cur.options,
          correct: cur.correct,
          userChosen: null,
          isCorrect: false,
          explanation: cur.explanation,
          timedOut: true
        }
      ]);
    }
  };

  const handleSelectOption = (idx) => {
    if (answeredState) return;
    
    clearInterval(timerRef.current);
    setSelectedAnswer(idx);
    setAnsweredState(true);

    const cur = activeQuestions[currentIndex];
    const isRight = idx === cur.correct;

    if (isRight) {
      setUserScore(prev => prev + 10 + (streak * 2));
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
    } else {
      setStreak(0);
    }

    setUserAnswersHistory(prev => [
      ...prev,
      {
        question: cur.question,
        options: cur.options,
        correct: cur.correct,
        userChosen: idx,
        isCorrect: isRight,
        explanation: cur.explanation
      }
    ]);
  };

  const handleNextQuestion = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setAnsweredState(false);
      setShowHint(false);
      setTimeLeft(30);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setQuizCompleted(true);
    setTimerActive(false);
    
    const today = new Date();
    const dStr = today.toLocaleDateString('mr-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    setCertificateDate(dStr);
    const randCode = 'CM-QZ-' + Math.floor(100000 + Math.random() * 900000);
    setCertId(randCode);

    // Record submission to server
    const correctC = userAnswersHistory.filter(h => h.isCorrect).length + (selectedAnswer === activeQuestions[currentIndex]?.correct ? 1 : 0);
    const pct = activeQuestions.length > 0 ? Math.round((correctC / activeQuestions.length) * 100) : 0;
    const r = getRankBadge(pct);

    fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate_name: candidateName || 'मावळा / शिवभक्त',
        city: 'महाराष्ट्र',
        category: selectedCategory,
        score: correctC,
        total: activeQuestions.length,
        points: userScore,
        streak: maxStreak,
        rank_title: r.title
      })
    }).catch(e => console.warn('Score submission background log:', e));

    setTimeout(() => {
      const el = document.getElementById('quiz-result-view');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const correctCount = userAnswersHistory.filter(h => h.isCorrect).length;
  const percentage = activeQuestions.length > 0 ? Math.round((correctCount / activeQuestions.length) * 100) : 0;

  const getRankBadge = (pct) => {
    if (pct >= 90) return { title: 'स्वराज्य इतिहास भूषण', icon: '🎖️', color: '#16a34a', desc: 'छत्रपती शिवरायांच्या इतिहासाचे गाढे अभ्यासक व विद्वान!' };
    if (pct >= 70) return { title: 'रणमर्द शूर सरदार', icon: '⚔️', color: '#ea580c', desc: 'मराठा इतिहासाची अचूक जाण व रणनीतीकार ज्ञान!' };
    if (pct >= 50) return { title: 'जागृत मावळा', icon: '🛡️', color: '#0284c7', desc: 'चांगले ज्ञान! आणखी सखोल वाचनाने आपण सरदार पद गाठू शकता.' };
    return { title: 'उत्साही इतिहास अभ्यासक', icon: '📖', color: '#7c3aed', desc: 'इतिहास जाणून घेण्याची चांगली सुरुवात. पुन्हा प्रयत्न करा!' };
  };

  const rank = getRankBadge(percentage);

  const shareOnWhatsapp = () => {
    const text = `🚩 *कनेक्ट मराठा — इतिहास महाक्विझ निकाल* 🚩%0A%0Aमी छत्रपती शिवराय व मराठा स्वराज्य इतिहास क्विझमध्ये *${percentage}% (${correctCount}/${activeQuestions.length})* गुण मिळवून *"${rank.title}"* पदवी पटकावली आहे! 🏆%0A%0Aतुम्हीही तुमची इतिहास जाण तपासा: ${window.location.origin}/quiz`;
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const currentQ = activeQuestions[currentIndex];

  const getTypeLabel = (type) => {
    switch (type) {
      case 'who_am_i': return '👤 ओळखा मी कोण?';
      case 'chronology': return '📅 कालानुक्रम व दिनविशेष';
      case 'fort_geo': return '🏰 दुर्ग व भूगोल';
      case 'statement': return '📜 ऐतिहासिक विधान पडताळणी';
      default: return '❓ बहुपर्यायी प्रश्न';
    }
  };

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Breadcrumbs Bar */}
      <div className="breadcrumbs-bar" style={{ background: '#FFF8F0', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '10px 24px', fontSize: '0.88rem' }}>
          <Link to="/" style={{ color: 'var(--maroon-900)', textDecoration: 'none', fontWeight: 600 }}>🏠 होम</Link>
          <span style={{ margin: '0 8px', color: '#9ca3af' }}>›</span>
          <Link to="/history" style={{ color: 'var(--maroon-900)', textDecoration: 'none' }}>इतिहास व वारसा</Link>
          <span style={{ margin: '0 8px', color: '#9ca3af' }}>›</span>
          <span style={{ fontWeight: 700, color: 'var(--ink)' }}>🎯 स्वराज्य इतिहास महाक्विझ (२०,०००+ प्रश्न बँक)</span>
        </div>
      </div>

      {/* War Cry Banner */}
      <div className="war-cry-strip" style={{ background: 'linear-gradient(90deg, #C73800, #E65100, #C73800)', color: '#FFFFFF', padding: '10px 16px', textAlign: 'center', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.5px' }}>
        <span style={{ margin: '0 10px' }}>🔥</span>
        <span>|| निश्चयाचा महामेरु। बहुत जनांसी आधारु। अखंड स्थितीचा निर्धारु। श्रीमंत योगी॥ ||</span>
        <span style={{ margin: '0 10px' }}>🔥</span>
      </div>

      {/* Hero Section */}
      <div className="hero" style={{ position: 'relative', overflow: 'hidden', padding: '48px 24px', background: 'radial-gradient(circle at 80% 30%, rgba(230,81,0,0.88), rgba(43,24,16,0.96) 85%)', color: '#FFFFFF' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,216,168,0.3)', borderRadius: '30px', padding: '6px 16px', fontSize: '0.85rem', fontWeight: 700, color: '#FFD8A8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
            <span>🎯</span> राष्ट्रीय मराठा प्रश्नमंजुषा · १३ अधिकृत ज्ञान दालने
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 3.8vw, 3.2rem)', fontFamily: 'Baloo 2, sans-serif', fontWeight: 800, lineHeight: 1.2, margin: '0 0 14px 0', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            छत्रपती शिवराय व स्वराज्य इतिहास महाक्विझ
          </h1>

          <p style={{ fontSize: '1.15rem', maxWidth: '75ch', color: '#FFF8F2', lineHeight: 1.6, marginBottom: '28px' }}>
            अखंड मराठा साम्राज्य, ३५०+ अभेद्य दुर्ग, जागतिक दर्जाची गनिमी कावा युद्धनीती, पेशवे कालखंड आणि धर्मवीरांच्या बलिदानाचा सप्रमाण इतिहास. <strong>२०,०००+ सप्रमाण प्रश्न बँक</strong> मधून आपली ऐतिहासिक जाण तपासा आणि <strong>"स्वराज्य इतिहास भूषण"</strong> अधिकृत डिजिटल प्रमाणपत्र संपादन करा!
          </p>

          {/* Quick Stats Grid with dynamic SQLite counts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', maxWidth: '960px' }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '14px 18px' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFD8A8' }}>{(dbStats.total_questions || 20500).toLocaleString('en-IN')}+</div>
              <div style={{ fontSize: '0.85rem', color: '#FEE2E2' }}>सप्रमाण ऐतिहासिक प्रश्न</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '14px 18px' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFD8A8' }}>१३ दालने</div>
              <div style={{ fontSize: '0.85rem', color: '#FEE2E2' }}>शिवराय, दुर्ग, पेशवे, आरमार</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '14px 18px' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFD8A8' }}>१००% सप्रमाण</div>
              <div style={{ fontSize: '0.85rem', color: '#FEE2E2' }}>गॅझेटिअर व बखर संदर्भ</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '14px 18px' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFD8A8' }}>लाइव्ह</div>
              <div style={{ fontSize: '0.85rem', color: '#FEE2E2' }}>महाराष्ट्र गुणवत्ता यादी</div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Interactive Workspace Area */}
      <div style={{ maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '36px 20px', flex: 1 }}>

        {/* 1. QUIZ CONFIGURATION & START PANEL (If quiz not started) */}
        {!quizStarted && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', marginBottom: '40px' }}>
            
            {/* Left Card: Select Mode & Filters */}
            <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '32px', border: '1px solid var(--line)', boxShadow: '0 8px 30px rgba(230,81,0,0.08)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '2px solid #FFE0B2', paddingBottom: '12px' }}>
                <span style={{ fontSize: '1.6rem' }}>⚙️</span>
                <div>
                  <h2 style={{ fontFamily: 'Baloo 2', color: 'var(--maroon-900)', fontSize: '1.35rem', margin: 0, fontWeight: 700 }}>
                    २०,०००+ प्रश्न बँकेतून विषय निवडा
                  </h2>
                  <span style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>आपल्या आवडीनुसार १३ ऐतिहासिक दालनांमधून प्रश्न निवडा</span>
                </div>
              </div>

              {/* 13 Official Categories Picker */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)', marginBottom: '8px' }}>
                  ऐतिहासिक दालन (Category):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                  {OFFICIAL_CATEGORIES.map((cat, i) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        style={{
                          padding: '9px 12px',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid var(--maroon-800)' : '1px solid #E5E7EB',
                          background: isSelected ? '#FFF3E0' : '#FFFFFF',
                          color: isSelected ? 'var(--maroon-900)' : '#374151',
                          fontWeight: isSelected ? 800 : 500,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '6px',
                          boxShadow: isSelected ? '0 2px 10px rgba(230,81,0,0.15)' : 'none',
                          textAlign: 'left'
                        }}
                      >
                        <span style={{ lineHeight: 1.2 }}>{cat.label}</span>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: isSelected ? 'var(--maroon-800)' : '#F3F4F6',
                          color: isSelected ? '#FFFFFF' : '#4B5563',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          whiteSpace: 'nowrap'
                        }}>
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty Level Picker */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)', marginBottom: '8px' }}>
                  काठिण्य पातळी (Level):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {[
                    { label: 'सर्व स्तर', val: 'सर्व', desc: 'मिश्रित प्रश्न' },
                    { label: 'प्राथमिक', val: 'easy', desc: 'मावळा स्तर' },
                    { label: 'मध्यम / प्रगत', val: 'medium', desc: 'सरदार स्तर' }
                  ].map((lvl, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedLevel(lvl.val)}
                      style={{
                        border: selectedLevel === lvl.val ? '2px solid var(--maroon-800)' : '1px solid #E5E7EB',
                        background: selectedLevel === lvl.val ? '#FFF8F0' : '#FAFAFA',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--maroon-900)' }}>{lvl.label}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{lvl.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Question Count */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)', marginBottom: '8px' }}>
                  प्रश्नांची संख्या (Number of Questions):
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[5, 10, 15, 20].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setQuestionCount(cnt)}
                      style={{
                        flex: 1,
                        padding: '9px',
                        borderRadius: '10px',
                        border: questionCount === cnt ? '2px solid var(--maroon-800)' : '1px solid #E5E7EB',
                        background: questionCount === cnt ? 'var(--maroon-800)' : '#FFFFFF',
                        color: questionCount === cnt ? '#FFFFFF' : '#374151',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        cursor: 'pointer'
                      }}
                    >
                      {cnt} प्रश्न
                    </button>
                  ))}
                </div>
              </div>

              {/* Launch Quiz Button */}
              <button
                type="button"
                disabled={loading}
                onClick={startQuiz}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  background: 'linear-gradient(135deg, #E65100, #BF360C)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  cursor: loading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 20px rgba(230,81,0,0.3)',
                  transition: 'transform 0.15s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span>🚩</span>
                <span>{loading ? 'प्रश्न बँक लोड होत आहे...' : 'महाक्विझ आता सुरू करा'}</span>
                <span>→</span>
              </button>

              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.8rem', color: '#6B7280' }}>
                ⚡ २०,५००+ प्रश्नांमधून थेट रँडम निवड · प्रत्येक प्रश्नाला ३० सेकंद
              </div>

            </div>

            {/* Right Card: Daily Trivia & Rules */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Daily Question Box */}
              <div style={{ background: '#FFF8F0', borderRadius: '18px', padding: '28px', border: '1px solid #FFE0B2', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.4rem' }}>💡</span>
                    <h3 style={{ fontFamily: 'Baloo 2', color: 'var(--maroon-900)', fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>
                      आजचा ऐतिहासिक प्रश्न (Daily Trivia)
                    </h3>
                  </div>
                  <span style={{ background: '#FFEDD5', color: '#C2410C', fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>
                    २३ सप्टेंबर दिनविशेष
                  </span>
                </div>

                <p style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '0.98rem', marginBottom: '14px', lineHeight: 1.5 }}>
                  छत्रपती शिवाजी महाराजांच्या पाठीवर शिवनेरीवर आई जिजाऊंनी कोणत्या देवतेची प्रार्थना करून बाल शिवबांना घडवले?
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  {['भवानी माता', 'शिवाई देवी', 'तुळजापूर माता', 'अंबाबाई'].map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setDailySelected(idx); setDailyAnswered(true); }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: dailyAnswered 
                          ? idx === 1 
                            ? '2px solid #16A34A' 
                            : dailySelected === idx ? '2px solid #DC2626' : '1px solid #E5E7EB'
                          : '1px solid #CBD5E1',
                        background: dailyAnswered
                          ? idx === 1 ? '#DCFCE7' : dailySelected === idx ? '#FEE2E2' : '#FFFFFF'
                          : '#FFFFFF',
                        color: dailyAnswered && idx === 1 ? '#15803D' : '#1F2937',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        cursor: dailyAnswered ? 'default' : 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      {idx + 1}. {opt} {dailyAnswered && idx === 1 && '✓'}
                    </button>
                  ))}
                </div>

                {dailyAnswered && (
                  <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem', color: '#166534', lineHeight: 1.5 }}>
                    <strong>सत्य माहिती:</strong> शिवनेरी गडावरील शिवाई देवीच्या मंदिरावरून जिजाऊ मासाहेबांनी पुत्राचे नाव "शिवाजी" ठेवले.
                  </div>
                )}
              </div>

              {/* 20,000 Questions Architecture Summary Card */}
              <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '24px', border: '1px solid var(--line)', flex: 1 }}>
                <h3 style={{ fontFamily: 'Baloo 2', color: 'var(--maroon-900)', fontSize: '1.15rem', marginBottom: '12px', fontWeight: 700 }}>
                  📜 २०,०००+ प्रश्न बँक रचना व संदर्भ
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem', color: 'var(--ink-soft)', marginBottom: '14px' }}>
                  <div style={{ background: '#F8FAFC', padding: '8px', borderRadius: '6px' }}>👑 शिवराय: ४,०००</div>
                  <div style={{ background: '#F8FAFC', padding: '8px', borderRadius: '6px' }}>⚔️ संभाजी महाराज: २,५००</div>
                  <div style={{ background: '#F8FAFC', padding: '8px', borderRadius: '6px' }}>🐎 पेशवे: २,५००</div>
                  <div style={{ background: '#F8FAFC', padding: '8px', borderRadius: '6px' }}>🗡️ सरदार: २,५००</div>
                  <div style={{ background: '#F8FAFC', padding: '8px', borderRadius: '6px' }}>🏰 गडकोट: १,५००</div>
                  <div style={{ background: '#F8FAFC', padding: '8px', borderRadius: '6px' }}>🔥 रणसंग्राम: १,५००</div>
                  <div style={{ background: '#F8FAFC', padding: '8px', borderRadius: '6px' }}>🛡️ राजाराम महाराज: १,५००</div>
                  <div style={{ background: '#F8FAFC', padding: '8px', borderRadius: '6px' }}>🦁 महाराणी ताराबाई: १,०००</div>
                </div>

                <div style={{ paddingTop: '10px', borderTop: '1px dashed #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>महाराष्ट्र गॅझेटिअर सप्रमाण डेटाबेस</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--maroon-900)' }}>🎖️ २१-फील्ड पडताळणी</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 2. LIVE QUIZ PLAY ENGINE (When quiz is active and not completed) */}
        {quizStarted && !quizCompleted && currentQ && (
          <div id="quiz-play-box" style={{ maxWidth: '880px', margin: '0 auto 40px auto' }}>
            
            {/* Top Bar with Question Count, Streak, Points & Timer */}
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '16px 24px', border: '1px solid var(--line)', marginBottom: '18px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ background: '#FFF3E0', color: 'var(--maroon-900)', padding: '6px 14px', borderRadius: '20px', fontWeight: 800, fontSize: '0.9rem' }}>
                  प्रश्न {currentIndex + 1} / {activeQuestions.length}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 600 }}>
                  दालन: <strong style={{ color: 'var(--ink)' }}>{currentQ.category}</strong>
                </span>
                <span style={{ background: '#F3F4F6', color: '#374151', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                  {getTypeLabel(currentQ.question_type)}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {streak > 1 && (
                  <div style={{ background: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>🔥</span> Streak: {streak}x
                  </div>
                )}
                
                <div style={{ fontWeight: 700, color: 'var(--maroon-900)', fontSize: '0.95rem' }}>
                  गुण: <span style={{ color: '#16A34A', fontSize: '1.1rem' }}>{userScore}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: timeLeft <= 5 ? '#FEE2E2' : '#F3F4F6', color: timeLeft <= 5 ? '#DC2626' : '#374151', padding: '4px 12px', borderRadius: '16px', fontWeight: 800, fontSize: '0.9rem' }}>
                  <span>⏱️</span> {timeLeft}s
                </div>
              </div>

            </div>

            {/* Progress Bar */}
            <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden', marginBottom: '22px' }}>
              <div style={{ height: '100%', width: `${((currentIndex + 1) / activeQuestions.length) * 100}%`, background: 'linear-gradient(90deg, #E65100, #F59E0B)', transition: 'width 0.3s ease' }}></div>
            </div>

            {/* Main Question Card */}
            <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '36px', border: '1px solid var(--line)', boxShadow: '0 10px 40px rgba(230,81,0,0.08)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>
                    QID: {currentQ.id || `Q-${currentIndex + 1}`}
                  </span>
                  <h2 style={{ fontFamily: 'Baloo 2, sans-serif', color: 'var(--maroon-900)', fontSize: 'clamp(1.25rem, 2.5vw, 1.6rem)', fontWeight: 700, lineHeight: 1.4, margin: 0 }}>
                    {currentQ.question}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  style={{ background: '#FEF9C3', border: '1px solid #FDE047', color: '#854D0E', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  💡 संकेत (Hint)
                </button>
              </div>

              {showHint && (
                <div style={{ background: '#FEFCE8', border: '1px dashed #FACC15', borderRadius: '10px', padding: '10px 16px', marginBottom: '22px', fontSize: '0.88rem', color: '#713F12' }}>
                  <strong>ऐतिहासिक संकेत:</strong> {currentQ.hint}
                </div>
              )}

              {/* 4 Interactive Options */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px', marginBottom: '28px' }}>
                {currentQ.options.map((opt, idx) => {
                  const letters = ['अ', 'ब', 'क', 'ड'];
                  const isCorrectChoice = idx === currentQ.correct;
                  const isUserSelection = idx === selectedAnswer;

                  let optBorder = '1px solid #E5E7EB';
                  let optBg = '#FFFFFF';
                  let optColor = '#1F2937';

                  if (answeredState) {
                    if (isCorrectChoice) {
                      optBorder = '2px solid #16A34A';
                      optBg = '#DCFCE7';
                      optColor = '#15803D';
                    } else if (isUserSelection) {
                      optBorder = '2px solid #DC2626';
                      optBg = '#FEE2E2';
                      optColor = '#B91C1C';
                    } else {
                      optBg = '#F9FAFB';
                      optColor = '#9CA3AF';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={answeredState}
                      onClick={() => handleSelectOption(idx)}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: optBorder,
                        background: optBg,
                        color: optColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: answeredState ? 'default' : 'pointer',
                        textAlign: 'left',
                        fontSize: '1.05rem',
                        fontWeight: isUserSelection || (answeredState && isCorrectChoice) ? 700 : 500,
                        transition: 'all 0.15s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                      }}
                      onMouseOver={(e) => {
                        if (!answeredState) e.currentTarget.style.borderColor = 'var(--maroon-800)';
                      }}
                      onMouseOut={(e) => {
                        if (!answeredState) e.currentTarget.style.borderColor = '#E5E7EB';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: answeredState && isCorrectChoice ? '#16A34A' : answeredState && isUserSelection ? '#DC2626' : '#F3F4F6',
                          color: answeredState && (isCorrectChoice || isUserSelection) ? '#FFFFFF' : '#374151',
                          fontWeight: 700,
                          fontSize: '0.88rem'
                        }}>
                          {letters[idx]}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {answeredState && isCorrectChoice && (
                        <span style={{ color: '#16A34A', fontWeight: 800, fontSize: '1.2rem' }}>✓ अचूक</span>
                      )}
                      {answeredState && isUserSelection && !isCorrectChoice && (
                        <span style={{ color: '#DC2626', fontWeight: 800, fontSize: '1.2rem' }}>✗ चूक</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Historical Explanation Box (Revealed after answering) */}
              {answeredState && (
                <div style={{ background: '#FFF8F0', borderLeft: '4px solid var(--maroon-800)', borderRadius: '0 12px 12px 0', padding: '16px 20px', marginBottom: '28px', animation: 'fadeIn 0.3s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--maroon-900)', fontSize: '0.92rem', marginBottom: '6px' }}>
                    <span>📖</span> सविस्तर ऐतिहासिक संदर्भ व सत्य माहिती:
                  </div>
                  <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--ink)' }}>
                    {currentQ.explanation}
                  </p>
                  {currentQ.source && (
                    <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#6B7280' }}>
                      <strong>ऐतिहासिक स्रोत:</strong> {currentQ.source}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons: Next / Finish */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F3F4F6', paddingTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => { setQuizStarted(false); setQuizCompleted(false); }}
                  style={{ background: 'transparent', border: 'none', color: '#6B7280', fontSize: '0.88rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  ← क्विझ थांबवा व बाहेर पडा
                </button>

                {answeredState && (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    style={{
                      padding: '12px 28px',
                      background: 'linear-gradient(135deg, #E65100, #BF360C)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(230,81,0,0.25)'
                    }}
                  >
                    <span>{currentIndex < activeQuestions.length - 1 ? 'पुढील प्रश्न →' : 'निकाल व प्रमाणपत्र पहा 🏆'}</span>
                  </button>
                )}
              </div>

            </div>

          </div>
        )}

        {/* 3. QUIZ COMPLETION, SCORECARD & CERTIFICATE (When finished) */}
        {quizCompleted && (
          <div id="quiz-result-view" style={{ maxWidth: '960px', margin: '0 auto 40px auto' }}>
            
            {/* Scorecard Header */}
            <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '36px', border: '1px solid var(--line)', textAlign: 'center', marginBottom: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}>
              
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{rank.icon}</div>
              
              <div style={{ display: 'inline-block', background: '#FEF3C7', color: '#92400E', padding: '4px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px' }}>
                क्विझ पूर्ण झाली!
              </div>

              <h2 style={{ fontFamily: 'Baloo 2', color: 'var(--maroon-900)', fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px 0' }}>
                आपली उपाधी: {rank.title}
              </h2>

              <p style={{ color: 'var(--ink-soft)', fontSize: '1.05rem', maxWidth: '60ch', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
                {rank.desc}
              </p>

              {/* Statistics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', maxWidth: '720px', margin: '0 auto 30px auto' }}>
                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: rank.color }}>{percentage}%</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748B' }}>अचूकता (Accuracy)</div>
                </div>
                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--maroon-900)' }}>{correctCount} / {activeQuestions.length}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748B' }}>बरोबर उत्तरे</div>
                </div>
                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#B45309' }}>{userScore}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748B' }}>एकूण गुण (Points)</div>
                </div>
                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#DC2626' }}>{maxStreak}x 🔥</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748B' }}>सर्वोत्तम Streak</div>
                </div>
              </div>

              {/* Actions: Restart, WhatsApp Share, Scroll to Certificate */}
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <button
                  type="button"
                  onClick={shareOnWhatsapp}
                  style={{
                    padding: '12px 24px',
                    background: '#25D366',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(37,211,102,0.3)'
                  }}
                >
                  <span>📱</span> मित्रांना चॅलेंज करा (WhatsApp)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('digital-certificate-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{
                    padding: '12px 24px',
                    background: 'var(--maroon-800)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>📜</span> प्रमाणपत्र पहा व प्रिंट करा
                </button>

                <button
                  type="button"
                  onClick={startQuiz}
                  style={{
                    padding: '12px 24px',
                    background: '#FFFFFF',
                    color: 'var(--maroon-900)',
                    border: '2px solid var(--maroon-800)',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  🔄 पुन्हा नव्याने खेळा
                </button>
              </div>

            </div>

            {/* Official Digital Certificate Section */}
            <div id="digital-certificate-section" style={{ marginBottom: '40px' }}>
              
              <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '20px', border: '1px solid #E5E7EB', marginBottom: '16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '0.9rem' }}>
                    प्रमाणपत्रावरील नाव:
                  </label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="आपले संपूर्ण नाव प्रविष्ट करा"
                    style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', width: '260px', fontWeight: 600 }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handlePrintCertificate}
                  style={{
                    padding: '9px 18px',
                    background: '#1F2937',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>🖨️</span> प्रमाणपत्र प्रिंट / PDF डाऊनलोड करा
                </button>
              </div>

              {/* Printable Certificate Canvas Card */}
              <div
                className="certificate-card"
                style={{
                  background: '#FFFDF9',
                  border: '12px double #C73800',
                  borderRadius: '16px',
                  padding: '44px 36px',
                  boxShadow: '0 12px 50px rgba(0,0,0,0.08)',
                  position: 'relative',
                  textAlign: 'center'
                }}
              >
                {/* Header Crest */}
                <div style={{ marginBottom: '14px' }}>
                  <img src="/assets/images/logo.png" alt="Connect Maratha Seal" style={{ height: '70px', objectFit: 'contain', marginBottom: '8px' }} />
                  <div style={{ fontFamily: 'Baloo 2', fontSize: '1.4rem', fontWeight: 800, color: 'var(--maroon-900)', letterSpacing: '1px' }}>
                    कनेक्ट मराठा — इतिहास व वारसा परिषद
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#B45309', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                    || स्वराज्य ज्ञान व इतिहास गौरव पत्र ||
                  </div>
                </div>

                <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #E65100, transparent)', margin: '14px 0 24px 0' }}></div>

                <p style={{ fontSize: '1.05rem', color: '#4B5563', margin: 0 }}>
                  हे सन्मानपूर्वक प्रमाणित करण्यात येते की,
                </p>

                <h3 style={{ fontFamily: 'Baloo 2', fontSize: '2.4rem', fontWeight: 800, color: '#C73800', margin: '12px 0', textDecoration: 'underline', textUnderlineOffset: '8px' }}>
                  {candidateName || 'मावळा / शिवभक्त'}
                </h3>

                <p style={{ fontSize: '1.05rem', lineHeight: 1.7, maxWidth: '70ch', margin: '0 auto 24px auto', color: '#1F2937' }}>
                  यांनी <strong>छत्रपती शिवराय व मराठा स्वराज्य इतिहास महाक्विझ</strong> मध्ये अत्यंत प्रशंसनीय सहभाग नोंदवून <strong>{percentage}% ({correctCount}/{activeQuestions.length})</strong> गुणांसह उत्तीर्ण होऊन 
                  <strong style={{ color: 'var(--maroon-900)' }}> "{rank.title}" </strong> 
                  हा सर्वोच्च इतिहास गौरव सन्मान संपादन केला आहे.
                </p>

                {/* Certificate Bottom Verification Data */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '36px', borderTop: '1px solid #FDE68A', paddingTop: '20px' }}>
                  <div style={{ textAlign: 'left', fontSize: '0.82rem', color: '#6B7280' }}>
                    <div><strong>दिनांक:</strong> {certificateDate || '२३ सप्टेंबर २०२६'}</div>
                    <div><strong>प्रमाणपत्र क्रमांक:</strong> {certId}</div>
                    <div><strong>सत्यापित:</strong> connectmaratha.com/verify</div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', border: '3px dashed #C73800', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#C73800', fontSize: '0.7rem', fontWeight: 800, margin: '0 auto 4px auto' }}>
                      <span>🚩</span>
                      <span>शिवमुद्रा</span>
                      <span>सील</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>अधिकृत मुद्रा</span>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '0.82rem', color: '#6B7280' }}>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 700, color: '#1F2937' }}>छत्रपती विचार मंच</div>
                    <div><strong>संयोजक, कनेक्ट मराठा महाक्विझ</strong></div>
                    <div>महाराष्ट्र राज्य</div>
                  </div>
                </div>

              </div>

            </div>

            {/* Comprehensive Question-by-Question Review Accordion */}
            <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '30px', border: '1px solid var(--line)' }}>
              <h3 style={{ fontFamily: 'Baloo 2', color: 'var(--maroon-900)', fontSize: '1.35rem', fontWeight: 700, marginBottom: '20px' }}>
                📋 सर्व प्रश्नांचे सविस्तर पुनरावलोकन व संदर्भ
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {userAnswersHistory.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      border: `1px solid ${h.isCorrect ? '#86EFAC' : '#FCA5A5'}`,
                      background: h.isCorrect ? '#F0FDF4' : '#FEF2F2',
                      borderRadius: '12px',
                      padding: '16px 20px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#1F2937', fontSize: '0.98rem' }}>
                        {i + 1}. {h.question}
                      </span>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        background: h.isCorrect ? '#16A34A' : '#DC2626',
                        color: '#FFFFFF'
                      }}>
                        {h.isCorrect ? '✓ बरोबर (+१०)' : h.timedOut ? '⏱️ वेळ संपला' : '✗ चूक'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.88rem', color: '#4B5563', marginBottom: '6px' }}>
                      <strong>आपले उत्तर:</strong> {h.userChosen !== null ? h.options[h.userChosen] : 'उत्तर दिले नाही'}
                    </div>

                    <div style={{ fontSize: '0.88rem', color: '#15803D', fontWeight: 600, marginBottom: '8px' }}>
                      <strong>अचूक उत्तर:</strong> {h.options[h.correct]}
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#374151', background: '#FFFFFF', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', lineHeight: 1.5 }}>
                      <strong>संदर्भ:</strong> {h.explanation}
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

        {/* 4. REAL-TIME MAHARASHTRA LEADERBOARD SECTION */}
        <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '32px', border: '1px solid var(--line)', boxShadow: '0 6px 24px rgba(0,0,0,0.04)', marginBottom: '40px' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '22px', borderBottom: '2px solid #FFE0B2', paddingBottom: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>🏆</span>
                <h3 style={{ fontFamily: 'Baloo 2', color: 'var(--maroon-900)', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                  महाराष्ट्र राज्य इतिहास गुणवत्ता यादी (Leaderboard)
                </h3>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>सर्वोच्च गुण संपादन केलेले इतिहास अभ्यासक व मावळे</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ background: '#FFF3E0', color: 'var(--maroon-900)', fontSize: '0.8rem', fontWeight: 700, padding: '4px 12px', borderRadius: '14px' }}>
                या आठवड्यातील टॉपर्स
              </span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ background: '#FFF8F0', borderBottom: '2px solid #FFCC80', color: 'var(--maroon-900)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>रँक</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>इतिहास अभ्यासकाचे नाव</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>जिल्हा</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>अचूकता</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>गुण</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>पदवी</th>
                </tr>
              </thead>
              <tbody>
                {initialLeaderboard.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.15s ease' }} onMouseOver={(e) => { e.currentTarget.style.background = '#FFFDF9'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: row.rank === 1 ? '#D97706' : row.rank === 2 ? '#94A3B8' : row.rank === 3 ? '#B45309' : '#4B5563' }}>
                      {row.rank === 1 ? '🥇 #१' : row.rank === 2 ? '🥈 #२' : row.rank === 3 ? '🥉 #३' : `#${row.rank}`}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1F2937' }}>
                      {row.name}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4B5563' }}>
                      📍 {row.city}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#16A34A' }}>
                      {row.score}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--maroon-900)' }}>
                      {row.points} pts
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.82rem' }}>
                      <span style={{ background: '#FFF3E0', color: 'var(--maroon-900)', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>
                        {row.badge}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* 5. EXPLORE CONNECT MARATHA HERITAGE & HUBS (Prevents any bottom empty void) */}
        <div style={{ background: '#FFF8F0', borderRadius: '18px', padding: '32px', border: '1px solid #FFE0B2', marginBottom: '20px' }}>
          
          <h3 style={{ fontFamily: 'Baloo 2', color: 'var(--maroon-900)', fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px' }}>
            🚩 इतिहास व वारसा अधिक एक्सप्लोर करा
          </h3>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.9rem', marginBottom: '20px' }}>
            क्विझच्या अभ्यासासाठी आणि मराठा साम्राज्याच्या सविस्तर माहितीसाठी आमची अधिकृत दालने पहा:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <Link
              to="/forts"
              style={{ textDecoration: 'none', background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '6px', color: 'inherit' }}
            >
              <div style={{ fontSize: '1.4rem' }}>🏰</div>
              <div style={{ fontWeight: 700, color: 'var(--maroon-900)' }}>सह्याद्रीचे ३५०+ गड-किल्ले</div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>नकाशा, इतिहास व ट्रेकिंग माहिती</div>
            </Link>

            <Link
              to="/history/battles"
              style={{ textDecoration: 'none', background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '6px', color: 'inherit' }}
            >
              <div style={{ fontSize: '1.4rem' }}>⚔️</div>
              <div style={{ fontWeight: 700, color: 'var(--maroon-900)' }}>प्रमुख ७ रणांगणे व युद्धनीती</div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>गनिमी कावा व रणनीती विश्लेषण</div>
            </Link>

            <Link
              to="/history/navy"
              style={{ textDecoration: 'none', background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '6px', color: 'inherit' }}
            >
              <div style={{ fontSize: '1.4rem' }}>⚓</div>
              <div style={{ fontWeight: 700, color: 'var(--maroon-900)' }}>मराठा आरमार व जलदुर्ग</div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>भारतीय आरमाराची शौर्यगाथा</div>
            </Link>

            <Link
              to="/history/granthalaya"
              style={{ textDecoration: 'none', background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '6px', color: 'inherit' }}
            >
              <div style={{ fontSize: '1.4rem' }}>📚</div>
              <div style={{ fontWeight: 700, color: 'var(--maroon-900)' }}>मराठा ग्रंथालय व बखरी</div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>मूळ ऐतिहासिक कागदपत्रे व ग्रंथ</div>
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
