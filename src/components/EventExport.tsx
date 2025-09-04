import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

interface EventExportProps {
  eventId: Id<"events">;
  eventTitle?: string;
  onClose?: () => void;
}

export function EventExport({ eventId, eventTitle, onClose }: EventExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  
  const eventData = useQuery(api.participantRegistrations.getEventRegistrationsForExport, { eventId });
  const event = eventData?.event;
  const registrations = eventData?.registrations || [];

  const exportToExcel = () => {
    if (!registrations || registrations.length === 0) {
      toast.error("No registrations to export for this event");
      return;
    }
    
    setIsExporting(true);
    
    try {
      // Comprehensive data export with all event-specific fields
      const exportData = registrations.map((reg, index) => {
        const baseData = {
          'S.No': index + 1,
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
          if (eventSpecific.selectedGame) additionalData['Selected Game'] = eventSpecific.selectedGame;

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
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Auto-size columns
      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      worksheet['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(workbook, worksheet, "Event Registrations");
      
      // Generate filename with event title and timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const title = event?.title || eventTitle || 'Event';
      const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${sanitizedTitle}_Registrations_${timestamp}.xlsx`;
      
      XLSX.writeFile(workbook, fileName);
      toast.success(`Excel file exported: ${fileName}`);
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-starlight-white">
          📊 Registrations: {registrations?.length || 0}
        </h3>
        
        <div className="flex items-center gap-3">
          <button
            onClick={exportToExcel}
            disabled={isExporting || !registrations?.length}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
              isExporting || !registrations?.length
                ? "bg-white/10 text-starlight-white/50 cursor-not-allowed"
                : "bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy hover:scale-105 shadow-lg"
            }`}
          >
            {isExporting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-space-navy border-t-transparent rounded-full"></div>
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export to Excel
              </>
            )}
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-starlight-white/70 hover:text-starlight-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {registrations && registrations.length > 0 ? (
        <div className="border border-white/20 rounded-xl overflow-hidden bg-white/5">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="p-3 text-left text-starlight-white font-medium">Name</th>
                <th className="p-3 text-left text-starlight-white font-medium">Email</th>
                <th className="p-3 text-left text-starlight-white font-medium">College</th>
                <th className="p-3 text-left text-starlight-white font-medium">Team</th>
              </tr>
            </thead>
            <tbody>
              {registrations.slice(0, 5).map((reg, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white/5" : "bg-transparent"}>
                  <td className="p-3 text-starlight-white/90">{reg.fullName}</td>
                  <td className="p-3 text-starlight-white/90">{reg.emailId}</td>
                  <td className="p-3 text-starlight-white/90">{reg.collegeUniversity}</td>
                  <td className="p-3 text-starlight-white/90">{reg.teamName || 'Individual'}</td>
                </tr>
              ))}
              {registrations.length > 5 && (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-starlight-white/70 bg-white/5">
                    + {registrations.length - 5} more registrations (will be included in export)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 border border-white/20 rounded-xl bg-white/5">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-starlight-white/70">No registrations for this event yet</p>
        </div>
      )}
    </div>
  );
}