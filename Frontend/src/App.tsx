import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, animate, useMotionValue } from 'motion/react';
import { 
  MapPin, ShieldCheck, Car, TreePine, Cctv, Zap, Dumbbell, Baby, 
  Home, Phone, Mail, ArrowRight, Menu, X, CheckCircle, User as UserIcon,
  ChevronDown, ChevronUp, MessageCircle
} from 'lucide-react';
import { PROJECT_DETAILS, User } from './data';
import Login from './Login';
import Dashboard from './Dashboard';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

const iconMap: Record<string, React.ElementType> = {
  ShieldCheck, Home, TreePine, Car, Cctv, Zap, Baby, Dumbbell
};

function AnimatedCounter({ value, duration = 2 }: { value: number, duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsInView(true);
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isInView) {
      const animation = animate(count, value, { duration });
      return animation.stop;
    }
  }, [count, value, isInView, duration]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

function LandingPage({ onLoginClick, currentUser }: { onLoginClick: () => void, currentUser: User | null }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSpecCategory, setActiveSpecCategory] = useState<string | null>(PROJECT_DETAILS.specifications[0].category);
  const [activeAmenityCategory, setActiveAmenityCategory] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-ink font-sans selection:bg-brand-accent selection:text-white">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-brand-bg/90 backdrop-blur-md shadow-sm py-4 border-b border-brand-border' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="flex flex-col">
            <span className={`font-serif text-2xl md:text-3xl font-bold leading-none ${isScrolled ? 'text-brand-ink' : 'text-white'}`}>My Nest</span>
            <span className={`text-[10px] uppercase tracking-widest font-semibold ${isScrolled ? 'text-brand-accent' : 'text-white/80'}`}>By Baheti Housing</span>
          </div>
          
          {/* Desktop Nav */}
          <div className={`hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest ${isScrolled ? 'text-brand-ink' : 'text-white'}`}>
            <button onClick={() => scrollTo('overview')} className="hover:text-brand-accent transition-colors">Overview</button>
            <button onClick={() => scrollTo('residences')} className="hover:text-brand-accent transition-colors">Residences</button>
            <button onClick={() => scrollTo('amenities')} className="hover:text-brand-accent transition-colors">Amenities</button>
            <button onClick={() => scrollTo('specifications')} className="hover:text-brand-accent transition-colors">Specifications</button>
            <button onClick={() => scrollTo('location')} className="hover:text-brand-accent transition-colors">Location</button>
            <button onClick={onLoginClick} className="hover:text-brand-accent transition-colors flex items-center gap-2">
              <UserIcon size={16} /> {currentUser ? 'Dashboard' : 'Portal'}
            </button>
            <button onClick={() => scrollTo('contact')} className={`px-6 py-2 rounded-full border transition-colors ${isScrolled ? 'border-brand-ink hover:bg-brand-ink hover:text-brand-bg' : 'border-white hover:bg-brand-surface hover:text-brand-ink'}`}>
              Enquire Now
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={`md:hidden ${isScrolled ? 'text-brand-ink' : 'text-white'}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-brand-bg pt-24 px-6 flex flex-col gap-6 text-xl font-serif">
          <button onClick={() => scrollTo('overview')} className="text-left border-b border-brand-border pb-4">Overview</button>
          <button onClick={() => scrollTo('residences')} className="text-left border-b border-brand-border pb-4">Residences</button>
          <button onClick={() => scrollTo('amenities')} className="text-left border-b border-brand-border pb-4">Amenities</button>
          <button onClick={() => scrollTo('specifications')} className="text-left border-b border-brand-border pb-4">Specifications</button>
          <button onClick={() => scrollTo('location')} className="text-left border-b border-brand-border pb-4">Location</button>
          <button onClick={() => { setMobileMenuOpen(false); onLoginClick(); }} className="text-left border-b border-brand-border pb-4 flex items-center gap-2">
            <UserIcon size={20} /> {currentUser ? 'Dashboard' : 'Portal Login'}
          </button>
          <button onClick={() => scrollTo('contact')} className="bg-brand-ink text-brand-bg py-4 rounded-lg text-center uppercase tracking-widest text-sm font-sans mt-4">
            Enquire Now
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <motion.img 
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=2000" 
            alt="My Nest Exterior" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl mb-4 leading-none drop-shadow-2xl">My Nest</h1>
            <p className="text-lg md:text-2xl font-light tracking-wide mb-8 text-white/90 drop-shadow-md">
              Modern Luxury by <span className="font-semibold text-brand-accent">Baheti Housing</span>
            </p>
            <p className="text-sm md:text-base uppercase tracking-[0.2em] mb-12 text-white/70 max-w-2xl mx-auto leading-relaxed">
              An exclusive gated community featuring premium 2 & 3 BHK residences in Chhatrapati Sambhaji Nagar.
            </p>
            <motion.button 
              onClick={() => scrollTo('contact')}
              className="bg-brand-accent text-white px-10 py-4 rounded-full uppercase tracking-widest text-sm font-medium hover:bg-brand-surface hover:text-brand-ink transition-all duration-300 shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Discover the Elegance
            </motion.button>
          </motion.div>
        </div>

        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 cursor-pointer"
          onClick={() => scrollTo('overview')}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white/50 to-transparent" />
          <span className="text-[10px] uppercase tracking-widest">Scroll to explore</span>
        </motion.div>
      </section>

      {/* Overview Section */}
      <section id="overview" className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-xs uppercase tracking-widest text-brand-accent font-semibold mb-4">The Vision</h2>
            <h3 className="font-serif text-4xl md:text-5xl mb-8 leading-tight">A Standalone Icon of <br/>Modern Luxury.</h3>
            <p className="text-brand-ink/70 leading-relaxed mb-6 text-lg font-light">
              {PROJECT_DETAILS.description}
            </p>
            <p className="text-brand-ink/70 leading-relaxed mb-8 text-lg font-light">
              Designed for those who appreciate the finer things in life, My Nest offers a rare combination of privacy, community, and unparalleled connectivity on Beed Bypass Road.
            </p>
            
            <div className="grid grid-cols-2 gap-8 border-t border-brand-border pt-8">
              <div>
                <div className="font-serif text-5xl text-brand-ink mb-2"><AnimatedCounter value={136} /></div>
                <div className="text-xs uppercase tracking-widest text-brand-ink/60 font-semibold">Exclusive Families</div>
              </div>
              <div>
                <div className="font-serif text-5xl text-brand-ink mb-2"><AnimatedCounter value={2} /> & <AnimatedCounter value={3} /></div>
                <div className="text-xs uppercase tracking-widest text-brand-ink/60 font-semibold">BHK Configurations</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="relative h-[600px] rounded-2xl overflow-hidden group"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.img 
              src={PROJECT_DETAILS.gallery[0]} 
              alt="Interior View" 
              className="w-full h-[120%] object-cover -mt-[10%]"
              referrerPolicy="no-referrer"
              initial={{ y: "-10%" }}
              whileInView={{ y: "10%" }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
            <div className="absolute inset-0 border-8 border-brand-bg/20 rounded-2xl m-4 pointer-events-none transition-all duration-500 group-hover:m-2"></div>
          </motion.div>
        </div>
      </section>

      {/* Residences Section */}
      <section id="residences" className="py-24 md:py-32 bg-brand-bg text-brand-ink px-6 border-y border-brand-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-xs uppercase tracking-widest text-brand-accent font-semibold mb-4">The Residences</h2>
            <h3 className="font-serif text-4xl md:text-5xl">Thoughtfully Designed Spaces</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {PROJECT_DETAILS.configurations.map((config, idx) => (
              <motion.div 
                key={idx}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                onClick={() => scrollTo('contact')}
              >
                <div className="relative h-[400px] rounded-xl overflow-hidden mb-8">
                  <img 
                    src={config.image} 
                    alt={config.type} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-brand-ink/0 group-hover:bg-brand-ink/40 transition-colors duration-500 flex items-center justify-center">
                    <motion.div 
                      className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500"
                    >
                      <span className="bg-brand-accent text-brand-bg px-6 py-3 rounded-full uppercase tracking-widest text-xs font-semibold shadow-xl flex items-center gap-2">
                        View Floor Plan <ArrowRight size={14} />
                      </span>
                    </motion.div>
                  </div>
                  <div className="absolute top-6 left-6 bg-brand-bg/80 backdrop-blur-md text-brand-ink px-4 py-2 text-xs uppercase tracking-widest font-semibold rounded-sm border border-brand-border">
                    {config.units} Units Only
                  </div>
                </div>
                <div className="flex justify-between items-end mb-4">
                  <h4 className="font-serif text-4xl text-brand-accent group-hover:text-brand-ink transition-colors">{config.type}</h4>
                  <span className="text-sm uppercase tracking-widest text-brand-ink/60">{config.carpetArea}</span>
                </div>
                <p className="text-brand-ink/70 font-light leading-relaxed mb-6">
                  {config.description}
                </p>
                <button className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-brand-accent group-hover:text-brand-ink transition-colors">
                  Request Details <ArrowRight size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities Section - Wheel of Luxury */}
      <section id="amenities" className="py-24 md:py-32 px-6 bg-brand-bg relative overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-luminosity">
          <motion.img 
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Luxury Texture" 
            className="w-full h-full object-cover grayscale"
            style={{ y: useTransform(useScroll().scrollYProgress, [0, 1], ['-10%', '10%']) }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-xs uppercase tracking-widest text-brand-accent font-semibold mb-4">Lifestyle</h2>
            <h3 className="font-serif text-4xl md:text-5xl text-brand-ink">The Wheel of Luxury</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
            {/* Left Pane: The Wheel */}
            <div className="relative flex justify-center items-center py-12 lg:py-0">
              <div className="relative w-[280px] h-[280px] md:w-[400px] md:h-[400px] lg:w-[460px] lg:h-[460px] rounded-full border border-brand-border/40 flex items-center justify-center">
                {/* Decorative Rings */}
                <div className="absolute inset-4 rounded-full border border-brand-border border-dashed"></div>
                <div className="absolute inset-12 rounded-full border border-brand-border"></div>
                <div className="absolute inset-24 rounded-full bg-brand-bg/30 shadow-inner flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-brand-accent/10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-brand-accent"></div>
                  </div>
                </div>

                {/* Active Indicator Line (Points Right) */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 md:w-12 h-[1px] bg-brand-accent translate-x-full hidden lg:block"></div>

                {/* Rotating Container */}
                <motion.div 
                  className="absolute inset-0"
                  animate={{ rotate: -activeAmenityCategory * (360 / PROJECT_DETAILS.categorizedAmenities.length) }}
                  transition={{ type: "spring", stiffness: 40, damping: 20 }}
                >
                  {PROJECT_DETAILS.categorizedAmenities.map((category, idx) => {
                    const angleStep = 360 / PROJECT_DETAILS.categorizedAmenities.length;
                    const itemAngle = idx * angleStep;
                    const isActive = activeAmenityCategory === idx;
                    const rotation = -activeAmenityCategory * angleStep;
                    
                    return (
                      <div 
                        key={idx}
                        className="absolute top-1/2 left-1/2 w-[280px] md:w-[400px] lg:w-[460px] h-0 -translate-x-1/2 -translate-y-1/2 flex justify-end items-center pointer-events-none"
                        style={{ transform: `rotate(${itemAngle}deg)` }}
                      >
                        <div className="pointer-events-auto translate-x-1/2">
                          <motion.button
                            onClick={() => setActiveAmenityCategory(idx)}
                            className={`flex flex-col items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full transition-all duration-300 ${isActive ? 'bg-brand-accent text-brand-bg shadow-2xl scale-110 border-4 border-brand-bg' : 'bg-brand-bg text-brand-ink/60 hover:text-brand-ink shadow-md hover:scale-105 border border-brand-border/50'}`}
                            animate={{ rotate: -rotation - itemAngle }}
                            transition={{ type: "spring", stiffness: 40, damping: 20 }}
                          >
                            <span className="text-[9px] md:text-[11px] uppercase tracking-widest font-semibold text-center leading-tight px-2">
                              {category.category.split(' ')[0]}
                            </span>
                          </motion.button>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </div>
            </div>

            {/* Right Pane: Content */}
            <div className="lg:pl-16">
              <motion.div
                key={activeAmenityCategory}
                initial={{ opacity: 0, x: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <h4 className="font-serif text-3xl md:text-4xl text-brand-ink mb-2">
                  {PROJECT_DETAILS.categorizedAmenities[activeAmenityCategory].category}
                </h4>
                <p className="text-brand-accent text-xs uppercase tracking-widest mb-10 font-semibold">Curated Experiences</p>
                
                <div className="space-y-8">
                  {PROJECT_DETAILS.categorizedAmenities[activeAmenityCategory].items.map((amenity, idx) => {
                    const Icon = iconMap[amenity.icon] || CheckCircle;
                    return (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.1 }}
                        className="flex items-start gap-6 group"
                      >
                        <div className="w-14 h-14 rounded-full bg-brand-bg border border-brand-border/50 flex items-center justify-center text-brand-accent shrink-0 group-hover:bg-brand-accent group-hover:text-brand-bg group-hover:border-brand-accent transition-all duration-300 shadow-sm">
                          <Icon size={22} strokeWidth={1.5} />
                        </div>
                        <div>
                          <h5 className="font-serif text-xl text-brand-ink mb-2 group-hover:text-brand-accent transition-colors">{amenity.name}</h5>
                          <p className="text-brand-ink/70 text-sm leading-relaxed">{amenity.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications Section */}
      <section id="specifications" className="py-24 md:py-32 px-6 bg-brand-bg relative overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-luminosity">
          <motion.img 
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Interior Texture" 
            className="w-full h-full object-cover grayscale"
            style={{ y: useTransform(useScroll().scrollYProgress, [0, 1], ['10%', '-10%']) }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-xs uppercase tracking-widest text-brand-accent font-semibold mb-4">Quality</h2>
            <h3 className="font-serif text-4xl md:text-5xl">Premium Specifications</h3>
            <p className="text-brand-ink/70 mt-6 max-w-2xl mx-auto">
              Every detail has been carefully selected to ensure the highest standards of luxury, durability, and aesthetics.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Pane: Tabs */}
            <div className="lg:col-span-4 space-y-2 sticky top-32">
              {PROJECT_DETAILS.specifications.map((spec, idx) => {
                const isActive = activeSpecCategory === spec.category;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveSpecCategory(spec.category)}
                    className={`w-full text-left px-6 py-4 rounded-lg transition-all duration-300 flex items-center justify-between ${isActive ? 'bg-brand-ink text-brand-bg shadow-lg' : 'hover:bg-brand-ink/5 text-brand-ink/70'}`}
                  >
                    <span className="font-serif text-lg">{spec.category}</span>
                    {isActive && <ArrowRight size={16} className="text-brand-accent" />}
                  </button>
                );
              })}
            </div>

            {/* Right Pane: Content */}
            <div className="lg:col-span-8 bg-brand-bg/80 backdrop-blur-xl rounded-2xl p-8 md:p-12 shadow-2xl border border-brand-border relative overflow-hidden min-h-[400px]">
              {/* Large background text for editorial feel */}
              <div className="absolute -right-10 -top-10 text-[120px] font-serif font-bold text-brand-ink/5 pointer-events-none select-none leading-none tracking-tighter">
                {activeSpecCategory?.split(' ')[0]}
              </div>

              <div className="relative z-10">
                <h4 className="font-serif text-3xl text-brand-ink mb-8 border-b border-brand-border pb-4">{activeSpecCategory}</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  {PROJECT_DETAILS.specifications.find(s => s.category === activeSpecCategory)?.details.map((detail, dIdx) => (
                    <motion.li
                      key={`${activeSpecCategory}-${dIdx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: dIdx * 0.1 }}
                      className="flex items-start gap-3 text-brand-ink/80"
                    >
                      <CheckCircle className="text-brand-accent shrink-0 mt-1" size={18} />
                      <span className="text-sm leading-relaxed">{detail}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-xs uppercase tracking-widest text-brand-accent font-semibold mb-4">Connectivity</h2>
            <h3 className="font-serif text-4xl md:text-5xl mb-6 leading-tight">Connected to Everything that Matters.</h3>
            <div className="flex items-start gap-3 mb-12 text-brand-ink/80">
              <MapPin className="text-brand-accent shrink-0 mt-1" size={20} />
              <p className="text-lg font-light">{PROJECT_DETAILS.location}</p>
            </div>

            <div className="space-y-6">
              {PROJECT_DETAILS.locationHighlights.map((highlight, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-brand-border pb-4">
                  <div className="font-medium text-brand-ink">{highlight.place}</div>
                  <div className="text-right">
                    <div className="text-brand-accent font-serif text-xl">{highlight.time}</div>
                    <div className="text-[10px] uppercase tracking-widest text-brand-ink/50">{highlight.distance}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="h-[500px] bg-brand-bg/50 rounded-2xl overflow-hidden relative group"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3752.417385552431!2d75.3370!3d19.8640!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdba2a1b1b1b1b1%3A0x1b1b1b1b1b1b1b1b!2sBeed%20Bypass%20Rd%2C%20Chhatrapati%20Sambhaji%20Nagar%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0, filter: 'grayscale(0.8) contrast(1.2)' }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full object-cover transition-all duration-700 group-hover:filter-none"
            ></iframe>
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center group-hover:opacity-0 transition-opacity duration-500">
              <div className="bg-brand-bg text-brand-ink px-6 py-4 rounded-xl shadow-2xl flex flex-col items-center text-center max-w-[200px] border border-brand-border">
                <div className="w-12 h-12 bg-brand-accent rounded-full flex items-center justify-center mb-3 -mt-10 shadow-lg border-4 border-brand-bg">
                  <Home size={20} className="text-white" />
                </div>
                <span className="font-serif text-xl mb-1">My Nest</span>
                <span className="text-[10px] uppercase tracking-widest text-brand-ink/60">Beed Bypass Road</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact / Footer Section */}
      <section id="contact" className="bg-brand-ink text-brand-bg py-24 px-6 border-t border-brand-bg/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="font-serif text-5xl md:text-6xl mb-6">Register Your Interest</h2>
            <p className="text-brand-bg/60 font-light text-lg mb-12 max-w-md">
              Leave your details below and our luxury property advisor will get in touch with you shortly to schedule a private presentation.
            </p>
            
            <div className="space-y-6 text-brand-bg/80">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-brand-bg/30 flex items-center justify-center text-brand-accent">
                  <Phone size={20} />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-brand-bg/50 mb-1">Call Us</div>
                  <div className="font-serif text-xl">+91 98765 43210</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-brand-bg/30 flex items-center justify-center text-brand-accent">
                  <Mail size={20} />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-brand-bg/50 mb-1">Email Us</div>
                  <div className="font-serif text-xl">sales@bahetihousing.com</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-bg/80 backdrop-blur-xl border border-brand-border text-brand-ink p-8 md:p-12 rounded-2xl shadow-2xl relative overflow-hidden">
            {/* Form Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-luminosity">
              <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Texture" className="w-full h-full object-cover grayscale" />
            </div>
            
            <div className="relative z-10">
              <h3 className="font-serif text-3xl mb-8">Enquiry Form</h3>
              <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative">
                  <input type="text" id="firstName" className="peer w-full border-b border-brand-border py-2 focus:outline-none focus:border-brand-accent bg-transparent transition-colors placeholder-transparent" placeholder="First Name" />
                  <label htmlFor="firstName" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest font-semibold text-brand-ink/60 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-brand-accent">First Name</label>
                </div>
                <div className="relative">
                  <input type="text" id="lastName" className="peer w-full border-b border-brand-border py-2 focus:outline-none focus:border-brand-accent bg-transparent transition-colors placeholder-transparent" placeholder="Last Name" />
                  <label htmlFor="lastName" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest font-semibold text-brand-ink/60 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-brand-accent">Last Name</label>
                </div>
              </div>
              <div className="relative">
                <input type="tel" id="phone" className="peer w-full border-b border-brand-border py-2 focus:outline-none focus:border-brand-accent bg-transparent transition-colors placeholder-transparent" placeholder="Phone Number" />
                <label htmlFor="phone" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest font-semibold text-brand-ink/60 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-brand-accent">Phone Number</label>
              </div>
              <div className="relative">
                <input type="email" id="email" className="peer w-full border-b border-brand-border py-2 focus:outline-none focus:border-brand-accent bg-transparent transition-colors placeholder-transparent" placeholder="Email Address" />
                <label htmlFor="email" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest font-semibold text-brand-ink/60 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-brand-accent">Email Address</label>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-brand-ink/60 mb-4">Interested In</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="config" className="accent-brand-accent" defaultChecked />
                    <span className="text-sm group-hover:text-brand-accent transition-colors">2 BHK</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="config" className="accent-brand-accent" />
                    <span className="text-sm group-hover:text-brand-accent transition-colors">3 BHK</span>
                  </label>
                </div>
              </div>
              <motion.button 
                className="w-full bg-brand-ink text-brand-bg py-4 rounded-lg uppercase tracking-widest text-sm font-medium hover:bg-brand-accent transition-colors mt-4 shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Submit Enquiry
              </motion.button>
            </form>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-brand-bg/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-brand-bg/40">
          <p>&copy; {new Date().getFullYear()} Baheti Housing. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-brand-bg transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-bg transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-brand-bg transition-colors">RERA Details</a>
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-[#128C7E] transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.open('https://wa.me/919876543210', '_blank')}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
      >
        <MessageCircle size={28} />
      </motion.button>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'dashboard'>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isResolvingAuth, setIsResolvingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            const userData: User = {
              id: firebaseUser.uid,
              name: data.displayName || firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              roleId: data.role === 'admin' ? 'r_admin' : 
                      data.role === 'director' ? 'r_dir' : 
                      data.role === 'advisor' ? 'r_adv' : 
                      data.role === 'developer' ? 'r_developer' : 'r_buyer',
              status: 'active'
            };
            setCurrentUser(userData);
            setCurrentView('dashboard');
          } else {
            setCurrentUser(null);
            setCurrentView('landing');
          }
        } catch (error) {
          console.error("Error restoring user session:", error);
          setCurrentUser(null);
          setCurrentView('landing');
        }
      } else {
        setCurrentUser(null);
        setCurrentView(prev => prev === 'dashboard' ? 'landing' : prev);
      }
      setIsResolvingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  if (isResolvingAuth) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center text-brand-ink">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full mb-4"
        />
        <h2 className="font-serif text-2xl tracking-widest text-brand-ink/80">My Nest</h2>
        <p className="text-[10px] uppercase tracking-widest text-brand-ink/40 mt-2">Restoring secure session...</p>
      </div>
    );
  }

  if (currentView === 'login') {
    return (
      <Login 
        onLogin={(user) => {
          setCurrentUser(user);
          setCurrentView('dashboard');
        }} 
        onBack={() => setCurrentView('landing')} 
      />
    );
  }

  if (currentView === 'dashboard' && currentUser) {
    return (
      <Dashboard 
        user={currentUser} 
        onLogout={async () => {
          try {
            await signOut(auth);
          } catch (error) {
            console.error("Logout error:", error);
          }
        }} 
        onGoToLanding={() => {
          setCurrentView('landing');
        }}
      />
    );
  }

  return (
    <LandingPage 
      onLoginClick={() => {
        if (currentUser) {
          setCurrentView('dashboard');
        } else {
          setCurrentView('login');
        }
      }} 
      currentUser={currentUser}
    />
  );
}
