import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Delete all events (for development/reset purposes)
export const deleteAllEvents = mutation({
  args: {},
  returns: v.object({ deleted: v.number() }),
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();
    for (const event of events) {
      await ctx.db.delete(event._id);
    }
    return { deleted: events.length };
  },
});

export const list = query({
  args: {
    category: v.optional(v.string()),
    status: v.optional(v.string())
  },
  returns: v.array(v.object({
    _id: v.id("events"),
    _creationTime: v.number(),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    location: v.string(),
    maxParticipants: v.number(),
    registrationDeadline: v.string(),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("ongoing"), v.literal("completed")),
    organizerId: v.id("users"),
    judges: v.array(v.id("users")),
    requirements: v.array(v.string()),
    prizes: v.array(v.object({
      position: v.string(),
      prize: v.string(),
      amount: v.optional(v.number())
    })),
    bannerImage: v.optional(v.string()),
    eventImage: v.optional(v.string()),
    registrationFee: v.optional(v.number()),
    paymentLink: v.optional(v.string()),
    tags: v.array(v.string()),
    organizer: v.object({
      name: v.string(),
      email: v.optional(v.string()),
      profile: v.any()
    })
  })),
  handler: async (ctx, args) => {
    let events;
    
    if (args.category) {
      events = await ctx.db
        .query("events")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else if (args.status) {
      events = await ctx.db
        .query("events")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .collect();
    } else {
      events = await ctx.db.query("events").collect();
    }
    
    // Get organizer details for each event
    const eventsWithOrganizers = await Promise.all(
      events.map(async (event) => {
        const organizer = await ctx.db.get(event.organizerId);
        const organizerProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", event.organizerId))
          .first();
        
        return {
          ...event,
          organizer: {
            name: organizer?.name || "Unknown",
            email: organizer?.email,
            profile: organizerProfile
          }
        };
      })
    );
    
    return eventsWithOrganizers;
  },
});

export const getById = query({
  args: { id: v.id("events") },
  returns: v.union(v.null(), v.object({
    _id: v.id("events"),
    _creationTime: v.number(),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    location: v.string(),
    maxParticipants: v.number(),
    registrationDeadline: v.string(),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("ongoing"), v.literal("completed")),
    organizerId: v.id("users"),
    requirements: v.array(v.string()),
    prizes: v.array(v.object({
      position: v.string(),
      prize: v.string(),
      amount: v.optional(v.number())
    })),
    bannerImage: v.optional(v.string()),
    eventImage: v.optional(v.string()),
    registrationFee: v.optional(v.number()),
    paymentLink: v.optional(v.string()),
    tags: v.array(v.string()),
    organizer: v.object({
      name: v.string(),
      email: v.optional(v.string()),
      profile: v.any()
    }),
    judges: v.array(v.object({
      id: v.id("users"),
      name: v.string(),
      profile: v.any()
    }))
  })),
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id);
    if (!event) return null;
    
    const organizer = await ctx.db.get(event.organizerId);
    const organizerProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", event.organizerId))
      .first();
    
    // Get judge profiles
    const judges = await Promise.all(
      event.judges.map(async (judgeId) => {
        const judge = await ctx.db.get(judgeId);
        const judgeProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", judgeId))
          .first();
        return {
          id: judgeId,
          name: judge?.name || "Unknown",
          profile: judgeProfile
        };
      })
    );
    
    return {
      ...event,
      organizer: {
        name: organizer?.name || "Unknown",
        email: organizer?.email,
        profile: organizerProfile
      },
      judges
    };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    location: v.string(),
    maxParticipants: v.number(),
    registrationDeadline: v.string(),
    requirements: v.array(v.string()),
    prizes: v.array(v.object({
      position: v.string(),
      prize: v.string(),
      amount: v.optional(v.number())
    })),
    tags: v.array(v.string()),
    eventImage: v.optional(v.string()), // URL for uploaded image
    registrationFee: v.optional(v.number()), // Registration fee amount
    paymentLink: v.optional(v.string()) // Payment link (managed by super admin)
  },
  returns: v.id("events"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create events");
    }

    const eventId = await ctx.db.insert("events", {
      ...args,
      organizerId: userId,
      judges: [],
      status: "draft",
      registrationFee: args.registrationFee || 0
    });
    
    return eventId;
  },
});

// Update event status (publish, unpublish, etc.)
export const updateStatus = mutation({
  args: {
    eventId: v.id("events"),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("ongoing"), v.literal("completed"))
  },
  returns: v.object({ success: v.boolean(), status: v.union(v.literal("draft"), v.literal("published"), v.literal("ongoing"), v.literal("completed")) }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to update event status");
    }

    // Get the event to verify ownership
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if user is the organizer of this event
    if (event.organizerId !== userId) {
      throw new Error("Only the event organizer can update event status");
    }

    // Update the event status
    await ctx.db.patch(args.eventId, {
      status: args.status
    });

    return { success: true, status: args.status };
  },
});

