import { useState } from "react";
import { Link } from "react-router-dom";
import { EnhancedRegistrationModal } from "./EnhancedRegistrationModal";

interface EventCardProps {
  event: any;
  showRegisterButton?: boolean;
}

export function EventCard({ event, showRegisterButton = false }: EventCardProps) {
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);



  return (
    <>
      <div className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-supernova-gold/50 transition-all duration-300 hover:scale-105 transform">
        {/* Event Image */}
        <div className="h-48 bg-gradient-to-br from-cosmic-purple to-stellar-blue relative overflow-hidden">
          {event.eventImage ? (
            <img 
              src={event.eventImage} 
              alt={event.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-starlight-white rounded-full text-sm font-medium">
              {event.category}
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              event.status === 'published' ? 'bg-supernova-gold/30 text-supernova-gold' :
              event.status === 'ongoing' ? 'bg-stellar-blue/30 text-stellar-blue' :
              event.status === 'completed' ? 'bg-nebula-pink/30 text-nebula-pink' :
              'bg-white/20 text-starlight-white/70'
            }`}>
              {event.status}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold text-starlight-white mb-1 group-hover:text-supernova-gold transition-colors">
              {event.title}
            </h3>
            <p className="text-starlight-white/80 text-sm">
              by {event.organizer.name}
            </p>
          </div>
        </div>

        {/* Event Details */}
        <div className="p-6">
          <p className="text-starlight-white/70 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-starlight-white/60 text-sm">
              <span>📅</span>
              {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 text-starlight-white/60 text-sm">
              <span>📍</span>
              {event.location}
            </div>
            <div className="flex items-center gap-2 text-starlight-white/60 text-sm">
              <span>👥</span>
              Max {event.maxParticipants} participants
            </div>
            <div className="flex items-center gap-2 text-starlight-white/60 text-sm">
              <span>⏰</span>
              Register by {new Date(event.registrationDeadline).toLocaleDateString()}
            </div>
          </div>

          {/* Judge Information */}
          {event.judges && event.judges.length > 0 && (
            <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-supernova-gold">⚖️</span>
                <span className="text-starlight-white/80 text-sm font-medium">
                  Judges ({event.judges.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {event.judges.slice(0, 3).map((judge: { profile?: { firstName?: string }; name?: string }, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-2 py-1 bg-supernova-gold/20 rounded-full"
                  >
                    <div className="w-6 h-6 bg-supernova-gold rounded-full flex items-center justify-center text-xs font-bold text-space-navy">
                      {judge.profile?.firstName?.[0] || judge.name?.[0] || "J"}
                    </div>
                    <span className="text-starlight-white/80 text-xs">
                      {judge.profile?.firstName || judge.name || "Judge"}
                    </span>
                  </div>
                ))}
                {event.judges.length > 3 && (
                  <span className="text-starlight-white/60 text-xs px-2 py-1">
                    +{event.judges.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {event.tags.slice(0, 3).map((tag: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-cosmic-purple/30 text-starlight-white rounded text-xs">
                  {tag}
                </span>
              ))}
              {event.tags.length > 3 && (
                <span className="px-2 py-1 bg-white/20 text-starlight-white/70 rounded text-xs">
                  +{event.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Prizes */}
          {event.prizes && event.prizes.length > 0 && (
            <div className="mb-4">
              <div className="text-starlight-white/80 text-sm font-medium mb-2">🏆 Prizes:</div>
              <div className="space-y-1">
                {event.prizes.slice(0, 2).map((prize: any, index: number) => (
                  <div key={index} className="text-starlight-white/60 text-xs">
                    {prize.position}: {prize.prize}
                    {prize.amount && ` ($${prize.amount})`}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {(event.status === 'published' || event.status === 'ongoing') && (
              <Link
                to={`/events/${event._id}`}
                className="flex-1 px-4 py-2 bg-stellar-blue hover:bg-stellar-blue/80 text-starlight-white rounded-lg transition-colors text-sm font-medium text-center"
              >
                Visit
              </Link>
            )}
            {showRegisterButton && event.status === 'published' && (
              <button
                onClick={() => setShowRegistrationModal(true)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy rounded-lg hover:scale-105 transform transition-all duration-300 text-sm font-bold"
              >
                Register
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Registration Modal */}
      {showRegistrationModal && (
        <EnhancedRegistrationModal
          event={event}
          onClose={() => setShowRegistrationModal(false)}
        />
      )}
    </>
  );
}
