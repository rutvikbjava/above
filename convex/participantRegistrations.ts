import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const registerParticipant = mutation({
  args: {
    eventId: v.id("events"),
    registrationData: v.object({
      fullName: v.string(),
      gender: v.optional(v.string()),
      contactNumber: v.string(),
      emailId: v.string(),
      collegeName: v.string(),
      collegeUniversity: v.string(),
      departmentYear: v.string(),
      city: v.optional(v.string()),
      programBranch: v.optional(v.string()),
      currentYear: v.optional(v.string()),
      isTeam: v.optional(v.boolean()),
      teamName: v.optional(v.string()),
      teamSize: v.float64(),
      roleInTeam: v.union(v.literal("Leader"), v.literal("Member")),
      teamMembers: v.optional(v.array(v.object({
        name: v.string(),
        gender: v.string(),
        contactNumber: v.string(),
        emailId: v.string(),
        college: v.string(),
        city: v.string(),
        programBranch: v.string(),
        currentYear: v.string()
      }))),
      // Event-specific fields
      technicalSkills: v.string(),
      previousExperience: v.optional(v.string()),
      projectIdea: v.optional(v.string()),
      projectTitle: v.optional(v.string()),
      projectAbstract: v.optional(v.string()),
      projectDomain: v.optional(v.string()),
      projectType: v.optional(v.string()),
      startupName: v.optional(v.string()),
      startupIdea: v.optional(v.string()),
      robotName: v.optional(v.string()),
      botDimensions: v.optional(v.string()),
      selectedGame: v.optional(v.string()),
      gameUsernames: v.optional(v.string()),
      needsSpecialSetup: v.optional(v.boolean()),
      additionalSpaceRequirements: v.optional(v.string()),
      laptopAvailable: v.optional(v.boolean()),
      agreeToRules: v.boolean(),
      eventCategory: v.optional(v.string()),
      eventTitle: v.optional(v.string())
    }),
    attachments: v.optional(v.array(v.id("files")))
  },
  handler: async (ctx, args) => {
    // Check if email already exists for this event
    const existingRegistration = await ctx.db
      .query("participantRegistrations")
      .withIndex("by_email", (q) => q.eq("emailId", args.registrationData.emailId))
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .first();

    if (existingRegistration) {
      throw new Error("You have already registered for this event with this email address.");
    }

    // Validate required fields
    if (!args.registrationData.agreeToRules) {
      throw new Error("You must agree to the rules and regulations to register.");
    }

    // Insert the registration
    const registrationId = await ctx.db.insert("participantRegistrations", {
      eventId: args.eventId,
      fullName: args.registrationData.fullName,
      collegeUniversity: args.registrationData.collegeName,
      departmentYear: `${args.registrationData.programBranch || ''} - ${args.registrationData.currentYear || ''}`.trim().replace(/^-\s*|-\s*$/, ''),
      contactNumber: args.registrationData.contactNumber,
      emailId: args.registrationData.emailId,
      teamName: args.registrationData.teamName,
      teamSize: args.registrationData.isTeam ? args.registrationData.teamSize : 1,
      roleInTeam: "Leader",
      technicalSkills: args.registrationData.technicalSkills || "",
      previousExperience: args.registrationData.previousExperience || "",
      agreeToRules: args.registrationData.agreeToRules,
      registeredAt: Date.now(),
      attachments: args.attachments || [],
      // Store additional event-specific data as JSON for flexibility
      eventSpecificData: {
        gender: args.registrationData.gender,
        city: args.registrationData.city,
        programBranch: args.registrationData.programBranch,
        currentYear: args.registrationData.currentYear,
        isTeam: args.registrationData.isTeam,
        teamMembers: args.registrationData.teamMembers?.map(member => ({
          name: member.name,
          gender: member.gender,
          contactNumber: member.contactNumber,
          emailId: member.emailId,
          college: member.college,
          city: member.city,
          programBranch: member.programBranch,
          currentYear: member.currentYear
        })),
        projectIdea: args.registrationData.projectIdea,
        projectTitle: args.registrationData.projectTitle,
        projectAbstract: args.registrationData.projectAbstract,
        projectDomain: args.registrationData.projectDomain,
        projectType: args.registrationData.projectType,
        startupName: args.registrationData.startupName,
        startupIdea: args.registrationData.startupIdea,
        robotName: args.registrationData.robotName,
        botDimensions: args.registrationData.botDimensions,
        selectedGame: args.registrationData.selectedGame,
        gameUsernames: args.registrationData.gameUsernames,
        needsSpecialSetup: args.registrationData.needsSpecialSetup,
        additionalSpaceRequirements: args.registrationData.additionalSpaceRequirements,
        laptopAvailable: args.registrationData.laptopAvailable,
        eventCategory: args.registrationData.eventCategory,
        eventTitle: args.registrationData.eventTitle
      }
    });

    return registrationId;
  },
});

export const getAllParticipantRegistrations = query({
  args: {},
  handler: async (ctx) => {
    const registrations = await ctx.db
      .query("participantRegistrations")
      .collect();

    // Sort by registration date (newest first)
    return registrations.sort((a, b) => b.registeredAt - a.registeredAt);
  },
});

export const getRegistrationsByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const registrations = await ctx.db
      .query("participantRegistrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Sort by registration date (newest first)
    return registrations.sort((a, b) => b.registeredAt - a.registeredAt);
  },
});

