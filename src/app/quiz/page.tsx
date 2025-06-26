"use client";
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Heart, Zap, Target, Scale, Ruler, Calendar, CheckCircle, Loader } from 'lucide-react';

interface Answers {
  reasons: string[];
  bodyType: string;
  timeSinceIdeal: string;
  bodyGoal: string;
  targetArea: string;
  activityLevel: string;
  menopauseSymptoms: string[];
  dietSuccess: string;
  age: string;
  currentWeight: string;
  height: string;
  targetWeight: string;
}

interface Result {
  weeksNeeded: number;
  currentWeight: number;
  targetWeight: number;
  weightDiff: number;
  product: string;
}

interface Plan {
  id: string;
  name: string;
  subtitle?: string;
  duration: string;
  price: string;
  originalPrice: string;
  dailyPrice: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  bgGradient?: boolean;
  link: string;
}

interface PlanSelectionProps {
  result: Result;
  answers: Answers;
}

const PlanSelection: React.FC<PlanSelectionProps> = ({ result, answers }) => {
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);
  const [selectedPlan, setSelectedPlan] = useState<string | null>('premium');
  const [showPlans, setShowPlans] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getBodyTypeImage = (type: string, isAfter: boolean = false): JSX.Element => {
    if (isAfter) {
      return (
        <img
          src={`/images/quiz/body-goals/${answers.bodyGoal}.avif`}
          alt="Dopo il piano"
          className="w-24 h-32 rounded-lg object-cover"
          style={{ marginLeft: '40px' }}
        />
      );
    }

    return (
      <img
        src={`/images/quiz/body-types/${type}.avif`}
        alt="Ora"
        className="w-24 h-32 rounded-lg object-cover"
        style={{ marginLeft: '40px' }}
      />
    );
  };

  const getBodyFatData = (bodyType: string, isAfter: boolean = false): number => {
    const fatPercentages: Record<string, { current: number; after: number }> = {
      'normale': { current: 25, after: 18 },
      'flaccido': { current: 30, after: 22 },
      'addome': { current: 35, after: 25 },
      'sovrappeso': { current: 40, after: 28 },
      'obesa': { current: 45, after: 32 }
    };

    const data = fatPercentages[bodyType] || fatPercentages['normale'];
    return isAfter ? data.after : data.current;
  };

  const renderDots = (current: number, total: number): JSX.Element[] => {
    return Array.from({ length: total }, (_, i) => (
      <div
        key={i}
        className={`w-2 h-2 rounded-full ${i < current ? 'bg-pink-500' : 'bg-gray-300'
          }`}
      />
    ));
  };

  const plans: Plan[] = [
    {
      id: 'matcha',
      name: 'THE MATCHA ULTRA',
      duration: '1 MESE',
      price: '€29',
      originalPrice: '€78',
      dailyPrice: '€1.02',
      description: '30 compresse',
      link: 'https://matcha-ultra-landing.com'
    },
    {
      id: 'keto',
      name: 'KETO BRUCIA',
      duration: '2 MESI',
      price: '€49.99',
      originalPrice: '€89.99',
      dailyPrice: '€0.81',
      description: '4x Keto Brucia + Piano alimentare + Supporto WhatsApp 24/7',
      badge: 'Più Popolare',
      badgeColor: 'bg-green-500',
      link: 'https://keto-brucia-landing.com'
    },
    {
      id: 'premium',
      name: 'COFANETTO PREMIUM:',
      subtitle: 'Brucia Grassi + Saziante + Detox',
      duration: '4 MESI',
      price: '€59.99',
      originalPrice: '€149.99',
      dailyPrice: '€0.49',
      description: 'Fame no + Tea Burn + Saxa Fit + Piano Alimentare + Supporto WhatsApp',
      badge: 'Miglior prezzo',
      badgeColor: 'bg-yellow-500 text-black',
      bgGradient: true,
      link: 'https://premium-bundle-landing.com'
    }
  ];

  const handlePlanSelection = (planId: string): void => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      window.open(plan.link, '_blank');
    }
  };

  const scrollToPlans = (): void => {
    setShowPlans(true);
    setTimeout(() => {
      document.getElementById('plans-section')?.scrollIntoView({
        behavior: 'smooth'
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="text-2xl font-bold text-pink-500">
            {formatTime(timeLeft)}
          </div>
          <div className="bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold">
            Ottieni il tuo piano
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h3 className="font-bold text-gray-800 mb-3">Ora</h3>
              {getBodyTypeImage(answers.bodyType, false)}
              <div className="mt-3">
                <p className="text-sm text-gray-600">Grasso corporeo</p>
                <p className="font-bold text-xl">{getBodyFatData(answers.bodyType, false)}%</p>
                <p className="text-sm text-gray-600 mt-2">Peso ottimale</p>
                <div className="flex justify-center space-x-1 mt-1">
                  {renderDots(2, 5)}
                </div>
              </div>
            </div>

            <div className="px-4">
              <div className="text-gray-400 text-3xl">→</div>
            </div>

            <div className="text-center flex-1">
              <h3 className="font-bold text-gray-800 mb-3">Dopo il piano</h3>
              {getBodyTypeImage(answers.bodyGoal, true)}
              <div className="mt-3">
                <p className="text-sm text-gray-600">Grasso corporeo</p>
                <p className="font-bold text-xl">{getBodyFatData(answers.bodyType, true)}%</p>
                <p className="text-sm text-gray-600 mt-2">Peso ottimale</p>
                <div className="flex justify-center space-x-1 mt-1">
                  {renderDots(5, 5)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-center text-gray-800 mb-4">
            Scegli <span className="text-pink-600">il tuo piano!</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-sm text-gray-600">Obiettivo</p>
              <p className="font-bold capitalize">{answers.bodyGoal || 'Peso sano'}</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <Scale className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-sm text-gray-600">Obiettivo di peso</p>
              <p className="font-bold">{result.targetWeight} kg</p>
            </div>
          </div>
        </div>

        <button
          onClick={scrollToPlans}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 px-6 rounded-lg transition-colors mb-8"
        >
          Ottieni il tuo piano
        </button>

        {showPlans && (
          <div id="plans-section">
            <div className="bg-green-500 text-white text-center py-3 rounded-lg mb-6">
              <p className="font-bold">60% OFF L'offerta scade tra: {formatTime(timeLeft)}</p>
            </div>

            <div className="space-y-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-xl shadow-lg p-4 border relative cursor-pointer transition-transform hover:scale-105 ${plan.bgGradient
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-500'
                    : 'bg-white border-gray-200'
                    } ${selectedPlan === plan.id ? 'ring-2 ring-pink-500' : ''
                    }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.badge && (
                    <div className={`absolute -top-2 left-4 ${plan.badgeColor} text-white text-xs px-3 py-1 rounded-full font-bold`}>
                      {plan.badge}
                    </div>
                  )}

                  <div className="flex justify-center mb-3">
                    <img
                      src={`/images/products/${plan.id}.jpg`}
                      alt={plan.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  </div>

                  <div className="text-center mb-4">
                    <h4 className={`font-bold mb-1 ${plan.bgGradient ? 'text-white' : 'text-gray-800'}`}>
                      {plan.name}
                    </h4>
                    {plan.subtitle && (
                      <p className={`text-sm font-medium ${plan.bgGradient ? 'text-white opacity-90' : 'text-gray-700'}`}>
                        {plan.subtitle}
                      </p>
                    )}
                    <p className={`text-sm mb-2 ${plan.bgGradient ? 'opacity-90' : 'text-gray-600'}`}>
                      {plan.duration}
                    </p>
                    <p className={`text-sm line-through mb-1 ${plan.bgGradient ? 'opacity-80' : 'text-gray-500'}`}>
                      {plan.originalPrice}
                    </p>
                    <p className={`text-3xl font-bold mb-1 ${plan.bgGradient ? 'text-white' : 'text-gray-800'}`}>
                      {plan.price}
                    </p>
                    <p className={`text-sm font-bold ${plan.bgGradient ? 'text-white' : 'text-blue-600'}`}>
                      {plan.dailyPrice} al giorno
                    </p>
                    <p className={`text-xs mt-2 ${plan.bgGradient ? 'opacity-90' : 'text-gray-600'}`}>
                      {plan.description}
                    </p>
                  </div>

                  {selectedPlan === plan.id && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-6 mb-4">
              <p className="text-sm text-gray-600 underline">30-giorni rimborso garantito</p>
            </div>

            <button
              onClick={() => selectedPlan && handlePlanSelection(selectedPlan)}
              disabled={!selectedPlan}
              className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors text-center"
            >
              <span>Seleziona piano</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const WeightLossQuiz: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Answers>({
    reasons: [],
    bodyType: '',
    timeSinceIdeal: '',
    bodyGoal: '',
    targetArea: '',
    activityLevel: '',
    menopauseSymptoms: [],
    dietSuccess: '',
    age: '',
    currentWeight: '',
    height: '',
    targetWeight: ''
  });
  const [showResults, setShowResults] = useState<boolean>(false);
  const [showLoading, setShowLoading] = useState<boolean>(false);
  const [finalResult, setFinalResult] = useState<Result | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const validateAge = (age: string): boolean => {
    const ageNum = parseInt(age);
    return ageNum >= 18 && ageNum <= 80;
  };

  const validateWeight = (weight: string): boolean => {
    const weightNum = parseFloat(weight);
    return weightNum >= 40 && weightNum <= 200;
  };

  const validateHeight = (height: string): boolean => {
    const heightNum = parseInt(height);
    return heightNum >= 140 && heightNum <= 220;
  };

  const validateTargetWeight = (current: string, target: string): boolean => {
    const currentNum = parseFloat(current);
    const targetNum = parseFloat(target);
    return targetNum < currentNum && targetNum >= 40;
  };

  const calculateResult = (): Result => {
    const currentWeight = parseFloat(answers.currentWeight);
    const targetWeight = parseFloat(answers.targetWeight);
    const weightDiff = currentWeight - targetWeight;

    let weeksNeeded: number;
    if (weightDiff <= 4) weeksNeeded = 2;
    else if (weightDiff <= 8) weeksNeeded = 4;
    else if (weightDiff <= 12) weeksNeeded = 6;
    else weeksNeeded = 8;

    const needsIntensiveSupport = weightDiff > 10 || answers.activityLevel === 'Per nulla' || answers.menopauseSymptoms.length > 3;

    return {
      weeksNeeded,
      currentWeight,
      targetWeight,
      weightDiff,
      product: needsIntensiveSupport ? 'premium' : 'standard'
    };
  };

  const handleAnswer = (answer: string): void => {
    const newAnswers = { ...answers };

    if (currentStep === 1) newAnswers.bodyType = answer;
    else if (currentStep === 2) newAnswers.timeSinceIdeal = answer;
    else if (currentStep === 3) newAnswers.bodyGoal = answer;
    else if (currentStep === 4) newAnswers.targetArea = answer;
    else if (currentStep === 5) newAnswers.activityLevel = answer;
    else if (currentStep === 7) newAnswers.dietSuccess = answer;

    setAnswers(newAnswers);

    if (currentStep < 11) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleReasonToggle = (reason: string): void => {
    const newReasons = answers.reasons.includes(reason)
      ? answers.reasons.filter(r => r !== reason)
      : [...answers.reasons, reason];

    setAnswers({ ...answers, reasons: newReasons });
  };

  const handleMenopauseSymptoms = (symptom: string): void => {
    const newSymptoms = answers.menopauseSymptoms.includes(symptom)
      ? answers.menopauseSymptoms.filter(s => s !== symptom)
      : [...answers.menopauseSymptoms, symptom];

    setAnswers({ ...answers, menopauseSymptoms: newSymptoms });
  };

  const handleInputChange = (field: keyof Answers, value: string): void => {
    setAnswers({ ...answers, [field]: value });
    setErrorMessage('');
  };

  const handleNext = (): void => {
    setErrorMessage('');

    if (currentStep === 0) {
      if (answers.reasons.length === 0) {
        setErrorMessage('Seleziona almeno una motivazione per procedere');
        return;
      }
    } else if (currentStep === 8) {
      if (!validateAge(answers.age)) {
        setErrorMessage('Inserisci un\'età valida tra 18 e 80 anni');
        return;
      }
    } else if (currentStep === 9) {
      if (!validateWeight(answers.currentWeight)) {
        setErrorMessage('Inserisci un peso valido tra 40 e 200 kg');
        return;
      }
    } else if (currentStep === 10) {
      if (!validateHeight(answers.height)) {
        setErrorMessage('Inserisci un\'altezza valida tra 140 e 220 cm');
        return;
      }
    } else if (currentStep === 11) {
      if (!validateWeight(answers.targetWeight)) {
        setErrorMessage('Inserisci un peso obiettivo valido tra 40 e 200 kg');
        return;
      }
      if (!validateTargetWeight(answers.currentWeight, answers.targetWeight)) {
        setErrorMessage('Il peso obiettivo deve essere inferiore al peso attuale');
        return;
      }

      setShowResults(true);
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const handleContinueFromResults = (): void => {
    setShowLoading(true);
    setTimeout(() => {
      const result = calculateResult();
      setFinalResult(result);
      setShowLoading(false);
    }, 3000);
  };

  const goBack = (): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrorMessage('');
    }
  };

  if (showLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 animate-spin text-pink-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Stiamo generando la tua soluzione</h2>
          <p className="text-gray-600">Personalizzando il piano perfetto per te...</p>
        </div>
      </div>
    );
  }

  if (finalResult) {
    return <PlanSelection result={finalResult} answers={answers} />;
  }

  if (showResults) {
    const result = calculateResult();
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Il tuo potenziale miglioramento in {result.weeksNeeded} settimane
          </h1>

          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">Stimiamo che tu possa potenzialmente raggiungere</p>
            <p className="text-2xl font-bold text-pink-600">{result.targetWeight} kg come obiettivo di peso</p>
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-gray-800 mb-4">Il peso che puoi raggiungere:</h3>

            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Settimana 1</span>
                <span className="text-sm text-gray-600">Settimana {result.weeksNeeded}</span>
              </div>

              <div className="relative h-20 bg-gray-100 rounded-lg overflow-hidden">
                <div className="absolute left-2 top-2">
                  <div className="bg-blue-200 rounded-full px-3 py-1 text-sm font-bold" style={{ marginLeft: '35px' }}>
                    {result.currentWeight} kg
                  </div>
                </div>

                <div className="absolute right-12 bottom-2">
                  <div className="bg-blue-500 text-white rounded-full px-3 py-1 text-sm font-bold">
                    {result.targetWeight} kg
                  </div>
                </div>

                <svg className="absolute inset-0 w-full h-full">
                  <path
                    d="M 20 20 Q 150 60 220 60"
                    stroke="#f59e0b"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="5,5"
                  />
                  <path
                    d="M 220 60 L 280 60"
                    stroke="#10b981"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="3,3"
                  />
                </svg>

                <div className="absolute bottom-2 right-2" style={{ marginBottom: '30px' }}>
                  <div className="text-xs text-gray-600 bg-white rounded px-2 py-1">
                    Il tuo programma finisce qui
                  </div>
                </div>
              </div>

              <div className="text-center mt-4">
                <div className="inline-flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Il peso rimane costante!
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleContinueFromResults}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
          >
            Continua
          </button>
        </div>
      </div>
    );
  }

  interface StepOption {
    text: string;
    selected: boolean;
    emoji?: string;
  }

  interface Step {
    title: string;
    subtitle?: string;
    isMultiple?: boolean;
    hasImages?: boolean;
    imageFolder?: string;
    options?: StepOption[];
    values?: string[];
    isInput?: boolean;
    inputType?: string;
    placeholder?: string;
    value?: string;
    field?: keyof Answers;
  }

  const steps: Step[] = [
    {
      title: "Perché vuoi perdere peso?",
      subtitle: "Puoi avere più obiettivi",
      isMultiple: true,
      hasImages: true,
      imageFolder: "reasons",
      options: [
        { text: "Migliorare il mio aspetto", selected: answers.reasons.includes("aspetto") },
        { text: "Migliorare la salute", selected: answers.reasons.includes("salute") },
        { text: "Sentirmi meglio", selected: answers.reasons.includes("benessere") },
        { text: "Migliorare la mia energia e il mio umore", selected: answers.reasons.includes("energia") }
      ],
      values: ["aspetto", "salute", "benessere", "energia"]
    },
    {
      title: "Qual è il tuo tipo di corpo?",
      hasImages: true,
      imageFolder: "body-types",
      options: [
        { text: "Normale", selected: answers.bodyType === "normale" },
        { text: "Flaccido", selected: answers.bodyType === "flaccido" },
        { text: "Grasso sull'addome", selected: answers.bodyType === "addome" },
        { text: "Sovrappeso", selected: answers.bodyType === "sovrappeso" },
        { text: "Obesa", selected: answers.bodyType === "obesa" }
      ],
      values: ["normale", "flaccido", "addome", "sovrappeso", "obesa"]
    },
    {
      title: "Quanto tempo è passato da quando avevi il tuo peso ideale?",
      options: [
        { text: "Meno di 1 anno", emoji: "😊", selected: answers.timeSinceIdeal === "meno1" },
        { text: "1-3 anni", emoji: "🙂", selected: answers.timeSinceIdeal === "1-3" },
        { text: "Più di 3 anni", emoji: "😬", selected: answers.timeSinceIdeal === "piu3" },
        { text: "Mai avuto", emoji: "👻", selected: answers.timeSinceIdeal === "mai" },
        { text: "Ce l'ho ora", emoji: "🎯", selected: answers.timeSinceIdeal === "ora" }
      ],
      values: ["meno1", "1-3", "piu3", "mai", "ora"]
    },
    {
      title: "Qual è il tuo obiettivo per il tuo corpo?",
      hasImages: true,
      imageFolder: "body-goals",
      options: [
        { text: "Curvy", selected: answers.bodyGoal === "curvy" },
        { text: "Normale", selected: answers.bodyGoal === "normale" },
        { text: "Magra", selected: answers.bodyGoal === "magro" },
        { text: "In forma", selected: answers.bodyGoal === "forma" },
        { text: "Sportivo", selected: answers.bodyGoal === "sportivo" }
      ],
      values: ["curvy", "normale", "magro", "forma", "sportivo"]
    },
    {
      title: "Seleziona la tua zona target",
      hasImages: true,
      imageFolder: "target-areas",
      options: [
        { text: "Braccia", selected: answers.targetArea === "braccia" },
        { text: "Addome", selected: answers.targetArea === "addome" },
        { text: "Schiena", selected: answers.targetArea === "schiena" },
        { text: "Glutei", selected: answers.targetArea === "glutei" },
        { text: "Gambe", selected: answers.targetArea === "gambe" },
        { text: "Fianchi", selected: answers.targetArea === "fianchi" },
        { text: "Tutto il corpo", selected: answers.targetArea === "tutto" }
      ],
      values: ["braccia", "addome", "schiena", "glutei", "gambe", "fianchi", "tutto"]
    },
    {
      title: "Quanto sei attiva fisicamente?",
      options: [
        { text: "Per nulla", emoji: "❌", selected: answers.activityLevel === "Per nulla" },
        { text: "Cammino solo", emoji: "🚶‍♀️", selected: answers.activityLevel === "Cammino solo" },
        { text: "Mi alleno una volta a settimana", emoji: "👍", selected: answers.activityLevel === "1 volta" },
        { text: "Mi alleno 3-4 volte a settimana", emoji: "💪", selected: answers.activityLevel === "3-4 volte" },
        { text: "Mi alleno 5 volte a settimana", emoji: "🚀", selected: answers.activityLevel === "5 volte" }
      ],
      values: ["Per nulla", "Cammino solo", "1 volta", "3-4 volte", "5 volte"]
    },
    {
      title: "Hai notato qualcuno di questi sintomi?",
      isMultiple: true,
      options: [
        { text: "Vampate di calore", emoji: "⚡", selected: answers.menopauseSymptoms.includes("vampate") },
        { text: "Affaticamento", emoji: "😴", selected: answers.menopauseSymptoms.includes("affaticamento") },
        { text: "Problemi a dormire", emoji: "😵", selected: answers.menopauseSymptoms.includes("sonno") },
        { text: "Capelli fini e pelle secca", emoji: "🤚", selected: answers.menopauseSymptoms.includes("capelli-pelle") },
        { text: "Cambiamenti di umore", emoji: "🎭", selected: answers.menopauseSymptoms.includes("umore") },
        { text: "Sudorazione notturna", emoji: "💧", selected: answers.menopauseSymptoms.includes("sudorazione") },
        { text: "Secchezza vaginale", emoji: "👤", selected: answers.menopauseSymptoms.includes("secchezza") },
        { text: "Nessuna delle precedenti", emoji: "❌", selected: answers.menopauseSymptoms.includes("nessuna") }
      ],
      values: ["vampate", "affaticamento", "sonno", "capelli-pelle", "umore", "sudorazione", "secchezza", "nessuna"]
    },
    {
      title: "Qualche altro piano dietetico ti ha aiutato a perdere peso?",
      options: [
        { text: "Sì, ho perso molto peso", emoji: "😂", selected: answers.dietSuccess === "molto" },
        { text: "Sì, ho perso un po' di peso", emoji: "🙂", selected: answers.dietSuccess === "poco" },
        { text: "No, non ho perso peso", emoji: "😑", selected: answers.dietSuccess === "no" },
        { text: "No, non ho ricevuto molto aiuto", emoji: "☹️", selected: answers.dietSuccess === "no-aiuto" }
      ],
      values: ["molto", "poco", "no", "no-aiuto"]
    },
    {
      title: "Quanti anni hai?",
      isInput: true,
      inputType: "number",
      placeholder: "Inserisci la tua età",
      value: answers.age,
      field: "age"
    },
    {
      title: "Qual è il tuo peso attuale?",
      isInput: true,
      inputType: "number",
      placeholder: "Peso in kg",
      value: answers.currentWeight,
      field: "currentWeight"
    },
    {
      title: "Qual è la tua altezza?",
      isInput: true,
      inputType: "number",
      placeholder: "Altezza in cm",
      value: answers.height,
      field: "height"
    },
    {
      title: "Qual è il tuo peso obiettivo?",
      isInput: true,
      inputType: "number",
      placeholder: "Peso obiettivo in kg",
      value: answers.targetWeight,
      field: "targetWeight"
    }
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm p-4">
        <div className="max-w-md mx-auto flex items-center">
          <button onClick={goBack} className="mr-4">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center">
            <div className="bg-pink-600 text-white rounded-lg px-3 py-1 text-sm font-bold mr-3">
              FH
            </div>
            <span className="text-xl font-bold text-gray-800">Fit Health</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {currentStepData.title}
          </h1>

          {currentStepData.subtitle && (
            <p className="text-gray-600 mb-6">{currentStepData.subtitle}</p>
          )}

          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          {currentStepData.isInput ? (
            <div className="space-y-4">
              <input
                type={currentStepData.inputType}
                placeholder={currentStepData.placeholder}
                value={currentStepData.value}
                onChange={(e) => handleInputChange(currentStepData.field as keyof Answers, e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                onClick={handleNext}
                disabled={!currentStepData.value}
                className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors"
              >
                Continua
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {currentStepData.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (currentStepData.isMultiple && currentStep === 0) {
                      handleReasonToggle(currentStepData.values?.[index] || '');
                    } else if (currentStepData.isMultiple && currentStep === 6) {
                      handleMenopauseSymptoms(currentStepData.values?.[index] || '');
                    } else {
                      handleAnswer(currentStepData.values?.[index] || '');
                    }
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${option.selected
                    ? 'border-pink-600 bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${option.selected ? 'border-pink-600 bg-pink-600' : 'border-gray-300'
                      }`}>
                      {option.selected && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-gray-800">{option.text}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {option.emoji && <span className="text-2xl">{option.emoji}</span>}
                    {currentStepData.hasImages && (
                      <img
                        src={`/images/quiz/${currentStepData.imageFolder}/${currentStepData.values?.[index]}.avif`}
                        alt={option.text}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                  </div>
                </button>
              ))}

              {currentStepData.isMultiple && (
                <button
                  onClick={handleNext}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 px-6 rounded-lg transition-colors mt-6"
                >
                  Continua
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeightLossQuiz;