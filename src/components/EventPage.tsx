import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { SimpleVideoBackground } from "./SimpleVideoBackground";

export function EventPage() {
  const { eventId } = useParams<{ eventId: Id<"events"> }>();
  const navigate = useNavigate();

  const event = useQuery(api.events.getById, {
    id: eventId!,
  });

  if (!event) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <SimpleVideoBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-supernova-gold mx-auto mb-4"></div>
            <p className="text-starlight-white text-lg">Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Only show published and ongoing events
  if (event.status !== 'published' && event.status !== 'ongoing') {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <SimpleVideoBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-starlight-white mb-4">Event Not Available</h1>
            <p className="text-starlight-white/70 mb-8">This event is not currently available for viewing.</p>
            <button
              onClick={() => void navigate(-1)}
              className="px-6 py-3 bg-stellar-blue hover:bg-stellar-blue/80 text-starlight-white rounded-lg transition-colors"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => void navigate(-1)}
          className="mb-6 flex items-center gap-2 text-starlight-white/70 hover:text-starlight-white transition-colors"
        >
          <span>←</span>
          Back to Events
        </button>

          {/* Event Hero Section */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden mb-8">
            {/* Event Banner */}
            <div className="h-64 md:h-80 bg-gradient-to-br from-cosmic-purple via-stellar-blue to-nebula-pink relative overflow-hidden">
              {event.eventImage ? (
                <img 
                  src={event.eventImage} 
                  alt={event.title} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : event.bannerImage ? (
                <img 
                  src={event.bannerImage} 
                  alt={event.title} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="absolute top-6 left-6">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-starlight-white rounded-full text-sm font-medium">
                  {event.category}
                </span>
              </div>
              <div className="absolute top-6 right-6">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  event.status === 'published' ? 'bg-supernova-gold/30 text-supernova-gold' :
                  event.status === 'ongoing' ? 'bg-stellar-blue/30 text-stellar-blue' :
                  'bg-white/20 text-starlight-white/70'
                }`}>
                  {event.status.toUpperCase()}
                </span>
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-4xl md:text-5xl font-bold text-starlight-white mb-2">
                  {event.title}
                </h1>
                <p className="text-starlight-white/80 text-lg">
                  Organized by {event.organizer?.name || 'Unknown Organizer'}
                </p>
              </div>
            </div>

            {/* Event Content */}
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">
                  {/* Description */}
                  <div>
                    <h2 className="text-2xl font-bold text-starlight-white mb-4">About This Event</h2>
                    <p className="text-starlight-white/70 leading-relaxed whitespace-pre-wrap">
                      {event.description}
                    </p>
                  </div>

                  {/* Requirements */}
                  {event.requirements && event.requirements.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold text-starlight-white mb-4">Requirements</h2>
                      <ul className="space-y-2">
                        {event.requirements.map((req: string, index: number) => (
                          <li key={index} className="flex items-start gap-3 text-starlight-white/70">
                            <span className="text-supernova-gold mt-1">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Prizes */}
                  {event.prizes && event.prizes.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold text-starlight-white mb-4">🏆 Prizes & Awards</h2>
                      <div className="grid gap-4">
                        {event.prizes.map((prize: any, index: number) => (
                          <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-supernova-gold font-semibold">{prize.position}</span>
                              {prize.amount && (
                                <span className="text-starlight-white font-bold">{prize.amount}</span>
                              )}
                            </div>
                            <p className="text-starlight-white/70 mt-1">Rupees {prize.prize}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Judges */}
                  {event.judges && event.judges.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold text-starlight-white mb-4">⚖️ Judges</h2>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {event.judges.map((judge: any, index: number) => (
                          <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-supernova-gold rounded-full flex items-center justify-center text-lg font-bold text-space-navy">
                                {judge.profile?.firstName?.[0] || judge.name?.[0] || "J"}
                              </div>
                              <div>
                                <h3 className="text-starlight-white font-semibold">
                                  {judge.profile?.firstName && judge.profile?.lastName 
                                    ? `${judge.profile.firstName} ${judge.profile.lastName}`
                                    : judge.name || "Judge"}
                                </h3>
                                {judge.profile?.organization && (
                                  <p className="text-starlight-white/60 text-sm">{judge.profile.organization}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Event Details Card */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-starlight-white mb-4">Event Details</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 text-starlight-white/60 text-sm mb-1">
                          <span>📅</span>
                          <span>Event Duration</span>
                        </div>
                        <p className="text-starlight-white">
                          {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 text-starlight-white/60 text-sm mb-1">
                          <span>📍</span>
                          <span>Location</span>
                        </div>
                        <p className="text-starlight-white">{event.location}</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 text-starlight-white/60 text-sm mb-1">
                          <span>👥</span>
                          <span>Max Participants</span>
                        </div>
                        <p className="text-starlight-white">{event.maxParticipants}</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 text-starlight-white/60 text-sm mb-1">
                          <span>⏰</span>
                          <span>Registration Deadline</span>
                        </div>
                        <p className="text-starlight-white">
                          {new Date(event.registrationDeadline).toLocaleDateString()}
                        </p>
                      </div>

                      {event.registrationFee && (
                        <div>
                          <div className="flex items-center gap-2 text-starlight-white/60 text-sm mb-1">
                            <span>💰</span>
                            <span>Registration Fee</span>
                          </div>
                          <p className="text-starlight-white">Rupees {event.registrationFee}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {event.tags && event.tags.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-starlight-white mb-4">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-cosmic-purple/30 text-starlight-white rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}



                  {event.status === 'ongoing' && (
                    <div className="bg-stellar-blue/20 border border-stellar-blue/30 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-starlight-white mb-2">Event in Progress</h3>
                      <p className="text-starlight-white/70 text-sm">
                        This event is currently ongoing. Registration may be closed.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
