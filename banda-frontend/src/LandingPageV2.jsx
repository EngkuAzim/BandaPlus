import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  MapPin, 
  Camera, 
  Activity, 
  CheckCircle2, 
  ChevronDown, 
  Menu,
  X,
  Layers,
  Zap,
  Shield,
  BarChart3
} from 'lucide-react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    outline: "border border-slate-200 hover:bg-slate-100 text-slate-900",
    ghost: "hover:bg-slate-100 hover:text-slate-900 text-slate-600"
  };
  const sizes = "h-10 py-2 px-4";
  
  return (
    <Link className={`${baseStyle} ${variants[variant]} ${sizes} ${className}`} {...props}>
      {children}
    </Link>
  );
};

export default function LandingPageV2() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-200">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center text-white text-xs">B</span>
              BANDA+
            </Link>
            <div className="hidden md:flex gap-6">
              <a href="#features" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">How it Works</a>
              <a href="#faq" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">FAQ</a>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" to="/login">Log in</Button>
            <Button variant="primary" to="/register">Sign up</Button>
          </div>
          <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4 flex flex-col gap-4">
            <a href="#features" className="text-sm font-medium text-slate-600 py-2">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 py-2">How it Works</a>
            <a href="#faq" className="text-sm font-medium text-slate-600 py-2">FAQ</a>
            <div className="h-px bg-slate-100 my-2"></div>
            <Link to="/login" className="text-sm font-medium text-slate-600 py-2">Log in</Link>
            <Link to="/register" className="text-sm font-medium text-slate-900 py-2">Sign up</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-slate-900 mr-2"></span>
            BANDA+ Version 2.0 is now live
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-slate-900 mb-6 max-w-4xl mx-auto leading-tight">
            Municipal maintenance, <br className="hidden md:block"/> engineered for speed.
          </h1>
          <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            A unified platform for civic reporting, automated AI damage assessment, and streamlined contractor dispatch. Built for modern city councils.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button variant="primary" to="/lapor-aduan" className="w-full sm:w-auto h-12 px-8 text-base">
              Report an Issue <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button variant="outline" to="/login" className="w-full sm:w-auto h-12 px-8 text-base">
              Contractor Portal
            </Button>
          </div>
        </div>
      </section>

      {/* Dashboard Preview / Trust Section */}
      <section className="py-12 border-t border-slate-100 bg-slate-50/50">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-sm font-medium text-slate-400 uppercase tracking-widest mb-8">Trusted by Municipalities</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60 grayscale items-center justify-items-center">
            <div className="text-xl font-bold tracking-tight">MPAJ</div>
            <div className="text-xl font-bold tracking-tight">SelangorGov</div>
            <div className="text-xl font-bold tracking-tight">JKR</div>
            <div className="text-xl font-bold tracking-tight">KPKT</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 md:mb-24">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4">Everything you need to manage city infrastructure.</h2>
            <p className="text-lg text-slate-500 max-w-2xl">BANDA+ replaces fragmented email threads and outdated spreadsheets with a cohesive, AI-powered system.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Feature 1 */}
            <div className="flex flex-col gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 mb-2">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">AI Damage Assessment</h3>
              <p className="text-slate-500 leading-relaxed">
                Upload a photo and our YOLOv8 pipeline instantly categorizes the issue (potholes, fallen trees, flooding) and assigns a severity score without human intervention.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 mb-2">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Spatial Clustering</h3>
              <p className="text-slate-500 leading-relaxed">
                Automatically group duplicate reports within a 500m radius into a single master ticket. Prevent contractor overlap and prioritize high-density clusters.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="flex flex-col gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 mb-2">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Automated Dispatch</h3>
              <p className="text-slate-500 leading-relaxed">
                Route verified issues directly to specialized contractors based on zones and workloads. Monitor repair status in real-time from the dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 md:py-32 bg-slate-50 border-y border-slate-100">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-6">Designed for velocity.</h2>
              <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                From the moment a citizen snaps a photo to the final contractor sign-off, BANDA+ minimizes friction at every step.
              </p>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-sm font-medium text-slate-900">1</div>
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">Report</h4>
                    <p className="text-sm text-slate-500 mt-1">Citizens submit location-tagged photos via the web portal.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-sm font-medium text-slate-900">2</div>
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">Analyze</h4>
                    <p className="text-sm text-slate-500 mt-1">AI models detect the damage type and calculate priority weight.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-sm font-medium text-slate-900">3</div>
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">Resolve</h4>
                    <p className="text-sm text-slate-500 mt-1">Contractors receive digital work orders, complete repairs, and upload proof.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Minimal UI Mockup */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-900"></div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="font-medium text-sm text-slate-900">Work Order #8492</div>
                <div className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-600">Pending</div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                <div className="h-32 bg-slate-50 rounded border border-slate-100 mt-4 flex items-center justify-center">
                  <MapPin className="text-slate-300 w-8 h-8" />
                </div>
                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <div className="h-8 bg-slate-900 rounded w-1/3"></div>
                  <div className="h-8 bg-slate-100 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-24 border-b border-slate-100">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="py-4">
              <div className="text-4xl font-semibold tracking-tight text-slate-900 mb-2">95%</div>
              <div className="text-sm font-medium text-slate-500">AI Accuracy</div>
            </div>
            <div className="py-4">
              <div className="text-4xl font-semibold tracking-tight text-slate-900 mb-2">&lt; 2m</div>
              <div className="text-sm font-medium text-slate-500">Average Triage Time</div>
            </div>
            <div className="py-4">
              <div className="text-4xl font-semibold tracking-tight text-slate-900 mb-2">5+</div>
              <div className="text-sm font-medium text-slate-500">Damage Models</div>
            </div>
            <div className="py-4">
              <div className="text-4xl font-semibold tracking-tight text-slate-900 mb-2">24/7</div>
              <div className="text-sm font-medium text-slate-500">Automated Intake</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-16 text-center">Built for scale.</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-xl border border-slate-200 bg-white">
              <div className="flex gap-1 mb-4 text-slate-900">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed">
                "BANDA+ eliminated our backlog. The AI clustering automatically groups duplicate complaints, saving our engineers hours of manual sorting every morning."
              </p>
              <div className="font-medium text-sm text-slate-900">Engineering Dept, MPAJ</div>
            </div>
            <div className="p-8 rounded-xl border border-slate-200 bg-white">
              <div className="flex gap-1 mb-4 text-slate-900">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed">
                "The contractor portal is incredibly straightforward. No more WhatsApp chains or lost PDFs. I log in, see my zone, fix the issue, and upload proof."
              </p>
              <div className="font-medium text-sm text-slate-900">Class F Contractor</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="p-6 bg-white border border-slate-200 rounded-lg">
              <h3 className="text-base font-semibold text-slate-900 mb-2">How does the AI determine priority?</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Our YOLO models assign a baseline severity score based on the damage type and visual severity. This is combined with spatial data (cluster density) to output a final priority rating.</p>
            </div>
            <div className="p-6 bg-white border border-slate-200 rounded-lg">
              <h3 className="text-base font-semibold text-slate-900 mb-2">Do citizens need to download an app?</h3>
              <p className="text-sm text-slate-500 leading-relaxed">No. BANDA+ uses a web-first approach. Citizens can submit reports instantly through any mobile browser without downloading or registering.</p>
            </div>
            <div className="p-6 bg-white border border-slate-200 rounded-lg">
              <h3 className="text-base font-semibold text-slate-900 mb-2">Is the platform secure?</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Yes. We use industry-standard encryption, token-based authentication, and strict role-based access control (RBAC) to separate Admin, Official, and Contractor data.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 mb-6">Ready to modernize your operations?</h2>
          <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto">Join the next generation of smart city infrastructure management.</p>
          <Button variant="primary" to="/register" className="h-12 px-8 text-base">
            Get Started <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold">B</span>
            <span className="font-medium text-slate-900 text-sm">BANDA+</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Documentation</a>
          </div>
          <div className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} BANDA+ Technologies.
          </div>
        </div>
      </footer>
    </div>
  );
}
