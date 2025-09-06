import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ParticipantTestPage } from "./ParticipantTestPage";
import { EventCard } from "./EventCard";
import { EventSelectionModal } from "./EventSelectionModal";
import { EventSpecificRegistrationForm } from "./EventSpecificRegistrationForm";
import { NewsUpdatesSection } from "./NewsUpdatesSection";
import { Id } from "../../convex/_generated/dataModel";

interface ParticipantLandingPageProps {
  onSwitchToOrganizer: () => void;
}

export function ParticipantLandingPage({ onSwitchToOrganizer }: ParticipantLandingPageProps) {
  const [showEventSelection, setShowEventSelection] = useState(false);
  const [showSpecificRegistration, setShowSpecificRegistration] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<Id<"events"> | null>(null);
  const [showPreQualifierTests, setShowPreQualifierTests] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const events = useQuery(api.events.list, {});
  const publishedEvents = events?.filter(event => event.status === "published") || [];
  const allEvents = events || [];
  const testNotification = useQuery(api.preQualifierTests.getUpcomingTestsNotification);
  const participatingInstitutions = useQuery(api.participatingInstitutions.getActiveInstitutions);
  const activeSponsors = useQuery(api.participatingInstitutions.getActiveSponsors);


  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Content Container - Background is handled by App.tsx */}
      <div className="relative z-10">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-space-navy/70 backdrop-blur-xl border-b border-white/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-supernova-gold to-plasma-orange rounded-full flex items-center justify-center">
                <span className="text-space-navy font-bold text-sm sm:text-lg">🚀</span>
              </div>
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-starlight-white">
                Tech Fest
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-4">
              <button
                onClick={() => window.open('https://erp.mgmu.ac.in/asd_EventPublicUserMaster.htm?eventID=152', '_blank', 'noopener,noreferrer')}
                className="px-3 xl:px-6 py-2 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy font-bold rounded-lg hover:scale-105 transform transition-all duration-300 shadow-lg backdrop-blur-sm text-sm xl:text-base"
              >
                Register Now
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowPreQualifierTests(true)}
                  className="px-3 xl:px-6 py-2 bg-gradient-to-r from-accent-blue to-electric-blue text-starlight-white font-bold rounded-lg hover:scale-105 transform transition-all duration-300 flex items-center gap-2 shadow-lg backdrop-blur-sm text-sm xl:text-base"
                >
                  <span>🎯</span>
                  <span className="hidden xl:inline">Pre-Qualifier Tests</span>
                  <span className="xl:hidden">Tests</span>
                </button>

                {/* Test notification badge */}
                {testNotification && (testNotification.hasActiveTests || testNotification.hasUpcomingTests) && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {(testNotification.activeTestsCount || 0) + (testNotification.upcomingTestsCount || 0)}
                    </span>
                  </div>
                )}
              </div>


              <button
                onClick={onSwitchToOrganizer}
                className="px-3 xl:px-4 py-2 border border-white/30 text-starlight-white rounded-lg hover:bg-white/10 transition-colors text-xs xl:text-sm backdrop-blur-sm bg-space-navy/20"
              >
                Organizer Login
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-starlight-white hover:bg-white/10 rounded-lg transition-colors touch-manipulation"
                aria-label="Toggle mobile menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-white/20 bg-space-navy/90 backdrop-blur-xl">
              <div className="px-4 py-4 space-y-3">
                <button
                  onClick={() => {
                    window.open('https://erp.mgmu.ac.in/asd_EventPublicUserMaster.htm?eventID=152', '_blank', 'noopener,noreferrer');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy font-bold rounded-lg text-center touch-manipulation"
                >
                  🚀 Register Now
                </button>

                <div className="relative">
                  <button
                    onClick={() => {
                      setShowPreQualifierTests(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-accent-blue to-electric-blue text-starlight-white font-bold rounded-lg text-center touch-manipulation"
                  >
                    🎯 Pre-Qualifier Tests
                  </button>

                  {/* Test notification badge for mobile */}
                  {testNotification && (testNotification.hasActiveTests || testNotification.hasUpcomingTests) && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {(testNotification.activeTestsCount || 0) + (testNotification.upcomingTestsCount || 0)}
                      </span>
                    </div>
                  )}
                </div>


                <button
                  onClick={() => {
                    onSwitchToOrganizer();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 border border-white/30 text-starlight-white rounded-lg text-center backdrop-blur-sm bg-space-navy/20 touch-manipulation"
                >
                  Organizer Login
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-6 sm:mb-8 relative">
            {/* Enhanced text backdrop for better readability over 3D background */}
            <div className="absolute inset-0 bg-space-navy/30 backdrop-blur-md rounded-2xl sm:rounded-3xl -m-4 sm:-m-8 border border-white/10"></div>
            <div className="relative z-10 p-4 sm:p-6 lg:p-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-starlight-white mb-4 sm:mb-6 leading-tight drop-shadow-2xl">
                <span className="block bg-gradient-to-r from-supernova-gold via-electric-blue to-nebula-pink bg-clip-text text-transparent drop-shadow-lg">
                  SuperNova
                </span>
                <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-starlight-white/90 mt-1 sm:mt-2">
                  Technical Fest
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-starlight-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-xl px-2 sm:px-0">
                Connect with brilliant minds, build innovative solutions, and compete for amazing prizes in the most exciting technical fest of the year!
              </p>
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-8 sm:mb-12 px-2 sm:px-0">
              <button
                onClick={() => window.open('https://erp.mgmu.ac.in/asd_EventPublicUserMaster.htm?eventID=152', '_blank', 'noopener,noreferrer')}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy font-bold rounded-xl text-base sm:text-lg hover:scale-105 transform transition-all duration-300 shadow-xl shadow-supernova-gold/40 backdrop-blur-md border border-white/20 min-h-[48px] touch-manipulation"
              >
                🚀 Register for Technical Fest
              </button>
              <button
                onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-electric-blue text-electric-blue font-bold rounded-xl text-base sm:text-lg hover:bg-electric-blue hover:text-space-navy transition-all duration-300 backdrop-blur-md bg-space-navy/20 min-h-[48px] touch-manipulation"
              >
                🎯 View Events
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto px-4 sm:px-0">
            <div className="text-center bg-space-navy/20 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-supernova-gold mb-2">5000+</div>
              <div className="text-sm sm:text-base text-starlight-white/70">Participants</div>
            </div>
            <div className="text-center bg-space-navy/20 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-electric-blue mb-2">₹50K+</div>
              <div className="text-sm sm:text-base text-starlight-white/70">Prize Pool</div>
            </div>
            <div className="text-center bg-space-navy/20 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-nebula-pink mb-2">48hrs</div>
              <div className="text-sm sm:text-base text-starlight-white/70">Coding Marathon</div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-space-navy/10 backdrop-blur-sm"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-starlight-white mb-8 sm:mb-12 drop-shadow-lg">
            🎯 Upcoming Events
          </h2>
          
          {publishedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {publishedEvents.map((event) => (
                <EventCard key={event._id} event={event} showRegisterButton={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              {/* Animated Icon */}
              <div className="relative mb-8">
                <div className="text-8xl animate-bounce">🚀</div>
                <div className="absolute -top-2 -right-2 text-2xl animate-pulse">✨</div>
                <div className="absolute -bottom-2 -left-2 text-2xl animate-ping">🎯</div>
              </div>

              <h3 className="text-3xl font-bold text-starlight-white mb-4 bg-gradient-to-r from-supernova-gold to-plasma-orange bg-clip-text text-transparent">
                Exciting Events Coming Soon!
              </h3>

              <p className="text-starlight-white/80 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
                {allEvents.length > 0
                  ? `🔥 We have ${allEvents.length} amazing event(s) in preparation! Our organizers are working around the clock to bring you the best technical competitions and learning experiences.`
                  : "🌟 Get ready for incredible technical events, coding competitions, and innovation challenges that will push your skills to the next level!"
                }
              </p>

              {allEvents.length > 0 && (
                <div className="mb-8 p-6 bg-gradient-to-br from-stellar-blue/10 via-cosmic-purple/10 to-nebula-pink/10 rounded-2xl backdrop-blur-sm border border-stellar-blue/20 max-w-4xl mx-auto">
                  <h4 className="text-xl font-bold text-starlight-white mb-4 flex items-center justify-center gap-2">
                    <span>📋</span>
                    <span>Events in Development</span>
                    <span className="px-2 py-1 bg-supernova-gold/20 text-supernova-gold rounded-full text-sm">
                      {allEvents.length}
                    </span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allEvents.map((event) => (
                      <div key={event._id} className="p-4 bg-space-navy/50 rounded-xl border border-stellar-blue/20 hover:border-supernova-gold/30 transition-colors">
                        {event.eventImage && (
                          <div className="h-24 mb-2 overflow-hidden rounded-lg">
                            <img 
                              src={event.eventImage} 
                              alt={event.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="text-starlight-white font-medium text-sm line-clamp-2 flex-1">{event.title}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${
                            event.status === 'published' ? 'bg-supernova-gold/20 text-supernova-gold' :
                            event.status === 'draft' ? 'bg-medium-blue/20 text-starlight-white/70' :
                            'bg-white/10 text-starlight-white/60'
                        }`}>
                          {event.status}
                        </span>
                        </div>
                        <div className="text-starlight-white/60 text-xs mt-1">
                          📅 {new Date(event.startDate).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric'
                          })}
                        </div>
                        <div className="text-starlight-white/60 text-xs">
                          💰 ₹{event.registrationFee || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => window.open('https://erp.mgmu.ac.in/asd_EventPublicUserMaster.htm?eventID=152', '_blank', 'noopener,noreferrer')}
                  className="px-8 py-3 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy font-bold rounded-xl hover:scale-105 transform transition-all duration-300 shadow-xl shadow-supernova-gold/30"
                >
                  🚀 Register Now
                </button>
                <button
                  onClick={() => setShowPreQualifierTests(true)}
                  className="px-8 py-3 border-2 border-electric-blue text-electric-blue font-bold rounded-xl hover:bg-electric-blue hover:text-space-navy transition-all duration-300"
                >
                  🎯 Take Pre-Qualifier Tests
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* College Promotions */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-starlight-white mb-8 sm:mb-12">
            🎓 Participating Colleges & Universities
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {participatingInstitutions?.filter(inst => inst.type !== 'company').map((institution) => (
              <div key={institution._id} className="p-4 sm:p-6 bg-dark-blue/40 backdrop-blur-md border border-medium-blue/30 rounded-xl hover:border-accent-blue/40 hover:shadow-xl transition-all duration-300">
                <div className="text-center">
                  {institution.logo ? (
                    <img 
                      src={institution.logo} 
                      alt={institution.name}
                      className="w-16 h-16 mx-auto mb-3 sm:mb-4 rounded-full object-cover"
                    />
                  ) : (
                    <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🎓</div>
                  )}
                  <h3 className="text-lg sm:text-xl font-bold text-starlight-white mb-2">{institution.name}</h3>
                  <p className="text-sm sm:text-base text-supernova-gold font-semibold">{institution.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-starlight-white mb-8 sm:mb-12">
            🏆 Our Sponsors
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {activeSponsors?.map((sponsor) => (
              <div key={sponsor._id} className="p-4 sm:p-6 bg-dark-blue/40 backdrop-blur-md border border-medium-blue/30 rounded-xl hover:border-accent-blue/40 hover:shadow-xl transition-all duration-300">
                <div className="text-center">
                  {sponsor.logo ? (
                    <img 
                      src={sponsor.logo} 
                      alt={sponsor.name}
                      className="w-16 h-16 mx-auto mb-3 sm:mb-4 rounded-full object-cover"
                    />
                  ) : (
                    <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🏆</div>
                  )}
                  <h3 className="text-lg sm:text-xl font-bold text-starlight-white mb-2">{sponsor.name}</h3>
                  <p className="text-sm sm:text-base text-supernova-gold font-semibold">{sponsor.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News & Updates Section */}
      <NewsUpdatesSection />

      {/* Why Participate Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-starlight-white mb-12">
            🌟 Why Participate?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "🏆", title: "Win Prizes", desc: "Compete for cash prizes, internships, and job opportunities" },
              { icon: "🤝", title: "Network", desc: "Connect with like-minded developers and industry experts" },
              { icon: "📚", title: "Learn", desc: "Gain hands-on experience with cutting-edge technologies" },
              { icon: "🚀", title: "Build", desc: "Create innovative solutions to real-world problems" }
            ].map((benefit, index) => (
              <div key={index} className="text-center p-6 bg-dark-blue/40 backdrop-blur-md border border-medium-blue/30 rounded-xl hover:border-accent-blue/40 transition-all duration-300">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-starlight-white mb-2">{benefit.title}</h3>
                <p className="text-starlight-white/70 text-sm">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/20 bg-space-navy/20 backdrop-blur-md relative">
        <div className="absolute inset-0 bg-gradient-to-t from-space-navy/40 to-transparent"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-supernova-gold to-plasma-orange rounded-full flex items-center justify-center">
              <span className="text-space-navy font-bold text-lg">🚀</span>
            </div>
            <span className="text-2xl font-bold text-starlight-white">Technical Fest</span>
          </div>
          <p className="text-starlight-white/60 mb-4">
            Empowering the next generation of innovators through competitive coding.
          </p>
          <div className="flex justify-center gap-6">
            <button
              onClick={() => window.open('https://erp.mgmu.ac.in/asd_EventPublicUserMaster.htm?eventID=152', '_blank', 'noopener,noreferrer')}
              className="px-6 py-2 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy font-bold rounded-lg hover:scale-105 transform transition-all duration-300"
            >
              Register Now
            </button>

            <div className="relative">
              <button
                onClick={() => setShowPreQualifierTests(true)}
                className="px-6 py-2 bg-gradient-to-r from-accent-blue to-electric-blue text-starlight-white font-bold rounded-lg hover:scale-105 transform transition-all duration-300 flex items-center gap-2"
              >
                <span>🎯</span>
                Pre-Qualifier Tests
              </button>

              {/* Test notification badge */}
              {testNotification && (testNotification.hasActiveTests || testNotification.hasUpcomingTests) && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {(testNotification.activeTestsCount || 0) + (testNotification.upcomingTestsCount || 0)}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={onSwitchToOrganizer}
              className="px-6 py-2 border border-white/20 text-starlight-white rounded-lg hover:bg-white/10 transition-colors"
            >
              Organizer Portal
            </button>
          </div>
        </div>
      </footer>

      {/* Event Selection Modal */}
      {showEventSelection && (
        <EventSelectionModal
          onClose={() => setShowEventSelection(false)}
          onEventSelect={(eventId) => {
            setSelectedEventId(eventId);
            setShowEventSelection(false);
            setShowSpecificRegistration(true);
          }}
        />
      )}

      {/* Event-Specific Registration Form */}
      {showSpecificRegistration && selectedEventId && (
        <EventSpecificRegistrationForm
          eventId={selectedEventId}
          onClose={() => {
            setShowSpecificRegistration(false);
            setSelectedEventId(null);
          }}
          onBack={() => {
            setShowSpecificRegistration(false);
            setShowEventSelection(true);
          }}
        />
      )}

      {/* Pre-Qualifier Tests Modal */}
      {showPreQualifierTests && (
        <ParticipantTestPage onClose={() => setShowPreQualifierTests(false)} />
      )}
      </div>
    </div>
  );
}
