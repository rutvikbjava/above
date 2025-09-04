import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { ParticipantRegistrationManager } from "./ParticipantRegistrationManager";
import { ParticipatingInstitutionsManager } from "./ParticipatingInstitutionsManager";
import { PreQualifierTestManager } from "./PreQualifierTestManager";
import { NewsListManager } from "./NewsListManager";
import { EventSpecificRegistrationExport } from "./EventSpecificRegistrationExport";
import { Id } from "../../convex/_generated/dataModel";

interface SuperAdminDashboardProps {
  onSignOut: () => void;
}

export function SuperAdminDashboard({ onSignOut }: SuperAdminDashboardProps) {
  const [showParticipantData, setShowParticipantData] = useState(false);
  const [showPreQualifierTests, setShowPreQualifierTests] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [showEventManagement, setShowEventManagement] = useState(false);
  const [showInstitutionsManager, setShowInstitutionsManager] = useState(false);
  const [showNewsManager, setShowNewsManager] = useState(false);
  const [showEventSpecificExport, setShowEventSpecificExport] = useState(false);
  const [selectedEventForExport, setSelectedEventForExport] = useState<{id: Id<"events">, title: string} | null>(null);
  const [editingPaymentLink, setEditingPaymentLink] = useState<{eventId: Id<"events">, currentLink: string} | null>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  // Super admin credentials (these would be securely stored in production)
  const SUPER_ADMIN_EMAIL = "rutvikburra@gmail.com";
  const SUPER_ADMIN_PASSWORD = "rutvikburra1234567890@#E";

  const organizersJudges = useQuery(api.superAdmin.getAllOrganizersJudges, {
    superAdminEmail: SUPER_ADMIN_EMAIL,
    superAdminPassword: SUPER_ADMIN_PASSWORD
  });

  const deleteAllEvents = useMutation(api.superAdmin.deleteAllEvents);
  const events = useQuery(api.events.list, {});
  const updatePaymentLink = useMutation(api.events.updatePaymentLink);
  const updateEvent = useMutation(api.events.updateEvent);

  const stats = useQuery(api.superAdmin.getOrganizerJudgeStats, {
    superAdminEmail: SUPER_ADMIN_EMAIL,
    superAdminPassword: SUPER_ADMIN_PASSWORD
  });

  const createOrganizerJudge = useMutation(api.superAdmin.createOrganizerJudge);
  const updatePassword = useMutation(api.superAdmin.updateOrganizerJudgePassword);
  const toggleStatus = useMutation(api.superAdmin.toggleOrganizerJudgeStatus);
  const deleteUser = useMutation(api.superAdmin.deleteOrganizerJudge);

  // Filter users
  const filteredUsers = organizersJudges?.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.organization?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;

    return matchesSearch && matchesRole;
  }) || [];

  const handleCreateUser = async (userData: any) => {
    try {
      await createOrganizerJudge({
        ...userData,
        superAdminEmail: SUPER_ADMIN_EMAIL,
        superAdminPassword: SUPER_ADMIN_PASSWORD
      });
      toast.success(`${userData.role} created successfully!`);
      setShowCreateForm(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to create user");
    }
  };

  const handlePasswordReset = async (newPassword: string) => {
    if (!selectedUser) return;
    
    try {
      await updatePassword({
        credentialId: selectedUser._id,
        newPassword,
        superAdminEmail: SUPER_ADMIN_EMAIL,
        superAdminPassword: SUPER_ADMIN_PASSWORD
      });
      toast.success("Password updated successfully!");
      setShowPasswordModal(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    }
  };

  const handleToggleStatus = async (userId: Id<"organizerCredentials">, isActive: boolean) => {
    try {
      await toggleStatus({
        credentialId: userId,
        isActive,
        superAdminEmail: SUPER_ADMIN_EMAIL,
        superAdminPassword: SUPER_ADMIN_PASSWORD
      });
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleDeleteUser = async (userId: Id<"organizerCredentials">) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await deleteUser({
          credentialId: userId,
          superAdminEmail: SUPER_ADMIN_EMAIL,
          superAdminPassword: SUPER_ADMIN_PASSWORD
        });
        toast.success("User deleted successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete user");
      }
    }
  };

  const handleUpdatePaymentLink = async (eventId: Id<"events">, paymentLink: string) => {
    try {
      await updatePaymentLink({
        eventId,
        paymentLink,
        superAdminEmail: SUPER_ADMIN_EMAIL,
        superAdminPassword: SUPER_ADMIN_PASSWORD
      });
      toast.success("Payment link updated successfully! 💳");
      setEditingPaymentLink(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update payment link");
    }
  };

  const handleUpdateEvent = async (eventId: Id<"events">, eventData: any) => {
    try {
      await updateEvent({
        eventId,
        ...eventData,
        superAdminEmail: SUPER_ADMIN_EMAIL,
        superAdminPassword: SUPER_ADMIN_PASSWORD
      });
      toast.success("Event updated successfully! 🎉");
      setEditingEvent(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update event");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-space-navy via-charcoal to-dark-blue">
      {/* Header */}
      <nav className="bg-space-navy/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-supernova-gold to-plasma-orange rounded-full flex items-center justify-center">
                <span className="text-space-navy font-bold text-lg">👑</span>
              </div>
              <span className="text-2xl font-bold text-starlight-white">
                Super Admin Panel
              </span>
            </div>
            
            <button
              onClick={onSignOut}
              className="px-4 py-2 border border-white/20 text-starlight-white rounded-lg hover:bg-white/10 transition-colors text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="p-6 bg-dark-blue/40 backdrop-blur-md border border-medium-blue/30 rounded-xl">
            <div className="text-3xl font-bold text-accent-blue mb-2">
              {stats?.totalOrganizers || 0}
            </div>
            <div className="text-silver/70 text-sm">Total Organizers</div>
          </div>
          
          <div className="p-6 bg-dark-blue/40 backdrop-blur-md border border-medium-blue/30 rounded-xl">
            <div className="text-3xl font-bold text-electric-blue mb-2">
              {stats?.totalJudges || 0}
            </div>
            <div className="text-silver/70 text-sm">Total Judges</div>
          </div>
          
          <div className="p-6 bg-dark-blue/40 backdrop-blur-md border border-medium-blue/30 rounded-xl">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {stats?.activeAccounts || 0}
            </div>
            <div className="text-silver/70 text-sm">Active Accounts</div>
          </div>
          
          <div className="p-6 bg-dark-blue/40 backdrop-blur-md border border-medium-blue/30 rounded-xl">
            <div className="text-3xl font-bold text-supernova-gold mb-2">
              {stats?.recentLogins || 0}
            </div>
            <div className="text-silver/70 text-sm">Recent Logins</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <button
            onClick={() => setShowParticipantData(true)}
            className="p-6 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy font-bold rounded-xl hover:scale-105 transform transition-all duration-300 shadow-lg"
          >
            <div className="text-2xl mb-2">📊</div>
            <div>View Participant Data</div>
            <div className="text-sm opacity-80">Export to Excel</div>
          </button>

          <button
            onClick={() => setShowPreQualifierTests(true)}
            className="p-6 bg-gradient-to-r from-cosmic-purple to-nebula-pink text-silver font-bold rounded-xl hover:scale-105 transform transition-all duration-300 shadow-lg"
          >
            <div className="text-2xl mb-2">🎯</div>
            <div>Manage Pre-Qualifier Tests</div>
            <div className="text-sm opacity-80">Create and manage tests</div>
          </button>

          <button
            onClick={() => setShowCreateForm(true)}
            className="p-6 bg-gradient-to-r from-accent-blue to-electric-blue text-silver font-bold rounded-xl hover:scale-105 transform transition-all duration-300 shadow-lg"
          >
            <div className="text-2xl mb-2">➕</div>
            <div>Create Organizer/Judge</div>
            <div className="text-sm opacity-80">Add new accounts</div>
          </button>

          <button
            onClick={() => setShowEventManagement(true)}
            className="p-6 bg-gradient-to-r from-stellar-blue to-medium-blue text-silver font-bold rounded-xl hover:scale-105 transform transition-all duration-300 shadow-lg"
          >
            <div className="text-2xl mb-2">🎪</div>
            <div>Manage Events</div>
            <div className="text-sm opacity-80">Update payment links</div>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete ALL events? This cannot be undone!')) {
                void (async () => {
                  try {
                    const result = await deleteAllEvents();
                    toast.success(`Deleted ${result.deletedEvents} events and ${result.deletedRegistrations} registrations`);
                  } catch {
                    toast.error('Failed to delete events');
                  }
                })();
              }
            }}
            className="p-6 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:scale-105 transform transition-all duration-300 shadow-lg"
          >
            <div className="text-2xl mb-2">🗑️</div>
            <div>Delete All Events</div>
            <div className="text-sm opacity-80">Reset event data</div>
          </button>

          <button
            onClick={() => setShowInstitutionsManager(true)}
            className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transform transition-all duration-300 shadow-lg"
          >
            <div className="text-2xl mb-2">🏫</div>
            <div>Manage Institutions</div>
            <div className="text-sm opacity-80">Colleges & Sponsors</div>
          </button>

          <button
            onClick={() => setShowNewsManager(true)}
            className="p-6 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy font-bold rounded-xl hover:scale-105 transform transition-all duration-300 shadow-lg"
          >
            <div className="text-2xl mb-2">📰</div>
            <div>Manage News & Updates</div>
            <div className="text-sm opacity-80">Create announcements</div>
          </button>

          <button
            onClick={() => window.scrollTo({ top: document.getElementById('user-management')?.offsetTop, behavior: 'smooth' })}
            className="p-6 bg-gradient-to-r from-cosmic-purple to-nebula-pink text-silver font-bold rounded-xl hover:scale-105 transform transition-all duration-300 shadow-lg"
          >
            <div className="text-2xl mb-2">👥</div>
            <div>Manage Users</div>
            <div className="text-sm opacity-80">View all accounts</div>
          </button>
        </div>

        {/* User Management Section */}
        <div id="user-management" className="bg-dark-blue/40 backdrop-blur-md border border-medium-blue/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-silver">
              👥 Organizer & Judge Management
            </h2>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-accent-blue hover:bg-accent-blue/80 text-silver font-medium rounded-lg transition-colors"
            >
              + Add New User
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-silver/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="cosmic-select"
            >
              <option value="all">All Roles</option>
              <option value="organizer">Organizers</option>
              <option value="judge">Judges</option>
            </select>
          </div>

          {/* User List */}
          <div className="space-y-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="p-4 bg-dark-blue/30 border border-medium-blue/20 rounded-xl hover:border-accent-blue/40 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        user.role === 'organizer' ? 'bg-accent-blue text-silver' : 'bg-electric-blue text-silver'
                      }`}>
                        {user.role === 'organizer' ? '👨‍💼' : '⚖️'}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-bold text-silver">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-silver/70 text-sm">{user.email}</p>
                        {user.organization && (
                          <p className="text-silver/60 text-xs">{user.organization}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.role === 'organizer' 
                          ? 'bg-accent-blue/20 text-accent-blue' 
                          : 'bg-electric-blue/20 text-electric-blue'
                      }`}>
                        {user.role}
                      </span>
                      
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.isActive 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowPasswordModal(true);
                          }}
                          className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors"
                          title="Reset Password"
                        >
                          🔑
                        </button>
                        
                        <button
                          onClick={() => {
                            void handleToggleStatus(user._id, !user.isActive);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            user.isActive 
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          }`}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? '🚫' : '✅'}
                        </button>
                        
                        <button
                          onClick={() => {
                            void handleDeleteUser(user._id);
                          }}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          title="Delete User"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-medium-blue/20 text-sm text-silver/60">
                    <div className="grid grid-cols-2 gap-4">
                      <div>Created: {new Date(user.createdAt).toLocaleDateString()}</div>
                      <div>Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</div>
                    </div>
                    <div className="mt-2">
                      <strong>Credentials:</strong> {user.email} / {user.password}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-bold text-silver mb-2">No Users Found</h3>
                <p className="text-silver/70 mb-6">
                  {searchTerm || filterRole !== "all" 
                    ? "Try adjusting your search criteria." 
                    : "No organizers or judges have been created yet."}
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-3 bg-accent-blue hover:bg-accent-blue/80 text-silver font-medium rounded-xl transition-colors"
                >
                  Create First User
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showParticipantData && (
        <ParticipantRegistrationManager onClose={() => setShowParticipantData(false)} />
      )}

      {showPreQualifierTests && (
        <PreQualifierTestManager
          onClose={() => setShowPreQualifierTests(false)}
          currentUserEmail={SUPER_ADMIN_EMAIL}
        />
      )}

      {showCreateForm && (
        <CreateUserModal 
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateUser}
        />
      )}

      {showPasswordModal && selectedUser && (
        <PasswordResetModal
          user={selectedUser}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedUser(null);
          }}
          onSubmit={handlePasswordReset}
        />
      )}

      {showEventManagement && (
        <EventManagementModal
          events={events || []}
          onClose={() => setShowEventManagement(false)}
          onUpdatePaymentLink={handleUpdatePaymentLink}
          onUpdateEvent={handleUpdateEvent}
          editingPaymentLink={editingPaymentLink}
          setEditingPaymentLink={setEditingPaymentLink}
          editingEvent={editingEvent}
          setEditingEvent={setEditingEvent}
          setSelectedEventForExport={setSelectedEventForExport}
          setShowEventSpecificExport={setShowEventSpecificExport}
        />
      )}

      {showInstitutionsManager && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-space-navy/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-starlight-white">Manage Institutions</h2>
              <button
                onClick={() => setShowInstitutionsManager(false)}
                className="text-starlight-white/60 hover:text-starlight-white text-2xl"
              >
                ×
              </button>
            </div>
            <ParticipatingInstitutionsManager />
          </div>
        </div>
      )}

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
                authorEmail={SUPER_ADMIN_EMAIL}
                authorName="Super Admin"
                isAdmin={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Create User Modal Component
function CreateUserModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: any) => unknown;
}) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "organizer" as "organizer" | "judge",
    firstName: "",
    lastName: "",
    organization: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl w-full max-w-2xl p-6">
        <h3 className="text-2xl font-bold text-silver mb-6">Create New User</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className="cosmic-input"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="cosmic-input"
              required
            />
          </div>
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="cosmic-input"
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="cosmic-input"
            required
          />
          
          <select
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as "organizer" | "judge" }))}
            className="cosmic-select"
          >
            <option value="organizer">Organizer</option>
            <option value="judge">Judge</option>
          </select>
          
          <input
            type="text"
            placeholder="Organization (Optional)"
            value={formData.organization}
            onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
            className="cosmic-input"
          />
          
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-medium-blue/40 text-silver rounded-xl hover:bg-medium-blue/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-accent-blue hover:bg-accent-blue/80 text-silver font-bold rounded-xl transition-colors"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Password Reset Modal Component
function PasswordResetModal({
  user,
  onClose,
  onSubmit,
}: {
  user: any;
  onClose: () => void;
  onSubmit: (password: string) => unknown;
}) {
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onSubmit(newPassword);
  };

  return (
    <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold text-silver mb-4">Reset Password</h3>
        <p className="text-silver/70 mb-6">
          Reset password for {user.firstName} {user.lastName} ({user.email})
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="cosmic-input"
            required
          />
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-medium-blue/40 text-silver rounded-xl hover:bg-medium-blue/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-space-navy font-bold rounded-xl transition-colors"
            >
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Event Management Modal Component
function EventManagementModal({
  events,
  onClose,
  onUpdatePaymentLink,
  onUpdateEvent,
  editingPaymentLink,
  setEditingPaymentLink,
  editingEvent,
  setEditingEvent,
  setSelectedEventForExport,
  setShowEventSpecificExport
}: {
  events: any[];
  onClose: () => void;
  onUpdatePaymentLink: (
    eventId: Id<"events">,
    paymentLink: string,
  ) => unknown;
  onUpdateEvent: (
    eventId: Id<"events">,
    eventData: any,
  ) => unknown;
  editingPaymentLink: { eventId: Id<"events">; currentLink: string } | null;
  setEditingPaymentLink: (
    value: { eventId: Id<"events">; currentLink: string } | null,
  ) => void;
  editingEvent: any;
  setEditingEvent: (value: any) => void;
  setSelectedEventForExport: (value: {id: Id<"events">, title: string} | null) => void;
  setShowEventSpecificExport: (value: boolean) => void;
}) {
  const [paymentLinkInput, setPaymentLinkInput] = useState("");
  const [eventFormData, setEventFormData] = useState<any>({});

  const handleSubmitPaymentLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPaymentLink && paymentLinkInput.trim()) {
      void onUpdatePaymentLink(editingPaymentLink.eventId, paymentLinkInput.trim());
    }
  };

  const handleSubmitEventEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent && eventFormData) {
      void onUpdateEvent(editingEvent._id, eventFormData);
    }
  };

  const initializeEventForm = (event: any) => {
    setEditingEvent(event);
    setEventFormData({
      title: event.title || "",
      description: event.description || "",
      category: event.category || "",
      startDate: event.startDate || "",
      endDate: event.endDate || "",
      location: event.location || "",
      maxParticipants: event.maxParticipants || 0,
      registrationDeadline: event.registrationDeadline || "",
      registrationFee: event.registrationFee || 0,
      paymentLink: event.paymentLink || "",
      eventImage: event.eventImage || "",
      requirements: event.requirements || [],
      prizes: event.prizes || [],
      tags: event.tags || []
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-space-navy/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-starlight-white">Event Management</h2>
          <button
            onClick={onClose}
            className="text-starlight-white/60 hover:text-starlight-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎪</div>
              <h3 className="text-xl font-bold text-starlight-white mb-2">No Events Found</h3>
              <p className="text-starlight-white/70">No events have been created yet.</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event._id} className="p-4 bg-dark-blue/40 border border-medium-blue/30 rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-starlight-white">{event.title}</h3>
                    <p className="text-starlight-white/70 text-sm">{event.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-starlight-white/60">
                      <span>Status: <span className={`font-medium ${
                        event.status === 'published' ? 'text-supernova-gold' :
                        event.status === 'ongoing' ? 'text-stellar-blue' :
                        event.status === 'completed' ? 'text-nebula-pink' :
                        'text-starlight-white/70'
                      }`}>{event.status}</span></span>
                      <span>Fee: ₹{event.registrationFee || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-starlight-white/70 text-sm mb-1">Payment Link:</label>
                    <div className="text-starlight-white/60 text-sm bg-dark-blue/20 p-2 rounded border">
                      {event.paymentLink || "No payment link set"}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => initializeEventForm(event)}
                      className="px-3 py-2 bg-accent-blue hover:bg-accent-blue/80 text-starlight-white rounded font-medium transition-colors text-sm"
                    >
                      Edit Event
                    </button>
                    <button
                      onClick={() => {
                        setEditingPaymentLink({
                          eventId: event._id,
                          currentLink: event.paymentLink || ""
                        });
                        setPaymentLinkInput(event.paymentLink || "");
                      }}
                      className="px-3 py-2 bg-supernova-gold hover:bg-supernova-gold/80 text-space-navy rounded font-medium transition-colors text-sm"
                    >
                      Update Link
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEventForExport({
                          id: event._id,
                          title: event.title
                        });
                        setShowEventSpecificExport(true);
                        onClose();
                      }}
                      className="px-3 py-2 bg-gradient-to-r from-nebula-pink to-cosmic-purple hover:from-nebula-pink/80 hover:to-cosmic-purple/80 text-starlight-white rounded font-medium transition-colors text-sm flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment Link Edit Modal */}
        {editingPaymentLink && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-60">
            <div className="bg-space-navy/95 backdrop-blur-md border border-medium-blue/30 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-starlight-white mb-4">Update Payment Link</h3>
              <form onSubmit={handleSubmitPaymentLink}>
                <div className="mb-4">
                  <label className="block text-starlight-white/70 text-sm mb-2">Payment Gateway URL:</label>
                  <input
                    type="url"
                    value={paymentLinkInput}
                    onChange={(e) => setPaymentLinkInput(e.target.value)}
                    placeholder="https://payment-gateway.com/event-payment"
                    className="w-full px-3 py-2 bg-dark-blue/40 border border-medium-blue/30 rounded text-starlight-white placeholder-starlight-white/40 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPaymentLink(null);
                      setPaymentLinkInput("");
                    }}
                    className="flex-1 px-4 py-2 bg-medium-blue hover:bg-medium-blue/80 text-starlight-white rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-supernova-gold hover:bg-supernova-gold/80 text-space-navy rounded font-medium transition-colors"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Event Edit Modal */}
        {editingEvent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-60">
            <div className="bg-space-navy/95 backdrop-blur-md border border-medium-blue/30 rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-starlight-white mb-4">Edit Event</h3>
              <form onSubmit={handleSubmitEventEdit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-starlight-white/70 text-sm mb-2">Event Title:</label>
                    <input
                      type="text"
                      value={eventFormData.title}
                      //onChange={(e) => setEventFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 bg-dark-blue/40 border border-medium-blue/30 rounded text-starlight-white placeholder-starlight-white/40 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-starlight-white/70 text-sm mb-2">Category:</label>
                    <input
                      type="text"
                      value={eventFormData.category}
                      //onChange={(e) => setEventFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 bg-dark-blue/40 border border-medium-blue/30 rounded text-starlight-white placeholder-starlight-white/40 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-starlight-white/70 text-sm mb-2">Start Date:</label>
                    <input
                      type="datetime-local"
                      value={eventFormData.startDate}
                      //onChange={(e) => setEventFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-dark-blue/40 border border-medium-blue/30 rounded text-starlight-white placeholder-starlight-white/40 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-starlight-white/70 text-sm mb-2">End Date:</label>
                    <input
                      type="datetime-local"
                      value={eventFormData.endDate}
                      //onChange={(e) => setEventFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-dark-blue/40 border border-medium-blue/30 rounded text-starlight-white placeholder-starlight-white/40 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-starlight-white/70 text-sm mb-2">Location:</label>
                    <input
                      type="text"
                      value={eventFormData.location}
                      //onChange={(e) => setEventFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 bg-dark-blue/40 border border-medium-blue/30 rounded text-starlight-white placeholder-starlight-white/40 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-starlight-white/70 text-sm mb-2">Max Participants:</label>
                    <input
                      type="number"
                      value={eventFormData.maxParticipants}
                      //onChange={(e) => setEventFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 bg-dark-blue/40 border border-medium-blue/30 rounded text-starlight-white placeholder-starlight-white/40 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-starlight-white/70 text-sm mb-2">Registration Deadline:</label>
                    <input
                      type="datetime-local"
                      value={eventFormData.registrationDeadline}
                      //onChange={(e) => setEventFormData(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                      className="w-full px-3 py-2 bg-dark-blue/40 border border-medium-blue/30 rounded text-starlight-white placeholder-starlight-white/40 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-starlight-white/70 text-sm mb-2">Registration Fee (₹):</label>
                    <input
                      type="number"
                      value={eventFormData.registrationFee}
                     // onChange={(e) => setEventFormData(prev => ({ ...prev, registrationFee: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 bg-dark-blue/40 border border-medium-blue/30 rounded text-starlight-white placeholder-starlight-white/40 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-starlight-white/70 text-sm mb-2">Description:</label>
                  <textarea
                    value={eventFormData.description}
                    //onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 bg-dark-blue/40 border border-medium-blue/30 rounded text-starlight-white placeholder-starlight-white/40 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-starlight-white/70 text-sm mb-2">Event Image URL:</label>
                  <input
                    type="url"
                    value={eventFormData.eventImage}
                    //onChange={(e) => setEventFormData(prev => ({ ...prev, eventImage: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-blue/40 border border-medium-blue/30 rounded text-starlight-white placeholder-starlight-white/40 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-starlight-white/70 text-sm mb-2">Payment Link:</label>
                  <input
                    type="url"
                    value={eventFormData.paymentLink}
                    //onChange={(e) => setEventFormData(prev => ({ ...prev, paymentLink: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-blue/40 border border-medium-blue/30 rounded text-starlight-white placeholder-starlight-white/40 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none"
                    placeholder="https://payment-gateway.com/event-payment"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEvent(null);
                      setEventFormData({});
                    }}
                    className="flex-1 px-4 py-2 bg-medium-blue hover:bg-medium-blue/80 text-starlight-white rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-supernova-gold hover:bg-supernova-gold/80 text-space-navy rounded font-medium transition-colors"
                  >
                    Update Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
