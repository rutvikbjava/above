import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

interface EventSpecificRegistrationExportProps {
  eventId: Id<"events">;
  eventTitle: string;
  onClose: () => void;
}

export function EventSpecificRegistrationExport({ 
  eventId, 
  eventTitle, 
  onClose 
}: EventSpecificRegistrationExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  
  const eventData = useQuery(api.participantRegistrations.getEventRegistrationsForExport, { eventId });
  const eventStats = useQuery(api.participantRegistrations.getEventRegistrationStats, { eventId });

  const exportToExcel = () => {
    if (!eventData?.registrations || eventData.registrations.length === 0) {
      toast.error("No registrations to export for this event");
      return;
    }

    setIsExporting(true);

    try {
      const event = eventData.event;
      const registrations = eventData.registrations;

      // Prepare comprehensive data for Excel export
      const excelData = registrations.map((reg, index) => {
        const baseData = {
          'S.No': index + 1,
          'Event Name': (reg.eventSpecificData?.eventTitle) || (event?.title || eventTitle),
          'Registration Date': new Date(reg.registeredAt).toLocaleDateString(),
          'Registration Time': new Date(reg.registeredAt).toLocaleTimeString(),
          'Full Name': reg.fullName,
          'Email ID': reg.emailId,
          'Contact Number': reg.contactNumber,
          'College/University': reg.collegeUniversity,
          'Department & Year': reg.departmentYear,
          'Technical Skills': reg.technicalSkills || 'N/A',
          'Previous Experience': reg.previousExperience || 'N/A',
          'Team Name': reg.teamName || 'Individual',
          'Team Size': reg.teamSize,
          'Role in Team': reg.roleInTeam,
          'Agreed to Rules': reg.agreeToRules ? 'Yes' : 'No'
        };

        // Add event-specific data if available
        const eventSpecific = reg.eventSpecificData;
        if (eventSpecific) {
          const additionalData: any = {};

          // Personal details
          if (eventSpecific.gender) additionalData['Gender'] = eventSpecific.gender;
          if (eventSpecific.city) additionalData['City'] = eventSpecific.city;
          if (eventSpecific.programBranch) additionalData['Program/Branch'] = eventSpecific.programBranch;
          if (eventSpecific.currentYear) additionalData['Current Year'] = eventSpecific.currentYear;

          // Project/Competition specific fields
          if (eventSpecific.projectTitle) additionalData['Project Title'] = eventSpecific.projectTitle;
          if (eventSpecific.projectAbstract) additionalData['Project Abstract'] = eventSpecific.projectAbstract;
          if (eventSpecific.projectDomain) additionalData['Project Domain'] = eventSpecific.projectDomain;
          if (eventSpecific.projectType) additionalData['Project Type'] = eventSpecific.projectType;
          if (eventSpecific.projectIdea) additionalData['Project Idea'] = eventSpecific.projectIdea;

          // Startup specific fields
          if (eventSpecific.startupName) additionalData['Startup Name'] = eventSpecific.startupName;
          if (eventSpecific.startupIdea) additionalData['Startup Idea'] = eventSpecific.startupIdea;

          // Robotics specific fields
          if (eventSpecific.robotName) additionalData['Robot Name'] = eventSpecific.robotName;
          if (eventSpecific.botDimensions) additionalData['Bot Dimensions'] = eventSpecific.botDimensions;

          // ESports specific fields
          if (eventSpecific.selectedGame) additionalData['Selected Game'] = eventSpecific.selectedGame;
          if (eventSpecific.gameUsernames) additionalData['Game Usernames'] = eventSpecific.gameUsernames;

          // Special setup/space
          if (eventSpecific.needsSpecialSetup !== undefined) {
            additionalData['Needs Special Setup'] = eventSpecific.needsSpecialSetup ? 'Yes' : 'No';
          }
          if (eventSpecific.additionalSpaceRequirements) {
            additionalData['Additional Space Requirements'] = eventSpecific.additionalSpaceRequirements;
          }

          // Other fields
          if (eventSpecific.laptopAvailable !== undefined) {
            additionalData['Laptop Available'] = eventSpecific.laptopAvailable ? 'Yes' : 'No';
          }
          if (eventSpecific.eventCategory) additionalData['Event Category'] = eventSpecific.eventCategory;

          // Team members details
          if (eventSpecific.teamMembers && eventSpecific.teamMembers.length > 0) {
            eventSpecific.teamMembers.forEach((member, idx) => {
              additionalData[`Team Member ${idx + 1} Name`] = member.name;
              additionalData[`Team Member ${idx + 1} Email`] = member.emailId;
              additionalData[`Team Member ${idx + 1} Contact`] = member.contactNumber;
              additionalData[`Team Member ${idx + 1} College`] = member.college;
              additionalData[`Team Member ${idx + 1} City`] = member.city;
              additionalData[`Team Member ${idx + 1} Program`] = member.programBranch;
              additionalData[`Team Member ${idx + 1} Year`] = member.currentYear;
              additionalData[`Team Member ${idx + 1} Gender`] = member.gender;
            });
          }

          return { ...baseData, ...additionalData };
        }

        return baseData;
      });

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Auto-size columns
      const colWidths = Object.keys(excelData[0] || {}).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Event Registrations');

      // Create summary sheet
      const summaryData = [
        { 'Metric': 'Event Title', 'Value': event?.title || eventTitle },
        { 'Metric': 'Event Category', 'Value': event?.category || 'N/A' },
        { 'Metric': 'Event Status', 'Value': event?.status || 'N/A' },
        { 'Metric': 'Total Registrations', 'Value': eventData.totalCount },
        { 'Metric': 'Export Date', 'Value': new Date().toLocaleDateString() },
        { 'Metric': 'Export Time', 'Value': new Date().toLocaleTimeString() },
        { 'Metric': '', 'Value': '' }, // Empty row
        { 'Metric': 'College Distribution', 'Value': '' },
      ];

      // Add college stats
      if (eventStats?.topColleges) {
        eventStats.topColleges.forEach(({ college, count }) => {
          summaryData.push({ 'Metric': college, 'Value': count });
        });
      }

      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      summaryWs['!cols'] = [{ wch: 30 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

      // Generate filename with event title and timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const sanitizedTitle = eventTitle.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${sanitizedTitle}_Registrations_${timestamp}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
      toast.success(`Excel file exported: ${filename}`);
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!eventData) {
    return (
      <div className="fixed inset-0 bg-space-navy/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-space-navy/95 backdrop-blur-md border border-white/20 rounded-2xl p-8">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-supernova-gold border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-starlight-white">Loading event data...</p>
          </div>
        </div>
      </div>
    );
  }

  const { registrations, totalCount } = eventData;

  return (
    <div className="fixed inset-0 bg-space-navy/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-space-navy/95 backdrop-blur-md border border-white/20 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-starlight-white to-supernova-gold bg-clip-text text-transparent mb-2">
              📊 Event Registrations Export
            </h2>
            <p className="text-starlight-white/70 text-sm sm:text-base">
              {eventTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-starlight-white/70 hover:text-starlight-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Statistics */}
        <div className="px-6 py-4 bg-white/5 border-b border-white/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-white/5 rounded-xl">
              <div className="text-2xl font-bold text-supernova-gold">
                {totalCount}
              </div>
              <div className="text-starlight-white/60 text-sm">Total Registrations</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <div className="text-2xl font-bold text-electric-blue">
                {eventStats?.recentRegistrations || 0}
              </div>
              <div className="text-starlight-white/60 text-sm">This Week</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <div className="text-2xl font-bold text-nebula-pink">
                {eventStats?.teamStats?.team || 0}
              </div>
              <div className="text-starlight-white/60 text-sm">Team Registrations</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <div className="text-2xl font-bold text-stellar-blue">
                {eventStats?.teamStats?.individual || 0}
              </div>
              <div className="text-starlight-white/60 text-sm">Individual</div>
            </div>
          </div>
        </div>

        {/* Export Actions */}
        <div className="p-6 border-b border-white/20">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-starlight-white mb-1">
                Export Options
              </h3>
              <p className="text-starlight-white/70 text-sm">
                Download comprehensive registration data with all event-specific fields
              </p>
            </div>
            <button
              onClick={exportToExcel}
              disabled={isExporting || totalCount === 0}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${
                isExporting || totalCount === 0
                  ? "bg-white/10 text-starlight-white/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy hover:scale-105 shadow-lg hover:shadow-supernova-gold/25"
              }`}
            >
              {isExporting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-space-navy border-t-transparent rounded-full"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export to Excel
                </>
              )}
            </button>
          </div>
        </div>

        {/* Registration Preview */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {registrations && registrations.length > 0 ? (
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-starlight-white mb-4">
                Registration Preview (Showing first 5 entries)
              </h4>
              {registrations.slice(0, 5).map((registration, index) => (
                <div
                  key={registration._id}
                  className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:border-supernova-gold/30 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="text-lg font-bold text-starlight-white mb-1">
                        {registration.fullName}
                      </h5>
                      <p className="text-starlight-white/70 text-sm">{registration.emailId}</p>
                      <p className="text-supernova-gold text-sm font-medium">
                        {registration.collegeUniversity}
                      </p>
                    </div>
                    <div className="text-right text-sm text-starlight-white/60">
                      <div>#{index + 1}</div>
                      <div>{new Date(registration.registeredAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <h6 className="text-starlight-white/80 text-xs font-medium mb-1">Contact</h6>
                      <p className="text-starlight-white/70 text-sm">{registration.contactNumber}</p>
                    </div>
                    
                    {registration.teamName && (
                      <div className="p-3 bg-white/5 rounded-lg">
                        <h6 className="text-starlight-white/80 text-xs font-medium mb-1">Team</h6>
                        <p className="text-starlight-white/70 text-sm">
                          {registration.teamName} ({registration.teamSize} members)
                        </p>
                      </div>
                    )}
                    
                    <div className="p-3 bg-white/5 rounded-lg">
                      <h6 className="text-starlight-white/80 text-xs font-medium mb-1">Skills</h6>
                      <p className="text-starlight-white/70 text-sm line-clamp-2">
                        {registration.technicalSkills || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {registrations.length > 5 && (
                <div className="text-center py-4 border border-white/10 rounded-xl bg-white/5">
                  <p className="text-starlight-white/70">
                    + {registrations.length - 5} more registrations will be included in the export
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h4 className="text-xl font-bold text-starlight-white mb-2">
                No Registrations Yet
              </h4>
              <p className="text-starlight-white/70">
                This event hasn't received any registrations yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}