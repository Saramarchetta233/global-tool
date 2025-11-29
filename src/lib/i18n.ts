import { getCurrencyFromCountry } from './stripe-config';

// Language mapping based on country
export const COUNTRY_TO_LANGUAGE = {
  // Italian
  'IT': 'it',
  'SM': 'it', // San Marino
  'VA': 'it', // Vatican City
  
  // English - USA/Canada/Australia/UK
  'US': 'en',
  'CA': 'en', // We can override for French Canada later
  'AU': 'en',
  'GB': 'en',
  'IE': 'en', // Ireland
  'NZ': 'en', // New Zealand
  'SG': 'en', // Singapore
  'MY': 'en', // Malaysia
  'IN': 'en', // India
  'ZA': 'en', // South Africa
  
  // Spanish
  'ES': 'es',
  'MX': 'es',
  'AR': 'es',
  'CO': 'es',
  'PE': 'es',
  'CL': 'es',
  'VE': 'es',
  'EC': 'es',
  'GT': 'es',
  'CU': 'es',
  'BO': 'es',
  'DO': 'es',
  'HN': 'es',
  'PY': 'es',
  'SV': 'es',
  'NI': 'es',
  'CR': 'es',
  'PA': 'es',
  'UY': 'es',
  
  // French
  'FR': 'fr',
  'BE': 'fr', // Belgium (partial)
  'CH': 'fr', // Switzerland (partial)
  'MC': 'fr', // Monaco
  'LU': 'fr', // Luxembourg (partial)
  
  // German
  'DE': 'de',
  'AT': 'de', // Austria (German)
  
  // Portuguese
  'PT': 'pt',
  'BR': 'pt',
  
  // Default fallback
  'DEFAULT': 'en'
} as const;

export type Language = 'en' | 'it' | 'es' | 'fr' | 'de' | 'pt';
export type TranslationKey = keyof typeof translations.en;

