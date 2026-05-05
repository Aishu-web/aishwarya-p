import React, { useState, useEffect } from 'react';
import { 
  auth, 
  db 
} from './firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider,
  User
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDocFromServer,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  writeBatch
} from 'firebase/firestore';
import { askExpertAi, generateDetailedProtocol, fetchAgriNews, translateText, generateTipImage, generateSummary } from './services/geminiService';
import { registerFcmToken } from './services/fcmService';
import { fetchWeather, WeatherData } from './services/weatherService';
import { CROP_CALENDAR, CropCalendarEntry } from './constants/cropCalendar';
import ReactMarkdown from 'react-markdown';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  Search, 
  Menu, 
  User as UserIcon, 
  Camera, 
  Sprout, 
  History, 
  Languages, 
  Filter,
  ChevronRight,
  ChevronLeft,
  X,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Zap,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Navigation,
  ThumbsUp,
  ThumbsDown,
  Star,
  Flag,
  Check,
  FileText,
  Quote,
  Settings,
  Plus,
  ArrowUp,
  ArrowDown,
  AlertTriangle
} from 'lucide-react';
import { Tip, SuccessStory, Language, UserProfile, OperationType, ExpertAsk, NewsArticle, MarketPrice } from './types';

// Initial data to ensure it loads instantly as per success criteria
const INITIAL_TIPS: Tip[] = [
  {
    id: 'tip-1',
    title: {
      en: 'Proper Paddy Spacing',
      kn: 'ಭತ್ತದ ನಡುವೆ ಸರಿಯಾದ ಅಂತರ'
    },
    content: {
      en: 'Maintain 20cm x 15cm spacing for optimal yield and easy weeding.',
      kn: 'ಗರಿಷ್ಠ ಇಳುವರಿ ಮತ್ತು ಕಳೆ ತೆಗೆಯಲು 20cm x 15cm ಅಂತರವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ.'
    },
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000',
    category: 'Paddy',
    verified: true,
    authorId: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tip-2',
    title: {
      en: 'Coconut Nut Drop',
      kn: 'ತೆಂಗಿನಕಾಯಿ ಉದುರುವಿಕೆ'
    },
    content: {
      en: 'Apply 50kg compost and regular watering to prevent immature nut fall.',
      kn: 'ಕಾಯಿ ಉದುರುವಿಕೆಯನ್ನು ತಡೆಯಲು 50 ಕೆಜಿ ಕಾಂಪೋಸ್ಟ್ ಮತ್ತು ನಿಯಮಿತ ನೀರಾವರಿಯನ್ನು ಅನ್ವಯಿಸಿ.'
    },
    imageUrl: 'https://images.unsplash.com/photo-1589182397057-b84651562a9b?q=80&w=1000',
    category: 'Coconut',
    verified: true,
    authorId: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tip-3',
    title: {
      en: 'Tomato Pest Control',
      kn: 'ಟೊಮೆಟೊ ಕೀಟ ನಿಯಂತ್ರಣ'
    },
    content: {
      en: 'Use neem oil spray (5ml/L) to control fruit borer early.',
      kn: 'ಹಣ್ಣು ಕೊರೆಕ ಹುಳುಗಳನ್ನು ನಿಯಂತ್ರಿಸಲು ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಣೆಯನ್ನು (5ml/L) ಬಳಸಿ.'
    },
    imageUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307bac?q=80&w=1000',
    category: 'Tomato',
    verified: true,
    authorId: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tip-4',
    title: {
      en: 'Areca Nut Yellowing',
      kn: 'ಅಡಿಕೆ ಹಳದಿ ರೋಗ'
    },
    content: {
      en: 'Ensure proper drainage and apply micronutrients (Boron/Zinc) to prevent leaf yellowing.',
      kn: 'ಸರಿಯಾದ ಒಳಚರಂಡಿ ವ್ಯವಸ್ಥೆಯನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ ಮತ್ತು ಎಲೆ ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುವುದನ್ನು ತಡೆಯಲು ಸೂಕ್ಷ್ಮ ಪೋಷಕಾಂಶಗಳನ್ನು (ಬೋರಾನ್/ಜಿಂಕ್) ಅನ್ವಯಿಸಿ.'
    },
    imageUrl: 'https://images.unsplash.com/photo-1621210179034-738944510065?q=80&w=1000',
    category: 'Areca nut',
    verified: true,
    authorId: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tip-5',
    title: {
      en: 'Weather Alert: Rain',
      kn: 'ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ: ಮಳೆ'
    },
    content: {
      en: 'Heavy rains expected in Davanagere. Avoid harvesting for the next 48 hours.',
      kn: 'ದಾವಣಗೆರೆಯಲ್ಲಿ ಭಾರಿ ಮಳೆ ನಿರೀಕ್ಷೆಯಿದೆ. ಮುಂದಿನ 48 ಗಂಟೆಗಳ ಕಾಲ ಕೊಯ್ಲು ಮಾಡುವುದನ್ನು ತಪ್ಪಿಸಿ.'
    },
    imageUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1000',
    category: 'Weather',
    verified: true,
    authorId: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tip-6',
    title: {
      en: 'Organic Pesticide for Chilli',
      kn: 'ಮೆಣಸಿನಕಾಯಿಗೆ ಸಾವಯವ ಕೀಟನಾಶಕ'
    },
    content: {
      en: 'Mix 100g of waste tobacco in 1 liter of water, soak for 24 hours, strain and spray.',
      kn: '100 ಗ್ರಾಂ ತ್ಯಾಜ್ಯ ತಂಬಾಕನ್ನು 1 ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಮಿಶ್ರಣ ಮಾಡಿ, 24 ಗಂಟೆಗಳ ಕಾಲ ನೆನೆಸಿ, ಸೋಸಿ ಮತ್ತು ಸಿಂಪಡಿಸಿ.'
    },
    imageUrl: 'https://images.unsplash.com/photo-1560066984-1389b45f4863?q=80&w=1000',
    category: 'Pest Control',
    verified: true,
    authorId: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tip-7',
    title: {
      en: 'Soil Testing Importance',
      kn: 'ಮಣ್ಣಿನ ಪರೀಕ್ಷೆಯ ಮಹತ್ವ'
    },
    content: {
      en: 'Test your soil every 2 years to understand specific nutrient needs for your crops.',
      kn: 'ನಿಮ್ಮ ಬೆಳೆಗಳಿಗೆ ನಿರ್ದಿಷ್ಟ ಪೋಷಕಾಂಶಗಳ ಅಗತ್ಯತೆಗಳನ್ನು ತಿಳಿಯಲು ಪ್ರತಿ 2 ವರ್ಷಗಳಿಗೊಮ್ಮೆ ನಿಮ್ಮ ಮಣ್ಣನ್ನು ಪರೀಕ್ಷಿಸಿ.'
    },
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000',
    category: 'Fertilizer',
    verified: true,
    authorId: 'system',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_SUCCESS_STORIES: SuccessStory[] = [
  {
    id: 'story-1',
    farmerName: 'Malleshappa',
    location: 'Davanagere',
    crop: 'Paddy',
    story: {
      en: 'Using biological fertilizers as suggested by Raitha-Varta, I improved my yield by 30% while reducing chemical costs significantly.',
      kn: 'ರೈತ-ವಾರ್ತಾ ಸೂಚಿಸಿದಂತೆ ಜೈವಿಕ ಗೊಬ್ಬರಗಳನ್ನು ಬಳಸಿ, ನಾನು ರಾಸಾಯನಿಕ ವೆಚ್ಚವನ್ನು ಗಣನೀಯವಾಗಿ ಕಡಿಮೆ ಮಾಡುವುದರ ಜೊತೆಗೆ ನನ್ನ ಇಳುವರಿಯನ್ನು 30% ರಷ್ಟು ಸುಧಾರಿಸಿದೆ.'
    },
    imageUrl: 'https://images.unsplash.com/photo-1590487988256-9ed24133863e?q=80&w=1000',
    createdAt: new Date().toISOString()
  },
  {
    id: 'story-2',
    farmerName: 'Kavitha Devi',
    location: 'Mandya',
    crop: 'Tomato',
    story: {
      en: 'The drip irrigation tips saved me 40% water during the harsh summer. My tomatoes are now larger and healthier.',
      kn: 'ಹನಿ ನೀರಾವರಿ ಸಲಹೆಗಳು ಕಠಿಣ ಬೇಸಿಗೆಯಲ್ಲಿ ನನಗೆ 40% ನೀರನ್ನು ಉಳಿಸಿದವು. ನನ್ನ ಟೊಮೆಟೊಗಳು ಈಗ ದೊಡ್ಡದಾಗಿವೆ ಮತ್ತು ಆರೋಗ್ಯಕರವಾಗಿವೆ.'
    },
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000',
    createdAt: new Date().toISOString()
  },
  {
    id: 'story-3',
    farmerName: 'Suresh Gowda',
    location: 'Tumakuru',
    crop: 'Coconut',
    story: {
      en: 'The nut drop problem in my plantation was solved within 3 months after following the KVK protocol provided here.',
      kn: 'ನನ್ನ ತೆಂಗಿನ ತೋಟದಲ್ಲಿನ ಕಾಯಿ ಉದುರುವಿಕೆ ಸಮಸ್ಯೆಯು ಇಲ್ಲಿ ನೀಡಲಾದ ಕೆವಿಕೆ ಪ್ರೋಟೋಕಾಲ್ ಅನ್ನು ಅನುಸರಿಸಿದ ನಂತರ 3 ತಿಂಗಳೊಳಗೆ ಬಗೆಹರಿಯಿತು.'
    },
    imageUrl: 'https://images.unsplash.com/photo-1589182397057-b84651562a9b?q=80&w=1000',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_MARKET_PRICES: MarketPrice[] = [
  { crop: 'Paddy', mandi: 'Raichur', price: 2100, prevPrice: 2050, unit: 'qtl', date: '2026-05-02' },
  { crop: 'Paddy', mandi: 'Sirsi', price: 2150, prevPrice: 2160, unit: 'qtl', date: '2026-05-02' },
  { crop: 'Tomato', mandi: 'Kolar', price: 1500, prevPrice: 1550, unit: 'qtl', date: '2026-05-02' },
  { crop: 'Tomato', mandi: 'Chikkaballapur', price: 1450, prevPrice: 1400, unit: 'qtl', date: '2026-05-02' },
  { crop: 'Coconut', mandi: 'Tiptur', price: 12000, prevPrice: 11800, unit: 'qtl', date: '2026-05-02' },
  { crop: 'Mango', mandi: 'Srinivaspur', price: 4500, prevPrice: 4200, unit: 'qtl', date: '2026-05-02' },
  { crop: 'Onion', mandi: 'Hubli', price: 1800, prevPrice: 1850, unit: 'qtl', date: '2026-05-02' },
  { crop: 'Potato', mandi: 'Hassan', price: 2200, prevPrice: 2100, unit: 'qtl', date: '2026-05-02' },
  { crop: 'Banana', mandi: 'Mysore', price: 2500, prevPrice: 2600, unit: 'qtl', date: '2026-05-02' },
  { crop: 'Ginger', mandi: 'Shimoga', price: 5500, prevPrice: 5300, unit: 'qtl', date: '2026-05-02' },
  { crop: 'Carrot', mandi: 'Bangalore', price: 3000, prevPrice: 2800, unit: 'qtl', date: '2026-05-02' },
  { crop: 'Apple', mandi: 'Bangalore', price: 8000, prevPrice: 8500, unit: 'qtl', date: '2026-05-02' },
  { crop: 'Grapes', mandi: 'Bijapur', price: 3500, prevPrice: 3800, unit: 'qtl', date: '2026-05-02' },
  { crop: 'Chilli', mandi: 'Bellary', price: 7000, prevPrice: 7200, unit: 'qtl', date: '2026-05-02' },
];

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tips, setTips] = useState<Tip[]>(INITIAL_TIPS);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>(INITIAL_MARKET_PRICES);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [newsSearch, setNewsSearch] = useState('');
  const [newsCategoryFilter, setNewsCategoryFilter] = useState<'all' | 'government' | 'market' | 'weather' | 'general'>('all');
  const [newsDateFilter, setNewsDateFilter] = useState<'all' | 'today' | 'week'>('all');
  const [newsLastUpdated, setNewsLastUpdated] = useState<number | null>(null);
  const [tipsLastUpdated, setTipsLastUpdated] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [newsView, setNewsView] = useState<'news' | 'market'>('news');
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('all');
  const [marketSearch, setMarketSearch] = useState('');
  const [marketSortOrder, setMarketSortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  
  useEffect(() => {
    const savedQueue = localStorage.getItem('raitha_varta_offline_queue');
    if (savedQueue) setOfflineQueue(JSON.parse(savedQueue));
  }, []);

  const addToQueue = (action: any) => {
    const newQueue = [...offlineQueue, { ...action, timestamp: Date.now() }];
    setOfflineQueue(newQueue);
    localStorage.setItem('raitha_varta_offline_queue', JSON.stringify(newQueue));
  };
  
  const syncOfflineActions = async () => {
    if (offlineQueue.length === 0) return;
    
    // Process actions.
    const batch = writeBatch(db);
    for (const action of offlineQueue) {
      if (action.type === 'tip_feedback' && auth.currentUser) {
        const { tipId, type, reason } = action.payload;
        const feedbackRef = doc(db, 'tips', tipId, 'feedback', auth.currentUser.uid);
        const feedbackData: any = {
            userId: auth.currentUser.uid,
            type,
            createdAt: serverTimestamp()
        };
        if (reason) feedbackData.reason = reason;
        batch.set(feedbackRef, feedbackData);
        const tipRef = doc(db, 'tips', tipId);
        batch.update(tipRef, {
            [type === 'useful' ? 'usefulCount' : 'reportCount']: increment(1)
        });
      }
    }
    try {
        await batch.commit();
        setOfflineQueue([]);
        localStorage.removeItem('raitha_varta_offline_queue');
    } catch (e) {
        console.error("Sync failed", e);
    }
  };
  
  useEffect(() => {
    if (isOnline) syncOfflineActions();
  }, [isOnline]);

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(newsSearch.toLowerCase()) || 
                         item.summary.toLowerCase().includes(newsSearch.toLowerCase());
    const matchesCategory = newsCategoryFilter === 'all' || item.category === newsCategoryFilter;
    
    let matchesDate = true;
    if (newsDateFilter !== 'all') {
      const itemDate = new Date(item.date);
      const now = new Date();
      if (newsDateFilter === 'today') {
        matchesDate = itemDate.toDateString() === now.toDateString();
      } else if (newsDateFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        matchesDate = itemDate >= weekAgo;
      }
    }
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize from cache
    const cachedTips = localStorage.getItem('raitha_varta_tips');
    const cachedNews = localStorage.getItem(`raitha_varta_news_${language}`);
    const cachedStories = localStorage.getItem('raitha_varta_stories');
    const cachedNewsTime = localStorage.getItem(`raitha_varta_news_time_${language}`);
    const cachedTipsTime = localStorage.getItem('raitha_varta_tips_time');
    
    if (cachedTips) setTips(JSON.parse(cachedTips));
    if (cachedNews) setNews(JSON.parse(cachedNews));
    if (cachedStories) setSuccessStories(JSON.parse(cachedStories));
    if (cachedNewsTime) setNewsLastUpdated(parseInt(cachedNewsTime));
    if (cachedTipsTime) setTipsLastUpdated(parseInt(cachedTipsTime));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [successStories, setSuccessStories] = useState<SuccessStory[]>(INITIAL_SUCCESS_STORIES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [language, setLanguage] = useState<Language>('kn');
  const [category, setCategory] = useState<string>('All');
  const [isExpertAskOpen, setIsExpertAskOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSuccessStoryOpen, setIsSuccessStoryOpen] = useState(false);
  const [storyCropFilter, setStoryCropFilter] = useState<string>('All');
  const [storyLocationFilter, setStoryLocationFilter] = useState<string>('All');
  const [tipSearchQuery, setTipSearchQuery] = useState<string>('');
  const [showFavoriteTips, setShowFavoriteTips] = useState<boolean>(false);
  const [expertTab, setExpertTab] = useState<'Expert' | 'History' | 'Disease Detection'>('Expert');
  const [diseaseDiagnosis, setDiseaseDiagnosis] = useState<{markdownReport: string, confidenceScore: number} | null>(null);
  const [translatedDiagnosis, setTranslatedDiagnosis] = useState<string | null>(null);

  useEffect(() => {
    if (diseaseDiagnosis && language !== 'en') {
      translateText(diseaseDiagnosis.markdownReport, language).then(setTranslatedDiagnosis);
    } else {
      setTranslatedDiagnosis(null);
    }
  }, [diseaseDiagnosis, language]);

  const [expandedResponses, setExpandedResponses] = useState<Set<string>>(new Set());
  const [isAddingStory, setIsAddingStory] = useState(false);
  const [newStoryDraft, setNewStoryDraft] = useState({
    farmerName: '',
    location: '',
    crop: '',
    storyEn: '',
    storyKn: ''
  });
  const [newStoryFile, setNewStoryFile] = useState<File | null>(null);
  const [newStoryPreview, setNewStoryPreview] = useState<string | null>(null);
  const [isCropCalendarOpen, setIsCropCalendarOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportingTipId, setReportingTipId] = useState<string | null>(null);
  const [selectedCalendarCrop, setSelectedCalendarCrop] = useState<CropCalendarEntry>(CROP_CALENDAR[0]);
  const [expertAskMsg, setExpertAskMsg] = useState('');
  const [dragDirection, setDragDirection] = useState<number | null>(null);
  const [myAsks, setMyAsks] = useState<ExpertAsk[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [expertModalTab, setExpertModalTab] = useState<'detect' | 'ask' | 'history'>('detect');
  const [historySort, setHistorySort] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low'>('newest');
  const [historyFilterStatus, setHistoryFilterStatus] = useState<'all' | 'pending' | 'answered'>('all');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [generatingTipId, setGeneratingTipId] = useState<string | null>(null);

  const handleGenerateImage = async (tip: Tip) => {
    setGeneratingTipId(tip.id);
    try {
      const newImageUrl = await generateTipImage(tip.title.en, tip.category);
      const tipRef = doc(db, 'tips', tip.id);
      await updateDoc(tipRef, { imageUrl: newImageUrl });
    } catch (error) {
      console.error("Image generation failed:", error);
      alert(language === 'kn' ? 'ಚಿತ್ರವನ್ನು ರಚಿಸಲು ವಿಫಲವಾಗಿದೆ.' : 'Failed to generate image.');
    } finally {
      setGeneratingTipId(null);
    }
  };
  const [userFeedback, setUserFeedback] = useState<Record<string, 'useful' | 'inaccurate'>>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempProfile, setTempProfile] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    // Test connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userRef = doc(db, 'users', u.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          const newProfile: UserProfile = {
            uid: u.uid,
            displayName: u.displayName || 'Farmer',
            role: 'farmer',
            preferredLanguage: 'kn',
            favoriteCrops: []
          };
          setProfile(newProfile);
          try {
            await setDoc(userRef, newProfile);
          } catch (e) {
            handleFirestoreError(e, OperationType.CREATE, 'users');
          }
        } else {
          setProfile(userDoc.data() as UserProfile);
        }
        registerFcmToken(u.uid);
      } else {
        setProfile(null);
        setMyAsks([]);
      }
    });

    // Real-time tips listener
    const tipsQuery = query(
      collection(db, 'tips'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribeTips = onSnapshot(tipsQuery, (snapshot) => {
      const dbTips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tip));
      if (dbTips.length > 0) {
        // Merge and ensure unique IDs
        const combined = [...dbTips];
        INITIAL_TIPS.forEach(it => {
          if (!combined.find(c => c.id === it.id)) combined.push(it);
        });
        setTips(combined);
        const now = Date.now();
        setTipsLastUpdated(now);
        localStorage.setItem('raitha_varta_tips', JSON.stringify(combined));
        localStorage.setItem('raitha_varta_tips_time', now.toString());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tips');
    });

    // Real-time success stories listener
    const storiesQuery = query(
      collection(db, 'success_stories'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribeStories = onSnapshot(storiesQuery, (snapshot) => {
      const dbStories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SuccessStory));
      if (dbStories.length > 0) {
        const combined = [...dbStories];
        INITIAL_SUCCESS_STORIES.forEach(it => {
          if (!combined.find(c => c.id === it.id)) combined.push(it);
        });
        setSuccessStories(combined);
        localStorage.setItem('raitha_varta_stories', JSON.stringify(combined));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'success_stories');
    });

    return () => {
      unsubscribeAuth();
      unsubscribeTips();
      unsubscribeStories();
    };
  }, []);

  // Fetch news effect
  useEffect(() => {
    setNews([]);
    const loadNews = async () => {
      if (!isOnline) return;
      
      // Cooldown: 15 minutes (900000 ms)
      const COOLDOWN = 15 * 60 * 1000;
      const lastFetch = localStorage.getItem(`raitha_varta_news_time_${language}`);
      const now = Date.now();
      
      // If we have cached news for this language, load it
      const cachedNews = localStorage.getItem(`raitha_varta_news_${language}`);
      if (cachedNews) {
        setNews(JSON.parse(cachedNews));
        if (lastFetch) setNewsLastUpdated(parseInt(lastFetch));
      }

      if (lastFetch && (now - parseInt(lastFetch)) < COOLDOWN && news.length > 0) {
        console.log("Using cached news (cooldown active)");
        return;
      }

      setNewsLoading(true);
      setNewsError(null);
      const data = await fetchAgriNews(language);
      if (data && data.length > 0) {
        setNews(data);
        const fetchTime = Date.now();
        setNewsLastUpdated(fetchTime);
        localStorage.setItem(`raitha_varta_news_${language}`, JSON.stringify(data));
        localStorage.setItem(`raitha_varta_news_time_${language}`, fetchTime.toString());
      } else if (isOnline && news.length === 0) {
        setNewsError(language === 'kn' ? 'ಸುದ್ದಿ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ.' : 'Could not fetch news. Please try again later.');
      }
      setNewsLoading(false);
    };
    loadNews();
  }, [isOnline, language, news.length]);

  // Real-time expert asks listener for current user
  useEffect(() => {
    if (!user) return;

    const asksQuery = query(
      collection(db, 'expert_asks'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribeAsks = onSnapshot(asksQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExpertAsk));
      setMyAsks(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'expert_asks');
    });

    return () => unsubscribeAsks();
  }, [user]);

  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);
  
  const filteredTips = tips.filter(tip => 
    (category === 'All' || tip.category === category) &&
    (tipSearchQuery === '' || 
     tip.title.en.toLowerCase().includes(tipSearchQuery.toLowerCase()) || 
     tip.title.kn.includes(tipSearchQuery) ||
     tip.content.en.toLowerCase().includes(tipSearchQuery.toLowerCase()) ||
     tip.content.kn.includes(tipSearchQuery)) &&
    (!showFavoriteTips || (profile?.favoriteCrops?.includes(tip.category as any)))
  );
  const currentTip = filteredTips[currentIndex];
  const categories = ['All', 'Paddy', 'Areca nut', 'Coconut', 'Tomato', 'Pest Control', 'Fertilizer'];

  useEffect(() => {
    if (!navigator.geolocation) return;
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({lat: position.coords.latitude, lon: position.coords.longitude});
      },
      (error) => {
        console.warn("Geolocation error:", error);
        // Default to Bangalore coords if geolocation fails
        setLocation({lat: 12.9716, lon: 77.5946});
      }
    );
  }, []);

  useEffect(() => {
    if (!location) return;
    
    const loadWeather = async () => {
      setWeatherLoading(true);
      try {
        const crop = currentTip?.category;
        const data = await fetchWeather(location.lat, location.lon, crop);
        setWeather(data);
      } catch (e) {
        console.error("Weather fetch error:", e);
      } finally {
        setWeatherLoading(false);
      }
    };
    
    loadWeather();
  }, [location, currentTip?.category]);

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const nextTip = () => {
    if (currentIndex < filteredTips.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevTip = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'kn' : 'en');
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleTipFeedback = async (tipId: string, type: 'useful' | 'inaccurate', reason?: string) => {
    if (!user) return alert(language === 'kn' ? 'ದಯವಿಟ್ಟು ಮೊದಲು ಲಾಗಿನ್ ಆಗಿ' : 'Please login first');
    if (userFeedback[tipId]) return;

    // Update local state immediately for UI responsiveness
    setUserFeedback({ ...userFeedback, [tipId]: type });

    if (!isOnline) {
       addToQueue({ type: 'tip_feedback', payload: { tipId, type, reason } });
       return;
    }
    
    try {
      const batch = writeBatch(db);
      
      // 1. Record individual feedback to subcollection
      const feedbackRef = doc(db, 'tips', tipId, 'feedback', user.uid);
      const feedbackData: any = {
        userId: user.uid,
        type,
        createdAt: serverTimestamp()
      };
      if (reason) feedbackData.reason = reason;

      batch.set(feedbackRef, feedbackData);

      // 2. Increment counters on main document
      const tipRef = doc(db, 'tips', tipId);
      batch.update(tipRef, {
        [type === 'useful' ? 'usefulCount' : 'reportCount']: increment(1)
      });

      await batch.commit();
      alert(type === 'useful' 
        ? (language === 'kn' ? 'ಪ್ರತಿಕ್ರಿಯೆಗಾಗಿ ಧನ್ಯವಾದಗಳು!' : 'Thanks for your feedback!') 
        : (language === 'kn' ? 'ವರದಿಯನ್ನು ಸ್ವೀಕರಿಸಲಾಗಿದೆ. ನಾವು ಇದನ್ನು ಪರಿಶೀಲಿಸುತ್ತೇವೆ.' : 'Report received. We will review this tip.')
      );
    } catch (e) {
      console.error("Feedback error:", e);
      // Fallback: If tip doesn't exist in DB (it's initial mock), we just update state
    }
  };

  const handleUpdateProfile = async () => {
    if (!user || !profile) return;
    setIsSubmitting(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: tempProfile.displayName !== undefined ? tempProfile.displayName : profile.displayName,
        preferredLanguage: tempProfile.preferredLanguage !== undefined ? tempProfile.preferredLanguage : profile.preferredLanguage,
        favoriteCrops: tempProfile.favoriteCrops !== undefined ? tempProfile.favoriteCrops : profile.favoriteCrops
      });

      // Update local profile state
      const updatedProfile = {
        ...profile,
        ...tempProfile
      } as UserProfile;
      setProfile(updatedProfile);
      
      // Update app language state if needed
      if (tempProfile.preferredLanguage && tempProfile.preferredLanguage !== language) {
        setLanguage(tempProfile.preferredLanguage as Language);
      }
      setIsSettingsOpen(false);
      alert(language === 'kn' ? 'ಪ್ರೊಫೈಲ್ ಅಪ್‌ಡೇಟ್ ಆಗಿದೆ!' : 'Profile updated successfully!');
    } catch (error) {
      console.error("Error updating profile:", error);
      alert('Error updating profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateProtocol = async (askId: string, diagnosis: string) => {
    setIsSubmitting(true);
    try {
      const protocol = await generateDetailedProtocol(diagnosis);
      const askRef = doc(db, 'expert_asks', askId);
      await updateDoc(askRef, {
        detailedProtocol: protocol
      });
      alert(language === 'kn' ? 'ವಿವರವಾದ ಚಿಕಿತ್ಸಾ ವರದಿ ಸಿದ್ಧವಾಗಿದೆ!' : 'Detailed treatment protocol is ready!');
    } catch (e) {
      console.error("Protocol generation error:", e);
      alert('Error generating protocol. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [newsSummaries, setNewsSummaries] = useState<Record<string, { kn: string, en: string }>>({});

  const handleTranslateResponse = async (askId: string, response: string) => {
    setIsSubmitting(true);
    try {
      const translation = await translateText(response, language);
      const askRef = doc(db, 'expert_asks', askId);
      await updateDoc(askRef, {
        translation: translation
      });
    } catch (e) {
      console.error("Translation error:", e);
      alert(language === 'kn' ? 'ಅನುವಾದ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.' : 'Translation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateSummary = async (newsId: string, text: string) => {
    setNewsSummaries(prev => ({ ...prev, [newsId]: { kn: '...', en: '...' } }));
    try {
      const summary = await generateSummary(text);
      setNewsSummaries(prev => ({ ...prev, [newsId]: summary }));
    } catch (e) {
      console.error("Summary error:", e);
      setNewsSummaries(prev => ({ ...prev, [newsId]: { kn: 'ಸಾರಾಂಶ ಲಭ್ಯವಿಲ್ಲ', en: 'Summary unavailable' } }));
    }
  };

  const handleExpertFeedback = async (askId: string, rating: number) => {
    try {
      const askRef = doc(db, 'expert_asks', askId);
      await updateDoc(askRef, { rating: rating });
    } catch (e) {
      console.error("Feedback error:", e);
      alert(language === 'kn' ? 'ಪ್ರತಿಕ್ರಿಯೆ ವಿಫಲವಾಗಿದೆ.' : 'Feedback failed.');
    }
  };

  const handleSubmitExpertAsk = async (customMessage?: string) => {
    if (!user) return alert('Please login first');
    const msgToSubmit = customMessage || expertAskMsg;
    if (!msgToSubmit) return;

    setIsSubmitting(true);
    try {
      // 1. Prepare AI request
      let imageBase64;
      let mimeType;
      let photoUrl;
      if (selectedFile) {
        const dataUrl = await fileToDataUrl(selectedFile);
        imageBase64 = dataUrl.split(',')[1];
        mimeType = selectedFile.type;
        photoUrl = dataUrl; // Store the data URL for history
      }

      // 2. Create the doc in pending state
      const docRef = await addDoc(collection(db, 'expert_asks'), {
        userId: user.uid,
        message: msgToSubmit,
        status: 'pending',
        photoUrl: photoUrl || null,
        createdAt: serverTimestamp()
      });

      // 3. Call Gemini
      setIsAnalyzing(true);
      const aiResult = await askExpertAi(msgToSubmit, imageBase64, mimeType);
      setIsAnalyzing(false);

      // 4. Update the doc with answer
      await updateDoc(docRef, {
        response: aiResult.markdownReport,
        confidenceScore: aiResult.confidenceScore,
        status: 'answered'
      });

      if (expertModalTab === 'detect') {
        setDiseaseDiagnosis(aiResult);
      } else {
        setExpertAskMsg('');
        setSelectedFile(null);
        setPreviewUrl(null);
        alert(language === 'kn' ? 'ತಜ್ಞರ ಪ್ರತಿಕ್ರಿಯೆ ಸಿದ್ಧವಾಗಿದೆ!' : 'Expert response is ready!');
        setExpertModalTab('history');
      }
    } catch (error: any) {
      try {
        handleFirestoreError(error, OperationType.CREATE, 'expert_asks');
      } catch (innerError: any) {
        if (innerError.message.includes('Missing or insufficient permissions')) {
          alert(language === 'kn' ? 'ಕ್ಷಮಿಸಿ, ನಿಮಗೆ ಅನುಮತಿ ಇಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಮೇಲ್ ಪರಿಶೀಲಿಸಲಾಗಿದೆಯೇ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.' : 'Permission denied. Please ensure your email is verified.');
        } else {
          alert('Error connecting to AI expert. Please try again.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitSuccessStory = async () => {
    if (!user) return alert(language === 'kn' ? 'ದಯವಿಟ್ಟು ಮೊದಲು ಲಾಗಿನ್ ಆಗಿ' : 'Please login first');
    if (!newStoryDraft.crop || (!newStoryDraft.storyEn && !newStoryDraft.storyKn)) {
      return alert(language === 'kn' ? 'ದಯವಿಟ್ಟು ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ' : 'Please fill all details');
    }

    setIsSubmitting(true);
    try {
      let imageUrl = 'https://images.unsplash.com/photo-1590487988256-9ed24133863e?q=80&w=1000'; // Default
      
      if (newStoryFile) {
        imageUrl = await fileToDataUrl(newStoryFile);
      }

      const storyData = {
        farmerName: newStoryDraft.farmerName || profile?.displayName || 'Farmer',
        location: newStoryDraft.location || profile?.district || 'Karnataka',
        crop: newStoryDraft.crop,
        story: {
          en: newStoryDraft.storyEn || newStoryDraft.storyKn,
          kn: newStoryDraft.storyKn || newStoryDraft.storyEn
        },
        imageUrl,
        authorId: user.uid,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'success_stories'), storyData);
      
      setNewStoryDraft({
        farmerName: '',
        location: '',
        crop: '',
        storyEn: '',
        storyKn: ''
      });
      setNewStoryFile(null);
      setNewStoryPreview(null);
      setIsAddingStory(false);
      alert(language === 'kn' ? 'ನಿಮ್ಮ ಯಶಸ್ಸಿನ ಕಥೆಯನ್ನು ಹಂಚಿಕೊಂಡಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು!' : 'Thank you for sharing your success story!');
    } catch (e) {
      console.error("Success story submission error:", e);
      alert('Error submitting story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-zinc-100 font-sans flex flex-col items-center select-none overflow-hidden">
      {/* Header */}
      <header className="w-full max-w-md bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
            <Sprout size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-emerald-800 leading-tight">Raitha-Varta</h1>
            <p className="text-[10px] text-zinc-500 font-medium tracking-widest uppercase">Flash-Card Advisor</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isOnline && (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-amber-700 uppercase">
                {language === 'kn' ? 'ಆಫ್‌' : 'Offline'}
              </span>
            </div>
          )}
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="flex items-center gap-1 bg-zinc-100 px-2 py-1 rounded-lg text-xs font-semibold transition-colors focus:outline-none"
          >
            <option value="en">English</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="hi">हिंदी</option>
            <option value="te">తెలుగు</option>
          </select>
          {!user ? (
            <button 
              onClick={handleLogin}
              className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors"
            >
              <UserIcon size={20} />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  if (profile) {
                    setTempProfile({
                      displayName: profile.displayName,
                      preferredLanguage: profile.preferredLanguage,
                      favoriteCrops: [...(profile.favoriteCrops || [])]
                    });
                    setIsSettingsOpen(true);
                  }
                }}
                className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors"
              >
                <Settings size={20} />
              </button>
              <img 
                src={user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.uid} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-emerald-500 shadow-sm cursor-pointer"
                onClick={() => auth.signOut()}
              />
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-md flex flex-col relative px-4 py-4 overflow-y-auto no-scrollbar">
        
        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide no-scrollbar flex-shrink-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setCurrentIndex(0);
              }}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105' 
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:border-emerald-300'
              }`}
            >
              {language === 'kn' && cat === 'All' ? 'ಎಲ್ಲಾ' : cat}
            </button>
          ))}
        </div>

        {/* Weather Dashboard */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden"
        >
          {weatherLoading ? (
            <div className="p-4 flex items-center justify-center gap-2">
              <Loader2 className="animate-spin text-emerald-600" size={16} />
              <span className="text-sm font-medium text-zinc-500">
                {language === 'kn' ? 'ಹವಾಮಾನ ಇಲಾಖೆಯಿಂದ ಮಾಹಿತಿ ಪಡೆಯಲಾಗುತ್ತಿದೆ...' : 'Getting weather data...'}
              </span>
            </div>
          ) : weather ? (
            <div className="flex flex-col">
              <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun size={14} className="text-amber-500" />
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">
                    {language === 'kn' ? 'ಸ್ಥಳೀಯ ಹವಾಮಾನ' : 'Local Weather'}
                  </span>
                </div>
                <div className="flex items-center gap-1 group cursor-help">
                  <Navigation size={10} className="text-zinc-400 group-hover:text-emerald-600" />
                  <span className="text-[9px] font-bold text-zinc-400 group-hover:text-emerald-600">AUTO-DETECTED</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold text-zinc-900">{weather.temp}°C</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-600 uppercase">{weather.condition}</span>
                      <span className="text-[10px] text-zinc-400 font-medium">Karnataka, IN</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="flex items-center gap-1.5">
                      <Droplets size={12} className="text-blue-500" />
                      <span className="text-[10px] font-bold text-zinc-600">{weather.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Wind size={12} className="text-zinc-500" />
                      <span className="text-[10px] font-bold text-zinc-600">{weather.windSpeed}km/h</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CloudRain size={12} className="text-emerald-500" />
                      <span className="text-[10px] font-bold text-zinc-600">{weather.precipitation}mm</span>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100 flex items-start gap-3">
                  <div className="bg-emerald-600 p-1.5 rounded-lg text-white mt-0.5">
                    <AlertCircle size={14} />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-0.5">
                      {language === 'kn' ? 'ಕೃಷಿ ಸಲಹೆ' : 'Farming Advisory'}
                    </h5>
                    <p className="text-xs text-zinc-700 font-medium leading-relaxed">
                      {weather.advisory[language]}
                    </p>
                  </div>
                </div>
                {weather.alerts && weather.alerts.length > 0 && (
                  <div className="bg-red-50 rounded-xl p-3 border border-red-100 flex items-start gap-3 mt-3">
                    <div className="bg-red-600 p-1.5 rounded-lg text-white mt-0.5">
                      <AlertTriangle size={14} />
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-0.5">
                        {language === 'kn' ? 'ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ' : 'Weather Alert'}
                      </h5>
                      {weather.alerts.map((alert, idx) => (
                        <p key={idx} className="text-xs text-red-700 font-medium leading-relaxed">
                          {alert[language]}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </motion.div>

        {/* Farming Tips Section Title */}
        <div className="w-full px-4 mb-4 mt-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center flex-1 gap-2 bg-white p-2 rounded-xl border border-zinc-200">
              <Search size={18} className="text-zinc-400" />
              <input
                type="text"
                placeholder={language === 'kn' ? 'ಹುಡುಕಿ...' : 'Search tips...'}
                value={tipSearchQuery}
                onChange={(e) => setTipSearchQuery(e.target.value)}
                className="flex-1 text-sm bg-transparent border-none outline-none"
              />
            </div>
            <button 
              onClick={() => setShowFavoriteTips(!showFavoriteTips)}
              className={`text-[10px] uppercase tracking-wider font-bold p-3 rounded-xl border ${
                showFavoriteTips ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-zinc-600 border-zinc-200'
              }`}
            >
              {language === 'kn' ? 'ನನ್ನ ಬೆಳೆಗಳು' : 'My'}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="text-xl font-black text-zinc-900 leading-tight">
                {language === 'kn' ? 'ದೈನಂದಿನ ಕೃಷಿ ಶಿಫಾರಸುಗಳು' : 'Daily Farming Wisdom'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none">
                  {language === 'kn' ? 'ನಿಮ್ಮ ಬೆಳೆ ಮತ್ತು ಮಣ್ಣಿನ ಅನುಗುಣವಾಗಿ' : 'Tailored for your crops'}
                </p>
                {tipsLastUpdated && (
                  <>
                    <span className="text-[10px] text-zinc-300">•</span>
                    <span className="text-[9px] font-bold text-zinc-400">
                      {language === 'kn' ? 'ಸುಂಕದ ಸಮಯ: ' : 'Synced: '}
                      {new Date(tipsLastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Swipe Section */}
        <div className="relative flex-1 flex flex-col items-center justify-center min-h-[400px]">
          <AnimatePresence mode="popLayout" initial={false}>
            {currentTip ? (
              <motion.div
                key={currentTip.id}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 100) prevTip();
                  else if (info.offset.x < -100) nextTip();
                }}
                initial={{ opacity: 0, scale: 0.9, x: 100 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -100 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full aspect-[4/5] bg-white rounded-3xl shadow-2xl shadow-zinc-300 overflow-hidden border border-zinc-100 flex flex-col touch-none"
              >
                <div className="relative h-2/3 overflow-hidden">
                  <img 
                    src={currentTip.imageUrl} 
                    alt="Tip" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    onClick={() => handleGenerateImage(currentTip)}
                    disabled={generatingTipId === currentTip.id}
                    className="absolute top-4 right-4 bg-white/80 p-2 rounded-full shadow-md text-emerald-600 hover:bg-white transition-opacity disabled:opacity-50"
                  >
                    {generatingTipId === currentTip.id ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  </button>
                  <div className="absolute top-4 left-4 flex gap-2 items-start">
                    <div className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase tracking-wider">
                      {currentTip.category}
                    </div>
                    {!isOnline && (
                      <div className="bg-amber-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase tracking-wider flex items-center gap-1">
                        <Clock size={10} />
                        {language === 'kn' ? 'ಸಂಗ್ರಹಿಸಲಾಗಿದೆ' : 'Stored'}
                      </div>
                    )}
                  </div>
                  {currentTip.verified && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-emerald-700 p-1.5 rounded-full shadow-md">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                  <h2 className="absolute bottom-4 left-4 right-4 text-white text-2xl font-bold leading-tight">
                    {currentTip.title[language]}
                  </h2>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-zinc-700 text-lg font-medium leading-relaxed flex-1">
                    {currentTip.content[language]}
                  </p>
                  
                  {/* Feedback Controls */}
                  <div className="mt-4 pt-4 border-t border-zinc-50 flex items-center justify-between">
                    <button 
                      onClick={() => handleTipFeedback(currentTip.id, 'useful')}
                      disabled={!!userFeedback[currentTip.id]}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                        userFeedback[currentTip.id] === 'useful' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'hover:bg-zinc-100 text-zinc-500'
                      }`}
                    >
                      {userFeedback[currentTip.id] === 'useful' ? <Check size={18} /> : <ThumbsUp size={18} />}
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {language === 'kn' ? 'ಉಪಯುಕ್ತ' : 'Useful'}
                        {currentTip.usefulCount ? ` (${currentTip.usefulCount + (userFeedback[currentTip.id] === 'useful' ? 0 : 0)})` : ''}
                      </span>
                    </button>

                    <button 
                      onClick={() => handleGenerateImage(currentTip)}
                      disabled={generatingTipId === currentTip.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-zinc-100 text-zinc-500 transition-all"
                    >
                      {generatingTipId === currentTip.id ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {language === 'kn' ? 'ಚಿತ್ರ' : 'Image'}
                      </span>
                    </button>

                    <button 
                      onClick={() => {
                        setReportingTipId(currentTip.id);
                        setIsReportModalOpen(true);
                      }}
                      disabled={!!userFeedback[currentTip.id]}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                        userFeedback[currentTip.id] === 'inaccurate' 
                          ? 'bg-red-100 text-red-700' 
                          : 'hover:bg-zinc-100 text-zinc-400'
                      }`}
                    >
                      <Flag size={18} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {language === 'kn' ? 'ವರದಿ' : 'Report'}
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center gap-4">
                 <AlertCircle size={48} className="text-zinc-300" />
                 <p className="text-zinc-500 font-medium">
                   {language === 'kn' ? 'ಈ ವರ್ಗದಲ್ಲಿ ಯಾವುದೇ ಸಲಹೆಗಳಿಲ್ಲ.' : 'No tips found in this category.'}
                 </p>
              </div>
            )}
          </AnimatePresence>

          {/* Navigation Hints */}
          {filteredTips.length > 1 && (
            <>
              <div className="absolute inset-y-0 -left-2 flex items-center z-10">
                <button 
                  onClick={prevTip}
                  disabled={currentIndex === 0}
                  className={`p-2 rounded-full bg-white shadow-lg text-zinc-400 border border-zinc-100 transition-opacity ${currentIndex === 0 ? 'opacity-0' : 'opacity-100'}`}
                >
                  <ChevronLeft size={24} />
                </button>
              </div>
              <div className="absolute inset-y-0 -right-2 flex items-center z-10">
                <button 
                  onClick={nextTip}
                  disabled={currentIndex === filteredTips.length - 1}
                  className={`p-2 rounded-full bg-white shadow-lg text-zinc-400 border border-zinc-100 transition-opacity ${currentIndex === filteredTips.length - 1 ? 'opacity-0' : 'opacity-100'}`}
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Daily Progress Indicator */}
        <div className="mt-8 flex justify-center gap-1.5 overflow-x-auto no-scrollbar py-2 flex-shrink-0">
          {filteredTips.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-8 bg-emerald-600' : 'w-2 bg-zinc-300'
              }`}
            />
          ))}
        </div>

        {/* News & Public Advisories Section */}
        <section className="mt-12 pb-8 border-t border-zinc-100 pt-8">
          <div className="flex flex-col gap-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-xl font-black text-zinc-900 leading-tight">
                  {language === 'kn' ? 'ಸರ್ಕಾರಿ ಸಲಹೆಗಳು ಮತ್ತು ಸುದ್ದಿಗಳು' : 'Govt Advisories & News'}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none">
                    {language === 'kn' ? 'ಕರ್ನಾಟಕದ ರೈತರಿಗಾಗಿ ತಾಜಾ ಮಾಹಿತಿ' : 'Updates for Karnataka'}
                  </p>
                  {newsLastUpdated && (
                    <>
                      <span className="text-[10px] text-zinc-300">•</span>
                      <span className="text-[9px] font-bold text-zinc-400">
                        {language === 'kn' ? 'ಸುಂಕದ ಸಮಯ: ' : 'Synced: '}
                        {new Date(newsLastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Tabs for News / Market */}
              <div className="flex bg-zinc-100 p-1 rounded-2xl">
                <button 
                  onClick={() => setNewsView('news')}
                  className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${newsView === 'news' ? 'bg-white text-emerald-900 shadow-sm' : 'text-zinc-500'}`}
                >
                  {language === 'kn' ? 'ಸುದ್ದಿ' : 'News'}
                </button>
                <button 
                  onClick={() => setNewsView('market')}
                  className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${newsView === 'market' ? 'bg-white text-emerald-900 shadow-sm' : 'text-zinc-500'}`}
                >
                  {language === 'kn' ? 'ಮಾರುಕಟ್ಟೆ' : 'Market'}
                </button>
              </div>
            </div>
          </div>
          
          {newsView === 'market' ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={language === 'kn' ? 'ಹುಡುಕಿ...' : 'Search...'}
                    value={marketSearch}
                    onChange={(e) => setMarketSearch(e.target.value)}
                    className="flex-1 p-2 bg-zinc-100 rounded-xl text-sm"
                  />
                  <button
                    onClick={() => setMarketSortOrder(marketSortOrder === 'none' ? 'asc' : marketSortOrder === 'asc' ? 'desc' : 'none')}
                    className="p-2 bg-zinc-100 rounded-xl text-sm font-bold w-16"
                  >
                    {marketSortOrder === 'none' ? 'Sort' : marketSortOrder === 'asc' ? '▲' : '▼'}
                  </button>
                </div>
                <select 
                  value={selectedCropFilter}
                  onChange={(e) => setSelectedCropFilter(e.target.value)}
                  className="w-full p-2 bg-zinc-100 rounded-xl text-sm text-zinc-700 font-bold"
                >
                  <option value="all">{language === 'kn' ? 'ಎಲ್ಲಾ ಬೆಳೆಗಳು' : 'All Crops'}</option>
                  {Array.from(new Set(marketPrices.map(p => p.crop))).map(crop => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
                {Object.entries(
                  marketPrices
                    .filter(p => (selectedCropFilter === 'all' || p.crop === selectedCropFilter) && 
                      (p.crop.toLowerCase().includes(marketSearch.toLowerCase()) || p.mandi.toLowerCase().includes(marketSearch.toLowerCase())))
                    .sort((a, b) => marketSortOrder === 'asc' ? a.price - b.price : marketSortOrder === 'desc' ? b.price - a.price : 0)
                    .reduce((acc, p) => {
                      if (!acc[p.crop]) acc[p.crop] = [];
                      acc[p.crop].push(p);
                      return acc;
                    }, {} as Record<string, typeof marketPrices>)
                ).map(([crop, prices]) => (
                  <div key={crop} className="bg-white p-4 rounded-3xl shadow-sm border border-zinc-100">
                    <h3 className="font-black text-zinc-900 mb-2 border-b border-zinc-100 pb-2">{crop}</h3>
                    {prices.map((p, idx) => {
                      const trend = p.prevPrice ? (p.price > p.prevPrice ? 'up' : p.price < p.prevPrice ? 'down' : 'stable') : 'stable';
                      return (
                        <div key={idx} className="flex justify-between items-center py-1">
                          <span className="text-xs text-zinc-500">{p.mandi}</span>
                          <div className="flex items-center gap-2">
                            {trend === 'up' && <ArrowUp size={14} className="text-emerald-600" />}
                            {trend === 'down' && <ArrowDown size={14} className="text-red-600" />}
                            <span className="font-bold text-zinc-900">₹{p.price}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
          ) : (
                <>
                  {/* News Filtering UI */}
                  <div className="mb-6 space-y-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                      <input 
                        type="text"
                        value={newsSearch}
                        onChange={(e) => setNewsSearch(e.target.value)}
                        placeholder={language === 'kn' ? 'ಸುದ್ದಿ ಹುಡುಕಿ...' : 'Search news...'}
                        className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        <Filter size={14} className="text-zinc-400 shrink-0" />
                        {(['all', 'government', 'market', 'weather', 'general'] as const).map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setNewsCategoryFilter(cat)}
                            className={`shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                              newsCategoryFilter === cat 
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                                : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                            }`}
                          >
                            {cat === 'all' ? (language === 'kn' ? 'ಎಲ್ಲಾ' : 'All') : cat}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        <Clock size={14} className="text-zinc-400 shrink-0" />
                        {(['all', 'today', 'week'] as const).map((range) => (
                          <button
                            key={range}
                            onClick={() => setNewsDateFilter(range)}
                            className={`shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                              newsDateFilter === range 
                                ? 'bg-amber-600 text-white shadow-lg shadow-amber-200' 
                                : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                            }`}
                          >
                            {range === 'all' ? (language === 'kn' ? 'ಯಾವಾಗಲೂ' : 'Anytime') : 
                             range === 'today' ? (language === 'kn' ? 'ಇಂದು' : 'Today') : 
                             (language === 'kn' ? 'ಈ ವಾರ' : 'This Week')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {newsError && (
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="text-amber-600 shrink-0" size={18} />
                        <p className="text-xs font-bold text-amber-800">{newsError}</p>
                      </div>
                    )}

                    {newsLoading && news.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <Loader2 className="text-emerald-600 animate-spin" size={32} />
                        <p className="text-sm font-bold text-zinc-400 animate-pulse">
                          {language === 'kn' ? 'ಇತ್ತೀಚಿನ ಸುದ್ದಿಗಳಿಗಾಗಿ ಹುಡುಕಲಾಗುತ್ತಿದೆ...' : 'Fetching latest headlines...'}
                        </p>
                      </div>
                    ) : filteredNews.length > 0 ? (
                      filteredNews.map((item, idx) => (
                        <motion.a 
                          key={item.id}
                          href={item.url}
                          target="_blank"
                          rel="no-referrer"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="block bg-white p-4 rounded-3xl shadow-sm border border-zinc-100 hover:border-emerald-200 transition-all group"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                              item.category === 'government' ? 'bg-amber-100 text-amber-700' :
                              item.category === 'weather' ? 'bg-blue-100 text-blue-700' :
                              item.category === 'market' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-zinc-100 text-zinc-700'
                            }`}>
                              {item.category}
                            </span>
                            <span className="text-[9px] font-bold text-zinc-400">{item.date}</span>
                          </div>
                          <button
                           onClick={(e) => { e.preventDefault(); handleGenerateSummary(item.id, item.summary); }}
                           className="text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold mb-2 hover:bg-emerald-100 transition-colors"
                          >
                           {language === 'kn' ? 'ಸಾರಾಂಶ' : 'Summarize'}
                          </button>
                          {newsSummaries[item.id] && (
                            <div className="bg-emerald-50 p-3 rounded-2xl mb-2 text-xs text-zinc-700 italic">
                             {language === 'kn' ? newsSummaries[item.id].kn : newsSummaries[item.id].en}
                            </div>
                          )}
                          <h4 className="text-sm font-bold text-zinc-900 mb-1 group-hover:text-emerald-700 transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-xs text-zinc-500 leading-relaxed">
                            {item.summary}
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-400">{item.source}</span>
                            <ChevronRight size={14} className="text-zinc-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </motion.a>
                      ))
                    ) : (
                      <div className="bg-white p-8 rounded-3xl border border-dashed border-zinc-200 text-center flex flex-col items-center gap-2">
                        <AlertCircle className="text-zinc-300" size={32} />
                        <p className="text-xs font-bold text-zinc-400">
                          {language === 'kn' ? 'ಯಾವುದೇ ಸುದ್ದಿ ಲಭ್ಯವಿಲ್ಲ' : 'No recent news found'}
                        </p>
                      </div>
                    )}
                  </div>
                </>
            )}


        </section>
      </main>

      {/* Footer Navigation */}
      <nav className="w-full max-w-md bg-white border-t border-zinc-200 px-6 py-4 flex items-center justify-around z-50">
        <button 
          onClick={() => {
            setCurrentIndex(0);
            setIsSuccessStoryOpen(false);
            setIsExpertAskOpen(false);
          }}
          className={`flex flex-col items-center gap-1 transition-colors ${!isSuccessStoryOpen && !isExpertAskOpen ? 'text-emerald-600' : 'text-zinc-400'}`}
        >
          <Sprout size={24} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            {language === 'kn' ? 'ಸಲಹೆಗಳು' : 'Tips'}
          </span>
        </button>
        <button 
          onClick={() => {
            setIsSuccessStoryOpen(true);
            setIsExpertAskOpen(false);
          }}
          className={`flex flex-col items-center gap-1 transition-colors ${isSuccessStoryOpen ? 'text-emerald-600' : 'text-zinc-400'}`}
        >
          <History size={24} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            {language === 'kn' ? 'ಯಶಸ್ಸು' : 'Success'}
          </span>
        </button>
        <button 
          onClick={() => {
            setIsCropCalendarOpen(true);
            setIsExpertAskOpen(false);
            setIsSuccessStoryOpen(false);
          }}
          className={`flex flex-col items-center gap-1 transition-colors ${isCropCalendarOpen ? 'text-emerald-600' : 'text-zinc-400'}`}
        >
          <Clock size={24} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            {language === 'kn' ? 'ಕ್ಯಾಲೆಂಡರ್' : 'Calendar'}
          </span>
        </button>
        <button 
          onClick={() => {
            setIsExpertAskOpen(true);
            setIsSuccessStoryOpen(false);
            setIsCropCalendarOpen(false);
          }}
          className={`flex flex-col items-center gap-1 transition-colors ${isExpertAskOpen ? 'text-emerald-600' : 'text-zinc-400'}`}
        >
          <Camera size={24} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            {language === 'kn' ? 'ತಜ್ಞರನ್ನು ಕೇಳಿ' : 'Ask Expert'}
          </span>
        </button>
      </nav>

      {/* Crop Calendar Modal */}
      <AnimatePresence>
        {isCropCalendarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 100, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 100, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-zinc-900">
                    {language === 'kn' ? 'ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್' : 'Crop Calendar'}
                  </h3>
                  <p className="text-zinc-500 text-sm">
                    {language === 'kn' ? 'ಬೆಳೆಯ ಹಂತಗಳು ಮತ್ತು ಹವಾಮಾನ ಅಗತ್ಯಗಳು' : 'Crop stages and weather requirements'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsCropCalendarOpen(false)}
                  className="p-1 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Crop Selector */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {CROP_CALENDAR.map(crop => (
                  <button
                    key={crop.crop}
                    onClick={() => setSelectedCalendarCrop(crop)}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedCalendarCrop.crop === crop.crop 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                    }`}
                  >
                    {language === 'kn' ? crop.cropKn : crop.crop}
                  </button>
                ))}
              </div>

              {/* Calendar Timeline */}
              <div className="flex flex-col gap-6">
                {selectedCalendarCrop.stages.map((stage, idx) => (
                  <div key={idx} className="relative flex gap-4">
                    {/* Visual Line */}
                    {idx < selectedCalendarCrop.stages.length - 1 && (
                      <div className="absolute left-[13px] top-6 bottom-0 w-0.5 bg-emerald-100" />
                    )}
                    
                    {/* Circle */}
                    <div className="relative z-10 w-7 h-7 rounded-full bg-emerald-100 border-2 border-emerald-600 flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-emerald-600" />
                    </div>

                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-bold text-emerald-900">
                          {language === 'kn' ? stage.stageKn : stage.stage}
                        </h4>
                        <div className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {stage.months.map(m => language === 'kn' ? m.substring(0, 3) : m.substring(0, 3)).join(', ')}
                        </div>
                      </div>
                      <p className="text-sm text-zinc-600 mb-3 leading-relaxed">
                        {language === 'kn' ? stage.descriptionKn : stage.description}
                      </p>
                      
                      {/* Weather Condition Overlay */}
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 flex items-start gap-3">
                        <div className="text-emerald-600 mt-0.5">
                          <CloudRain size={14} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                            {language === 'kn' ? 'ಗರಿಷ್ಠ ಹವಾಮಾನ' : 'Optimal Weather'}
                          </p>
                          <p className="text-xs text-zinc-700 font-medium italic">
                            {language === 'kn' ? stage.optimalWeatherKn : stage.optimalWeather}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <button 
                onClick={() => {
                  setCategory(selectedCalendarCrop.crop);
                  setIsCropCalendarOpen(false);
                }}
                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <Sprout size={20} />
                {language === 'kn' ? `${selectedCalendarCrop.cropKn} ಸಲಹೆಗಳನ್ನು ನೋಡಿ` : `View ${selectedCalendarCrop.crop} Tips`}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Issue Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-end sm:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 100, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 100, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col gap-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900">
                    {language === 'kn' ? 'ನಿಖರವಲ್ಲದ ಮಾಹಿತಿಯನ್ನು ವರದಿ ಮಾಡಿ' : 'Report Inaccuracy'}
                  </h3>
                  <p className="text-zinc-500 text-xs">
                    {language === 'kn' ? 'ಈ ಮಾಹಿತಿಯಲ್ಲಿ ಏನು ತಪ್ಪಿದೆ ಎಂದು ನಮಗೆ ತಿಳಿಸಿ' : 'Tell us what is wrong with this tip'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsReportModalOpen(false)}
                  className="p-1 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400"
                >
                  <X size={20} />
                </button>
              </div>

              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder={language === 'kn' ? 'ವಿವರಗಳನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ...' : 'Write details here...'}
                className="w-full h-32 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none resize-none"
              />

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsReportModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 text-zinc-600 font-bold text-sm hover:bg-zinc-50 transition-all"
                >
                  {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
                </button>
                <button 
                  onClick={async () => {
                    if (reportingTipId && reportReason.trim()) {
                      await handleTipFeedback(reportingTipId, 'inaccurate', reportReason.trim());
                      setIsReportModalOpen(false);
                      setReportReason('');
                    } else if (!reportReason.trim()) {
                      alert(language === 'kn' ? 'ವರದಿ ಮಾಡಲು ಕಾರಣವನ್ನು ತಿಳಿಸಿ' : 'Please provide a reason to report');
                    }
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-100 hover:bg-red-700 transition-all"
                >
                  {language === 'kn' ? 'ವರದಿ ಸಲ್ಲಿಸಿ' : 'Submit Report'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-end sm:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 100, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 100, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col gap-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-zinc-900">
                  {language === 'kn' ? 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು' : 'Settings'}
                </h3>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Display Name */}
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block">
                    {language === 'kn' ? 'ಹೆಸರು' : 'Display Name'}
                  </label>
                  <input
                    type="text"
                    value={tempProfile.displayName || ''}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>

                {/* Language */}
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block">
                    {language === 'kn' ? 'ಭಾಷೆ' : 'Preferred Language'}
                  </label>
                  <div className="flex gap-2">
                    {['en', 'kn'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setTempProfile(prev => ({ ...prev, preferredLanguage: lang as Language }))}
                        className={`flex-1 py-2 px-4 rounded-xl text-sm font-bold border transition-all ${
                          tempProfile.preferredLanguage === lang
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                            : 'bg-white text-zinc-600 border-zinc-200 hover:border-emerald-200'
                        }`}
                      >
                        {lang === 'en' ? 'English' : 'ಕನ್ನಡ'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Favorite Crops */}
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block">
                    {language === 'kn' ? 'ನೆಚ್ಚಿನ ಬೆಳೆಗಳು' : 'Favorite Crops'}
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(tempProfile.favoriteCrops || []).map((crop) => (
                      <span 
                        key={crop}
                        className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                      >
                        {crop}
                        <button 
                          onClick={() => setTempProfile(prev => ({ 
                            ...prev, 
                            favoriteCrops: prev.favoriteCrops?.filter(c => c !== crop) 
                          }))}
                          className="hover:text-emerald-900"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={language === 'kn' ? 'ಬೆಳೆ ಸೇರಿಸಿ (ಉದಾ: ರಾಗಿ)' : 'Add crop (e.g. Ragi)'}
                      className="flex-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val && !tempProfile.favoriteCrops?.includes(val)) {
                            setTempProfile(prev => ({
                              ...prev,
                              favoriteCrops: [...(prev.favoriteCrops || []), val]
                            }));
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 text-zinc-600 font-bold text-sm hover:bg-zinc-50 transition-all"
                >
                  {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
                </button>
                <button 
                  onClick={handleUpdateProfile}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {language === 'kn' ? 'ಉಳಿಸಿ' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expert Ask Modal */}
      <AnimatePresence>
        {isExpertAskOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 100, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 100, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-zinc-900">
                    {language === 'kn' ? 'ತಜ್ಞರನ್ನು ಕೇಳಿ' : 'Ask an Expert'}
                  </h3>
                  <p className="text-zinc-500 text-sm">
                    {language === 'kn' ? 'ಕಾಯಿಲೆಯ ಚಿತ್ರವನ್ನು ಕಳುಹಿಸಿ ಅಥವಾ ನಿಮ್ಮ ವಿವರವಾಗಿ ತಿಳಿಸಿ' : 'Send a photo of the disease or describe your issue'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsExpertAskOpen(false)}
                  className="p-1 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400"
                >
                  <X size={24} />
                </button>
              </div>

              {!user ? (
                <div className="bg-emerald-50 rounded-2xl p-6 flex flex-col items-center text-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                    <UserIcon size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900">
                      {language === 'kn' ? 'ಲಾಗಿನ್ ಮಾಡಿ' : 'Please Login'}
                    </h4>
                    <p className="text-sm text-emerald-700">
                      {language === 'kn' ? 'ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಲು ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ' : 'You need to be logged in to ask questions to experts.'}
                    </p>
                    <div className="text-left w-full space-y-2 mt-4 bg-white/50 p-4 rounded-xl">
                      <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">{language === 'kn' ? 'ಲಾಗಿನ್ ಪ್ರಯೋಜನಗಳು:' : 'Login Benefits:'}</p>
                      <ul className="text-xs text-emerald-700 list-disc list-inside space-y-1">
                        <li>{language === 'kn' ? 'ನಿಮ್ಮ ಪ್ರಗತಿಯನ್ನು ಉಳಿಸಿ' : 'Save your progress & history'}</li>
                        <li>{language === 'kn' ? 'ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ಸಲಹೆ' : 'Get personalized farming advice'}</li>
                        <li>{language === 'kn' ? 'ಬೆಳೆಗಳ ಆದ್ಯತೆಗಳನ್ನು ಉಳಿಸಿ' : 'Stay synced across devices'}</li>
                      </ul>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogin}
                    className="bg-emerald-600 text-white font-bold px-6 py-2 rounded-xl shadow-md hover:bg-emerald-700 transition-all"
                  >
                    {language === 'kn' ? 'ಲಾಗಿನ್' : 'Login'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex bg-zinc-100 p-1 rounded-xl mb-2">
                    <button 
                      onClick={() => setExpertModalTab('detect')}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${expertModalTab === 'detect' ? 'bg-white text-emerald-700 shadow-sm' : 'text-zinc-500'}`}
                    >
                      {language === 'kn' ? 'ಪತ್ತೆ ಹಚ್ಚಿ' : 'Detect'}
                    </button>
                    <button 
                      onClick={() => setExpertModalTab('ask')}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${expertModalTab === 'ask' ? 'bg-white text-emerald-700 shadow-sm' : 'text-zinc-500'}`}
                    >
                      {language === 'kn' ? 'ಕೇಳಿ' : 'Ask'}
                    </button>
                  <div className="flex justify-between items-center mb-2">
                    <button 
                      onClick={() => setExpertModalTab('history')}
                      className="text-xs font-bold text-zinc-500 uppercase tracking-widest"
                    >
                      {language === 'kn' ? 'ಇತಿಹಾಸ' : 'History'}
                    </button>
                    <select 
                      onChange={(e) => setHistorySort(e.target.value as 'newest' | 'oldest' | 'rating_high' | 'rating_low')}
                      className="bg-white text-xs border border-zinc-100 rounded-lg p-1 text-zinc-600"
                    >
                      <option value="newest">{language === 'kn' ? 'ಹೊಸದು' : 'Newest'}</option>
                      <option value="oldest">{language === 'kn' ? 'ಹಳೆಯದು' : 'Oldest'}</option>
                      <option value="rating_high">{language === 'kn' ? 'ಅತ್ಯಧಿಕ ರೇಟಿಂಗ್' : 'Highest Rating'}</option>
                      <option value="rating_low">{language === 'kn' ? 'ಅತ್ಯಂತ ಕಡಿಮೆ ರೇಟಿಂಗ್' : 'Lowest Rating'}</option>
                    </select>
                  </div>
                  </div>

                  {expertModalTab === 'detect' ? (
                    isAnalyzing ? (
                      <div className="flex flex-col items-center gap-4 p-10">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                          <p className="text-zinc-600 font-bold">{language === 'kn' ? 'ರೋಗನಿರ್ಣಯ ನಡೆಯುತ್ತಿದೆ...' : 'Analyzing...'}</p>
                      </div>
                    ) : diseaseDiagnosis ? (
                      <div className="flex flex-col gap-6 p-4 bg-white rounded-2xl border border-zinc-100">
                          <h3 className="text-base font-bold text-emerald-900">Diagnosis Result</h3>
                          <div className="prose prose-sm markdown-body">
                            <ReactMarkdown>{translatedDiagnosis || diseaseDiagnosis.markdownReport}</ReactMarkdown>
                          </div>
                          <p className="text-xs text-zinc-500">Confidence: {diseaseDiagnosis.confidenceScore}%</p>
                          <button 
                            onClick={() => {
                                setDiseaseDiagnosis(null);
                                setPreviewUrl(null);
                                setSelectedFile(null);
                            }}
                            className="bg-zinc-100 text-zinc-700 py-2 rounded-xl text-sm font-bold"
                          >
                             Scan Another
                          </button>
                      </div>
                    ) : (
                    <div className="flex flex-col gap-6">
                      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
                        <div className="bg-emerald-600 p-2 rounded-xl text-white">
                          <Camera size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-emerald-900 leading-tight">
                            {language === 'kn' ? 'ಸುಧಾರಿತ ರೋಗನಿರ್ಣಯ' : 'Advanced Diagnostic Scan'}
                          </h4>
                          <p className="text-[10px] text-emerald-700 font-medium">
                            {language === 'kn' ? 'ಮಲ್ಟಿ-ಸ್ಟೇಜ್ ಮೊರ್ಫೋಲಜಿ ವಿಶ್ಲೇಷಣೆ' : 'Multi-stage morphology & pathogen scan'}
                          </p>
                        </div>
                      </div>

                      <div 
                        onClick={() => document.getElementById('detect-camera-input')?.click()}
                        className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all group overflow-hidden relative"
                      >
                        {previewUrl ? (
                          <div className="absolute inset-0">
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                               <Camera size={32} className="text-white" />
                               <p className="text-xs font-bold text-white">Change Photo</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center text-zinc-400 group-hover:text-emerald-600 transition-colors">
                              <Camera size={40} />
                            </div>
                            <p className="text-sm font-bold text-zinc-600">
                              {language === 'kn' ? 'ಚಿತ್ರ ತೆಗೆಯಿರಿ' : 'Capture Disease Photo'}
                            </p>
                          </>
                        )}
                        <input 
                          id="detect-camera-input" 
                          type="file" 
                          accept="image/*" 
                          capture="environment" 
                          className="hidden" 
                          onChange={handleFileChange}
                        />
                      </div>

                      <button 
                        onClick={() => handleSubmitExpertAsk(language === 'kn' ? 'ಈ ಚಿತ್ರದ ಲಕ್ಷಣಗಳನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ವಿಶ್ಲೇಷಿಸಿ, ಬೆಳೆ ಮತ್ತು ಭಾಗವನ್ನು ಗುರುತಿಸಿ, ಮತ್ತು ವಿವರವಾದ ರೋಗನಿರ್ಣಯವನ್ನು ನೀಡಿ.' : 'Identify the crop, plant part, and symptoms in this image. Provide a detailed scientific diagnosis using morphology analysis.')}
                        disabled={!selectedFile || isSubmitting}
                        className="w-full relative overflow-hidden bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="animate-spin" />
                            <span>{language === 'kn' ? 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...' : 'Analyzing Symptoms...'}</span>
                          </div>
                        ) : (
                          <>
                            <Zap size={20} className="text-amber-300" />
                            <span>{language === 'kn' ? 'ಸುಧಾರಿತ ವಿಶ್ಲೇಷಣೆ ಪ್ರಾರಂಭಿಸಿ' : 'Perform Advanced Analysis'}</span>
                          </>
                        )}
                      </button>
                    </div>
                    )
                  ) : expertModalTab === 'ask' ? (
                    <div className="flex flex-col gap-6">
                      <div 
                        onClick={() => document.getElementById('camera-input')?.click()}
                        className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all group overflow-hidden relative"
                      >
                        {previewUrl ? (
                          <div className="absolute inset-0">
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-30" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 group-hover:opacity-100 transition-opacity">
                               <Camera size={32} className="text-emerald-600" />
                               <p className="text-xs font-bold text-emerald-700 bg-white/80 px-2 py-1 rounded">Change Photo</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-zinc-400 group-hover:text-emerald-600 transition-colors">
                              <Camera size={32} />
                            </div>
                            <p className="text-sm font-semibold text-zinc-600">
                              {language === 'kn' ? 'ಚಿತ್ರವನ್ನು ಸೇರಿಸಿ' : 'Add Photo'}
                            </p>
                          </>
                        )}
                        <input 
                          id="camera-input" 
                          type="file" 
                          accept="image/*" 
                          capture="environment" 
                          className="hidden" 
                          onChange={handleFileChange}
                        />
                      </div>

                      <textarea 
                        placeholder={language === 'kn' ? 'ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ...' : 'Describe your problem here...'}
                        value={expertAskMsg}
                        onChange={(e) => setExpertAskMsg(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />

                      <button 
                        onClick={() => handleSubmitExpertAsk()}
                        disabled={!expertAskMsg || isSubmitting}
                        className="w-full relative overflow-hidden bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center gap-2">
                                <Loader2 className="animate-spin" />
                                <span>{language === 'kn' ? 'ತಜ್ಞರು ವಿಶ್ಲೇಷಿಸುತ್ತಿದ್ದಾರೆ...' : 'Deep Scientific Analysis...'}</span>
                              </div>
                              <span className="text-[10px] font-normal opacity-80 uppercase tracking-widest animate-pulse">
                                {language === 'kn' ? 'ಕೃಷಿ ಡೇಟಾಬೇಸ್ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ' : 'Verifying Agricultural Database'}
                              </span>
                            </div>
                            <motion.div 
                              className="absolute inset-x-0 h-[3px] bg-amber-400/50"
                              animate={{ top: ['0%', '100%', '0%'] }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            />
                          </>
                        ) : (
                          <>
                            <Zap size={20} className="text-amber-300" />
                            <span>{language === 'kn' ? 'ಸುಧಾರಿತ ತಜ್ಞರ ಸಲಹೆ ಪಡೆಯಿರಿ' : 'Get Advanced Expert Advice'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      <div className="flex gap-2">
                        <select 
                          value={historyFilterStatus}
                          onChange={(e) => setHistoryFilterStatus(e.target.value as 'all' | 'pending' | 'answered')}
                          className="bg-zinc-100 text-xs border border-zinc-200 rounded-lg p-2 text-zinc-600 font-bold"
                        >
                          <option value="all">{language === 'kn' ? 'ಎಲ್ಲಾ' : 'All'}</option>
                          <option value="pending">{language === 'kn' ? 'ಬಾಕಿ' : 'Pending'}</option>
                          <option value="answered">{language === 'kn' ? 'ಉತ್ತರಿಸಲಾಗಿದೆ' : 'Answered'}</option>
                        </select>
                      </div>

                      {myAsks.filter(a => historyFilterStatus === 'all' || a.status === historyFilterStatus).length > 0 ? (
                        Array.from(myAsks).filter(a => historyFilterStatus === 'all' || a.status === historyFilterStatus).sort((a, b) => {
                          if (historySort === 'rating_high') return (b.rating || 0) - (a.rating || 0);
                          if (historySort === 'rating_low') return (a.rating || 0) - (b.rating || 0);
                          if (historySort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                        }).map((ask, idx) => (
                          <motion.div 
                            key={ask.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col overflow-hidden"
                          >
                            <div className="p-4 flex flex-col gap-3">
                              <p className="text-sm text-zinc-800 font-semibold leading-relaxed">
                                {ask.message}
                              </p>
                              {ask.response && (
                                <div className="bg-white p-5 border-t border-zinc-100 relative">
                                  <div className="flex justify-between items-center mb-2">
                                     <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">Confidence: {ask.confidenceScore}%</span>
                                  </div>
                                  <div className="prose prose-sm max-w-none text-zinc-900 markdown-body text-xs leading-relaxed">
                                    <ReactMarkdown>{expandedResponses.has(ask.id) ? ask.response : (ask.response.length > 200 ? ask.response.slice(0, 200) + '...' : ask.response)}</ReactMarkdown>
                                  </div>
                                  
                                  <div className="flex gap-4 mt-2">
                                    {ask.response.length > 200 && (
                                      <button 
                                        onClick={() => {
                                          setExpandedResponses(prev => {
                                            const next = new Set(prev);
                                            if (next.has(ask.id)) next.delete(ask.id);
                                            else next.add(ask.id);
                                            return next;
                                          });
                                        }}
                                        className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:underline"
                                      >
                                        {expandedResponses.has(ask.id) ? (language === 'kn' ? 'ಕಡಿಮೆ ಓದಿ' : 'Read less') : (language === 'kn' ? 'ಇನ್ನಷ್ಟು ಓದಿ' : 'Read more')}
                                      </button>
                                    )}

                                    {ask.translation ? (
                                      <div className="text-xs text-zinc-600 mt-2 p-2 bg-zinc-50 rounded italic prose prose-sm max-w-none markdown-body">
                                        <span className="font-bold text-zinc-400">Translation:</span> <ReactMarkdown>{ask.translation}</ReactMarkdown>
                                      </div>
                                    ) : (
                                      <button 
                                        onClick={() => handleTranslateResponse(ask.id, ask.response || '')}
                                        disabled={isSubmitting}
                                        className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:underline"
                                      >
                                        {language === 'kn' ? 'ಅನುವಾದಿಸಿ' : 'Translate'}
                                      </button>
                                    )}
                                  </div>

                                  <div className="flex gap-1 items-center justify-end mt-4 pt-4 border-t border-zinc-100">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button key={star} onClick={() => handleExpertFeedback(ask.id, star)}>
                                        <Star size={16} className={ask.rating && ask.rating >= star ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'} />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-zinc-400 text-sm font-medium">{language === 'kn' ? 'ಇಲ್ಲಿಯವರೆಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳಿಲ್ಲ.' : 'No history yet.'}</div>
                      )}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Stories Modal */}
      <AnimatePresence>
        {isSuccessStoryOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 100, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 100, scale: 0.95 }}
              className="bg-zinc-50 w-full max-w-md rounded-3xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl flex flex-col gap-6 no-scrollbar"
            >
              <div className="flex justify-between items-center bg-white -mx-6 -mt-6 p-6 border-b border-zinc-100 rounded-t-3xl sticky top-0 z-10">
                <div>
                  <h3 className="text-2xl font-bold text-zinc-900">
                    {language === 'kn' ? 'ಯಶಸ್ಸಿನ ಕಥೆಗಳು' : 'Success Stories'}
                  </h3>
                  <p className="text-emerald-600 text-sm font-semibold uppercase tracking-wider">
                    {language === 'kn' ? 'ಸ್ಥಳೀಯ ಅನುಭವ' : 'Local Experience'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsAddingStory(!isAddingStory)}
                    className={`p-2 rounded-xl transition-all ${isAddingStory ? 'bg-zinc-100 text-zinc-500' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'}`}
                  >
                    {isAddingStory ? <X size={20} /> : <Plus size={20} />}
                  </button>
                  <button 
                    onClick={() => setIsSuccessStoryOpen(false)}
                    className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-400"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex gap-2">
                  <select 
                    value={storyCropFilter} 
                    onChange={(e) => setStoryCropFilter(e.target.value)}
                    className="flex-1 bg-white border border-zinc-200 rounded-xl py-2 px-3 text-sm focus:outline-none"
                  >
                    {['All', ...Array.from(new Set(successStories.map(s => s.crop)))].map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                  <select 
                    value={storyLocationFilter} 
                    onChange={(e) => setStoryLocationFilter(e.target.value)}
                    className="flex-1 bg-white border border-zinc-200 rounded-xl py-2 px-3 text-sm focus:outline-none"
                  >
                     {['All', ...Array.from(new Set(successStories.map(s => s.location)))].map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                <AnimatePresence>
                  {isAddingStory && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-xl shadow-emerald-50/50 mb-4 space-y-4">
                        <h4 className="text-sm font-black text-emerald-800 uppercase tracking-widest">
                          {language === 'kn' ? 'ನಿಮ್ಮ ಕಥೆಯನ್ನು ಹಂಚಿಕೊಳ್ಳಿ' : 'Share Your Success Story'}
                        </h4>
                        
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <input 
                              type="text"
                              placeholder={language === 'kn' ? 'ಬೆಳೆ (ಉದಾ: ಭತ್ತ)' : 'Crop (e.g. Paddy)'}
                              value={newStoryDraft.crop}
                              onChange={(e) => setNewStoryDraft({...newStoryDraft, crop: e.target.value})}
                              className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                            <input 
                              type="text"
                              placeholder={language === 'kn' ? 'ಊರು/ಜಿಲ್ಲೆ' : 'Location'}
                              value={newStoryDraft.location}
                              onChange={(e) => setNewStoryDraft({...newStoryDraft, location: e.target.value})}
                              className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>
                          <textarea 
                            placeholder={language === 'kn' ? 'ನಿಮ್ಮ ಯಶಸ್ಸಿನ ಕಥೆಯನ್ನು ವಿವರಿಸಿ...' : 'Describe your success story...'}
                            value={language === 'kn' ? newStoryDraft.storyKn : newStoryDraft.storyEn}
                            onChange={(e) => {
                              if (language === 'kn') setNewStoryDraft({...newStoryDraft, storyKn: e.target.value});
                              else setNewStoryDraft({...newStoryDraft, storyEn: e.target.value});
                            }}
                            rows={3}
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                          />
                          
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                              {language === 'kn' ? 'ಫೋಟೋ ಸೇರಿಸಿ' : 'Add a Photo'}
                            </label>
                            {newStoryPreview ? (
                              <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-zinc-200">
                                <img src={newStoryPreview} alt="Preview" className="w-full h-full object-cover" />
                                <button 
                                  onClick={() => {
                                    setNewStoryFile(null);
                                    setNewStoryPreview(null);
                                  }}
                                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full backdrop-blur-md"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <label className="w-full h-24 border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-zinc-50 transition-colors">
                                <Camera size={24} className="text-zinc-300" />
                                <span className="text-[10px] font-bold text-zinc-400 uppercase">{language === 'kn' ? 'ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' : 'Upload Image'}</span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setNewStoryFile(file);
                                      setNewStoryPreview(URL.createObjectURL(file));
                                    }
                                  }}
                                />
                              </label>
                            )}
                          </div>

                          <button 
                            onClick={handleSubmitSuccessStory}
                            disabled={isSubmitting}
                            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isSubmitting ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <>
                                <Send size={16} />
                                {language === 'kn' ? 'ಸಲ್ಲಿಸಿ' : 'Submit Story'}
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {successStories.filter(story => 
                   (storyCropFilter === 'All' || story.crop === storyCropFilter) &&
                   (storyLocationFilter === 'All' || story.location === storyLocationFilter)
                ).map((story) => (
                  <motion.div 
                    key={story.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl overflow-hidden shadow-xl border border-zinc-100 flex flex-col relative"
                  >
                    <div className="relative h-48">
                      <img src={story.imageUrl} alt={story.farmerName} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <div>
                          <h4 className="text-xl font-bold text-white leading-tight">{story.farmerName}</h4>
                          <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">{story.location}</span>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
                          <span className="text-white text-[10px] font-bold uppercase tracking-widest">{story.crop}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 italic relative">
                      <div className="absolute -top-4 left-4 bg-emerald-600 text-white p-2 rounded-xl shadow-lg">
                        <Quote size={16} fill="currentColor" />
                      </div>
                      <p className="text-zinc-600 text-sm leading-relaxed mt-2 pl-2 border-l-2 border-emerald-100">
                        {story.story[language]}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
