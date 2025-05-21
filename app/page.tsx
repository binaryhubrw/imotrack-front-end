'use client'
import { faCogs, faStar, faEnvelope,
  faTruckMoving, faRocket, faPlayCircle, faCar, faTruck, faBus, faMotorcycle,
  faSatelliteDish, faGasPump, faTools, faUserTie, faCheckCircle,
  faChartLine, faClock, faShieldAlt,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@/components/ui/button' // shadcn/ui button

export default function HomePage() {

  return (
    <main className="text-[#0872b3]">
      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center text-center bg-gradient-to-br from-[#0872b3] to-white pt-24 overflow-hidden">
        <div className="z-10 max-w-2xl mx-auto">
          <div className="text-6xl text-[#0872b3] mb-6 animate-pulse">
            <FontAwesomeIcon icon={faTruckMoving} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#0872b3]">Imotrack</h1>
          <p className="text-lg mb-8 text-[#0872b3]">Streamline your fleet operations with real-time tracking and comprehensive management tools</p>
             <div className="flex justify-center gap-4 ">
            <Button className=" bg-[#0872b3] text-white hover:bg-white hover:text-[#0872b3] flex items-center gap-2 text-lg px-15 py-7 rounded cursor-pointer ">
              <FontAwesomeIcon icon={faRocket} /> Get Started
            </Button>
            <Button variant="outline" className=" hover:border-0  hover:text-white hover:bg-[#0872b3] flex items-center gap-2 text-lg px-15 py-7 rounded cursor-pointer ">
              <FontAwesomeIcon icon={faPlayCircle} /> Watch Demo
            </Button>
          </div>
        </div>
        {/* Floating Icons */}
        <div className="absolute inset-0 pointer-events-none">
          <span className="absolute top-[20%] left-[10%] text-3xl text-[#0872b3]/80 animate-float1"><FontAwesomeIcon icon={faCar} /></span>
          <span className="absolute top-[60%] left-[80%] text-3xl text-[#0872b3]/80 animate-float2"><FontAwesomeIcon icon={faTruck} /></span>
          <span className="absolute top-[80%] left-[20%] text-3xl text-[#0872b3]/80 animate-float3"><FontAwesomeIcon icon={faBus} /></span>
          <span className="absolute top-[30%] left-[70%] text-3xl text-[#0872b3]/80 animate-float4"><FontAwesomeIcon icon={faMotorcycle} /></span>
        </div>
        {/* Keyframes for floating icons */}
        <style jsx global>{`
          @keyframes float1 { 0%{transform:translateY(0);} 100%{transform:translateY(-100vh) rotate(360deg);} }
          @keyframes float2 { 0%{transform:translateY(0);} 100%{transform:translateY(-100vh) rotate(360deg);} }
          @keyframes float3 { 0%{transform:translateY(0);} 100%{transform:translateY(-100vh) rotate(360deg);} }
          @keyframes float4 { 0%{transform:translateY(0);} 100%{transform:translateY(-100vh) rotate(360deg);} }
          .animate-float1 { animation: float1 15s linear infinite; animation-delay: 0s;}
          .animate-float2 { animation: float2 15s linear infinite; animation-delay: 2s;}
          .animate-float3 { animation: float3 15s linear infinite; animation-delay: 4s;}
          .animate-float4 { animation: float4 15s linear infinite; animation-delay: 6s;}
        `}</style>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-[5%] bg-white">
        <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-2 text-[#0872b3]">
          <FontAwesomeIcon icon={faCogs} /> Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-xl text-center shadow border border-[#0872b3]/30 hover:bg-[#0872b3] hover:text-white transition-all">
            <div className="text-3xl mb-4 transition-all"><FontAwesomeIcon icon={faSatelliteDish} /></div>
            <h3 className="text-xl font-semibold mb-2">Real-time Tracking</h3>
            <p className="mb-4">Monitor your vehicles in real-time with advanced GPS tracking technology</p>
            <ul className="text-left space-y-2">
              <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheckCircle} /> Live GPS tracking</li>
              <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheckCircle} /> Route optimization</li>
              <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheckCircle} /> Geofencing alerts</li>
            </ul>
          </div>
          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-xl text-center shadow border border-[#0872b3]/30 hover:bg-[#0872b3] hover:text-white transition-all">
            <div className="text-3xl mb-4 transition-all"><FontAwesomeIcon icon={faGasPump} /></div>
            <h3 className="text-xl font-semibold mb-2">Fuel Management</h3>
            <p className="mb-4">Track fuel consumption and optimize costs across your fleet</p>
            <ul className="text-left space-y-2">
              <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheckCircle} /> Fuel consumption tracking</li>
              <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheckCircle} /> Cost analysis</li>
              <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheckCircle} /> Efficiency reports</li>
            </ul>
          </div>
          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-xl text-center shadow border border-[#0872b3]/30 hover:bg-[#0872b3] hover:text-white transition-all">
            <div className="text-3xl mb-4 transition-all"><FontAwesomeIcon icon={faTools} /></div>
            <h3 className="text-xl font-semibold mb-2">Maintenance Scheduling</h3>
            <p className="mb-4">Keep your fleet in top condition with automated maintenance scheduling</p>
            <ul className="text-left space-y-2">
              <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheckCircle} /> Service reminders</li>
              <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheckCircle} /> Maintenance history</li>
              <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheckCircle} /> Cost tracking</li>
            </ul>
          </div>
          {/* Feature 4 */}
          <div className="bg-white p-8 rounded-xl text-center shadow border border-[#0872b3]/30 hover:bg-[#0872b3] hover:text-white transition-all">
            <div className="text-3xl mb-4 transition-all"><FontAwesomeIcon icon={faUserTie} /></div>
            <h3 className="text-xl font-semibold mb-2">Driver Management</h3>
            <p className="mb-4">Efficiently manage driver schedules and performance</p>
            <ul className="text-left space-y-2">
              <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheckCircle} /> Driver profiles</li>
              <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheckCircle} /> Performance metrics</li>
              <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheckCircle} /> Training records</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-[5%] bg-white">
        <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-2 text-[#0872b3]">
          <FontAwesomeIcon icon={faStar} /> Why Choose Imotrack?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Benefit 1 */}
          <div className="text-center p-8 bg-white rounded-xl shadow border border-[#0872b3]/30 hover:bg-[#0872b3] hover:text-white transition-all">
            <div className="text-3xl mb-4"><FontAwesomeIcon icon={faChartLine} /></div>
            <h3 className="text-xl font-semibold mb-2">Cost Optimization</h3>
            <p>Reduce operational costs through efficient fleet management</p>
            <div className="mt-6 pt-6 border-t border-[#0872b3]/30">
              <span className="block text-2xl font-bold group-hover:text-white ">25%</span>
              <span className="block">Cost Reduction</span>
            </div>
          </div>
          {/* Benefit 2 */}
          <div className="text-center p-8 bg-white rounded-xl shadow border border-[#0872b3]/30 hover:bg-[#0872b3] hover:text-white transition-all">
            <div className="text-3xl mb-4"><FontAwesomeIcon icon={faClock} /></div>
            <h3 className="text-xl font-semibold mb-2">Time Savings</h3>
            <p>Automate routine tasks and save valuable time</p>
            <div className="mt-6 pt-6 border-t border-[#0872b3]/30">
              <span className="block text-2xl font-bold  group-hover:text-white">40%</span>
              <span className="block">Time Saved</span>
            </div>
          </div>
          {/* Benefit 3 */}
          <div className="text-center p-8 bg-white rounded-xl shadow border border-[#0872b3]/30 hover:bg-[#0872b3] hover:text-white transition-all">
            <div className="text-3xl mb-4"><FontAwesomeIcon icon={faShieldAlt} /></div>
            <h3 className="text-xl font-semibold mb-2">Enhanced Safety</h3>
            <p>Improve safety standards with real-time monitoring</p>
            <div className="mt-6 pt-6 border-t border-[#0872b3]/30">
              <span className="block text-2xl font-bold  group-hover:text-white">30%</span>
              <span className="block">Safety Improvement</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative h-screen flex-col flex items-center justify-center text-center bg-gradient-to-br from-[#0872b3] to-white pt-24 overflow-hidden">
        <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2 text-[#0872b3]">
          <FontAwesomeIcon icon={faEnvelope} /> Ready to Get Started?
        </h2>
        <p className="mb-8">Transform your fleet management today</p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button className=" bg-[#0872b3] text-white hover:bg-white hover:text-[#0872b3] flex items-center gap-2 text-lg px-15 py-7 rounded cursor-pointer ">
              <FontAwesomeIcon icon={faRocket} /> Get Started
            </Button>
            <Button variant="outline" className=" hover:border-0  hover:text-white hover:bg-[#0872b3] flex items-center gap-2 text-lg px-15 py-7 rounded cursor-pointer ">
              <FontAwesomeIcon icon={faPlayCircle} /> Schedule Demo
            </Button>
        </div>
      </section>
    </main>
  )
}
