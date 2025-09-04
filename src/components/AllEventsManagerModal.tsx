import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { EventSpecificRegistrationExport } from "./EventSpecificRegistrationExport";

interface AllEventsManagerModalProps {
  events: any[];
  onClose: () => void;
  onStatusUpdate: (eventId: Id<"events">, status: "draft" | "published" | "ongoing" | "completed") => void;
}

export function AllEventsManagerModal({ events, onClose, onStatusUpdate }: AllEventsManagerModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "name" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showEventSpecificExport, setShowEventSpecificExport] = useState(false);
  const [selectedEventForExport, setSelectedEventForExport] = useState<{id: Id<"events">, title: string} | null>(null);

  // Get organizer credentials to show organizer names
  // Temporarily disabled until function is deployed
  const organizerCredentials: any[] = [];

  // Filter and sort events
  const filteredEvents = events
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || event.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "name":
          comparison = a.title.localeCompare(b.title);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "date":
        default:
          comparison = new Date(a._creationTime).getTime() - new Date(b._creationTime).getTime();
          break;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const getOrganizerName = (organizerId: Id<"users">) => {
    if (!organizerCredentials) return "Loading...";
    const organizer = organizerCredentials.find(cred => cred.linkedUserId === organizerId);
    return organizer ? `${organizer.firstName} ${organizer.lastName}` : "Unknown Organizer";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "text-supernova-gold bg-supernova-gold/20";
      case "ongoing": return "text-stellar-blue bg-stellar-blue/20";
      case "completed": return "text-nebula-pink bg-nebula-pink/20";
      case "draft": return "text-starlight-white/70 bg-white/10";
      default: return "text-starlight-white/70 bg-white/10";
    }
  };

  const handleStatusChange = (eventId: Id<"events">, newStatus: "draft" | "published" | "ongoing" | "completed") => {
    try {
      onStatusUpdate(eventId, newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-space-navy/95 backdrop-blur-md border border-medium-blue/30 rounded-xl sm:rounded-2xl w-full max-w-7xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-medium-blue/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-2xl font-bold text-starlight-white flex items-center gap-2">
              <span>🎪</span>
              <span className="hidden sm:inline">All Events Manager</span>
              <span className="sm:hidden">Events</span>
            </h2>
            <button
              onClick={onClose}
              className="text-starlight-white/60 hover:text-starlight-white text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          {/* Filters and Search */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-starlight-white/70 text-sm mb-2">Search Events</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or description..."
                className="w-full px-3 py-2 bg-dark-blue/40 border border-medium-blue/30 rounded text-starlight-white placeholder-starlight-white/40 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-starlight-white/70 text-sm mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-dark-blue/40 border border-medium-blue/30 rounded text-starlight-white focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-starlight-white/70 text-sm mb-2">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "name" | "status")}
                className="w-full px-3 py-2 bg-dark-blue/40 border border-medium-blue/30 rounded text-starlight-white focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none"
              >
                <option value="date">Creation Date</option>
                <option value="name">Event Name</option>
                <option value="status">Status</option>
              </select>
            </div>

            <div>
              <label className="block text-starlight-white/70 text-sm mb-2">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="w-full px-3 py-2 bg-dark-blue/40 border border-medium-blue/30 rounded text-starlight-white focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="overflow-auto max-h-[60vh]">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl sm:text-6xl mb-4">🔍</div>
              <h3 className="text-lg sm:text-xl font-bold text-starlight-white mb-2">No Events Found</h3>
              <p className="text-starlight-white/70 text-sm sm:text-base">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search criteria."
                  : "No events have been created yet."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark-blue/40 border-b border-medium-blue/30">
                    <tr>
                      <th className="text-left p-4 text-starlight-white font-medium">Event Name</th>
                      <th className="text-left p-4 text-starlight-white font-medium">Status</th>
                      <th className="text-left p-4 text-starlight-white font-medium">Organizer</th>
                      <th className="text-left p-4 text-starlight-white font-medium">Created</th>
                      <th className="text-left p-4 text-starlight-white font-medium">Fee</th>
                      <th className="text-left p-4 text-starlight-white font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((event, index) => (
                      <tr key={event._id} className={`border-b border-medium-blue/20 hover:bg-white/5 transition-colors ${
                        index % 2 === 0 ? 'bg-dark-blue/20' : 'bg-transparent'
                      }`}>
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-starlight-white">{event.title}</div>
                            <div className="text-sm text-starlight-white/60 truncate max-w-xs">
                              {event.description}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {event.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-starlight-white/80">
                          {getOrganizerName(event.organizerId)}
                        </td>
                        <td className="p-4 text-starlight-white/60 text-sm">
                          {new Date(event._creationTime).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-starlight-white/80">
                          ₹{event.registrationFee || 0}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 items-center">
                            <select
                              value={event.status}
                              onChange={(e) => handleStatusChange(event._id, e.target.value as any)}
                              className="px-2 py-1 bg-dark-blue/40 border border-medium-blue/30 rounded text-starlight-white text-xs focus:border-supernova-gold outline-none"
                            >
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                              <option value="ongoing">Ongoing</option>
                              <option value="completed">Completed</option>
                            </select>
                            <button
                              onClick={() => {
                                setSelectedEventForExport({
                                  id: event._id,
                                  title: event.title
                                });
                                setShowEventSpecificExport(true);
                              }}
                              className="px-2 py-1 bg-gradient-to-r from-nebula-pink to-cosmic-purple hover:from-nebula-pink/80 hover:to-cosmic-purple/80 text-starlight-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                              title="Export Registrations"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Export
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4 p-4">
                {filteredEvents.map((event) => (
                  <div key={event._id} className="bg-dark-blue/40 border border-medium-blue/30 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-starlight-white text-lg mb-1">{event.title}</h3>
                        <p className="text-sm text-starlight-white/60 line-clamp-2">{event.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ml-3 ${getStatusColor(event.status)}`}>
                        {event.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-starlight-white/60">Organizer:</span>
                        <div className="text-starlight-white/80">{getOrganizerName(event.organizerId)}</div>
                      </div>
                      <div>
                        <span className="text-starlight-white/60">Fee:</span>
                        <div className="text-starlight-white/80">₹{event.registrationFee || 0}</div>
                      </div>
                      <div>
                        <span className="text-starlight-white/60">Created:</span>
                        <div className="text-starlight-white/60">{new Date(event._creationTime).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-starlight-white/60">Status:</span>
                        <select
                          value={event.status}
                          onChange={(e) => handleStatusChange(event._id, e.target.value as any)}
                          className="w-full mt-1 px-2 py-1 bg-dark-blue/40 border border-medium-blue/30 rounded text-starlight-white text-xs focus:border-supernova-gold outline-none"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedEventForExport({
                            id: event._id,
                            title: event.title
                          });
                          setShowEventSpecificExport(true);
                        }}
                        className="px-3 py-2 bg-gradient-to-r from-nebula-pink to-cosmic-purple hover:from-nebula-pink/80 hover:to-cosmic-purple/80 text-starlight-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export Registrations
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-medium-blue/30 bg-dark-blue/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-starlight-white/70">
            <span>Total Events: {filteredEvents.length}</span>
            <span>Showing {filteredEvents.length} of {events.length} events</span>
          </div>
        </div>
      </div>

      {/* Event Specific Export Modal */}
      {showEventSpecificExport && selectedEventForExport && (
        <EventSpecificRegistrationExport
          eventId={selectedEventForExport.id}
          eventTitle={selectedEventForExport.title}
          onClose={() => {
            setShowEventSpecificExport(false);
            setSelectedEventForExport(null);
          }}
        />
      )}
    </div>
  );
}
