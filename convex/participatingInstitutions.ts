import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const createInstitution = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("college"), v.literal("university"), v.literal("company")),
    logo: v.optional(v.string()),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    location: v.optional(v.string()),
    studentCount: v.optional(v.number()),
    isActive: v.boolean(),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("participatingInstitutions", {
      name: args.name,
      type: args.type,
      logo: args.logo,
      description: args.description,
      website: args.website,
      location: args.location,
      studentCount: args.studentCount || 0,
      isActive: args.isActive,
      order: args.order || 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateInstitution = mutation({
  args: {
    id: v.id("participatingInstitutions"),
    name: v.optional(v.string()),
    type: v.optional(v.union(v.literal("college"), v.literal("university"), v.literal("company"))),
    logo: v.optional(v.string()),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    location: v.optional(v.string()),
    studentCount: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const updateData: any = { updatedAt: Date.now() };
    
    if (args.name !== undefined) updateData.name = args.name;
    if (args.type !== undefined) updateData.type = args.type;
    if (args.logo !== undefined) updateData.logo = args.logo;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.website !== undefined) updateData.website = args.website;
    if (args.location !== undefined) updateData.location = args.location;
    if (args.studentCount !== undefined) updateData.studentCount = args.studentCount;
    if (args.isActive !== undefined) updateData.isActive = args.isActive;
    if (args.order !== undefined) updateData.order = args.order;

    return await ctx.db.patch(args.id, updateData);
  },
});

export const deleteInstitution = mutation({
  args: { id: v.id("participatingInstitutions") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const listInstitutions = query({
  args: {
    type: v.optional(v.union(v.literal("college"), v.literal("university"), v.literal("company"))),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("participatingInstitutions");
    
    if (args.type) {
      query = query.filter(q => q.eq(q.field("type"), args.type));
    }
    
    if (args.isActive !== undefined) {
      query = query.filter(q => q.eq(q.field("isActive"), args.isActive));
    }
    
    return await query
      .order("desc")
      .collect();
  },
});

export const getInstitution = query({
  args: { id: v.id("participatingInstitutions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getInstitutionsByType = query({
  args: { type: v.union(v.literal("college"), v.literal("university"), v.literal("company")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("participatingInstitutions")
      .filter(q => q.eq(q.field("type"), args.type))
      .filter(q => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();
  },
});

export const getActiveInstitutions = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("participatingInstitutions")
      .filter(q => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();
  },
});

export const getActiveSponsors = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("participatingInstitutions")
      .filter(q => q.eq(q.field("type"), "company"))
      .filter(q => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();
  },
});
