import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { Id as ConvexId } from "../../convex/_generated/dataModel";
import { CreateEventModal } from "./CreateEventModal";
import { EventExport } from "./EventExport";
import { EventSpecificRegistrationExport } from "./EventSpecificRegistrationExport";
import { JudgeAssignmentModal } from "./JudgeAssignmentModal";
import { EventAnalyticsModal } from "./EventAnalyticsModal";
import { EventTemplatesModal } from "./EventTemplatesModal";
import { AwardsManagementModal } from "./AwardsManagementModal";
import { AllEventsManagerModal } from "./AllEventsManagerModal";
import { NewsListManager } from "./NewsListManager";

interface OrganizerDashboardProps {
  profile: any;
  stats: any;
}

export function OrganizerDashboard({ profile, stats }: OrganizerDashboardProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEventExport, setShowEventExport] = useState(false);
  const [showEventSpecificExport, setShowEventSpecificExport] = useState(false);
  const [showJudgeAssignment, setShowJudgeAssignment] = useState(false);
  const [showEventAnalytics, setShowEventAnalytics] = useState(false);
  const [showEventTemplates, setShowEventTemplates] = useState(false);
  const [showAwardsManagement, setShowAwardsManagement] = useState(false);
  const [showAllEventsManager, setShowAllEventsManager] = useState(false);
  const [showNewsManager, setShowNewsManager] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{
    id: ConvexId<"events">;
    title: string;
    judges: ConvexId<"users">[];
  } | null>(null);

  const events = useQuery(api.events.list, {});
  const myEvents = events?.filter(event => event.organizerId === profile.userId) || [];
  const updateEventStatusMutation = useMutation(api.events.updateEventStatus);

  const handleStatusUpdate = async (eventId: ConvexId<"events">, status: "draft" | "published" | "ongoing" | "completed") => {
    try {
      // Get current user email from localStorage for authorization
      const storedUser = localStorage.getItem('currentUser');
      const userInfo = storedUser ? JSON.parse(storedUser) : null;

      if (!userInfo?.email) {
        toast.error("Please sign in to update event status");
        return;
      }

      await updateEventStatusMutation({
        eventId,
        status
      });
      toast.success(`Event status updated to ${status}! ✨`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update event status");
    }
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-starlight-white to-supernova-gold bg-clip-text text-transparent mb-2">
              Event Command Center 🎯
            </h1>
            <p className="text-starlight-white/70 text-sm sm:text-base lg:text-lg">
              Welcome back, {profile.firstName}! Ready to create stellar experiences?
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy font-bold rounded-lg hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-supernova-gold/25 flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation"
          >
            <span>➕</span> Create Event
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {[
            {
              label: "My Events",
              value: stats.myEvents,
              icon: "🌟",
              color: "from-supernova-gold to-plasma-orange",
              clickable: false
            },
            {
              label: "Total Events",
              value: events?.length || 0,
              icon: "🎪",
              color: "from-electric-blue to-neon-blue",
              clickable: true,
              onClick: () => setShowAllEventsManager(true)
            },
            {
              label: "Active Events",
              value: stats.activeEvents,
              icon: "🚀",
              color: "from-stellar-blue to-cosmic-purple",
              clickable: false
            },
            {
              label: "Total Registrations",
              value: stats.totalRegistrations,
              icon: "👥",
              color: "from-nebula-pink to-cosmic-purple",
              clickable: false
            },
            {
              label: "Draft Events",
              value: stats.draftEvents,
              icon: "📝",
              color: "from-plasma-orange to-supernova-gold",
              clickable: false
            }
          ].map((stat, index) => (
            <div
              key={index}
              className={`relative group ${stat.clickable ? 'cursor-pointer' : ''}`}
              onClick={stat.clickable ? stat.onClick : undefined}
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-20 rounded-xl sm:rounded-2xl blur group-hover:opacity-30 transition-opacity"></div>
              <div className={`relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 ${
                stat.clickable
                  ? 'hover:border-electric-blue/50 hover:scale-105 hover:shadow-lg hover:shadow-electric-blue/20'
                  : 'hover:border-supernova-gold/50'
              }`}>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="text-2xl sm:text-3xl">{stat.icon}</div>
                  {stat.clickable && (
                    <div className="text-electric-blue/60 group-hover:text-electric-blue transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-starlight-white mb-1">{stat.value}</div>
                <div className="text-starlight-white/70 text-xs sm:text-sm">{stat.label}</div>
                {stat.clickable && (
                  <div className="text-electric-blue/60 text-xs mt-2 group-hover:text-electric-blue transition-colors">
                    Click to manage all events
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions Cards */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-bold text-starlight-white mb-3 sm:mb-4 flex items-center gap-2">
            <span>🚀</span> Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div
              onClick={() => setShowCreateModal(true)}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-supernova-gold/50 transition-all duration-300 hover:scale-105 transform cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-supernova-gold to-plasma-orange rounded-xl flex items-center justify-center">
                  <span className="text-xl">➕</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-starlight-white">Create Event</h4>
                  <p className="text-starlight-white/70 text-sm">Launch a new stellar event</p>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy rounded-lg hover:opacity-90 transition-opacity text-sm font-bold">
                Create New Event
              </button>
            </div>

            <div
              onClick={() => setShowEventAnalytics(true)}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-stellar-blue/50 transition-all duration-300 hover:scale-105 transform cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-stellar-blue to-cosmic-purple rounded-xl flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-starlight-white">Event Analytics</h4>
                  <p className="text-starlight-white/70 text-sm">View performance metrics</p>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-stellar-blue hover:bg-stellar-blue/80 text-starlight-white rounded-lg transition-colors text-sm font-medium">
                View Analytics
              </button>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-nebula-pink/50 transition-all duration-300 hover:scale-105 transform">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-nebula-pink to-cosmic-purple rounded-xl flex items-center justify-center">
                  <span className="text-xl">👥</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-starlight-white">Event Registrations</h4>
                  <p className="text-starlight-white/70 text-sm">View & export event registrations</p>
                </div>
              </div>
              <div className="space-y-2">
                {myEvents.length > 0 ? (
                  <>
                    {myEvents.slice(0, 3).map((event) => (
                      <button 
                        key={event._id}
                        onClick={() => {
                          setSelectedEvent({
                            id: event._id,
                            title: event.title,
                            judges: event.judges || []
                          });
                          setShowEventSpecificExport(true);
                        }}
                        className="w-full px-4 py-3 bg-gradient-to-r from-nebula-pink/20 to-cosmic-purple/20 hover:from-nebula-pink/30 hover:to-cosmic-purple/30 text-starlight-white rounded-lg transition-all duration-300 text-sm font-medium flex items-center justify-between border border-nebula-pink/20 hover:border-nebula-pink/40"
                      >
                        <div className="flex items-center gap-2">
                          <span>📊</span>
                          <span className="truncate">{event.title}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-starlight-white/70">
                          <span>Export</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                    {myEvents.length > 3 && (
                      <button 
                        onClick={() => setShowAllEventsManager(true)}
                        className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-starlight-white/70 hover:text-starlight-white rounded-lg transition-colors text-sm font-medium"
                      >
                        + {myEvents.length - 3} more events
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-3xl mb-2">📝</div>
                    <p className="text-starlight-white/50 text-sm">No events created yet</p>
                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className="mt-2 px-3 py-1 bg-nebula-pink/20 text-nebula-pink rounded-lg text-xs hover:bg-nebula-pink/30 transition-colors"
                    >
                      Create First Event
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div
              onClick={() => {
                if (myEvents.length > 0) {
                  setSelectedEvent({
                    id: myEvents[0]._id,
                    title: myEvents[0].title,
                    judges: myEvents[0].judges || []
                  });
                  setShowJudgeAssignment(true);
                }
              }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-electric-blue/50 transition-all duration-300 hover:scale-105 transform cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-electric-blue to-neon-blue rounded-xl flex items-center justify-center">
                  <span className="text-xl">⚖️</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-starlight-white">Assign Judges</h4>
                  <p className="text-starlight-white/70 text-sm">Manage event judging</p>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-electric-blue hover:bg-electric-blue/80 text-starlight-white rounded-lg transition-colors text-sm font-medium">
                Assign Judges
              </button>
            </div>

            <div
              onClick={() => setShowEventTemplates(true)}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-plasma-orange/50 transition-all duration-300 hover:scale-105 transform cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-plasma-orange to-supernova-gold rounded-xl flex items-center justify-center">
                  <span className="text-xl">📋</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-starlight-white">Event Templates</h4>
                  <p className="text-starlight-white/70 text-sm">Use pre-built templates</p>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-plasma-orange hover:bg-plasma-orange/80 text-space-navy rounded-lg transition-colors text-sm font-medium">
                Browse Templates
              </button>
            </div>

            <div
              onClick={() => setShowAwardsManagement(true)}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-accent-blue/50 transition-all duration-300 hover:scale-105 transform cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-electric-blue rounded-xl flex items-center justify-center">
                  <span className="text-xl">🏆</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-starlight-white">Awards & Prizes</h4>
                  <p className="text-starlight-white/70 text-sm">Manage event rewards</p>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-accent-blue hover:bg-accent-blue/80 text-starlight-white rounded-lg transition-colors text-sm font-medium">
                Manage Awards
              </button>
            </div>

            <div
              onClick={() => setShowNewsManager(true)}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-supernova-gold/50 transition-all duration-300 hover:scale-105 transform cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-supernova-gold to-plasma-orange rounded-xl flex items-center justify-center">
                  <span className="text-xl">📰</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-starlight-white">News & Updates</h4>
                  <p className="text-starlight-white/70 text-sm">Create and manage news</p>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy rounded-lg hover:opacity-90 transition-opacity text-sm font-bold">
                Manage News
              </button>
            </div>
          </div>
        </div>

        {/* My Events */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-starlight-white mb-6 flex items-center gap-2">
            <span>🎪</span> My Events
          </h3>
          
          {myEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents.map((event) => (
                <div key={event._id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-supernova-gold/50 transition-all duration-300 group">
                  {event.eventImage && (
                    <div className="h-32 mb-4 overflow-hidden rounded-lg">
                      <img 
                        src={event.eventImage} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-bold text-starlight-white group-hover:text-supernova-gold transition-colors">
                      {event.title}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      event.status === 'published' ? 'bg-supernova-gold/30 text-supernova-gold' :
                      event.status === 'ongoing' ? 'bg-stellar-blue/30 text-stellar-blue' :
                      event.status === 'completed' ? 'bg-nebula-pink/30 text-nebula-pink' :
                      'bg-white/20 text-starlight-white/70'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  
                  <p className="text-starlight-white/70 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-starlight-white/60 text-sm">
                      <span>📅</span>
                      {new Date(event.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-starlight-white/60 text-sm">
                      <span>📍</span>
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-starlight-white/60 text-sm">
                      <span>👥</span>
                      0 / {event.maxParticipants} registered
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {event.status === 'draft' ? (
                      <button
                        onClick={() => void handleStatusUpdate(event._id, 'published')}
                        className="flex-1 px-3 py-2 bg-supernova-gold hover:bg-supernova-gold/80 text-space-navy rounded text-sm transition-colors font-bold"
                      >
                        🚀 Publish
                      </button>
                    ) : (
                      <button
                        onClick={() => void handleStatusUpdate(event._id, 'draft')}
                        className="flex-1 px-3 py-2 bg-medium-blue hover:bg-medium-blue/80 text-starlight-white rounded text-sm transition-colors"
                      >
                        📝 Unpublish
                      </button>
                    )}
                    <button className="flex-1 px-3 py-2 bg-stellar-blue hover:bg-stellar-blue/80 text-starlight-white rounded text-sm transition-colors">
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚀</div>
              <h4 className="text-xl font-bold text-starlight-white mb-2">No Events Yet</h4>
              <p className="text-starlight-white/70 mb-6">
                Ready to launch your first stellar event? The cosmos awaits!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy font-bold rounded-lg hover:scale-105 transform transition-all duration-300"
              >
                Create Your First Event
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateEventModal onClose={() => setShowCreateModal(false)} />
      )}

      {showEventExport && selectedEvent && (
        <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-blue/95 border border-medium-blue/30 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-medium-blue/30">
              <h2 className="text-xl font-bold text-silver">
                {selectedEvent.title} - Registrations
              </h2>
              <button
                onClick={() => {
                  setShowEventExport(false);
                  setSelectedEvent(null);
                }}
                className="text-silver/70 hover:text-silver p-1"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <EventExport eventId={selectedEvent.id} />
            </div>
          </div>
        </div>
      )}

      {showJudgeAssignment && selectedEvent && (
        <JudgeAssignmentModal
          eventId={selectedEvent.id}
          eventTitle={selectedEvent.title}
          currentJudges={selectedEvent.judges}
          onClose={() => {
            setShowJudgeAssignment(false);
            setSelectedEvent(null);
          }}
          onUpdate={() => {
            // Refresh events data - useQuery will automatically refetch
          }}
        />
      )}

      {showEventAnalytics && (
        <EventAnalyticsModal
          onClose={() => setShowEventAnalytics(false)}
          organizerId={profile.userId}
        />
      )}

      {showEventTemplates && (
        <EventTemplatesModal
          onClose={() => setShowEventTemplates(false)}
          onSelectTemplate={(template) => {
            // Handle template selection - could open create event modal with pre-filled data
            console.log("Selected template:", template);
          }}
        />
      )}

      {showAwardsManagement && (
        <AwardsManagementModal
          onClose={() => setShowAwardsManagement(false)}
          organizerId={profile.userId}
        />
      )}

      {showAllEventsManager && (
        <AllEventsManagerModal
          events={events || []}
          onClose={() => setShowAllEventsManager(false)}
          onStatusUpdate={(eventId, status) => void handleStatusUpdate(eventId, status)}
        />
      )}

      {showEventSpecificExport && selectedEvent && (
        <EventSpecificRegistrationExport
          eventId={selectedEvent.id}
          eventTitle={selectedEvent.title}
          onClose={() => {
            setShowEventSpecificExport(false);
            setSelectedEvent(null);
          }}
        />
      )}

      {showNewsManager && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-space-navy/95 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-starlight-white">News & Updates Management</h2>
                <button
                  onClick={() => setShowNewsManager(false)}
                  className="text-starlight-white/60 hover:text-starlight-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <NewsListManager
                authorEmail={profile.email || ""}
                authorName={`${profile.firstName} ${profile.lastName}`}
                isAdmin={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
