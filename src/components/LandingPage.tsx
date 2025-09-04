import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignInForm } from "../SignInForm";
import { EventCard } from "./EventCard";
import { EventsExplorer } from "./EventsExplorer";
import { SignInRequiredModal } from "./SignInRequiredModal";

interface LandingPageProps {
  onSwitchToParticipant: () => void;
}

export function LandingPage({ onSwitchToParticipant }: LandingPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showEventsExplorer, setShowEventsExplorer] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const events = useQuery(api.events.list, { category: selectedCategory || undefined });

  const categories = [
    { id: "", name: "All Events", icon: "🌟" },
    { id: "hackathon", name: "Hackathons", icon: "💻" },
    { id: "competition", name: "Competitions", icon: "🏆" },
    { id: "workshop", name: "Workshops", icon: "🛠️" },
    { id: "conference", name: "Conferences", icon: "🎤" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/20 to-electric-blue/20 rounded-full blur-3xl transform scale-150"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex justify-end mb-4">
            <button
              onClick={onSwitchToParticipant}
              className="px-4 py-2 border border-white/20 text-silver rounded-lg hover:bg-white/10 transition-colors text-sm"
            >
              Participant Portal
            </button>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-silver via-accent-blue to-electric-blue bg-clip-text text-transparent animate-pulse">
            Organizer Hub
          </h1>
          <p className="text-xl md:text-2xl text-silver/80 mb-8 leading-relaxed">
            Manage technical events, review participant registrations, and create extraordinary experiences
            that inspire the next generation of innovators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => setShowEventsExplorer(true)}
              className="px-8 py-4 bg-gradient-to-r from-accent-blue to-electric-blue text-silver font-bold rounded-lg hover:scale-105 transform transition-all duration-300 shadow-lg shadow-accent-blue/25 hover:shadow-accent-blue/40"
            >
              <span className="flex items-center gap-2">
                <span>🌟</span>
                Manage Events
              </span>
            </button>

            <button
              onClick={() => setShowSignInModal(true)}
              className="px-8 py-4 border-2 border-accent-blue text-silver font-bold rounded-lg hover:bg-accent-blue/20 transition-all duration-300 hover:shadow-lg hover:shadow-accent-blue/20"
            >
              <span className="flex items-center gap-2">
                <span>➕</span>
                Create Event
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: "Active Events", value: "150+", icon: "🚀" },
              { label: "Participants", value: "10K+", icon: "👥" },
              { label: "Success Rate", value: "98%", icon: "⭐" }
            ].map((stat, index) => (
              <div key={index} className="text-center p-8 rounded-2xl bg-dark-blue/50 backdrop-blur-md border border-medium-blue/30 hover:border-accent-blue/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent-blue/10">
                <div className="text-4xl mb-4">{stat.icon}</div>
                <div className="text-3xl font-bold text-accent-blue mb-2">{stat.value}</div>
                <div className="text-silver/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-silver to-accent-blue bg-clip-text text-transparent">
            Discover Stellar Events
          </h2>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-accent-blue to-electric-blue text-silver shadow-lg shadow-accent-blue/30"
                    : "bg-dark-blue/50 text-silver/70 hover:bg-dark-blue/70 hover:text-silver border border-medium-blue/30 hover:border-accent-blue/50"
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events?.slice(0, 6).map((event) => (
              <EventCard key={event._id} event={event} />
            )) || 
            // Placeholder cards while loading
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-dark-blue/30 backdrop-blur-md border border-medium-blue/20 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>

      {/* Sign In Section */}
      <section id="sign-in-section" className="py-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-silver mb-4">
              Join the Cosmic Community
            </h3>
            <p className="text-silver/70">
              Sign in to create events, register for competitions, and connect with stellar minds.
            </p>
          </div>
          <div className="bg-dark-blue/50 backdrop-blur-md border border-medium-blue/30 rounded-2xl p-8 shadow-lg shadow-charcoal/20">
            <SignInForm />
          </div>
        </div>
      </section>

      {/* Modals */}
      {showEventsExplorer && (
        <EventsExplorer onClose={() => setShowEventsExplorer(false)} />
      )}

      {showSignInModal && (
        <SignInRequiredModal
          onClose={() => setShowSignInModal(false)}
          action="create an event"
        />
      )}
    </div>
  );
}