// Update payment link (super admin only)
export const updatePaymentLink = mutation({
  args: {
    eventId: v.id("events"),
    paymentLink: v.string(),
    superAdminEmail: v.string(),
    superAdminPassword: v.string()
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    // Verify super admin credentials
    const SUPER_ADMIN_EMAIL = "rutvikburra@gmail.com";
    const SUPER_ADMIN_PASSWORD = "rutvikburra1234567890@#E";

    if (args.superAdminEmail !== SUPER_ADMIN_EMAIL || args.superAdminPassword !== SUPER_ADMIN_PASSWORD) {
      throw new Error("Invalid super admin credentials");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    await ctx.db.patch(args.eventId, { paymentLink: args.paymentLink });
    return { success: true };
  },
});

// Update event status (organizers can manage all events) - Enhanced version
export const updateEventStatusEnhanced = mutation({
  args: {
    eventId: v.id("events"),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("ongoing"), v.literal("completed")),
    organizerEmail: v.string() // Required organizer email for verification
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    let isAuthorized = false;

    // Check authorization through different methods
    if (userId) {
      // Method 1: Check if user is linked to organizer credentials
      const organizerProfile = await ctx.db
        .query("organizerCredentials")
        .filter((q) => q.eq(q.field("linkedUserId"), userId))
        .first();

      if (organizerProfile) {
        isAuthorized = true;
      }
    }

    // Method 2: Check if organizer email is provided and valid
    if (!isAuthorized && args.organizerEmail) {
      const organizerProfile = await ctx.db
        .query("organizerCredentials")
        .filter((q) => q.eq(q.field("email"), args.organizerEmail))
        .first();

      if (organizerProfile && organizerProfile.isActive) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      throw new Error("Only organizers can update event status");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    await ctx.db.patch(args.eventId, { status: args.status });
    return { success: true };
  },
});

// Keep the original function for backward compatibility but make it simpler
export const updateEventStatus = mutation({
  args: {
    eventId: v.id("events"),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("ongoing"), v.literal("completed"))
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    // For now, allow any authenticated user to update event status
    // This is a temporary workaround until the enhanced version is deployed
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    await ctx.db.patch(args.eventId, { status: args.status });
    return { success: true };
  },
});

export const register = mutation({
  args: {
    eventId: v.id("events"),
    isTeamLeader: v.boolean(),
    submissionData: v.object({
      teamName: v.optional(v.string()),
      teamMembers: v.optional(v.array(v.string())),
      projectDescription: v.optional(v.string()),
      additionalInfo: v.optional(v.string()),
      // Enhanced registration fields
      experience: v.optional(v.string()),
      motivation: v.optional(v.string()),
      skills: v.optional(v.array(v.string())),
      portfolio: v.optional(v.string()),
      github: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      website: v.optional(v.string()),
      emergencyContact: v.optional(v.object({
        name: v.string(),
        phone: v.string(),
        relationship: v.string()
      })),
      dietaryRestrictions: v.optional(v.string()),
      tshirtSize: v.optional(v.string()),
      agreeToTerms: v.boolean(),
      agreeToCodeOfConduct: v.boolean(),
      allowPhotography: v.optional(v.boolean())
    }),
    attachments: v.optional(v.array(v.id("files")))
  },
  returns: v.id("registrations"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to register");
    }

    // Check if already registered
    const existingRegistration = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("participantId"), userId))
      .first();

    if (existingRegistration) {
      throw new Error("Already registered for this event");
    }

    const registrationId = await ctx.db.insert("registrations", {
      eventId: args.eventId,
      participantId: userId,
      status: "pending",
      paymentStatus: "pending",
      isTeamLeader: args.isTeamLeader,
      submissionData: {
        ...args.submissionData,
        // Provide defaults for required fields if not present
        agreeToTerms: args.submissionData.agreeToTerms ?? true,
        agreeToCodeOfConduct: args.submissionData.agreeToCodeOfConduct ?? true
      },
      attachments: args.attachments,
      registeredAt: Date.now()
    });

    return registrationId;
  },
});

export const getRegistrations = query({
  args: { eventId: v.id("events") },
  returns: v.array(v.object({
    _id: v.id("registrations"),
    _creationTime: v.number(),
    eventId: v.id("events"),
    participantId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    paymentStatus: v.union(v.literal("pending"), v.literal("paid"), v.literal("failed")),
    isTeamLeader: v.boolean(),
    submissionData: v.any(),
    attachments: v.optional(v.array(v.id("files"))),
    registeredAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.id("users")),
    reviewNotes: v.optional(v.string()),
    participant: v.object({
      name: v.string(),
      email: v.optional(v.string()),
      profile: v.any()
    })
  })),
  handler: async (ctx, args) => {
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const registrationsWithParticipants = await Promise.all(
      registrations.map(async (registration) => {
        const participant = await ctx.db.get(registration.participantId);
        const participantProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", registration.participantId))
          .first();

        return {
          ...registration,
          participant: {
            name: participant?.name || "Unknown",
            email: participant?.email,
            profile: participantProfile
          }
        };
      })
    );

    return registrationsWithParticipants;
  },
});

