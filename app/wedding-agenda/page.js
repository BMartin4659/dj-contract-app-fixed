'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaArrowLeft, 
  FaSpinner, 
  FaCalendarAlt,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMusic,
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaRing,
  FaPray,
  FaClipboardList,
  FaBirthdayCake,
  FaMicrophoneAlt,
  FaAddressCard,
  FaUserFriends,
  FaBan,
  FaChevronDown,
  FaFemale,
  FaMale,
  FaUsers,
  FaHeart,
  FaUserTie,
  FaAddressBook,
  FaPhoneAlt
} from 'react-icons/fa';
import Image from 'next/image';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Head from 'next/head';
import ReactDatePickerField from '../components/ReactDatePickerField';
import Link from 'next/link';
import WeddingEventTypeDropdown from '../components/WeddingEventTypeDropdown';
import ClientOnly from '../components/ClientOnly';
import SuppressHydration from '../components/SuppressHydration';
import { useRouter } from 'next/navigation';
import { useFormContext } from '../contexts/FormContext';
import { getBasePriceV2 } from '../utils/weddingEventTypes';
import SongSelector from '../components/SongSelector';
import { useIsMobile } from '../hooks/useIsMobile';
import Select from 'react-select';

// Add CSS for animation
const animationStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
`;

// Song suggestions data
const SONG_SUGGESTIONS = {
  firstDance: [
    "Perfect – Ed Sheeran (2017)",
    "Lover – Taylor Swift (2019)",
    "All of Me – John Legend (2013)",
    "Say You Won't Let Go – James Arthur (2016)",
    "Beyond – Leon Bridges (2018)",
    "Falling Like the Stars – James Arthur (2019)",
    "Love Someone – Lukas Graham (2018)",
    "First Time – Kygo & Ellie Goulding (2022)"
  ],
  fatherDaughter: [
    "Yours – Post Malone (2024)",
    "My Little Girl – Tim McGraw (2006)",
    "Gracie – Ben Folds (2005)",
    "Daughters – John Mayer (2003)",
    "My Girl – The Temptations (1965)",
    "I Loved Her First – Heartland (2006)",
    "When You Wish Upon a Star – Cliff Edwards (1940)",
    "You're My Best Friend – Queen (1975)"
  ],
  motherSon: [
    "What a Wonderful World – Louis Armstrong (1967)",
    "My Wish – Rascal Flatts (2006)",
    "A Song for Mama – Boyz II Men (1997)",
    "You'll Be in My Heart – Phil Collins (1999)",
    "Humble and Kind – Tim McGraw (2015)",
    "Simple Man – Shinedown (2003)",
    "Landslide – Fleetwood Mac (1975)",
    "Unforgettable – Nat King Cole & Natalie Cole (1991)"
  ],
  bouquetToss: [
    "Single Ladies (Put a Ring on It) – Beyoncé (2008)",
    "Dear Future Husband – Meghan Trainor (2015)",
    "Love On Top – Beyoncé (2011)",
    "That's What I Like – Bruno Mars (2016)",
    "Blinding Lights – The Weeknd (2019)",
    "Girls Just Want to Have Fun – Cyndi Lauper (1983)",
    "Levitating – Dua Lipa (2020)",
    "Juice – Lizzo (2019)"
  ],
  garterToss: [
    "Pony – Ginuwine (1996)",
    "Hot in Herre – Nelly (2002)",
    "Let's Get It On – Marvin Gaye (1973)",
    "Rock Your Body – Justin Timberlake (2002)",
    "SexyBack – Justin Timberlake (2006)",
    "Drunk in Love – Beyoncé ft. Jay-Z (2013)",
    "Savage – Megan Thee Stallion (2020)",
    "Dangerous – Kardinal Offishall ft. Akon (2008)"
  ],
  partyEntrance: [
    "24K Magic – Bruno Mars (2016)",
    "Crazy in Love – Beyoncé ft. Jay-Z (2003)",
    "I Ain't Worried – OneRepublic (2022)",
    "Blinding Lights – The Weeknd (2019)",
    "As It Was – Harry Styles (2022)",
    "The Giver – Chappell Roan (2023)",
    "Bring Em Out – T.I. (2004)",
    "On Top of the World – Imagine Dragons (2012)"
  ],
  coupleEntrance: [
    "Can't Help Falling in Love – Kina Grannis (2015)",
    "Perfect – Ed Sheeran (2017)",
    "Can You Feel the Love Tonight – Elton John (1994)",
    "Time of Our Lives – Pitbull & Ne-Yo (2014)",
    "Sugar – Maroon 5 (2015)",
    "Signed, Sealed, Delivered (I'm Yours) – Stevie Wonder (1970)",
    "Marry You – Bruno Mars (2010)",
    "This Will Be (An Everlasting Love) – Natalie Cole (1975)"
  ],
  lastDance: [
    "Last Dance – Donna Summer (1978)",
    "(I've Had) The Time of My Life – Bill Medley & Jennifer Warnes (1987)",
    "Sweet Caroline – Neil Diamond (1969)",
    "All You Need is Love – The Beatles (1967)",
    "Don't Stop Believin' – Journey (1981)",
    "Closing Time – Semisonic (1998)",
    "Bye Bye Bye – NSYNC (2000)",
    "Lover – Taylor Swift (2019)"
  ]
};

// SectionHeader component for consistent styling
const SectionHeader = ({ icon, label, color = 'text-blue-500' }) => (
  <h2 className="flex items-center gap-2 text-xl font-semibold mb-3" style={{ color: '#333' }}>
    {icon && <span className={`text-xl ${color}`}>{icon}</span>}
    {label}
  </h2>
);

export default function WeddingAgendaForm() {
  // Get form context
  const { contractFormData, weddingAgendaData, updateWeddingAgendaData, updateContractFormData, isClient: contextIsClient } = useFormContext();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [eventType, setEventType] = useState('Wedding');
  const [basePrice, setBasePrice] = useState(1000);
  const [errors, setErrors] = useState({});
  const [fontLoaded, setFontLoaded] = useState(false);
  
  // Authentication state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Initial form data structure
  const initialFormData = {
    eventType: 'Wedding',
    brideName: '',
    groomName: '',
    weddingDate: null,
    email: '',
    phone: '',
    // Wedding party fields
    maidOfHonor: '',
    bestMan: '',
    bridesmaids: ['', '', ''],
    groomsmen: ['', '', ''],
    flowerGirl: '',
    ringBearer: '',
    // Existing fields - updated to separate song and artist
    entranceSong: '',
    entranceArtist: '',
    coupleEntranceSong: '',
    coupleEntranceArtist: '',
    welcome: 'Yes',
    blessing: 'Yes',
    timeline: '',
    // Timeline events with times
    cocktailHourTime: '',
    grandEntranceTime: '',
    firstDanceTime: '',
    dinnerTime: '',
    toastsTime: '',
    parentDancesTime: '',
    cakeCuttingTime: '',
    openDancingTime: '',
    lastDanceTime: '',
    // Special dances
    firstDanceSong: '',
    firstDanceArtist: '',
    fatherDaughterSong: '',
    fatherDaughterArtist: '',
    motherSonSong: '',
    motherSonArtist: '',
    bouquetTossSong: '',
    bouquetTossArtist: '',
    gatherTossSong: '',
    gatherTossArtist: '',
    lastSong: '',
    lastSongArtist: '',
    // Additional details
    specialInstructions: '',
  };
  
  const [formData, setFormData] = useState(initialFormData);
  const formRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Authentication state management
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  const [weddingDate, setWeddingDate] = useState(null);

  const handleEventTypeChange = (selected) => {
    setEventType(selected);
  };



  // Font loading effect to prevent FOUT
  useEffect(() => {
    const loadFont = async () => {
      try {
        // Check if Hugh is Life Personal Use font is already loaded
        if (document.fonts.check('1em "Hugh is Life Personal Use"')) {
          setFontLoaded(true);
          return;
        }

        // Preload the Hugh is Life Personal Use font
        const font = new FontFace(
          'Hugh is Life Personal Use',
          'url(/fonts/hugh-is-life.ttf) format("truetype")'
        );
        
        await font.load();
        document.fonts.add(font);
        
        // Small delay to ensure font is fully ready
        setTimeout(() => {
          setFontLoaded(true);
        }, 100);
      } catch (error) {
        console.error('Error loading font:', error);
        // Fallback: show content after timeout even if font fails
        setTimeout(() => {
          setFontLoaded(true);
        }, 1000);
      }
    };

    loadFont();
  }, []);

  // Initialize form data from context if available - only runs when weddingAgendaData changes
  useEffect(() => {
    if (weddingAgendaData) {
      setFormData(prevData => {
        // Only update if the data is different
        const contextDate = weddingAgendaData.weddingDate ? new Date(weddingAgendaData.weddingDate) : null;
        const currentDate = prevData.weddingDate ? new Date(prevData.weddingDate) : null;
        
        // Compare dates
        const datesEqual = (!contextDate && !currentDate) || 
          (contextDate && currentDate && contextDate.getTime() === currentDate.getTime());
        
        // If data hasn't changed, return previous state
        if (datesEqual && JSON.stringify(prevData) === JSON.stringify(weddingAgendaData)) {
          return prevData;
        }
        
        // Return new state with updated date
        return {
          ...prevData,
          ...weddingAgendaData,
          weddingDate: contextDate
        };
      });
    }
  }, [weddingAgendaData]);

  // Memoize the date change handler
  const handleDateChange = useCallback((date) => {
    try {
      const validDate = date ? new Date(date) : null;
      if (validDate && !isNaN(validDate.getTime())) {
        setFormData(prev => ({ ...prev, weddingDate: validDate }));
        setErrors(prev => ({ ...prev, weddingDate: '' }));
      } else {
        setFormData(prev => ({ ...prev, weddingDate: null }));
      }
    } catch (error) {
      console.error('Date conversion error:', error);
      setFormData(prev => ({ ...prev, weddingDate: null }));
    }
  }, []);

  // Sync form data to context - use debounce to prevent excessive updates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (updateWeddingAgendaData) {
        updateWeddingAgendaData(formData);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [formData, updateWeddingAgendaData]);

  // Sync with contract form data whenever it changes
  useEffect(() => {
    if (contextIsClient && contractFormData && Object.keys(contractFormData).length > 0) {
      console.log('Wedding agenda syncing with contract form data:', contractFormData);
      
      setFormData(prev => {
        const updatedData = { ...prev };
        let hasChanges = false;
        
        // Sync client name to bride/groom names if they're empty
        if (contractFormData.clientName && (!prev.brideName || !prev.groomName)) {
          const nameParts = contractFormData.clientName.split(' ');
          if (nameParts.length >= 2) {
            if (!prev.brideName) {
              updatedData.brideName = nameParts[0];
              hasChanges = true;
            }
            if (!prev.groomName) {
              updatedData.groomName = nameParts.slice(1).join(' ');
              hasChanges = true;
            }
          } else if (!prev.brideName) {
            updatedData.brideName = contractFormData.clientName;
            hasChanges = true;
          }
        }
        
        // Sync email
        if (contractFormData.email && !prev.email) {
          updatedData.email = contractFormData.email;
          hasChanges = true;
        }
        
        // Sync phone
        if (contractFormData.contactPhone && !prev.phone) {
          updatedData.phone = contractFormData.contactPhone;
          hasChanges = true;
        }
        
        // Sync wedding date
        if (contractFormData.eventDate && !prev.weddingDate) {
          updatedData.weddingDate = contractFormData.eventDate;
          hasChanges = true;
        }
        
        return hasChanges ? updatedData : prev;
      });
    }
  }, [contextIsClient, contractFormData]);

  // Time options for the dropdowns
  const timeOptions = [
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
    '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
    '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
    '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM',
    '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM',
    '12:00 AM', '12:30 AM', '1:00 AM', '1:30 AM', '2:00 AM'
  ];

  // Convert time string like "7:30 PM" to minutes since midnight
  const convertToMinutes = useCallback((timeStr) => {
    if (!timeStr) return 0;
    
    const [timePart, ampm] = timeStr.split(' ');
    let [hour, minute] = timePart.split(':').map(Number);
    
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    
    const total = hour * 60 + minute;
    return total < 180 ? total + 1440 : total; // if before 3:00 AM, treat as after midnight
  }, []);

  // Sync eventType state with formData.eventType
  useEffect(() => {
    if (formData.eventType && typeof formData.eventType === 'string' && formData.eventType !== eventType) {
      setEventType(formData.eventType);
    }
  }, [formData.eventType, eventType]);

  // Set base price based on event type using dynamic pricing
  useEffect(() => {
    if (eventType && typeof eventType === 'string') {
      const newBasePrice = getBasePriceV2(eventType);
      setBasePrice(newBasePrice);
    } else {
      setBasePrice(400); // Default price for non-wedding events
    }
  }, [eventType]);

  // Set document title
  useEffect(() => {
    document.title = "Wedding Agenda Form - DJ Bobby Drake";
    
    // Add meta viewport tag for mobile devices
    const viewportMeta = document.createElement('meta');
    viewportMeta.name = "viewport";
    viewportMeta.content = "width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes";
    document.getElementsByTagName('head')[0].appendChild(viewportMeta);
    
    // Debug console log
    console.log('Wedding Agenda Form mounted');
    
    return () => {
      document.title = "DJ Bobby Drake";
      if (document.querySelector('meta[name="viewport"]')) {
        document.querySelector('meta[name="viewport"]').remove();
      }
    };
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Handler for wedding party array fields (bridesmaids, groomsmen)
  const handlePartyMemberChange = (group, index, value) => {
    setFormData(prev => {
      const updatedArray = [...prev[group]];
      updatedArray[index] = value;
      const newData = { ...prev, [group]: updatedArray };
      return newData;
    });
  };

  // Add a new field to bridesmaids or groomsmen
  const addPartyMember = (group) => {
    setFormData(prev => {
      const newData = { 
        ...prev, 
        [group]: [...prev[group], ''] 
      };
      return newData;
    });
  };

  // Remove a field from bridesmaids or groomsmen
  const removePartyMember = (group, index) => {
    setFormData(prev => {
      if (prev[group].length <= 3) return prev; // Keep at least 3 fields
      
      const updatedArray = [...prev[group]];
      updatedArray.splice(index, 1);
      const newData = { 
        ...prev, 
        [group]: updatedArray 
      };
      return newData;
    });
  };

  const validate = () => {
    const newErrors = {};
    
    // Required fields - only the most essential ones
    if (!formData.brideName) newErrors.brideName = 'Required';
    if (!formData.groomName) newErrors.groomName = 'Required';
    if (!formData.weddingDate) newErrors.weddingDate = 'Required';
    
    // Contact info validation - make phone optional
    if (!formData.email) newErrors.email = 'Required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    // Phone is now optional - removed the requirement
    
    // Make entrance music required
    if (!formData.entranceSong) newErrors.entranceMusic = 'Wedding Party Entrance Music is required';
    if (!formData.coupleEntranceSong) newErrors.coupleEntranceMusic = 'Bride & Groom Entrance Song is required';
    
    // Very flexible timeline validation - just check that at least one timeline element is specified
    const hasAnyTimelineEvent = formData.cocktailHourTime || 
                               formData.grandEntranceTime || 
                               formData.firstDanceTime || 
                               formData.dinnerTime || 
                               formData.toastsTime ||
                               formData.parentDancesTime ||
                               formData.cakeCuttingTime ||
                               formData.openDancingTime ||
                               formData.lastDanceTime;
    
    // Make timeline optional too - only warn if completely empty
    if (!hasAnyTimelineEvent) {
      // Don't make this a hard error, just a warning
      console.log('Warning: No timeline events specified, but allowing submission');
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Add to Firebase
      const docRef = await addDoc(collection(db, 'weddingAgendas'), { 
        ...formData, 
        basePrice,
        createdAt: serverTimestamp() 
      });
      
      // Send email notification
      await sendEmailNotification();
      
      // Show success and reset form
      setSubmitted(true);
      setIsSubmitting(false);
      toast.success('Wedding agenda submitted successfully!');
    } catch (error) {
      console.error('Error submitting agenda:', error);
      setIsSubmitting(false);
      toast.error('Error submitting agenda. Please try again.');
    }
  };

  const sendEmailNotification = async () => {
    try {
      // Format the bridesmaids and groomsmen arrays to strings
      const bridesmaidsList = formData.bridesmaids.filter(item => item.trim() !== '').join('\n');
      const groomsmenList = formData.groomsmen.filter(item => item.trim() !== '').join('\n');
      
      // Combine timeline events into a formatted string
      const timelineText = [
        formData.cocktailHourTime ? `${formData.cocktailHourTime} - Cocktail Hour` : '',
        formData.grandEntranceTime ? `${formData.grandEntranceTime} - Grand Entrance` : '',
        formData.firstDanceTime ? `${formData.firstDanceTime} - First Dance` : '',
        formData.dinnerTime ? `${formData.dinnerTime} - Dinner Served` : '',
        formData.toastsTime ? `${formData.toastsTime} - Toasts` : '',
        formData.parentDancesTime ? `${formData.parentDancesTime} - Parent Dances` : '',
        formData.cakeCuttingTime ? `${formData.cakeCuttingTime} - Cake Cutting` : '',
        formData.openDancingTime ? `${formData.openDancingTime} - Open Dancing` : '',
        formData.lastDanceTime ? `${formData.lastDanceTime} - Last Dance` : '',
      ].filter(Boolean).join('\n');

      const response = await fetch('/api/send-wedding-agenda', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          bridesmaids: bridesmaidsList,
          groomsmen: groomsmenList,
          timeline: timelineText, // Use the formatted timeline
          basePrice
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send email notification');
      }
      
      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  };

  const resetForm = () => {
    setFormData({
      eventType: 'Wedding',
      brideName: '',
      groomName: '',
      weddingDate: null,
      email: '',
      phone: '',
      // Wedding party fields
      maidOfHonor: '',
      bestMan: '',
      bridesmaids: ['', '', ''],
      groomsmen: ['', '', ''],
      flowerGirl: '',
      ringBearer: '',
      // Reset entrance music to separate fields
      entranceSong: '',
      entranceArtist: '',
      coupleEntranceSong: '',
      coupleEntranceArtist: '',
      welcome: 'Yes',
      blessing: 'Yes',
      timeline: '',
      // Reset timeline events with times
      cocktailHourTime: '',
      grandEntranceTime: '',
      firstDanceTime: '',
      dinnerTime: '',
      toastsTime: '',
      parentDancesTime: '',
      cakeCuttingTime: '',
      openDancingTime: '',
      lastDanceTime: '',
      // Reset special dances
      firstDanceSong: '',
      firstDanceArtist: '',
      fatherDaughterSong: '',
      fatherDaughterArtist: '',
      motherSonSong: '',
      motherSonArtist: '',
      bouquetTossSong: '',
      bouquetTossArtist: '',
      gatherTossSong: '',
      gatherTossArtist: '',
      lastSong: '',
      lastSongArtist: '',
      // Reset additional details
      specialInstructions: ''
    });
    setErrors({});
    setSubmitted(false);
  };

  // Function to produce time slots that are chronologically valid
  const getValidTimeOptions = (currentField) => {
    const fields = [
      'cocktailHourTime',
      'grandEntranceTime',
      'firstDanceTime',
      'dinnerTime',
      'toastsTime',
      'parentDancesTime',
      'cakeCuttingTime',
      'openDancingTime',
      'lastDanceTime'
    ];
    
    // Find the current field index
    const currentIndex = fields.indexOf(currentField);
    
    // Get the field before
    const prevField = currentIndex > 0 ? fields[currentIndex - 1] : null;
    // Get the field after 
    const nextField = currentIndex < fields.length - 1 ? fields[currentIndex + 1] : null;
    
    // Get times from prev and next fields
    const prevTime = prevField ? formData[prevField] : null;
    const nextTime = nextField ? formData[nextField] : null;
    
    // If no constraints, return all options
    if (!prevTime && !nextTime) return timeOptions;
    
    // Filter based on constraints with 30-minute minimum gap
    return timeOptions.filter(time => {
      const timeMinutes = convertToMinutes(time);
      
      // Check if time is at least 30 minutes after previous field
      const isAfterPrev = !prevTime || timeMinutes >= (convertToMinutes(prevTime) + 30);
      
      // Check if time is at least 30 minutes before next field
      const isBeforeNext = !nextTime || timeMinutes <= (convertToMinutes(nextTime) - 30);
      
      return isAfterPrev && isBeforeNext;
    });
  };

  if (submitted) {
    return (
      <ClientOnly>
        <SuppressHydration>
          <div className="min-h-screen p-6 flex flex-col items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
              <div className="text-center mb-6">
                <Image 
                  src="/wedding-agenda-logo.png" 
                  alt="Wedding Agenda Logo" 
                  width={120} 
                  height={120} 
                  className="mx-auto mb-4 rounded-full"
                  unoptimized
                  priority
                />
                <h1 className="text-2xl font-bold text-indigo-600">Success!</h1>
                <p className="text-gray-600 mt-2">Your wedding agenda has been submitted.</p>
              </div>
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaCheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      We&apos;ve received your wedding agenda details. You&apos;ll receive a confirmation email shortly.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Link
                  href="/"
                  className="mx-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaArrowLeft className="mr-2 -ml-1 h-4 w-4" />
                  Return Home
                </Link>
                <button
                  onClick={resetForm}
                  className="mx-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Submit Another
                </button>
              </div>
            </div>
            <ToastContainer />
          </div>
        </SuppressHydration>
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <SuppressHydration>
        <Head>
          <title>Wedding Agenda Form - DJ Bobby Drake</title>
          <meta name="description" content="Complete your wedding agenda details with DJ Bobby Drake" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        </Head>



        <div className="min-h-screen flex items-center justify-center" style={{ padding: isMobile ? '2px' : '1rem' }}>
          <style jsx global>{`
            @font-face {
              font-family: 'Hugh is Life Personal Use';
              src: url('/fonts/hugh-is-life.ttf') format('truetype');
              font-weight: normal;
              font-style: normal;
              font-display: swap;
            }

            ${animationStyles}
            
            /* Mobile-specific adjustments only */
            @media (max-width: 768px) {
              body {
                background-attachment: scroll !important;
              }
              
              /* Improved touch targets for mobile */
              input, select, button, textarea {
                min-height: 44px;
                font-size: 16px !important;
                -webkit-appearance: none;
                appearance: none;
              }
              
              /* Better spacing for mobile form elements */
              .grid {
                gap: 1.25rem !important;
              }
              
              /* Ensure buttons are easier to tap */
              button[type="submit"] {
                padding: 0.875rem 1.5rem !important;
                min-height: 52px !important;
              }
              
              /* Improve form section spacing on mobile */
              .section-header {
                margin-top: 2.5rem !important;
              }
              
              /* Make sure select arrows are visible */
              select {
                background-position: right 12px center !important;
                background-size: 12px !important;
                padding-right: 35px !important;
              }
            }
            
            /* Fix for iOS button hover states */
            @media (hover: none) {
              button:hover {
                background-color: initial !important;
              }
              
              button[type="submit"]:hover {
                background-color: #1a73e8 !important;
              }
            }
            
            /* iOS-specific adjustments only */
            @supports (-webkit-touch-callout: none) {
              body {
                background-attachment: scroll !important;
              }
              
              /* Prevent zoom on iOS input focus */
              input, select, textarea {
                font-size: 16px !important;
                -webkit-appearance: none;
                appearance: none;
                border-radius: 8px !important;
              }
              
              /* Fix iOS scrolling issues */
              .min-h-screen {
                min-height: -webkit-fill-available;
              }
            }
          `}</style>
          
          {/* Main form container */}
          <div 
            className="wedding-agenda-form"
            style={{ 
              maxWidth: '800px',
              width: isMobile ? '98%' : '96%',
              margin: isMobile ? '1rem auto 2rem auto' : '2rem auto 3rem auto'
            }}
          >
            <form 
              onSubmit={handleSubmit}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                padding: isMobile ? '1rem' : '2.5rem',
                borderRadius: isMobile ? '8px' : '20px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                width: '100%',
                marginBottom: '50px',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}
            >
              {/* Header with Wedding Logo */}
              <div style={{
                textAlign: 'center',
                marginBottom: '30px',
                position: 'relative',
                maxWidth: '100%',
                padding: '0 10px'
              }}>
                <div style={{
                  width: isMobile ? '80px' : '120px',
                  height: isMobile ? '80px' : '120px',
                  margin: '0 auto 15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Image
                    src="/wedding-agenda-logo.png"
                    alt="Wedding Agenda Logo"
                    width={isMobile ? 80 : 120}
                    height={isMobile ? 80 : 120}
                    priority
                    style={{
                      width: '100%',
                      height: 'auto',
                      objectFit: 'contain'
                    }}
                  />
                </div>
                
                <h1 style={{
                  fontSize: 'clamp(50px, 7.2vw, 65px)',
                  fontFamily: '"Hugh is Life Personal Use", sans-serif',
                  fontWeight: 'normal',
                  margin: '10px auto',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  lineHeight: '1.2',
                  maxWidth: '100%',
                  textAlign: 'center',
                  flexWrap: 'nowrap',
                  whiteSpace: 'nowrap'
                }}>
                  <span>Wedding Agenda</span>
                </h1>
              </div>

              {/* Spacer div */}
              <div style={{ 
                height: '20px', 
                marginBottom: '20px', 
                borderBottom: '1px solid #e0e0e0',
                opacity: 0.5
              }} className="section-divider"></div>

              {/* Event Type and Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ marginBottom: '2.5rem' }}>
                <div>
                  <label 
                    htmlFor="eventType" 
                    className="field-label"
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                      color: '#333',
                      fontSize: 'clamp(16px, 2.5vw, 18px)'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <FaMusic style={{ marginRight: '8px', color: '#9F7AEA' }} /> Event Type *
                    </span>
                  </label>
                  <WeddingEventTypeDropdown
                    value={formData.eventType}
                    onChange={handleEventTypeChange}
                    style={{
                      backgroundColor: 'white',
                      width: '100%',
                      padding: 'clamp(12px, 2vw, 16px)',
                      marginBottom: '1rem',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                      color: '#1a1a1a',
                      fontSize: 'clamp(16px, 2.5vw, 18px)',
                      minHeight: '44px',
                      lineHeight: '1.4',
                      WebkitAppearance: 'none',
                      appearance: 'none',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    className="field-input"
                  />
                </div>
                <div>
                  <label 
                    htmlFor="weddingDate" 
                    className="field-label"
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                      color: '#333',
                      fontSize: 'clamp(16px, 2.5vw, 18px)'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <FaCalendarAlt style={{ marginRight: '8px', color: '#D53F8C' }} /> Wedding Date *
                    </span>
                  </label>
                  <ReactDatePickerField
                    id="weddingDate"
                    name="weddingDate"
                    selectedDate={formData.weddingDate}
                    onChange={handleDateChange}
                    placeholder="Select wedding date"
                    error={errors.weddingDate}
                    minDate={new Date()}
                    style={{
                      backgroundColor: 'white',
                      width: '100%',
                      padding: 'clamp(12px, 2vw, 16px)',
                      marginBottom: '1rem',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                      color: '#1a1a1a',
                      fontSize: 'clamp(16px, 2.5vw, 18px)',
                      minHeight: '44px',
                      lineHeight: '1.4',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    className="field-input"
                  />
                </div>
              </div>

              {/* Contact Information Section */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{
                  fontSize: 'clamp(18px, 3vw, 22px)',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem',
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaAddressBook style={{ color: '#4299E1' }} />
                  Contact Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label 
                      htmlFor="email" 
                      className="field-label"
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 'bold',
                        color: '#333',
                        fontSize: 'clamp(16px, 2.5vw, 18px)'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        <FaEnvelope style={{ marginRight: '8px', color: '#ED8936' }} /> Email *
                      </span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                      style={{
                        backgroundColor: 'white',
                        width: '100%',
                        padding: 'clamp(12px, 2vw, 16px)',
                        marginBottom: '1rem',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        color: '#1a1a1a',
                        fontSize: 'clamp(16px, 2.5vw, 18px)',
                        fontWeight: '500',
                        minHeight: '44px',
                        lineHeight: '1.4',
                        WebkitAppearance: 'none',
                        appearance: 'none',
                        outline: 'none',
                        boxSizing: 'border-box',
                        userSelect: 'text',
                        WebkitUserSelect: 'text'
                      }}
                      className={`field-input ${errors.email ? 'border-red-500' : ''}`}
                    />
                  </div>
                  <div>
                    <label 
                      htmlFor="phone" 
                      className="field-label"
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 'bold',
                        color: '#333',
                        fontSize: 'clamp(16px, 2.5vw, 18px)'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        <FaPhoneAlt style={{ marginRight: '8px', color: '#48BB78' }} /> Phone *
                      </span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="(123) 456-7890"
                      style={{
                        backgroundColor: 'white',
                        width: '100%',
                        padding: 'clamp(12px, 2vw, 16px)',
                        marginBottom: '1rem',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        color: '#1a1a1a',
                        fontSize: 'clamp(16px, 2.5vw, 18px)',
                        fontWeight: '500',
                        minHeight: '44px',
                        lineHeight: '1.4',
                        WebkitAppearance: 'none',
                        appearance: 'none',
                        outline: 'none',
                        boxSizing: 'border-box',
                        userSelect: 'text',
                        WebkitUserSelect: 'text'
                      }}
                      className={`field-input ${errors.phone ? 'border-red-500' : ''}`}
                    />
                  </div>
                </div>
              </div>

              {/* Wedding Party Information */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{
                  fontSize: 'clamp(18px, 3vw, 22px)',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem',
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaHeart style={{ color: '#F56565' }} />
                  Wedding Party
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label 
                      htmlFor="brideName" 
                      className="field-label"
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 'bold',
                        color: '#333',
                        fontSize: 'clamp(16px, 2.5vw, 18px)'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                                                 <FaFemale style={{ marginRight: '8px', color: '#F687B3' }} /> Bride&apos;s Name
                      </span>
                    </label>
                    <input
                      type="text"
                      id="brideName"
                      name="brideName"
                      value={formData.brideName}
                      onChange={handleChange}
                      placeholder="Bride's full name"
                      style={{
                        backgroundColor: 'white',
                        width: '100%',
                        padding: 'clamp(12px, 2vw, 16px)',
                        marginBottom: '1rem',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        color: '#1a1a1a',
                        fontSize: 'clamp(16px, 2.5vw, 18px)',
                        fontWeight: '500',
                        minHeight: '44px',
                        lineHeight: '1.4',
                        WebkitAppearance: 'none',
                        appearance: 'none',
                        outline: 'none',
                        boxSizing: 'border-box',
                        userSelect: 'text',
                        WebkitUserSelect: 'text'
                      }}
                      className="field-input"
                    />
                  </div>
                  <div>
                    <label 
                      htmlFor="groomName" 
                      className="field-label"
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 'bold',
                        color: '#333',
                        fontSize: 'clamp(16px, 2.5vw, 18px)'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                                                 <FaMale style={{ marginRight: '8px', color: '#4299E1' }} /> Groom&apos;s Name
                      </span>
                    </label>
                    <input
                      type="text"
                      id="groomName"
                      name="groomName"
                      value={formData.groomName}
                      onChange={handleChange}
                      placeholder="Groom's full name"
                      style={{
                        backgroundColor: 'white',
                        width: '100%',
                        padding: 'clamp(12px, 2vw, 16px)',
                        marginBottom: '1rem',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        color: '#1a1a1a',
                        fontSize: 'clamp(16px, 2.5vw, 18px)',
                        fontWeight: '500',
                        minHeight: '44px',
                        lineHeight: '1.4',
                        WebkitAppearance: 'none',
                        appearance: 'none',
                        outline: 'none',
                        boxSizing: 'border-box',
                        userSelect: 'text',
                        WebkitUserSelect: 'text'
                      }}
                      className="field-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label 
                      htmlFor="maidOfHonor" 
                      className="field-label"
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 'bold',
                        color: '#333',
                        fontSize: 'clamp(16px, 2.5vw, 18px)'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        <FaUserFriends style={{ marginRight: '8px', color: '#ED8936' }} /> Maid of Honor
                      </span>
                    </label>
                    <input
                      type="text"
                      id="maidOfHonor"
                      name="maidOfHonor"
                      value={formData.maidOfHonor}
                      onChange={handleChange}
                      placeholder="Maid of Honor's name"
                      style={{
                        backgroundColor: 'white',
                        width: '100%',
                        padding: 'clamp(12px, 2vw, 16px)',
                        marginBottom: '1rem',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        color: '#1a1a1a',
                        fontSize: 'clamp(16px, 2.5vw, 18px)',
                        fontWeight: '500',
                        minHeight: '44px',
                        lineHeight: '1.4',
                        WebkitAppearance: 'none',
                        appearance: 'none',
                        outline: 'none',
                        boxSizing: 'border-box',
                        userSelect: 'text',
                        WebkitUserSelect: 'text'
                      }}
                      className="field-input"
                    />
                  </div>
                  <div>
                    <label 
                      htmlFor="bestMan" 
                      className="field-label"
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 'bold',
                        color: '#333',
                        fontSize: 'clamp(16px, 2.5vw, 18px)'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        <FaUserTie style={{ marginRight: '8px', color: '#805AD5' }} /> Best Man
                      </span>
                    </label>
                    <input
                      type="text"
                      id="bestMan"
                      name="bestMan"
                      value={formData.bestMan}
                      onChange={handleChange}
                      placeholder="Best Man's name"
                      style={{
                        backgroundColor: 'white',
                        width: '100%',
                        padding: 'clamp(12px, 2vw, 16px)',
                        marginBottom: '1rem',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        color: '#1a1a1a',
                        fontSize: 'clamp(16px, 2.5vw, 18px)',
                        fontWeight: '500',
                        minHeight: '44px',
                        lineHeight: '1.4',
                        WebkitAppearance: 'none',
                        appearance: 'none',
                        outline: 'none',
                        boxSizing: 'border-box',
                        userSelect: 'text',
                        WebkitUserSelect: 'text'
                      }}
                      className="field-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label 
                      htmlFor="bridesmaids" 
                      className="field-label"
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 'bold',
                        color: '#333',
                        fontSize: 'clamp(16px, 2.5vw, 18px)'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        <FaUsers style={{ marginRight: '8px', color: '#F687B3' }} /> Bridesmaids
                      </span>
                    </label>
                    <p className="text-sm text-blue-700 font-semibold mb-4">List Bridesmaids In Order Of Entrance</p>
                    <div className="space-y-4">
                      {formData.bridesmaids.map((bridesmaid, index) => (
                        <div key={`bridesmaid-${index}`} style={{ marginBottom: isMobile ? '16px' : '24px' }}>
                          <input
                            type="text"
                            value={bridesmaid}
                            onChange={(e) => handlePartyMemberChange('bridesmaids', index, e.target.value)}
                            placeholder={`Bridesmaid #${index + 1}`}
                            style={{
                              backgroundColor: 'white',
                              width: '100%',
                              padding: 'clamp(12px, 2vw, 16px)',
                              marginBottom: '1rem',
                              borderRadius: '8px',
                              border: '1px solid #ccc',
                              color: '#1a1a1a',
                              fontSize: 'clamp(16px, 2.5vw, 18px)',
                              fontWeight: '500',
                              minHeight: '44px',
                              lineHeight: '1.4',
                              WebkitAppearance: 'none',
                              appearance: 'none',
                              outline: 'none',
                              boxSizing: 'border-box',
                              userSelect: 'text',
                              WebkitUserSelect: 'text'
                            }}
                            className="field-input"
                          />
                        </div>
                      ))}
                      
                      {/* Remove buttons section - only show if there are more than 3 bridesmaids */}
                      {formData.bridesmaids.length > 3 && (
                        <div style={{ marginTop: '12px', marginBottom: '16px' }}>
                          {formData.bridesmaids.slice(3).map((_, removeIndex) => (
                            <div key={`remove-${removeIndex + 3}`} style={{ 
                              marginBottom: '12px',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <button 
                                type="button"
                                onClick={() => removePartyMember('bridesmaids', removeIndex + 3)}
                                style={{
                                  backgroundColor: '#fef2f2',
                                  color: '#ef4444',
                                  border: '1px solid #ef4444',
                                  borderRadius: '8px',
                                  padding: 'clamp(12px, 2vw, 16px)',
                                  fontSize: 'clamp(14px, 2.2vw, 16px)',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'flex-start',
                                  transition: 'all 0.2s ease-in-out',
                                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.15)',
                                  width: '100%',
                                  minHeight: isMobile ? '44px' : 'clamp(44px, 3vw, 52px)',
                                  gap: '8px'
                                }}
                                onMouseOver={(e) => {
                                  e.target.style.backgroundColor = '#ef4444';
                                  e.target.style.color = 'white';
                                  e.target.style.transform = 'translateY(-1px)';
                                  e.target.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.25)';
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.backgroundColor = '#fef2f2';
                                  e.target.style.color = '#ef4444';
                                  e.target.style.transform = 'translateY(0)';
                                  e.target.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.15)';
                                }}
                                aria-label={`Remove bridesmaid ${removeIndex + 4}`}
                              >
                                <FaBan style={{ fontSize: 'clamp(14px, 2.2vw, 16px)', flexShrink: 0 }} />
                                <span style={{ fontSize: 'clamp(16px, 2.5vw, 18px)', flexShrink: 0 }}>👩🏽</span>
                                <span style={{ fontSize: 'clamp(14px, 2.2vw, 16px)' }}>Remove Bridesmaid #{removeIndex + 4}</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div style={{ 
                        marginTop: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '0'
                      }}>
                        <button 
                          type="button"
                          onClick={() => addPartyMember('bridesmaids')}
                          style={{
                            backgroundColor: '#f0f9ff',
                            color: '#22c55e',
                            border: '1px solid #22c55e',
                            borderRadius: '8px',
                            padding: 'clamp(12px, 2vw, 16px)',
                            fontSize: 'clamp(14px, 2.2vw, 16px)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease-in-out',
                            boxShadow: '0 2px 4px rgba(34, 197, 94, 0.15)',
                            width: '100%',
                            minHeight: isMobile ? '44px' : 'clamp(44px, 3vw, 52px)',
                            gap: '8px'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#22c55e';
                            e.target.style.color = 'white';
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(34, 197, 94, 0.25)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#f0f9ff';
                            e.target.style.color = '#22c55e';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 4px rgba(34, 197, 94, 0.15)';
                          }}
                          aria-label="Add bridesmaid"
                        >
                          <span style={{ fontSize: 'clamp(16px, 2.5vw, 18px)' }}>👩🏽</span>
                          <span>Add Bridesmaid</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label 
                      htmlFor="groomsmen" 
                      className="field-label"
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 'bold',
                        color: '#333',
                        fontSize: 'clamp(16px, 2.5vw, 18px)'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        <FaUsers style={{ marginRight: '8px', color: '#4299E1' }} /> Groomsmen
                      </span>
                    </label>
                    <p className="text-sm text-blue-700 font-semibold mb-4">List Groomsmen In Order Of Entrance</p>
                    <div className="space-y-4">
                      {formData.groomsmen.map((groomsman, index) => (
                        <div key={`groomsman-${index}`} style={{ marginBottom: isMobile ? '16px' : '24px' }}>
                          <input
                            type="text"
                            value={groomsman}
                            onChange={(e) => handlePartyMemberChange('groomsmen', index, e.target.value)}
                            placeholder={`Groomsman #${index + 1}`}
                            style={{
                              backgroundColor: 'white',
                              width: '100%',
                              padding: 'clamp(12px, 2vw, 16px)',
                              marginBottom: '1rem',
                              borderRadius: '8px',
                              border: '1px solid #ccc',
                              color: '#1a1a1a',
                              fontSize: 'clamp(16px, 2.5vw, 18px)',
                              fontWeight: '500',
                              minHeight: '44px',
                              lineHeight: '1.4',
                              WebkitAppearance: 'none',
                              appearance: 'none',
                              outline: 'none',
                              boxSizing: 'border-box',
                              userSelect: 'text',
                              WebkitUserSelect: 'text'
                            }}
                            className="field-input"
                          />
                        </div>
                      ))}
                      
                      {/* Remove buttons section - only show if there are more than 3 groomsmen */}
                      {formData.groomsmen.length > 3 && (
                        <div style={{ marginTop: '12px', marginBottom: '16px' }}>
                          {formData.groomsmen.slice(3).map((_, removeIndex) => (
                            <div key={`remove-${removeIndex + 3}`} style={{ 
                              marginBottom: '12px',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <button 
                                type="button"
                                onClick={() => removePartyMember('groomsmen', removeIndex + 3)}
                                style={{
                                  backgroundColor: '#fef2f2',
                                  color: '#ef4444',
                                  border: '1px solid #ef4444',
                                  borderRadius: '8px',
                                  padding: 'clamp(12px, 2vw, 16px)',
                                  fontSize: 'clamp(14px, 2.2vw, 16px)',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'flex-start',
                                  transition: 'all 0.2s ease-in-out',
                                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.15)',
                                  width: '100%',
                                  minHeight: isMobile ? '44px' : 'clamp(44px, 3vw, 52px)',
                                  gap: '8px'
                                }}
                                onMouseOver={(e) => {
                                  e.target.style.backgroundColor = '#ef4444';
                                  e.target.style.color = 'white';
                                  e.target.style.transform = 'translateY(-1px)';
                                  e.target.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.25)';
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.backgroundColor = '#fef2f2';
                                  e.target.style.color = '#ef4444';
                                  e.target.style.transform = 'translateY(0)';
                                  e.target.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.15)';
                                }}
                                aria-label={`Remove groomsman ${removeIndex + 4}`}
                              >
                                <FaBan style={{ fontSize: 'clamp(14px, 2.2vw, 16px)', flexShrink: 0 }} />
                                <span style={{ fontSize: 'clamp(16px, 2.5vw, 18px)', flexShrink: 0 }}>🤵🏽</span>
                                <span style={{ fontSize: 'clamp(14px, 2.2vw, 16px)' }}>Remove Groomsman #{removeIndex + 4}</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div style={{ 
                        marginTop: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '0'
                      }}>
                        <button 
                          type="button"
                          onClick={() => addPartyMember('groomsmen')}
                          style={{
                            backgroundColor: '#f0f9ff',
                            color: '#22c55e',
                            border: '1px solid #22c55e',
                            borderRadius: '8px',
                            padding: 'clamp(12px, 2vw, 16px)',
                            fontSize: 'clamp(14px, 2.2vw, 16px)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease-in-out',
                            boxShadow: '0 2px 4px rgba(34, 197, 94, 0.15)',
                            width: '100%',
                            minHeight: isMobile ? '44px' : 'clamp(44px, 3vw, 52px)',
                            gap: '8px'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#22c55e';
                            e.target.style.color = 'white';
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(34, 197, 94, 0.25)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#f0f9ff';
                            e.target.style.color = '#22c55e';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 4px rgba(34, 197, 94, 0.15)';
                          }}
                          aria-label="Add groomsman"
                        >
                          <span style={{ fontSize: 'clamp(16px, 2.5vw, 18px)' }}>🤵🏽</span>
                          <span>Add Groomsman</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flower Girl and Ring Bearer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ marginBottom: '2.5rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                    color: '#333',
                    fontSize: 'clamp(16px, 2.5vw, 18px)'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                              👧🏽 Flower Girl
                    </span>
                  </label>
                  <input
                    id="flowerGirl"
                    type="text"
                    name="flowerGirl"
                    value={formData.flowerGirl}
                    onChange={handleChange}
                    style={{
                      backgroundColor: 'white',
                      width: '100%',
                      padding: 'clamp(12px, 2vw, 16px)',
                      marginBottom: '1rem',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                      color: '#1a1a1a',
                      fontSize: 'clamp(16px, 2.5vw, 18px)',
                      fontWeight: '500',
                      minHeight: '44px',
                      lineHeight: '1.4',
                      WebkitAppearance: 'none',
                      appearance: 'none',
                      outline: 'none',
                      boxSizing: 'border-box',
                      userSelect: 'text',
                      WebkitUserSelect: 'text'
                    }}
                    className="field-input"
                    placeholder="Enter flower girl's name (if applicable)"
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                    color: '#333',
                    fontSize: 'clamp(16px, 2.5vw, 18px)'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                              👦🏽 Ring Bearer
                    </span>
                  </label>
                  <input
                    id="ringBearer"
                    type="text"
                    name="ringBearer"
                    value={formData.ringBearer}
                    onChange={handleChange}
                    style={{
                      backgroundColor: 'white',
                      width: '100%',
                      padding: 'clamp(12px, 2vw, 16px)',
                      marginBottom: '1rem',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                      color: '#1a1a1a',
                      fontSize: 'clamp(16px, 2.5vw, 18px)',
                      fontWeight: '500',
                      minHeight: '44px',
                      lineHeight: '1.4',
                      WebkitAppearance: 'none',
                      appearance: 'none',
                      outline: 'none',
                      boxSizing: 'border-box',
                      userSelect: 'text',
                      WebkitUserSelect: 'text'
                    }}
                    className="field-input"
                    placeholder="Enter ring bearer's name (if applicable)"
                  />
                </div>
              </div>

              {/* Entrance Music */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{
                  fontSize: 'clamp(18px, 3vw, 22px)',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem',
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaMusic style={{ color: '#9F7AEA' }} /> Entrance Music
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                      color: '#333',
                      fontSize: 'clamp(16px, 2.5vw, 18px)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', fontSize: '15px' }}>
                        🎉 Wedding Party Entrance Song *
                      </span>
                    </label>
                    <SongSelector
                      songValue={formData.entranceSong}
                      artistValue={formData.entranceArtist || ""}
                      onSongChange={handleChange}
                      onArtistChange={handleChange}
                      songName="entranceSong"
                      artistName="entranceArtist"
                      suggestions={SONG_SUGGESTIONS.partyEntrance}
                      isMobile={isMobile}
                    />
                    {/* Error message placeholder for alignment */}
                    <div style={{ minHeight: '1.25rem' }}>
                      {errors.entranceMusic && <p className="mt-1 text-xs text-red-500">{errors.entranceMusic}</p>}
                    </div>
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                      color: '#333',
                      fontSize: 'clamp(16px, 2.5vw, 18px)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', fontSize: '15px' }}>
                        💑 Bride & Groom Entrance Song *
                      </span>
                    </label>
                    <SongSelector
                      songValue={formData.coupleEntranceSong}
                      artistValue={formData.coupleEntranceArtist || ""}
                      onSongChange={handleChange}
                      onArtistChange={handleChange}
                      songName="coupleEntranceSong"
                      artistName="coupleEntranceArtist"
                      suggestions={SONG_SUGGESTIONS.coupleEntrance}
                      isMobile={isMobile}
                    />
                    {/* Matching error message placeholder for alignment */}
                    <div style={{ minHeight: '1.25rem' }}>
                      {errors.coupleEntranceMusic && <p className="mt-1 text-xs text-red-500">{errors.coupleEntranceMusic}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Welcome and Blessing */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{
                  fontSize: 'clamp(18px, 3vw, 22px)',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem',
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaPray style={{ color: '#38B2AC' }} /> Welcome and Blessing
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                      color: '#333',
                      fontSize: 'clamp(16px, 2.5vw, 18px)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        Will a Welcome Be Offered? *
                      </span>
                    </label>
                    <select
                      name="welcome"
                      value={formData.welcome}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: 'clamp(12px, 2vw, 16px)',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        fontSize: 'clamp(16px, 2.5vw, 18px)',
                        backgroundColor: 'white',
                        marginBottom: '1rem'
                      }}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                      color: '#333',
                      fontSize: 'clamp(16px, 2.5vw, 18px)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        Will a Blessing Be Offered? *
                      </span>
                    </label>
                    <select
                      name="blessing"
                      value={formData.blessing}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: 'clamp(12px, 2vw, 16px)',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        fontSize: 'clamp(16px, 2.5vw, 18px)',
                        backgroundColor: 'white',
                        marginBottom: '1rem'
                      }}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Reception Timeline */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{
                  fontSize: 'clamp(18px, 3vw, 22px)',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem',
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaClipboardList style={{ color: '#4FD1C5' }} /> Reception Timeline
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5" style={{ marginBottom: '2rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                      color: '#333',
                      fontSize: 'clamp(16px, 2.5vw, 18px)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        Cocktail Hour
                      </span>
                    </label>
                    <select
                      name="cocktailHourTime"
                      value={formData.cocktailHourTime}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: 'clamp(12px, 2vw, 14px)',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        fontSize: 'clamp(15px, 2vw, 16px)',
                        backgroundColor: 'white',
                        marginBottom: '1rem',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'black\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/><path d=\'M0 0h24v24H0z\' fill=\'none\'/></svg>")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 10px center',
                        paddingRight: '30px',
                        fontWeight: '500',
                        minHeight: isMobile ? '44px' : 'auto'
                      }}
                    >
                      <option value="">Select time</option>
                      {getValidTimeOptions('cocktailHourTime').map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                      color: '#333',
                      fontSize: 'clamp(16px, 2.5vw, 18px)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        Grand Entrance
                      </span>
                    </label>
                    <select
                      name="grandEntranceTime"
                      value={formData.grandEntranceTime}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: 'clamp(12px, 2vw, 14px)',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        fontSize: 'clamp(15px, 2vw, 16px)',
                        backgroundColor: 'white',
                        marginBottom: '1rem',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'black\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/><path d=\'M0 0h24v24H0z\' fill=\'none\'/></svg>")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 10px center',
                        paddingRight: '30px',
                        fontWeight: '500'
                      }}
                    >
                      <option value="">Select time</option>
                      {getValidTimeOptions('grandEntranceTime').map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                      color: '#333',
                      fontSize: 'clamp(16px, 2.5vw, 18px)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        First Dance
                      </span>
                    </label>
                    <select
                      name="firstDanceTime"
                      value={formData.firstDanceTime}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: 'clamp(12px, 2vw, 14px)',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        fontSize: 'clamp(15px, 2vw, 16px)',
                        backgroundColor: 'white',
                        marginBottom: '1rem',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'black\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/><path d=\'M0 0h24v24H0z\' fill=\'none\'/></svg>")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 10px center',
                        paddingRight: '30px',
                        fontWeight: '500'
                      }}
                    >
                      <option value="">Select time</option>
                      {getValidTimeOptions('firstDanceTime').map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5" style={{ marginBottom: '2rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                      color: '#333',
                      fontSize: 'clamp(16px, 2.5vw, 18px)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        Dinner Served
                      </span>
                    </label>
                    <select
                      name="dinnerTime"
                      value={formData.dinnerTime}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: 'clamp(12px, 2vw, 14px)',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        fontSize: 'clamp(15px, 2vw, 16px)',
                        backgroundColor: 'white',
                        marginBottom: '1rem',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'black\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/><path d=\'M0 0h24v24H0z\' fill=\'none\'/></svg>")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 10px center',
                        paddingRight: '30px',
                        fontWeight: '500'
                      }}
                    >
                      <option value="">Select time</option>
                      {getValidTimeOptions('dinnerTime').map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                      color: '#333',
                      fontSize: 'clamp(16px, 2.5vw, 18px)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        Toasts
                      </span>
                    </label>
                    <select
                      name="toastsTime"
                      value={formData.toastsTime}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: 'clamp(12px, 2vw, 14px)',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        fontSize: 'clamp(15px, 2vw, 16px)',
                        backgroundColor: 'white',
                        marginBottom: '1rem',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'black\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/><path d=\'M0 0h24v24H0z\' fill=\'none\'/></svg>")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 10px center',
                        paddingRight: '30px',
                        fontWeight: '500'
                      }}
                    >
                      <option value="">Select time</option>
                      {getValidTimeOptions('toastsTime').map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                      color: '#333',
                      fontSize: 'clamp(16px, 2.5vw, 18px)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        Parent Dances
                      </span>
                    </label>
                    <select
                      name="parentDancesTime"
                      value={formData.parentDancesTime}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: 'clamp(12px, 2vw, 14px)',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        fontSize: 'clamp(15px, 2vw, 16px)',
                        backgroundColor: 'white',
                        marginBottom: '1rem',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'black\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/><path d=\'M0 0h24v24H0z\' fill=\'none\'/></svg>")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 10px center',
                        paddingRight: '30px',
                        fontWeight: '500'
                      }}
                    >
                      <option value="">Select time</option>
                      {getValidTimeOptions('parentDancesTime').map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5" style={{ marginBottom: '2.5rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                      color: '#333',
                      fontSize: 'clamp(16px, 2.5vw, 18px)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        Cake Cutting
                      </span>
                    </label>
                    <select
                      name="cakeCuttingTime"
                      value={formData.cakeCuttingTime}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: 'clamp(12px, 2vw, 14px)',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        fontSize: 'clamp(15px, 2vw, 16px)',
                        backgroundColor: 'white',
                        marginBottom: '1rem',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'black\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/><path d=\'M0 0h24v24H0z\' fill=\'none\'/></svg>")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 10px center',
                        paddingRight: '30px',
                        fontWeight: '500'
                      }}
                    >
                      <option value="">Select time</option>
                      {getValidTimeOptions('cakeCuttingTime').map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                      color: '#333',
                      fontSize: 'clamp(16px, 2.5vw, 18px)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        Open Dancing
                      </span>
                    </label>
                    <select
                      name="openDancingTime"
                      value={formData.openDancingTime}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: 'clamp(12px, 2vw, 14px)',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        fontSize: 'clamp(15px, 2vw, 16px)',
                        backgroundColor: 'white',
                        marginBottom: '1rem',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'black\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/><path d=\'M0 0h24v24H0z\' fill=\'none\'/></svg>")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 10px center',
                        paddingRight: '30px',
                        fontWeight: '500'
                      }}
                    >
                      <option value="">Select time</option>
                      {getValidTimeOptions('openDancingTime').map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                      color: '#333',
                      fontSize: 'clamp(16px, 2.5vw, 18px)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        Last Dance
                      </span>
                    </label>
                    <select
                      name="lastDanceTime"
                      value={formData.lastDanceTime}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: 'clamp(12px, 2vw, 14px)',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        fontSize: 'clamp(15px, 2vw, 16px)',
                        backgroundColor: 'white',
                        marginBottom: '1rem',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'black\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/><path d=\'M0 0h24v24H0z\' fill=\'none\'/></svg>")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 10px center',
                        paddingRight: '30px',
                        fontWeight: '500'
                      }}
                    >
                      <option value="">Select time</option>
                      {getValidTimeOptions('lastDanceTime').map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Special Dances */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{
                  fontSize: 'clamp(18px, 3vw, 22px)',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem',
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaMusic style={{ color: '#38B2AC' }} /> Special Dances
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12" style={{ marginBottom: '3rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                      color: '#333',
                      fontSize: 'clamp(16px, 2.5vw, 18px)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        💃🏽<span style={{ transform: 'scaleX(-1)', display: 'inline-block' }}>🕺🏽</span> First Dance
                      </span>
                    </label>
                    <SongSelector
                      songValue={formData.firstDanceSong}
                      artistValue={formData.firstDanceArtist || ""}
                      onSongChange={handleChange}
                      onArtistChange={handleChange}
                      songName="firstDanceSong"
                      artistName="firstDanceArtist"
                      suggestions={SONG_SUGGESTIONS.firstDance}
                      isMobile={isMobile}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                      color: '#333',
                      fontSize: 'clamp(16px, 2.5vw, 18px)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        👨🏽‍👧🏽 Father/Daughter Dance
                      </span>
                    </label>
                    <SongSelector
                      songValue={formData.fatherDaughterSong}
                      artistValue={formData.fatherDaughterArtist || ""}
                      onSongChange={handleChange}
                      onArtistChange={handleChange}
                      songName="fatherDaughterSong"
                      artistName="fatherDaughterArtist"
                      suggestions={SONG_SUGGESTIONS.fatherDaughter}
                      isMobile={isMobile}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12" style={{ marginBottom: '3rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                      color: '#333',
                      fontSize: 'clamp(16px, 2.5vw, 18px)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        👩🏽‍👦🏽 Mother/Son Dance
                      </span>
                    </label>
                    <SongSelector
                      songValue={formData.motherSonSong}
                      artistValue={formData.motherSonArtist || ""}
                      onSongChange={handleChange}
                      onArtistChange={handleChange}
                      songName="motherSonSong"
                      artistName="motherSonArtist"
                      suggestions={SONG_SUGGESTIONS.motherSon}
                      isMobile={isMobile}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                      color: '#333',
                      fontSize: 'clamp(16px, 2.5vw, 18px)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        💐 Bouquet Toss
                      </span>
                    </label>
                    <SongSelector
                      songValue={formData.bouquetTossSong}
                      artistValue={formData.bouquetTossArtist || ""}
                      onSongChange={handleChange}
                      onArtistChange={handleChange}
                      songName="bouquetTossSong"
                      artistName="bouquetTossArtist"
                      suggestions={SONG_SUGGESTIONS.bouquetToss}
                      isMobile={isMobile}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16" style={{ marginBottom: '3.5rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                      color: '#333',
                      fontSize: 'clamp(16px, 2.5vw, 18px)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        👰🏽‍♂️ Garter Toss
                      </span>
                    </label>
                    <SongSelector
                      songValue={formData.gatherTossSong}
                      artistValue={formData.gatherTossArtist || ""}
                      onSongChange={handleChange}
                      onArtistChange={handleChange}
                      songName="gatherTossSong"
                      artistName="gatherTossArtist"
                      suggestions={SONG_SUGGESTIONS.garterToss}
                      isMobile={isMobile}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                      color: '#333',
                      fontSize: 'clamp(16px, 2.5vw, 18px)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        🎶 Last Dance
                      </span>
                    </label>
                    <SongSelector
                      songValue={formData.lastSong}
                      artistValue={formData.lastSongArtist || ""}
                      onSongChange={handleChange}
                      onArtistChange={handleChange}
                      songName="lastSong"
                      artistName="lastSongArtist"
                      suggestions={SONG_SUGGESTIONS.lastDance}
                      isMobile={isMobile}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div style={{ marginTop: '3.5rem' }}>
                <h3 style={{
                  fontSize: 'clamp(18px, 3vw, 22px)',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem',
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaFileAlt style={{ color: '#ECC94B' }} /> Additional Information
                </h3>
                
                <div style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '10px',
                  border: '1px solid #e5e5e5',
                  marginBottom: '2rem'
                }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.75rem',
                    fontWeight: 'bold',
                    color: '#333',
                    fontSize: 'clamp(16px, 2.5vw, 18px)'
                  }}>
                    Special Instructions
                  </label>
                  <textarea
                    id="specialInstructions"
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      fontSize: 'clamp(16px, 2.5vw, 18px)',
                      minHeight: '120px',
                      lineHeight: '1.5',
                      resize: 'vertical'
                    }}
                    placeholder="Anything else we should know about your event"
                    rows="4"
                  ></textarea>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-12 mb-10 text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-16 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 text-lg mx-auto inline-block"
                  style={{
                    border: 'none',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    minWidth: isMobile ? '260px' : '300px',
                    minHeight: isMobile ? '52px' : 'auto'
                  }}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <FaSpinner className="animate-spin mr-2" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    'Submit Wedding Agenda'
                  )}
                </button>
                
                <div className="mt-4 text-sm text-gray-500">
                  Your information helps us prepare for your special day
                </div>
                
                {/* Navigation buttons - Bottom */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push('/');
                    }}
                    className="px-10 py-2.5 text-white font-medium rounded-full hover:bg-blue-700 focus:outline-none transition-all duration-200 text-base inline-flex items-center justify-center"
                    style={{
                      border: 'none',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                      minWidth: isMobile ? '180px' : '200px',
                      minHeight: isMobile ? '44px' : 'auto',
                      letterSpacing: '0.3px',
                      backgroundColor: '#1a73e8'
                    }}
                  >
                    <FaArrowLeft className="mr-3" style={{ fontSize: '14px' }} />
                    Back to Contract
                  </button>
                  
                  {user && (
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push('/dj/dashboard');
                      }}
                      className="px-10 py-2.5 text-white font-medium rounded-full hover:bg-indigo-700 focus:outline-none transition-all duration-200 text-base inline-flex items-center justify-center"
                      style={{
                        border: 'none',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        minWidth: isMobile ? '180px' : '200px',
                        minHeight: isMobile ? '44px' : 'auto',
                        letterSpacing: '0.3px',
                        backgroundColor: '#6366f1'
                      }}
                    >
                      <FaArrowLeft className="mr-3" style={{ fontSize: '14px' }} />
                      DJ Dashboard
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
          <ToastContainer position={isMobile ? "bottom-center" : "bottom-right"} autoClose={5000} />
        </div>
      </SuppressHydration>
    </ClientOnly>
  );
} 