export const translations = {
  en: {
    // Navigation & General
    title: 'StudiusAI - AI-Powered Study Assistant',
    subtitle: 'Transform any PDF into flashcards, summaries, and study materials in seconds',
    getStarted: 'Get Started',
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    
    // Features
    features: {
      summaries: 'Smart Summaries',
      flashcards: 'AI Flashcards',
      quiz: 'Practice Quizzes',
      conceptMap: 'Concept Maps',
      aiTutor: 'AI Tutor'
    },
    
    // Pricing
    pricing: {
      title: 'Choose Your Plan',
      monthly: 'Monthly Plan',
      lifetime: 'Lifetime Access',
      onetime: 'StudiusAI',
      monthlyDesc: 'Unlimited credits • Cancel anytime',
      lifetimeDesc: 'One-time payment • Unlimited credits forever',
      onetimeDesc: '4,000 credits • One-time payment',
      chooseMonthly: 'Choose Monthly',
      chooseLifetime: 'Choose Lifetime',
      buyNow: 'Buy Now',
      securePayment: '🔒 Secure payment with Stripe • 30-day money-back guarantee',
      best: 'BEST VALUE'
    },
    
    // Payment
    payment: {
      processing: 'Processing...',
      error: 'Payment error. Please try again later.',
      success: 'Payment successful! Welcome to StudiusAI!',
      detectingLocation: 'Detecting your location...',
      detectedCountry: '📍 Detected country: {country} • Prices in {currency}'
    },
    
    // PDF Processing
    pdf: {
      upload: 'Upload PDF',
      processing: 'Processing your PDF...',
      selectLanguage: 'Select language',
      generate: 'Generate Study Materials',
      error: 'Error processing PDF. Please try again.',
      success: 'Study materials generated successfully!'
    },
    
    // Authentication
    auth: {
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      loginButton: 'Sign In',
      signupButton: 'Create Account',
      forgotPassword: 'Forgot Password?',
      noAccount: "Don't have an account?",
      haveAccount: 'Already have an account?',
      signupHere: 'Sign up here',
      loginHere: 'Login here'
    },
    
    // Credits
    credits: {
      current: 'Current Credits',
      insufficient: 'Insufficient credits',
      recharge: 'Recharge Credits'
    }
  },
  
  it: {
    // Navigation & General
    title: 'StudiusAI - Assistente Studio con Intelligenza Artificiale',
    subtitle: 'Trasforma qualsiasi PDF in flashcard, riassunti e materiali di studio in pochi secondi',
    getStarted: 'Inizia',
    login: 'Accedi',
    signup: 'Registrati',
    logout: 'Esci',
    
    // Features
    features: {
      summaries: 'Riassunti Intelligenti',
      flashcards: 'Flashcard IA',
      quiz: 'Quiz di Pratica',
      conceptMap: 'Mappe Concettuali',
      aiTutor: 'Tutor IA'
    },
    
    // Pricing
    pricing: {
      title: 'Scegli il Tuo Piano',
      monthly: 'Piano Mensile',
      lifetime: 'Accesso a Vita',
      onetime: 'StudiusAI',
      monthlyDesc: 'Crediti illimitati • Cancella quando vuoi',
      lifetimeDesc: 'Pagamento unico • Crediti illimitati per sempre',
      onetimeDesc: '4.000 crediti • Pagamento unico',
      chooseMonthly: 'Scegli Mensile',
      chooseLifetime: 'Scegli Lifetime',
      buyNow: 'Acquista Ora',
      securePayment: '🔒 Pagamento sicuro con Stripe • 30 giorni soddisfatti o rimborsati',
      best: 'MIGLIORE'
    },
    
    // Payment
    payment: {
      processing: 'Elaborazione...',
      error: 'Errore durante il pagamento. Riprova più tardi.',
      success: 'Pagamento riuscito! Benvenuto in StudiusAI!',
      detectingLocation: 'Rilevando la tua posizione...',
      detectedCountry: '📍 Paese rilevato: {country} • Prezzi in {currency}'
    },
    
    // PDF Processing
    pdf: {
      upload: 'Carica PDF',
      processing: 'Elaborando il tuo PDF...',
      selectLanguage: 'Seleziona lingua',
      generate: 'Genera Materiali di Studio',
      error: 'Errore nell\'elaborazione del PDF. Riprova.',
      success: 'Materiali di studio generati con successo!'
    },
    
    // Authentication
    auth: {
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Conferma Password',
      loginButton: 'Accedi',
      signupButton: 'Crea Account',
      forgotPassword: 'Password dimenticata?',
      noAccount: 'Non hai un account?',
      haveAccount: 'Hai già un account?',
      signupHere: 'Registrati qui',
      loginHere: 'Accedi qui'
    },
    
    // Credits
    credits: {
      current: 'Crediti Attuali',
      insufficient: 'Crediti insufficienti',
      recharge: 'Ricarica Crediti'
    }
  },
  
  es: {
    title: 'StudiusAI - Asistente de Estudio con IA',
    subtitle: 'Transforma cualquier PDF en tarjetas de estudio, resúmenes y materiales en segundos',
    getStarted: 'Comenzar',
    login: 'Iniciar Sesión',
    signup: 'Registrarse',
    logout: 'Cerrar Sesión',
    
    features: {
      summaries: 'Resúmenes Inteligentes',
      flashcards: 'Tarjetas IA',
      quiz: 'Cuestionarios',
      conceptMap: 'Mapas Conceptuales',
      aiTutor: 'Tutor IA'
    },
    
    pricing: {
      title: 'Elige Tu Plan',
      monthly: 'Plan Mensual',
      lifetime: 'Acceso de Por Vida',
      onetime: 'StudiusAI',
      monthlyDesc: 'Créditos ilimitados • Cancela en cualquier momento',
      lifetimeDesc: 'Pago único • Créditos ilimitados para siempre',
      onetimeDesc: '4.000 créditos • Pago único',
      chooseMonthly: 'Elegir Mensual',
      chooseLifetime: 'Elegir De Por Vida',
      buyNow: 'Comprar Ahora',
      securePayment: '🔒 Pago seguro con Stripe • Garantía de 30 días',
      best: 'MEJOR VALOR'
    },
    
    payment: {
      processing: 'Procesando...',
      error: 'Error en el pago. Inténtalo más tarde.',
      success: '¡Pago exitoso! ¡Bienvenido a StudiusAI!',
      detectingLocation: 'Detectando tu ubicación...',
      detectedCountry: '📍 País detectado: {country} • Precios en {currency}'
    },
    
    pdf: {
      upload: 'Subir PDF',
      processing: 'Procesando tu PDF...',
      selectLanguage: 'Seleccionar idioma',
      generate: 'Generar Materiales de Estudio',
      error: 'Error procesando PDF. Inténtalo de nuevo.',
      success: '¡Materiales de estudio generados exitosamente!'
    },
    
    auth: {
      email: 'Correo Electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      loginButton: 'Iniciar Sesión',
      signupButton: 'Crear Cuenta',
      forgotPassword: '¿Olvidaste tu contraseña?',
      noAccount: '¿No tienes cuenta?',
      haveAccount: '¿Ya tienes cuenta?',
      signupHere: 'Regístrate aquí',
      loginHere: 'Inicia sesión aquí'
    },
    
    credits: {
      current: 'Créditos Actuales',
      insufficient: 'Créditos insuficientes',
      recharge: 'Recargar Créditos'
    }
  },
  
  fr: {
    title: 'StudiusAI - Assistant d\'Étude avec IA',
    subtitle: 'Transformez n\'importe quel PDF en cartes flash, résumés et matériel d\'étude en secondes',
    getStarted: 'Commencer',
    login: 'Se Connecter',
    signup: 'S\'Inscrire',
    logout: 'Se Déconnecter',
    
    features: {
      summaries: 'Résumés Intelligents',
      flashcards: 'Cartes Flash IA',
      quiz: 'Quiz de Pratique',
      conceptMap: 'Cartes Conceptuelles',
      aiTutor: 'Tuteur IA'
    },
    
    pricing: {
      title: 'Choisissez Votre Plan',
      monthly: 'Plan Mensuel',
      lifetime: 'Accès à Vie',
      onetime: 'StudiusAI',
      monthlyDesc: 'Crédits illimités • Annulez à tout moment',
      lifetimeDesc: 'Paiement unique • Crédits illimités pour toujours',
      onetimeDesc: '4.000 crédits • Paiement unique',
      chooseMonthly: 'Choisir Mensuel',
      chooseLifetime: 'Choisir À Vie',
      buyNow: 'Acheter Maintenant',
      securePayment: '🔒 Paiement sécurisé avec Stripe • Garantie 30 jours',
      best: 'MEILLEURE VALEUR'
    },
    
    payment: {
      processing: 'Traitement...',
      error: 'Erreur de paiement. Veuillez réessayer plus tard.',
      success: 'Paiement réussi! Bienvenue dans StudiusAI!',
      detectingLocation: 'Détection de votre emplacement...',
      detectedCountry: '📍 Pays détecté: {country} • Prix en {currency}'
    },
    
    pdf: {
      upload: 'Télécharger PDF',
      processing: 'Traitement de votre PDF...',
      selectLanguage: 'Sélectionner la langue',
      generate: 'Générer le Matériel d\'Étude',
      error: 'Erreur lors du traitement du PDF. Réessayez.',
      success: 'Matériel d\'étude généré avec succès!'
    },
    
    auth: {
      email: 'Email',
      password: 'Mot de Passe',
      confirmPassword: 'Confirmer le Mot de Passe',
      loginButton: 'Se Connecter',
      signupButton: 'Créer un Compte',
      forgotPassword: 'Mot de passe oublié?',
      noAccount: 'Pas de compte?',
      haveAccount: 'Déjà un compte?',
      signupHere: 'Inscrivez-vous ici',
      loginHere: 'Connectez-vous ici'
    },
    
    credits: {
      current: 'Crédits Actuels',
      insufficient: 'Crédits insuffisants',
      recharge: 'Recharger les Crédits'
    }
  },
  
  de: {
    title: 'StudiusAI - KI-gestützter Lernassistent',
    subtitle: 'Verwandeln Sie jede PDF in Lernkarten, Zusammenfassungen und Lernmaterialien in Sekunden',
    getStarted: 'Loslegen',
    login: 'Anmelden',
    signup: 'Registrieren',
    logout: 'Abmelden',
    
    features: {
      summaries: 'Intelligente Zusammenfassungen',
      flashcards: 'KI-Lernkarten',
      quiz: 'Übungsquiz',
      conceptMap: 'Konzeptkarten',
      aiTutor: 'KI-Tutor'
    },
    
    pricing: {
      title: 'Wählen Sie Ihren Plan',
      monthly: 'Monatsplan',
      lifetime: 'Lebenslanger Zugang',
      onetime: 'StudiusAI',
      monthlyDesc: 'Unbegrenzte Credits • Jederzeit kündbar',
      lifetimeDesc: 'Einmalige Zahlung • Unbegrenzte Credits für immer',
      onetimeDesc: '4.000 Credits • Einmalige Zahlung',
      chooseMonthly: 'Monatlich Wählen',
      chooseLifetime: 'Lebenslang Wählen',
      buyNow: 'Jetzt Kaufen',
      securePayment: '🔒 Sichere Zahlung mit Stripe • 30 Tage Geld-zurück-Garantie',
      best: 'BESTER WERT'
    },
    
    payment: {
      processing: 'Verarbeitung...',
      error: 'Zahlungsfehler. Bitte versuchen Sie es später erneut.',
      success: 'Zahlung erfolgreich! Willkommen bei StudiusAI!',
      detectingLocation: 'Ihren Standort ermitteln...',
      detectedCountry: '📍 Erkanntes Land: {country} • Preise in {currency}'
    },
    
    pdf: {
      upload: 'PDF Hochladen',
      processing: 'Ihre PDF wird verarbeitet...',
      selectLanguage: 'Sprache auswählen',
      generate: 'Lernmaterialien Generieren',
      error: 'Fehler beim Verarbeiten der PDF. Versuchen Sie es erneut.',
      success: 'Lernmaterialien erfolgreich generiert!'
    },
    
    auth: {
      email: 'E-Mail',
      password: 'Passwort',
      confirmPassword: 'Passwort Bestätigen',
      loginButton: 'Anmelden',
      signupButton: 'Konto Erstellen',
      forgotPassword: 'Passwort vergessen?',
      noAccount: 'Noch kein Konto?',
      haveAccount: 'Bereits ein Konto?',
      signupHere: 'Hier registrieren',
      loginHere: 'Hier anmelden'
    },
    
    credits: {
      current: 'Aktuelle Credits',
      insufficient: 'Unzureichende Credits',
      recharge: 'Credits Aufladen'
    }
  },
  
  pt: {
    title: 'StudiusAI - Assistente de Estudo com IA',
    subtitle: 'Transforme qualquer PDF em cartões de estudo, resumos e materiais em segundos',
    getStarted: 'Começar',
    login: 'Entrar',
    signup: 'Cadastrar',
    logout: 'Sair',
    
    features: {
      summaries: 'Resumos Inteligentes',
      flashcards: 'Cartões IA',
      quiz: 'Quiz de Prática',
      conceptMap: 'Mapas Conceituais',
      aiTutor: 'Tutor IA'
    },
    
    pricing: {
      title: 'Escolha Seu Plano',
      monthly: 'Plano Mensal',
      lifetime: 'Acesso Vitalício',
      onetime: 'StudiusAI',
      monthlyDesc: 'Créditos ilimitados • Cancele a qualquer momento',
      lifetimeDesc: 'Pagamento único • Créditos ilimitados para sempre',
      onetimeDesc: '4.000 créditos • Pagamento único',
      chooseMonthly: 'Escolher Mensal',
      chooseLifetime: 'Escolher Vitalício',
      buyNow: 'Comprar Agora',
      securePayment: '🔒 Pagamento seguro com Stripe • Garantia de 30 dias',
      best: 'MELHOR VALOR'
    },
    
    payment: {
      processing: 'Processando...',
      error: 'Erro no pagamento. Tente novamente mais tarde.',
      success: 'Pagamento realizado com sucesso! Bem-vindo ao StudiusAI!',
      detectingLocation: 'Detectando sua localização...',
      detectedCountry: '📍 País detectado: {country} • Preços em {currency}'
    },
    
    pdf: {
      upload: 'Enviar PDF',
      processing: 'Processando seu PDF...',
      selectLanguage: 'Selecionar idioma',
      generate: 'Gerar Materiais de Estudo',
      error: 'Erro ao processar PDF. Tente novamente.',
      success: 'Materiais de estudo gerados com sucesso!'
    },
    
    auth: {
      email: 'Email',
      password: 'Senha',
      confirmPassword: 'Confirmar Senha',
      loginButton: 'Entrar',
      signupButton: 'Criar Conta',
      forgotPassword: 'Esqueceu a senha?',
      noAccount: 'Não tem conta?',
      haveAccount: 'Já tem conta?',
      signupHere: 'Cadastre-se aqui',
      loginHere: 'Entre aqui'
    },
    
    credits: {
      current: 'Créditos Atuais',
      insufficient: 'Créditos insuficientes',
      recharge: 'Recarregar Créditos'
    }
  }
} as const;

// Helper function to get language from country
export function getLanguageFromCountry(countryCode: string): Language {
  return (COUNTRY_TO_LANGUAGE[countryCode as keyof typeof COUNTRY_TO_LANGUAGE] || COUNTRY_TO_LANGUAGE.DEFAULT) as Language;
}

// Translation helper with interpolation and nested key support
export function t(key: string, lang: Language, params?: Record<string, string>): string {
  // Handle nested keys like 'payment.error'
  const keys = key.split('.');
  let translation: any = translations[lang] || translations.en;
  
  // Navigate through nested object
  for (const k of keys) {
    translation = translation?.[k];
    if (!translation) break;
  }
  
  // Fallback to English if not found
  if (!translation) {
    translation = translations.en;
    for (const k of keys) {
      translation = translation?.[k];
      if (!translation) break;
    }
  }
  
  // Final fallback to key itself
  if (!translation) {
    translation = key;
  }
  
  // Handle interpolation like {country}, {currency}
  if (params && typeof translation === 'string') {
    Object.entries(params).forEach(([param, value]) => {
      translation = translation.replace(new RegExp(`\\{${param}\\}`, 'g'), value);
    });
  }
  
  return translation;
}