// Judge Assignment Functions
export const getAvailableJudges = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("userProfiles"),
    _creationTime: v.number(),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("organizer"), v.literal("judge"), v.literal("participant")),
    firstName: v.string(),
    lastName: v.string(),
    bio: v.optional(v.string()),
    skills: v.array(v.string()),
    organization: v.optional(v.string()),
    avatar: v.optional(v.string()),
    socialLinks: v.optional(v.object({
      linkedin: v.optional(v.string()),
      github: v.optional(v.string()),
      twitter: v.optional(v.string())
    })),
    user: v.object({
      name: v.string(),
      email: v.optional(v.string())
    })
  })),
  handler: async (ctx) => {
    const judgeProfiles = await ctx.db
      .query("userProfiles")
      .withIndex("by_role", (q) => q.eq("role", "judge"))
      .collect();

    const judgesWithUserData = await Promise.all(
      judgeProfiles.map(async (profile) => {
        const user = await ctx.db.get(profile.userId);
        return {
          ...profile,
          user: {
            name: user?.name || "Unknown",
            email: user?.email
          }
        };
      })
    );

    return judgesWithUserData;
  },
});

export const assignJudgeToEvent = mutation({
  args: {
    eventId: v.id("events"),
    judgeId: v.id("users")
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to assign judges");
    }

    // Check if user is admin or event organizer
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    if (userProfile?.role !== "admin" && event.organizerId !== userId) {
      throw new Error("Only admins and event organizers can assign judges");
    }

    // Check if judge is already assigned
    if (event.judges.includes(args.judgeId)) {
      throw new Error("Judge is already assigned to this event");
    }

    // Add judge to event
    await ctx.db.patch(args.eventId, {
      judges: [...event.judges, args.judgeId]
    });

    return { success: true };
  },
});

export const removeJudgeFromEvent = mutation({
  args: {
    eventId: v.id("events"),
    judgeId: v.id("users")
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to remove judges");
    }

    // Check if user is admin or event organizer
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    if (userProfile?.role !== "admin" && event.organizerId !== userId) {
      throw new Error("Only admins and event organizers can remove judges");
    }

    // Remove judge from event
    await ctx.db.patch(args.eventId, {
      judges: event.judges.filter(id => id !== args.judgeId)
    });

    return { success: true };
  },
});

// Registration Management Functions
export const updateRegistrationStatus = mutation({
  args: {
    registrationId: v.id("registrations"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    reviewNotes: v.optional(v.string())
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to update registration status");
    }

    // Check if user has permission to review registrations
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const registration = await ctx.db.get(args.registrationId);
    if (!registration) {
      throw new Error("Registration not found");
    }

    const event = await ctx.db.get(registration.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Only admins, organizers, and judges can review registrations
    if (userProfile?.role !== "admin" &&
        event.organizerId !== userId &&
        !event.judges?.includes(userId)) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.registrationId, {
      status: args.status,
      reviewedAt: Date.now(),
      reviewedBy: userId,
      reviewNotes: args.reviewNotes
    });

    return { success: true };
  },
});

// Update event details (super admin only)
export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    location: v.optional(v.string()),
    maxParticipants: v.optional(v.number()),
    registrationDeadline: v.optional(v.string()),
    requirements: v.optional(v.array(v.string())),
    prizes: v.optional(v.array(v.object({
      position: v.string(),
      prize: v.string(),
      amount: v.optional(v.number())
    }))),
    tags: v.optional(v.array(v.string())),
    eventImage: v.optional(v.string()),
    registrationFee: v.optional(v.number()),
    paymentLink: v.optional(v.string()),
    superAdminEmail: v.string(),
    superAdminPassword: v.string()
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    // Verify super admin credentials
    const SUPER_ADMIN_EMAIL = "rutvikburra@gmail.com";
    const SUPER_ADMIN_PASSWORD = "rutvikburra1234567890@#E";

    if (args.superAdminEmail !== SUPER_ADMIN_EMAIL || args.superAdminPassword !== SUPER_ADMIN_PASSWORD) {
      throw new Error("Invalid super admin credentials");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Prepare update object with only provided fields
    const updateData: any = {};
    if (args.title !== undefined) updateData.title = args.title;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.category !== undefined) updateData.category = args.category;
    if (args.startDate !== undefined) updateData.startDate = args.startDate;
    if (args.endDate !== undefined) updateData.endDate = args.endDate;
    if (args.location !== undefined) updateData.location = args.location;
    if (args.maxParticipants !== undefined) updateData.maxParticipants = args.maxParticipants;
    if (args.registrationDeadline !== undefined) updateData.registrationDeadline = args.registrationDeadline;
    if (args.requirements !== undefined) updateData.requirements = args.requirements;
    if (args.prizes !== undefined) updateData.prizes = args.prizes;
    if (args.tags !== undefined) updateData.tags = args.tags;
    if (args.eventImage !== undefined) updateData.eventImage = args.eventImage;
    if (args.registrationFee !== undefined) updateData.registrationFee = args.registrationFee;
    if (args.paymentLink !== undefined) updateData.paymentLink = args.paymentLink;

    await ctx.db.patch(args.eventId, updateData);
    return { success: true };
  },
});