export const getParticipantRegistrationsByCollege = query({
  args: { college: v.string() },
  handler: async (ctx, args) => {
    const registrations = await ctx.db
      .query("participantRegistrations")
      .withIndex("by_college", (q) => q.eq("collegeUniversity", args.college))
      .collect();

    return registrations;
  },
});

export const getRegistrationStats = query({
  args: {},
  handler: async (ctx) => {
    const allRegistrations = await ctx.db
      .query("participantRegistrations")
      .collect();

    const totalRegistrations = allRegistrations.length;
    
    // Group by college
    const collegeStats = allRegistrations.reduce((acc, reg) => {
      acc[reg.collegeUniversity] = (acc[reg.collegeUniversity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by team size
    const teamSizeStats = allRegistrations.reduce((acc, reg) => {
      const size = reg.teamSize.toString();
      acc[size] = (acc[size] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent registrations (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentRegistrations = allRegistrations.filter(
      reg => reg.registeredAt > sevenDaysAgo
    ).length;

    return {
      totalRegistrations,
      collegeStats,
      teamSizeStats,
      recentRegistrations,
      topColleges: Object.entries(collegeStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([college, count]) => ({ college, count }))
    };
  },
});

export const searchParticipantRegistrations = query({
  args: {
    searchTerm: v.optional(v.string()),
    college: v.optional(v.string()),
    teamSize: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let registrations = await ctx.db
      .query("participantRegistrations")
      .collect();

    // Sort by registration date (newest first)
    registrations = registrations.sort((a, b) => b.registeredAt - a.registeredAt);

    // Apply filters
    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      registrations = registrations.filter(reg =>
        reg.fullName.toLowerCase().includes(searchLower) ||
        reg.emailId.toLowerCase().includes(searchLower) ||
        reg.teamName?.toLowerCase().includes(searchLower) ||
        reg.technicalSkills.toLowerCase().includes(searchLower)
      );
    }

    if (args.college) {
      registrations = registrations.filter(reg =>
        reg.collegeUniversity.toLowerCase().includes(args.college!.toLowerCase())
      );
    }

    if (args.teamSize) {
      registrations = registrations.filter(reg => reg.teamSize === args.teamSize);
    }

    return registrations;
  },
});

export const deleteParticipantRegistration = mutation({
  args: { registrationId: v.id("participantRegistrations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.registrationId);
    return { success: true };
  },
});

export const updateParticipantRegistration = mutation({
  args: {
    registrationId: v.id("participantRegistrations"),
    fullName: v.optional(v.string()),
    collegeUniversity: v.optional(v.string()),
    departmentYear: v.optional(v.string()),
    contactNumber: v.optional(v.string()),
    teamName: v.optional(v.string()),
    teamSize: v.optional(v.number()),
    roleInTeam: v.optional(v.union(v.literal("Leader"), v.literal("Member"))),
    technicalSkills: v.optional(v.string()),
    previousExperience: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { registrationId, ...updates } = args;
    
    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(registrationId, filteredUpdates);
    return { success: true };
  },
});

// Get detailed registrations for a specific event with all event-specific data
export const getEventRegistrationsForExport = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const registrations = await ctx.db
      .query("participantRegistrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Get event details for context
    const event = await ctx.db.get(args.eventId);

    // Sort by registration date (newest first)
    const sortedRegistrations = registrations.sort((a, b) => b.registeredAt - a.registeredAt);

    return {
      event,
      registrations: sortedRegistrations,
      totalCount: sortedRegistrations.length
    };
  },
});

// Get registrations by organizer (all events created by specific organizer)
export const getRegistrationsByOrganizer = query({
  args: { organizerId: v.id("users") },
  handler: async (ctx, args) => {
    // First get all events by this organizer
    const organizerEvents = await ctx.db
      .query("events")
      .withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId))
      .collect();

    const eventIds = organizerEvents.map(event => event._id);

    // Get all registrations for these events
    const allRegistrations = await ctx.db
      .query("participantRegistrations")
      .collect();

    const organizerRegistrations = allRegistrations.filter(reg => 
      reg.eventId && eventIds.includes(reg.eventId)
    );

    // Group by event
    const registrationsByEvent = organizerEvents.map(event => {
      const eventRegistrations = organizerRegistrations.filter(reg => 
        reg.eventId === event._id
      ).sort((a, b) => b.registeredAt - a.registeredAt);

      return {
        event,
        registrations: eventRegistrations,
        count: eventRegistrations.length
      };
    });

    return {
      events: registrationsByEvent,
      totalRegistrations: organizerRegistrations.length
    };
  },
});

// Get event statistics for organizer dashboard
export const getEventRegistrationStats = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const registrations = await ctx.db
      .query("participantRegistrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const totalRegistrations = registrations.length;
    
    // Group by college
    const collegeStats = registrations.reduce((acc, reg) => {
      acc[reg.collegeUniversity] = (acc[reg.collegeUniversity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Team vs Individual stats
    const teamStats = registrations.reduce((acc, reg) => {
      const isTeam = reg.teamSize > 1;
      acc[isTeam ? 'team' : 'individual'] = (acc[isTeam ? 'team' : 'individual'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent registrations (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentRegistrations = registrations.filter(
      reg => reg.registeredAt > sevenDaysAgo
    ).length;

    return {
      totalRegistrations,
      collegeStats,
      teamStats,
      recentRegistrations,
      topColleges: Object.entries(collegeStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([college, count]) => ({ college, count }))
    };
  },
});


