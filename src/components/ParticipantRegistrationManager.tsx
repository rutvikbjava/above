import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

interface ParticipantRegistrationManagerProps {
  onClose: () => void;
}

export function ParticipantRegistrationManager({ onClose }: ParticipantRegistrationManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("all");
  const [selectedTeamSize, setSelectedTeamSize] = useState<number | null>(null);

  const allRegistrations = useQuery(api.participantRegistrations.getAllParticipantRegistrations);
  const registrationStats = useQuery(api.participantRegistrations.getRegistrationStats);
  const deleteRegistration = useMutation(api.participantRegistrations.deleteParticipantRegistration);

  // Filter registrations
  const filteredRegistrations = allRegistrations?.filter(registration => {
    const matchesSearch = 
      registration.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.emailId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.collegeUniversity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.technicalSkills.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCollege = selectedCollege === "all" || 
      registration.collegeUniversity.toLowerCase().includes(selectedCollege.toLowerCase());

    const matchesTeamSize = selectedTeamSize === null || registration.teamSize === selectedTeamSize;

    return matchesSearch && matchesCollege && matchesTeamSize;
  }) || [];

  const exportToExcel = () => {
    if (!filteredRegistrations || filteredRegistrations.length === 0) {
      toast.error("No registrations to export");
      return;
    }

    // Prepare data for Excel
    const excelData = filteredRegistrations.map((reg, index) => {
      const base = {
        'S.No': index + 1,
        'Event Name': reg.eventSpecificData?.eventTitle || 'N/A',
        'Full Name': reg.fullName,
        'College/University': reg.collegeUniversity,
        'Department & Year': reg.departmentYear,
        'Contact Number': reg.contactNumber,
        'Email ID': reg.emailId,
        'Team Name': reg.teamName || 'N/A',
        'Team Size': reg.teamSize,
        'Role in Team': reg.roleInTeam,
        'Technical Skills': reg.technicalSkills,
        'Previous Experience': reg.previousExperience || 'N/A',
        'Agreed to Rules': reg.agreeToRules ? 'Yes' : 'No',
        'Registration Date': new Date(reg.registeredAt).toLocaleDateString(),
        'Registration Time': new Date(reg.registeredAt).toLocaleTimeString()
      } as any;

      const es = reg.eventSpecificData;
      if (!es) return base;

      // Personal
      if (es.gender) base['Gender'] = es.gender;
      if (es.city) base['City'] = es.city;
      if (es.programBranch) base['Program/Branch'] = es.programBranch;
      if (es.currentYear) base['Current Year'] = es.currentYear;

      // Project/Startup/Robotics/ESports
      if (es.projectTitle) base['Project Title'] = es.projectTitle;
      if (es.projectAbstract) base['Project Abstract'] = es.projectAbstract;
      if (es.projectDomain) base['Project Domain'] = es.projectDomain;
      if (es.projectType) base['Project Type'] = es.projectType;
      if (es.projectIdea) base['Project Idea'] = es.projectIdea;
      if (es.startupName) base['Startup Name'] = es.startupName;
      if (es.startupIdea) base['Startup Idea'] = es.startupIdea;
      if (es.robotName) base['Robot Name'] = es.robotName;
      if (es.botDimensions) base['Bot Dimensions'] = es.botDimensions;
      if (es.selectedGame) base['Selected Game'] = es.selectedGame;
      if (es.gameUsernames) base['Game Usernames'] = es.gameUsernames;
      if (es.needsSpecialSetup !== undefined) base['Needs Special Setup'] = es.needsSpecialSetup ? 'Yes' : 'No';
      if (es.additionalSpaceRequirements) base['Additional Space Requirements'] = es.additionalSpaceRequirements;
      if (es.laptopAvailable !== undefined) base['Laptop Available'] = es.laptopAvailable ? 'Yes' : 'No';
      if (es.eventCategory) base['Event Category'] = es.eventCategory;

      // Team members
      if (es.teamMembers && es.teamMembers.length > 0) {
        es.teamMembers.forEach((m, i) => {
          base[`Team Member ${i + 1} Name`] = m.name;
          base[`Team Member ${i + 1} Email`] = m.emailId;
          base[`Team Member ${i + 1} Contact`] = m.contactNumber;
          base[`Team Member ${i + 1} College`] = m.college;
          base[`Team Member ${i + 1} City`] = m.city;
          base[`Team Member ${i + 1} Program`] = m.programBranch;
          base[`Team Member ${i + 1} Year`] = m.currentYear;
          base[`Team Member ${i + 1} Gender`] = m.gender;
        });
      }

      return base;
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 8 },   // S.No
      { wch: 20 },  // Full Name
      { wch: 25 },  // College/University
      { wch: 20 },  // Department & Year
      { wch: 15 },  // Contact Number
      { wch: 25 },  // Email ID
      { wch: 15 },  // Team Name
      { wch: 10 },  // Team Size
      { wch: 12 },  // Role in Team
      { wch: 30 },  // Technical Skills
      { wch: 25 },  // Previous Experience
      { wch: 12 },  // Agreed to Rules
      { wch: 15 },  // Registration Date
      { wch: 15 }   // Registration Time
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Participant Registrations');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Hackathon_Registrations_${timestamp}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
    toast.success(`Excel file exported: ${filename}`);
  };

  const handleDeleteRegistration = async (registrationId: string) => {
    if (window.confirm("Are you sure you want to delete this registration?")) {
      try {
        await deleteRegistration({ registrationId: registrationId as any });
        toast.success("Registration deleted successfully");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete registration");
      }
    }
  };

  const uniqueColleges = Array.from(
    new Set(allRegistrations?.map(reg => reg.collegeUniversity) || [])
  ).sort();

  return (
    <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-medium-blue/30">
          <div>
            <h2 className="text-3xl font-bold text-silver mb-2">
              📊 Participant Registrations
            </h2>
            <p className="text-silver/70">
              Manage and export participant registration data
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-medium-blue/30 rounded-lg transition-colors text-silver/70 hover:text-silver"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Statistics */}
        <div className="px-6 py-4 bg-dark-blue/30 border-b border-medium-blue/30">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-accent-blue">
                {registrationStats?.totalRegistrations || 0}
              </div>
              <div className="text-silver/60 text-sm">Total Registrations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {registrationStats?.recentRegistrations || 0}
              </div>
              <div className="text-silver/60 text-sm">This Week</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {registrationStats?.topColleges?.length || 0}
              </div>
              <div className="text-silver/60 text-sm">Colleges</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {filteredRegistrations.length}
              </div>
              <div className="text-silver/60 text-sm">Filtered Results</div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="p-6 border-b border-medium-blue/30">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, college, team, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-silver/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-silver/80 text-sm font-medium mb-2">Filter by College</label>
              <select
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                className="cosmic-select"
              >
                <option value="all">All Colleges</option>
                {uniqueColleges.map(college => (
                  <option key={college} value={college}>{college}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-silver/80 text-sm font-medium mb-2">Filter by Team Size</label>
              <select
                value={selectedTeamSize || "all"}
                onChange={(e) => setSelectedTeamSize(e.target.value === "all" ? null : parseInt(e.target.value))}
                className="cosmic-select"
              >
                <option value="all">All Team Sizes</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(size => (
                  <option key={size} value={size}>{size} member{size > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={exportToExcel}
                className="w-full px-4 py-3 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export to Excel
              </button>
            </div>
          </div>
        </div>

        {/* Registration List */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {filteredRegistrations.length > 0 ? (
            <div className="space-y-4">
              {filteredRegistrations.map((registration) => (
                <div
                  key={registration._id}
                  className="p-6 bg-dark-blue/40 backdrop-blur-md border border-medium-blue/30 rounded-xl hover:border-accent-blue/40 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-silver mb-1">
                        {registration.fullName}
                      </h4>
                      <p className="text-silver/70 text-sm">{registration.emailId}</p>
                      <p className="text-accent-blue text-sm font-medium">
                        {registration.collegeUniversity} • {registration.departmentYear}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right text-sm text-silver/60">
                        <div>Registered: {new Date(registration.registeredAt).toLocaleDateString()}</div>
                        <div>Contact: {registration.contactNumber}</div>
                      </div>
                      <button
                        onClick={() => handleDeleteRegistration(registration._id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        title="Delete Registration"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {registration.teamName && (
                      <div className="p-3 bg-dark-blue/30 rounded-lg">
                        <h5 className="text-silver/80 text-sm font-medium mb-1">Team Details</h5>
                        <p className="text-silver/70 text-sm">
                          {registration.teamName} ({registration.teamSize} members)
                        </p>
                        <p className="text-accent-blue text-xs">Role: {registration.roleInTeam}</p>
                      </div>
                    )}
                    
                    <div className="p-3 bg-dark-blue/30 rounded-lg">
                      <h5 className="text-silver/80 text-sm font-medium mb-1">Technical Skills</h5>
                      <p className="text-silver/70 text-sm line-clamp-2">
                        {registration.technicalSkills}
                      </p>
                    </div>

                    {registration.previousExperience && (
                      <div className="p-3 bg-dark-blue/30 rounded-lg">
                        <h5 className="text-silver/80 text-sm font-medium mb-1">Previous Experience</h5>
                        <p className="text-silver/70 text-sm line-clamp-2">
                          {registration.previousExperience}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-medium-blue/20">
                    <div className="flex items-center gap-4 text-sm text-silver/60">
                      <span>Team Size: {registration.teamSize}</span>
                      <span>Role: {registration.roleInTeam}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        registration.agreeToRules 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {registration.agreeToRules ? "✅ Agreed to Rules" : "❌ Not Agreed"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h4 className="text-xl font-bold text-silver mb-2">No Registrations Found</h4>
              <p className="text-silver/70 mb-6">
                {searchTerm || selectedCollege !== "all" || selectedTeamSize !== null
                  ? "Try adjusting your search criteria or filters."
                  : "No participant registrations available yet."}
              </p>
              {(searchTerm || selectedCollege !== "all" || selectedTeamSize !== null) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCollege("all");
                    setSelectedTeamSize(null);
                  }}
                  className="px-6 py-3 bg-accent-blue hover:bg-accent-blue/80 text-silver font-medium rounded-xl transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-medium-blue/30 bg-dark-blue/30">
          <div className="flex items-center justify-between">
            <div className="text-silver/60 text-sm">
              Showing {filteredRegistrations.length} of {allRegistrations?.length || 0} registrations
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToExcel}
                disabled={filteredRegistrations.length === 0}
                className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                  filteredRegistrations.length > 0
                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    : "bg-medium-blue/20 text-silver/50 cursor-not-allowed"
                }`}
              >
                📊 Export Excel
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-medium-blue/40 hover:bg-medium-blue/60 text-silver font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
