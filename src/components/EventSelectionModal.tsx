import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface EventSelectionModalProps {
  onClose: () => void;
  onEventSelect: (eventId: Id<"events">) => void;
}

export function EventSelectionModal({ onClose, onEventSelect }: EventSelectionModalProps) {
  const events = useQuery(api.events.list, { status: "published" });

  const handleEventSelect = (eventId: Id<"events">) => {
    onEventSelect(eventId);
  };

  return (
    <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-xl sm:rounded-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-medium-blue/30">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-silver mb-1 sm:mb-2 truncate">
              🎯 Select an Event to Register
            </h2>
            <p className="text-silver/70 text-sm sm:text-base">
              Choose the event you want to participate in from the available options below
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-medium-blue/30 rounded-lg transition-colors text-silver/70 hover:text-silver touch-manipulation ml-2"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Events Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh]">
          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {events.map((event) => (
                <div
                  key={event._id}
                  onClick={() => handleEventSelect(event._id)}
                  className="relative p-4 sm:p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 border-medium-blue/40 bg-dark-blue/40 hover:border-accent-blue/60 hover:bg-accent-blue/10"
                >
                  {/* Register Button Indicator */}
                  <div className="absolute top-2 right-2 px-3 py-1 bg-supernova-gold text-space-navy rounded-full text-xs font-bold">
                    Register
                  </div>

                  {/* Event Image */}
                  {event.eventImage && (
                    <div className="h-32 sm:h-40 mb-4 overflow-hidden rounded-lg">
                      <img 
                        src={event.eventImage} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Event Details */}
                  <div className="space-y-3">
                    <h3 className="text-lg sm:text-xl font-bold text-silver line-clamp-2">
                      {event.title}
                    </h3>
                    
                    <p className="text-silver/80 text-sm line-clamp-3">
                      {event.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-silver/70">
                        <span>📅</span>
                        <span>{new Date(event.startDate).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-silver/70">
                        <span>📍</span>
                        <span className="truncate">{event.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-silver/70">
                        <span>💰</span>
                        <span>₹{event.registrationFee || 0}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-silver/70">
                        <span>👥</span>
                        <span>Max {event.maxParticipants} participants</span>
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-accent-blue/20 text-accent-blue rounded-full text-xs font-medium">
                        {event.category}
                      </span>
                      
                      {/* Registration Deadline */}
                      <span className="text-xs text-silver/60">
                        Deadline: {new Date(event.registrationDeadline).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Tags */}
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {event.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-medium-blue/20 text-silver/70 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {event.tags.length > 3 && (
                          <span className="px-2 py-1 bg-medium-blue/20 text-silver/70 rounded text-xs">
                            +{event.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-silver mb-4">No Events Available</h3>
              <p className="text-silver/70 max-w-md mx-auto">
                There are currently no published events available for registration. Please check back later!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-center p-4 sm:p-6 border-t border-medium-blue/30">
          <button
            onClick={onClose}
            className="px-8 py-3 border border-medium-blue/40 text-silver rounded-xl hover:bg-medium-blue/20 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}