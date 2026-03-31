"use client";

import {
  faChevronUp, faEnvelope, faRocket, faTimes, faCheckCircle,
  faChartLine, faClock, faShieldAlt, faSatelliteDish, faTachometerAlt,
  faTachometer, faMapMarkerAlt, faRoute, faBell, faExclamationTriangle,
  faCog, faCloud, faDatabase, faLaptop, faMobileAlt, faTruck,
  faUniversity, faLandmark, faShippingFast, faBox, faChartBar, faMapPin,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth/AuthModal";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PRIMARY = "#00628B";

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  // If already logged in, skip the landing page
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      router.replace("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="text-black">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Hero */}
      <section id="home" className="relative min-h-screen flex items-center justify-center text-center pt-24 overflow-hidden">
        <video ref={videoRef} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover scale-105">
          <source src="/vroomo-car-rental-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-[#00628B]/55 via-[#042f44]/70 to-black/85 pointer-events-none" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" aria-hidden />
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-4xl text-[#00628B] md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Smart Fleet Tracking & <span className="text-white">Vehicle Monitoring System</span>
          </h1>
          <p className="text-lg md:text-xl text-white/95 mb-10 max-w-2xl mx-auto">
            Monitor, analyze, and manage your vehicles in real time using IoT and GPS tracking technology.
          </p>
          <Button
            type="button"
            className="bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-[#00628B] border-2 border-white/90 shadow-lg flex items-center gap-2 text-lg px-8 py-6 rounded-xl transition-all duration-300"
            onClick={() => setIsAuthModalOpen(true)}
          >
            <FontAwesomeIcon icon={faRocket} className="mr-2" />
            Get Started
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0] pointer-events-none">
          <svg className="relative block w-full h-16 md:h-24" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden>
            <path d="M0,0 Q720,80 1440,0 L1440,80 L0,80 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Problems */}
      <section id="problem" className="py-20 px-[5%] bg-white">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <p className="text-sm uppercase tracking-wider text-[#00628B] font-semibold mb-2">Why we exist</p>
          <h2 className="text-3xl md:text-4xl font-bold text-black">Challenges in Fleet Management</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {["Difficult to monitor vehicle locations","Fuel misuse and inefficient routes","Lack of real-time monitoring","Limited driver performance tracking"].map((text, i) => (
            <div key={i} className="flex items-center gap-4 p-6 rounded-xl border border-[#00628B]/20 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: PRIMARY }}>
                <FontAwesomeIcon icon={faExclamationTriangle} />
              </div>
              <p className="text-gray-700 font-medium">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solution */}
      <section id="solution" className="py-20 px-[5%] text-white relative bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{ backgroundImage: `linear-gradient(rgba(0,98,139,0.7), rgba(0,98,139,0.85)), url('https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1920&q=80')` }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl px-8 py-12 shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Smart Tracking Solution</h2>
            <p className="text-lg text-white/95 leading-relaxed">
              Imotrak provides a powerful platform that uses GPS and IoT technology to monitor vehicle movement, optimize routes, and improve fleet efficiency in real time.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-[5%] bg-gray-50">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <p className="text-sm uppercase tracking-wider text-[#00628B] font-semibold mb-2">Platform capabilities</p>
          <h2 className="text-3xl md:text-4xl font-bold text-black">Key Features</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { icon: faSatelliteDish, title: "Real-Time Vehicle Tracking", desc: "Track vehicles live on an interactive map." },
            { icon: faTachometerAlt, title: "Fleet Dashboard", desc: "View all vehicle activity in a single dashboard." },
            { icon: faTachometer, title: "Speed Monitoring", desc: "Detect overspeeding and unsafe driving behavior." },
            { icon: faMapMarkerAlt, title: "Geofencing Alerts", desc: "Receive notifications when vehicles enter or leave specific areas." },
            { icon: faRoute, title: "Trip Analytics", desc: "Analyze route efficiency and trip history." },
            { icon: faBell, title: "Smart Alerts & Notifications", desc: "Get alerts for unusual activities." },
          ].map((f, i) => (
            <div key={i} className="bg-white p-8 rounded-xl shadow border border-[#00628B]/10 hover:border-[#00628B]/30 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white mb-4 group-hover:bg-[#004a6b] transition-colors" style={{ backgroundColor: PRIMARY }}>
                <FontAwesomeIcon icon={f.icon} className="text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-[5%] text-white relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,1.55), rgba(0,0,0,0.75)), url('https://images.unsplash.com/photo-1591419478162-a4dd21b7ec0a?q=80&w=687&auto=format&fit=crop')` }}>
        <div className="max-w-4xl mx-auto text-center mb-14">
          <p className="text-sm uppercase tracking-wider text-[#00628B] font-semibold mb-2">Simple process</p>
          <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {[
            { step: "1", icon: faCog, title: "Install GPS Device", desc: "A tracking device is installed in the vehicle." },
            { step: "2", icon: faDatabase, title: "Data Collection", desc: "Vehicle data is sent to the cloud in real time." },
            { step: "3", icon: faCloud, title: "System Processing", desc: "The platform analyzes location and activity." },
            { step: "4", icon: faLaptop, title: "Dashboard Monitoring", desc: "Managers view insights through the Imotrak dashboard." },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4" style={{ backgroundColor: PRIMARY }}>{item.step}</div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                <FontAwesomeIcon icon={item.icon} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-white/85 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology */}
      <section id="technology" className="py-20 px-[5%] bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <p className="text-sm uppercase tracking-wider text-[#00628B] font-semibold mb-2">Built for scale</p>
          <h2 className="text-3xl md:text-4xl font-bold">System Architecture & Technology</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
          {[{ label: "IoT Sensors", icon: faCog },{ label: "GPS tracking devices", icon: faSatelliteDish },{ label: "Cloud data processing", icon: faCloud },{ label: "Web dashboard", icon: faLaptop },{ label: "Mobile monitoring", icon: faMobileAlt }].map((t, i) => (
            <div key={i} className="flex items-center gap-3 px-6 py-4 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-colors">
              <FontAwesomeIcon icon={t.icon} className="text-[#00628B]" />
              <span className="font-medium">{t.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20 px-[5%] bg-white">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <p className="text-sm uppercase tracking-wider text-[#00628B] font-semibold mb-2">Why choose us</p>
          <h2 className="text-3xl md:text-4xl font-bold text-black">Benefits</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[{ icon: faChartLine, text: "Reduce fuel costs" },{ icon: faShieldAlt, text: "Improve driver safety" },{ icon: faTachometerAlt, text: "Increase fleet efficiency" },{ icon: faMapPin, text: "Real-time vehicle visibility" },{ icon: faChartBar, text: "Data-driven decisions" }].map((b, i) => (
            <div key={i} className="flex items-center gap-4 p-6 rounded-xl border border-[#00628B]/20 bg-gray-50/50 hover:bg-[#00628B]/5 transition-colors">
              <FontAwesomeIcon icon={faCheckCircle} className="text-[#00628B] text-xl shrink-0" />
              <span className="text-gray-800 font-medium">{b.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-20 px-[5%] bg-gray-50">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <p className="text-sm uppercase tracking-wider text-[#00628B] font-semibold mb-2">Who uses Imotrak</p>
          <h2 className="text-3xl md:text-4xl font-bold text-black">Use Cases</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {[{ icon: faTruck, label: "Logistics companies" },{ icon: faUniversity, label: "Universities" },{ icon: faLandmark, label: "Government fleets" },{ icon: faShippingFast, label: "Transportation services" },{ icon: faBox, label: "Delivery companies" }].map((u, i) => (
            <div key={i} className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white border border-[#00628B]/10 shadow-sm hover:shadow-md hover:border-[#00628B]/30 transition-all">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: PRIMARY }}>
                <FontAwesomeIcon icon={u.icon} className="text-xl" />
              </div>
              <span className="text-center font-medium text-gray-800 text-sm">{u.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Statistics */}
      <section id="statistics" className="py-20 px-[5%] text-white" style={{ backgroundColor: PRIMARY }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[{ icon: faTruck, value: "100+", label: "Vehicles monitored" },{ icon: faSatelliteDish, value: "Real-time", label: "Tracking" },{ icon: faClock, value: "24/7", label: "Monitoring" },{ icon: faChartBar, value: "Data-driven", label: "Fleet management" }].map((s, i) => (
              <div key={i} className="text-center p-6 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition-colors">
                <FontAwesomeIcon icon={s.icon} className="text-3xl mb-3 text-white/90" />
                <div className="text-2xl md:text-3xl font-bold mb-1">{s.value}</div>
                <div className="text-white/90 text-sm uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-[5%] bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm uppercase tracking-wider text-[#00628B] font-semibold mb-2">About the project</p>
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">About Imotrak</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Imotrak is an intelligent fleet monitoring system developed to support smart transportation and IoT innovation at the{" "}
            <strong className="text-black">University of Rwanda and other institutions.</strong>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-24 px-[5%] text-white text-center" style={{ backgroundColor: "#00628B" }}>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Monitoring Your Fleet Today</h2>
        <p className="text-white/80 mb-10 max-w-xl mx-auto">Request a demo or get in touch to see how Imotrak can transform your fleet operations.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button type="button" className="bg-white text-[#00628B] hover:bg-white/90 border-2 border-white text-lg px-8 py-6 rounded-xl shadow-lg transition-all duration-300" onClick={() => setIsAuthModalOpen(true)}>
            <FontAwesomeIcon icon={faRocket} className="mr-2" />
            Get Started
          </Button>
          <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-black text-lg px-8 py-6 rounded-lg transition-colors" asChild>
            <Link href="#contact">
              <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
              Contact Us
            </Link>
          </Button>
        </div>
      </section>

      {/* Scroll to top */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
        className={`fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 ${showScrollTop ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}`}
        style={{ backgroundColor: PRIMARY }}
      >
        <FontAwesomeIcon icon={faChevronUp} className="text-lg" />
      </button>
    </main>
  );
}
