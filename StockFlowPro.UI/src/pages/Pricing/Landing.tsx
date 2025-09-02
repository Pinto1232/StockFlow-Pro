import React, { useEffect, useMemo, useState } from 'react';
import { getPlansByInterval, type SubscriptionPlan } from '../../services/subscriptionService';
import { landingService, type LandingFeature, type LandingTestimonial, type LandingStat, type LandingHero } from '../../services/landingService';
import { getPricingDisplayInfo, calculateSavingsPercentage } from '../../utils/pricingUtils';
import { useGeolocationPricing, useCurrencyMismatch } from '../../hooks/useGeolocationPricing';
import { formatCurrencyAmount } from '../../utils/currencyMapping';
import CurrencySelector from '../../components/CurrencySelector';
import { 
  Check, Zap, Crown, Star, ArrowRight, Shield, Clock, Users,
  UserCheck, Calendar, DollarSign, FileText, Award,
  Play, Quote, Building2,
  CheckCircle, Globe, Smartphone, HeadphonesIcon, MapPin, AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DemoScheduler from '../../components/DemoScheduler';

const Landing: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [yearly, setYearly] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDemoSchedulerOpen, setIsDemoSchedulerOpen] = useState(false);
  const [features, setFeatures] = useState<LandingFeature[]>([]);
  const [testimonials, setTestimonials] = useState<LandingTestimonial[]>([]);
  const [stats, setStats] = useState<LandingStat[]>([]);
  const [hero, setHero] = useState<LandingHero | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const navigate = useNavigate();

  // Geolocation pricing hook
  const [pricingState, pricingActions] = useGeolocationPricing({
    autoDetect: true,
    showOriginalPrices: false,
    compactFormat: false,
  });

  // Currency mismatch detection
  const currencyMismatch = useCurrencyMismatch();

  // Resilient avatar component with fallback to DiceBear initials
  const AvatarImage: React.FC<{ name: string; src?: string; size?: number; className?: string }> = ({ name, src, size = 48, className }) => {
    // Normalize Unsplash URLs to a consistent parameter set to avoid 404s and aborts
    const normalize = (u?: string): string | undefined => {
      if (!u) return u;
      try {
        const url = new URL(u);
        if (url.hostname.endsWith('images.unsplash.com')) {
          // Clear existing parameters to avoid conflicts
          url.search = '';
          // Set consistent parameters
          url.searchParams.set('auto', 'format');
          url.searchParams.set('fit', 'crop');
          url.searchParams.set('w', String(size));
          url.searchParams.set('h', String(size));
          url.searchParams.set('crop', 'faces');
          url.searchParams.set('q', '80');
          return url.toString();
        }
      } catch {
        /* Ignore invalid URL values; fallback logic will handle image errors. */
      }
      return u;
    };
    const [imgSrc, setImgSrc] = useState<string | undefined>(normalize(src));
    const fallback = useMemo(() => {
      const seed = encodeURIComponent(name || 'User');
      // DiceBear initials (no auth, cacheable)
      return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&radius=8&backgroundType=gradientLinear&fontWeight=600`;
    }, [name]);
    const onError = () => setImgSrc(fallback);
    return (
      <img
        src={imgSrc || fallback}
        onError={onError}
        width={size}
        height={size}
        alt={name}
        className={className}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    );
  };

  const loadPlans = async (interval: 'Monthly' | 'Annual') => {
    try {
      setIsLoadingPlans(true);
      console.log(`🔍 Loading ${interval} plans with currency: ${pricingState.currentCurrency}`);
      
      // Get plans with geolocation-aware pricing
      const p = await getPlansByInterval(interval, pricingState.currentCurrency);
      
      // Convert plans to user's preferred currency if needed
      const convertedPlans = await pricingActions.convertPlans(p, pricingState.currentCurrency);
      
      // Sort plans by order
      const sortedPlans = convertedPlans.slice().sort((a,b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || a.name.localeCompare(b.name));
      
      setPlans(sortedPlans);
      console.log(`✅ Loaded ${sortedPlans.length} ${interval} plans in ${pricingState.currentCurrency}`);
    } catch (error) {
      console.error(`❌ Failed to load ${interval} plans:`, error);
      // Fallback to basic plan loading
      const p = await getPlansByInterval(interval);
      setPlans(p.slice().sort((a,b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || a.name.localeCompare(b.name)));
    } finally {
      setIsLoadingPlans(false);
    }
  };

 

  const loadLandingContent = async () => {
    try {
      setIsLoadingContent(true);
      const content = await landingService.getLandingContent();
      setFeatures(content.features);
      setTestimonials(content.testimonials);
      setStats(content.stats);
      setHero(content.hero || null);
    } catch (error) {
      console.error('Failed to load landing content:', error);
      // Remove hardcoded fallback; rely on backend data only
      setFeatures([]);
      setTestimonials([]);
      setStats([]);
      setHero(null);
    } finally {
      setIsLoadingContent(false);
    }
  };

  useEffect(() => {
    (async () => {
      await loadPlans(yearly ? 'Annual' : 'Monthly');
    })();
  }, [yearly, pricingState.currentCurrency]);

  // Handle currency changes
  const handleCurrencyChange = async (newCurrency: string) => {
    console.log(`💰 Currency changed to: ${newCurrency}`);
    pricingActions.setCurrency(newCurrency);
    // Plans will be reloaded automatically due to the useEffect dependency
  };

  useEffect(() => {
    loadLandingContent();
  }, []);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const openCheckoutPage = (plan: SubscriptionPlan) => {
    try {
      localStorage.setItem(
        'selectedPlan',
        JSON.stringify({
          id: plan.id,
          cadence: yearly ? 'annual' : 'monthly',
          name: plan.name,
          price: plan.price,
          currency: plan.currency,
        })
      );
    } catch {}
    navigate(`/checkout?plan=${encodeURIComponent(plan.id)}&cadence=${yearly ? 'annual' : 'monthly'}`);
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      UserCheck, Calendar, DollarSign, FileText, Users, Building2, Shield, HeadphonesIcon
    };
    return iconMap[iconName] || FileText;
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/login" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  StockFlow Pro
                </span>
                <div className="text-xs text-gray-500 font-medium">HR Module</div>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Reviews</a>
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Sign in</Link>
              <Link to="/register" className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Start Free Trial
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-[16px] font-medium mb-8 border border-blue-200">
                <Zap className="w-3 h-3" />
                Complete HR Management Solution 
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
                {hero?.title || "Streamline Your"}
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-[32px] md:text-[40px] lg:text-[44px] leading-tight mt-1">
                  {hero?.subtitle || "HR Operations"}
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
                {hero?.description || "Empower your team with comprehensive HR tools designed for small to medium businesses. From employee management to payroll integration—everything you need in one platform."}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link 
                  to={hero?.primaryButtonUrl || "/register"}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  {hero?.primaryButtonText || "Start Free Trial"}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button 
                  onClick={() => {
                    if (hero?.secondaryButtonUrl?.startsWith('http')) {
                      window.open(hero.secondaryButtonUrl, '_blank');
                    } else if (hero?.secondaryButtonUrl) {
                      navigate(hero.secondaryButtonUrl);
                    } else {
                      setIsDemoSchedulerOpen(true);
                    }
                  }}
                  className="px-8 py-4 rounded-full border-2 border-gray-300 text-gray-700 font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {hero?.secondaryButtonText || "Watch Demo"}
                </button>
              </div>
              
              <div className="flex items-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  14-day free trial
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Cancel anytime
                </div>
              </div>
            </div>
            
            <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                  <div className="space-y-6">
                    {isLoadingContent ? (
                      // Loading skeleton
                      Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 rounded-xl">
                          <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      features.map((feature, index) => {
                        const IconComponent = getIconComponent(feature.iconName);
                        return (
                          <div 
                            key={feature.id}
                            className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                              activeFeature === index 
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 scale-105' 
                                : 'hover:bg-gray-50 border-2 border-transparent'
                            }`}
                            onClick={() => setActiveFeature(index)}
                          >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.colorClass} flex items-center justify-center shadow-lg`}>
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                              <p className="text-sm text-gray-600">{feature.description}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoadingContent ? (
              // Loading skeleton for stats
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))
            ) : (
              stats.map((stat) => {
                const IconComponent = getIconComponent(stat.iconName);
                return (
                  <div key={stat.id} className="text-center group">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for 
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Modern HR Management
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools designed to streamline your HR processes and empower your workforce
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: UserCheck,
                title: "Employee Profiles",
                description: "Complete employee database with custom fields, documents, and organizational hierarchy",
                features: ["Digital onboarding", "Document management", "Role-based access"]
              },
              {
                icon: Calendar,
                title: "Leave Management",
                description: "Automated leave tracking with approval workflows and calendar integration",
                features: ["Multiple leave types", "Approval workflows", "Calendar sync"]
              },
              {
                icon: Clock,
                title: "Time & Attendance",
                description: "Smart time tracking with mobile check-in and automated timesheet generation",
                features: ["Mobile check-in", "Overtime tracking", "Shift scheduling"]
              },
              {
                icon: DollarSign,
                title: "Payroll Integration",
                description: "Seamless payroll processing with tax calculations and direct deposit",
                features: ["Tax calculations", "Direct deposit", "Pay stub generation"]
              },
              {
                icon: Award,
                title: "Performance Reviews",
                description: "360-degree feedback system with goal tracking and performance analytics",
                features: ["Goal setting", "Peer reviews", "Performance metrics"]
              },
              {
                icon: FileText,
                title: "Compliance Reporting",
                description: "Automated compliance checks and comprehensive reporting dashboard",
                features: ["Regulatory compliance", "Custom reports", "Audit trails"]
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-2">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
                      <Check className="w-4 h-4 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Growing Companies 
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers say about transforming their HR operations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {isLoadingContent ? (
              // Loading skeleton for testimonials
              Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                  <div className="w-8 h-8 bg-gray-200 rounded mb-4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded mb-6 animate-pulse"></div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-1 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded mb-1 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              testimonials.slice(0, 2).map((testimonial) => (
                <div key={testimonial.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 hover:shadow-lg transition-all duration-300">
                  <Quote className="w-8 h-8 text-blue-600 mb-4" />
                  <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-4">
                    <AvatarImage 
                      name={testimonial.name}
                      src={testimonial.imageUrl}
                      size={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-sm text-blue-600 font-medium">{testimonial.company}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose a plan that fits your business and scale confidently. 
              Change or cancel anytime with our flexible subscription options.
            </p>
            
            {/* Location and Currency Info */}
            {pricingState.location && (
              <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Detected location: {pricingState.location.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>Currency: {pricingState.currentCurrency}</span>
                </div>
              </div>
            )}
            
            {/* Currency Mismatch Warning */}
            {currencyMismatch.hasMismatch && (
              <div className="mt-4 max-w-md mx-auto">
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    We detected you're in {currencyMismatch.detectedCurrencyInfo?.name}. 
                    <button
                      onClick={pricingActions.useDetectedCurrency}
                      className="ml-1 underline hover:no-underline font-medium"
                    >
                      Switch to {currencyMismatch.detectedCurrency}?
                    </button>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Currency Selector and Billing Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            {/* Currency Selector */}
            <div className="flex items-center gap-3">
              <CurrencySelector
                selectedCurrency={pricingState.currentCurrency}
                onCurrencyChange={handleCurrencyChange}
                compact={true}
                showLabel={false}
                className="min-w-[200px]"
              />
            </div>
            
            {/* Billing Toggle */}
            <div className="flex items-center gap-4">
              <span className={`text-lg font-medium transition-colors ${!yearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button 
                onClick={() => setYearly(v => !v)} 
                className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-all duration-200 ${yearly ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-medium transition-colors ${yearly ? 'text-gray-900' : 'text-gray-500'}`}>
                  Yearly
                </span>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                  <Star className="w-3 h-3" />
                  Save 20%
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {isLoadingPlans ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="relative rounded-3xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm p-8 flex flex-col">
                  <div className="text-center mb-8">
                    <div className="h-8 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="text-center mb-8">
                    <div className="h-12 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-4 mb-8 flex-grow">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                  <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))
            ) : (
              plans.map((plan) => {
                const isAnnual = plan.interval === 'Annual';
                const price = plan.price;
                const pricingInfo = getPricingDisplayInfo(price, plan.currency, plan.interval, plan.monthlyEquivalentPrice);
                
                return (
                  <div 
                    key={plan.id} 
                    className={`relative rounded-3xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                      plan.isPopular 
                        ? 'border-blue-500 bg-white shadow-xl scale-105' 
                        : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-gray-300'
                    } p-8 flex flex-col`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg">
                          <Crown className="w-4 h-4" />
                          Most Popular
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 leading-relaxed">{plan.description}</p>
                    </div>
                    
                    <div className="text-center mb-8">
                      <div className="flex items-baseline justify-center gap-2 mb-2">
                        <span className="text-4xl font-extrabold text-gray-900">
                          {formatCurrencyAmount(price, plan.currency)}
                        </span>
                        <span className="text-gray-500 font-medium">/{plan.interval.toLowerCase()}</span>
                      </div>
                      
                      {/* Monthly equivalent for annual plans */}
                      {isAnnual && plan.monthlyEquivalentPrice && (
                        <div className="space-y-1">
                          <p className="text-sm text-green-600 font-medium">
                            {formatCurrencyAmount(plan.monthlyEquivalentPrice, plan.currency)} per month equivalent
                          </p>
                          <p className="text-xs text-gray-500">
                            Billed annually
                          </p>
                        </div>
                      )}
                      
                      {/* Annual equivalent for monthly plans */}
                      {!isAnnual && (
                        <p className="text-xs text-gray-500">
                          Annual: {formatCurrencyAmount(price * 12 * 0.8, plan.currency)} (save 20% with yearly billing)
                        </p>
                      )}
                      
                      {/* Currency conversion disclaimer */}
                      {pricingState.location && plan.currency !== 'USD' && (
                        <p className="text-xs text-gray-400 mt-2">
                          Prices converted from USD. Exchange rates may vary.
                        </p>
                      )}
                    </div>
                  
                  <ul className="space-y-4 mb-8 flex-grow">
                    {(plan.features ?? []).map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-gray-700 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => openCheckoutPage(plan)}
                    className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 ${
                      plan.isPopular 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl' 
                        : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Choose {plan.name}
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </button>
                </div>
              );
            })
            )}
          </div>
          
          {/* Pricing Footer with Currency Info */}
          <div className="mt-12 text-center">
            <div className="max-w-2xl mx-auto">
              {pricingState.location && (
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Localized Pricing</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Prices are automatically converted to your local currency ({pricingState.currentCurrency}) 
                    based on your location ({pricingState.location.country}).
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Real-time exchange rates</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>No hidden fees</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Local payment methods</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center">
            <div className="flex flex-wrap items-center justify-center gap-8 text-gray-500 mb-6">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="font-medium">Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                <span className="font-medium">Global Compliance</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                <span className="font-medium">Mobile Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <HeadphonesIcon className="w-5 h-5" />
                <span className="font-medium">24/7 Support</span>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              By subscribing you agree to our{' '}
              <a className="underline hover:text-gray-700 transition-colors" href="#">Terms of Service</a>
              {' '}and{' '}
              <a className="underline hover:text-gray-700 transition-colors" href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your HR Operations?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join thousands of companies already using StockFlow Pro HR to streamline their people management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="px-8 py-4 rounded-full bg-white text-blue-600 font-semibold text-lg hover:bg-gray-50 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button 
              onClick={() => setIsDemoSchedulerOpen(true)}
              className="px-8 py-4 rounded-full border-2 border-white text-white font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200 flex items-center justify-center gap-2"
            >
              Schedule Demo
              <Calendar className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold">StockFlow Pro</span>
                  <div className="text-xs text-gray-400">HR Module</div>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Comprehensive HR management solution designed for growing businesses.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} StockFlow Pro. All rights reserved.
            </p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Scheduler Modal */}
      <DemoScheduler 
        isOpen={isDemoSchedulerOpen} 
        onClose={() => setIsDemoSchedulerOpen(false)} 
      />

      {/* Custom Styles */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .bg-grid-pattern {
          background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
};

export default Landing;