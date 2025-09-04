import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  events: defineTable({
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
    eventImage: v.optional(v.string()), // New field for event image
    registrationFee: v.optional(v.number()), // New field for registration fee
    paymentLink: v.optional(v.string()), // New field for payment link
    tags: v.array(v.string())
  })
    .index("by_organizer", ["organizerId"])
    .index("by_status", ["status"])
    .index("by_category", ["category"]),

  registrations: defineTable({
    eventId: v.id("events"),
    participantId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    paymentStatus: v.union(v.literal("pending"), v.literal("paid"), v.literal("failed")),
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
    attachments: v.optional(v.array(v.id("files"))),
    registeredAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.id("users")),
    reviewNotes: v.optional(v.string())
  })
    .index("by_event", ["eventId"])
    .index("by_participant", ["participantId"])
    .index("by_status", ["status"])
    .index("by_reviewed", ["reviewedAt"]),

  scores: defineTable({
    eventId: v.id("events"),
    participantId: v.id("users"),
    judgeId: v.id("users"),
    criteria: v.object({
      innovation: v.number(),
      execution: v.number(),
      presentation: v.number(),
      impact: v.number()
    }),
    totalScore: v.number(),
    feedback: v.optional(v.string()),
    submittedAt: v.number()
  })
    .index("by_event", ["eventId"])
    .index("by_judge", ["judgeId"])
    .index("by_participant", ["participantId"]),

  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(v.literal("info"), v.literal("success"), v.literal("warning"), v.literal("error")),
    read: v.boolean(),
    eventId: v.optional(v.id("events")),
    createdAt: v.number()
  })
    .index("by_user", ["userId"])
    .index("by_read", ["read"]),

  userProfiles: defineTable({
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
    }))
  })
    .index("by_user", ["userId"])
    .index("by_role", ["role"]),

  files: defineTable({
    name: v.string(),
    type: v.string(),
    size: v.number(),
    storageId: v.id("_storage"),
    uploadedBy: v.id("users"),
    uploadedAt: v.number(),
    eventId: v.optional(v.id("events")),
    registrationId: v.optional(v.id("registrations")),
    category: v.union(
      v.literal("resume"),
      v.literal("portfolio"),
      v.literal("project"),
      v.literal("document"),
      v.literal("image"),
      v.literal("other")
    ),
    description: v.optional(v.string()),
    isPublic: v.boolean()
  })
    .index("by_uploader", ["uploadedBy"])
    .index("by_event", ["eventId"])
    .index("by_registration", ["registrationId"])
    .index("by_category", ["category"])
    .index("by_upload_date", ["uploadedAt"]),

  participantRegistrations: defineTable({
    eventId: v.optional(v.id("events")),
    fullName: v.string(),
    collegeUniversity: v.string(),
    departmentYear: v.string(),
    contactNumber: v.string(),
    emailId: v.string(),
    teamName: v.optional(v.string()),
    teamSize: v.number(),
    roleInTeam: v.union(v.literal("Leader"), v.literal("Member")),
    technicalSkills: v.string(),
    previousExperience: v.optional(v.string()),
    agreeToRules: v.boolean(),
    registeredAt: v.number(),
    ipAddress: v.optional(v.string()),
    attachments: v.optional(v.array(v.id("files"))),
    // Store all event-specific data for flexibility and export
    eventSpecificData: v.optional(v.object({
      gender: v.optional(v.string()),
      city: v.optional(v.string()),
      programBranch: v.optional(v.string()),
      currentYear: v.optional(v.string()),
      isTeam: v.optional(v.boolean()),
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
      eventCategory: v.optional(v.string()),
      eventTitle: v.optional(v.string())
    }))
  })
    .index("by_email", ["emailId"])
    .index("by_college", ["collegeUniversity"])
    .index("by_registration_date", ["registeredAt"])
    .index("by_event", ["eventId"]),

  organizerCredentials: defineTable({
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("organizer"), v.literal("judge")),
    firstName: v.string(),
    lastName: v.string(),
    organization: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    createdBy: v.string(), // Super admin email
    lastLogin: v.optional(v.number()),
    passwordResetRequired: v.boolean(),
    linkedUserId: v.optional(v.id("users")) // Link to Convex Auth user
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_active", ["isActive"])
    .index("by_created_by", ["createdBy"])
    .index("by_linked_user", ["linkedUserId"]),

  preQualifierTests: defineTable({
    title: v.string(),
    description: v.string(),
    testLink: v.string(),
    isActive: v.boolean(),
    startDate: v.number(),
    endDate: v.number(),
    duration: v.number(), // Duration in minutes
    instructions: v.string(),
    eligibilityCriteria: v.string(),
    maxAttempts: v.number(),
    passingScore: v.optional(v.number()),
    createdBy: v.string(), // Email of creator (organizer/super admin)
    createdAt: v.number(),
    updatedAt: v.number(),
    eventId: v.optional(v.id("events")), // Link to specific event if applicable
    tags: v.array(v.string()), // Tags for categorization
    difficulty: v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard")),
    totalQuestions: v.optional(v.number()),
    testType: v.union(v.literal("MCQ"), v.literal("Coding"), v.literal("Mixed"))
  })
    .index("by_active", ["isActive"])
    .index("by_created_by", ["createdBy"])
    .index("by_event", ["eventId"])
    .index("by_start_date", ["startDate"])
    .index("by_end_date", ["endDate"])
    .index("by_difficulty", ["difficulty"])
    .index("by_test_type", ["testType"]),

  testAttempts: defineTable({
    testId: v.id("preQualifierTests"),
    participantEmail: v.string(),
    participantName: v.string(),
    attemptNumber: v.number(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    score: v.optional(v.number()),
    status: v.union(v.literal("started"), v.literal("completed"), v.literal("abandoned")),
    timeSpent: v.optional(v.number()), // Time spent in minutes
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    responses: v.optional(v.any()), // Store test responses if needed
    feedback: v.optional(v.string())
  })
    .index("by_test", ["testId"])
    .index("by_participant", ["participantEmail"])
    .index("by_test_participant", ["testId", "participantEmail"])
    .index("by_status", ["status"])
    .index("by_completed_at", ["completedAt"]),

  participatingInstitutions: defineTable({
    name: v.string(),
    type: v.union(v.literal("college"), v.literal("university"), v.literal("company")),
    logo: v.optional(v.string()),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    location: v.optional(v.string()),
    studentCount: v.number(),
    isActive: v.boolean(),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_active", ["isActive"])
    .index("by_order", ["order"])
    .index("by_type_active", ["type", "isActive"]),

  newsUpdates: defineTable({
    title: v.string(),
    subtitle: v.optional(v.string()),
    content: v.string(),
    category: v.union(
      v.literal("Announcement"), 
      v.literal("Event Update"), 
      v.literal("Important Notice"), 
      v.literal("General News")
    ),
    image: v.optional(v.string()),
    videoLink: v.optional(v.string()),
    publishDate: v.number(),
    authorName: v.string(),
    authorEmail: v.string(),
    status: v.union(v.literal("draft"), v.literal("published")),
    attachments: v.optional(v.array(v.id("files"))),
    createdAt: v.number(),
    updatedAt: v.number(),
    views: v.number(),
    featured: v.boolean()
  })
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_author", ["authorEmail"])
    .index("by_publish_date", ["publishDate"])
    .index("by_featured", ["featured"])
    .index("by_status_publish_date", ["status", "publishDate"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
