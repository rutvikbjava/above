import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Create a new news/update
export const create = mutation({
  args: {
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
    featured: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const newsId = await ctx.db.insert("newsUpdates", {
      title: args.title,
      subtitle: args.subtitle,
      content: args.content,
      category: args.category,
      image: args.image,
      videoLink: args.videoLink,
      publishDate: args.publishDate,
      authorName: args.authorName,
      authorEmail: args.authorEmail,
      status: args.status,
      attachments: args.attachments,
      createdAt: now,
      updatedAt: now,
      views: 0,
      featured: args.featured || false
    });

    return newsId;
  },
});

// Update an existing news/update
export const update = mutation({
  args: {
    id: v.id("newsUpdates"),
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("Announcement"), 
      v.literal("Event Update"), 
      v.literal("Important Notice"), 
      v.literal("General News")
    )),
    image: v.optional(v.string()),
    videoLink: v.optional(v.string()),
    publishDate: v.optional(v.number()),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
    attachments: v.optional(v.array(v.id("files"))),
    featured: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now()
    });

    return id;
  },
});

// Delete a news/update
export const remove = mutation({
  args: { id: v.id("newsUpdates") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get all published news/updates for public display
export const getPublished = query({
  args: {
    limit: v.optional(v.number()),
    category: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let newsQuery = ctx.db
      .query("newsUpdates")
      .withIndex("by_status_publish_date", (q) => 
        q.eq("status", "published")
      )
      .order("desc");

    let news;
    if (args.limit) {
      news = await newsQuery.take(args.limit);
    } else {
      news = await newsQuery.collect();
    }

    if (args.category) {
      return news.filter(item => item.category === args.category);
    }

    return news;
  },
});

// Get featured news/updates
export const getFeatured = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let newsQuery = ctx.db
      .query("newsUpdates")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .filter((q) => q.eq(q.field("status"), "published"))
      .order("desc");

    if (args.limit) {
      return await newsQuery.take(args.limit);
    }

    return await newsQuery.collect();
  },
});

// Get all news/updates for admin/organizer management
export const getAll = query({
  args: {
    authorEmail: v.optional(v.string()),
    status: v.optional(v.union(v.literal("draft"), v.literal("published")))
  },
  handler: async (ctx, args) => {
    if (args.authorEmail && args.status) {
      // Both filters provided - need to use one index and filter the other
      return await ctx.db
        .query("newsUpdates")
        .withIndex("by_author", (q) => q.eq("authorEmail", args.authorEmail!))
        .filter((q) => q.eq(q.field("status"), args.status!))
        .order("desc")
        .collect();
    } else if (args.authorEmail) {
      return await ctx.db
        .query("newsUpdates")
        .withIndex("by_author", (q) => q.eq("authorEmail", args.authorEmail!))
        .order("desc")
        .collect();
    } else if (args.status) {
      return await ctx.db
        .query("newsUpdates")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      return await ctx.db
        .query("newsUpdates")
        .order("desc")
        .collect();
    }
  },
});

// Get a single news/update by ID
export const getById = query({
  args: { id: v.id("newsUpdates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Increment view count
export const incrementViews = mutation({
  args: { id: v.id("newsUpdates") },
  handler: async (ctx, args) => {
    const news = await ctx.db.get(args.id);
    if (news) {
      await ctx.db.patch(args.id, {
        views: news.views + 1
      });
    }
  },
});

// Get news statistics
export const getStats = query({
  args: { authorEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let allNews;
    
    if (args.authorEmail) {
      allNews = await ctx.db
        .query("newsUpdates")
        .withIndex("by_author", (q) => q.eq("authorEmail", args.authorEmail!))
        .collect();
    } else {
      allNews = await ctx.db.query("newsUpdates").collect();
    }
    
    const stats = {
      total: allNews.length,
      published: allNews.filter(n => n.status === "published").length,
      drafts: allNews.filter(n => n.status === "draft").length,
      featured: allNews.filter(n => n.featured).length,
      totalViews: allNews.reduce((sum, n) => sum + n.views, 0),
      byCategory: {
        "Announcement": allNews.filter(n => n.category === "Announcement").length,
        "Event Update": allNews.filter(n => n.category === "Event Update").length,
        "Important Notice": allNews.filter(n => n.category === "Important Notice").length,
        "General News": allNews.filter(n => n.category === "General News").length,
      }
    };

    return stats;
  },
});