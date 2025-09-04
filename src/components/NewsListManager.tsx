import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { NewsManagementModal } from "./NewsManagementModal";

interface NewsListManagerProps {
  authorEmail: string;
  authorName: string;
  isAdmin?: boolean;
}

export function NewsListManager({ authorEmail, authorName, isAdmin = false }: NewsListManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNews, setEditingNews] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "published">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const allNews = useQuery(api.newsUpdates.getAll, isAdmin ? {} : { authorEmail });
  const newsStats = useQuery(api.newsUpdates.getStats, isAdmin ? {} : { authorEmail });
  const deleteNews = useMutation(api.newsUpdates.remove);

  const filteredNews = allNews?.filter(news => {
    const statusMatch = filterStatus === "all" || news.status === filterStatus;
    const categoryMatch = filterCategory === "all" || news.category === filterCategory;
    return statusMatch && categoryMatch;
  }) || [];

  const handleDelete = async (newsId: string) => {
    if (window.confirm("Are you sure you want to delete this news item?")) {
      try {
        await deleteNews({ id: newsId as any });
        toast.success("News deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete news");
        console.error("Error deleting news:", error);
      }
    }
  };

  const handleEdit = (news: any) => {
    setEditingNews(news);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingNews(null);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Announcement": return "bg-supernova-gold/20 text-supernova-gold";
      case "Event Update": return "bg-stellar-blue/20 text-stellar-blue";
      case "Important Notice": return "bg-red-500/20 text-red-400";
      case "General News": return "bg-cosmic-purple/20 text-cosmic-purple";
      default: return "bg-white/20 text-starlight-white";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "published" 
      ? "bg-green-500/20 text-green-400" 
      : "bg-yellow-500/20 text-yellow-400";
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-starlight-white">
            📰 News & Updates Management
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy font-bold rounded-lg hover:scale-105 transform transition-all duration-300"
          >
            + Create News
          </button>
        </div>

        {/* Stats */}
        {newsStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/5 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-supernova-gold">{newsStats.total}</div>
              <div className="text-starlight-white/70 text-sm">Total News</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-400">{newsStats.published}</div>
              <div className="text-starlight-white/70 text-sm">Published</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-400">{newsStats.drafts}</div>
              <div className="text-starlight-white/70 text-sm">Drafts</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-stellar-blue">{newsStats.totalViews}</div>
              <div className="text-starlight-white/70 text-sm">Total Views</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-starlight-white focus:outline-none focus:border-supernova-gold"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-starlight-white focus:outline-none focus:border-supernova-gold"
          >
            <option value="all">All Categories</option>
            <option value="Announcement">Announcement</option>
            <option value="Event Update">Event Update</option>
            <option value="Important Notice">Important Notice</option>
            <option value="General News">General News</option>
          </select>
        </div>
      </div>

      {/* News List */}
      <div className="space-y-4">
        {filteredNews.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-bold text-starlight-white mb-2">No News Found</h3>
            <p className="text-starlight-white/70 mb-4">
              {filterStatus !== "all" || filterCategory !== "all" 
                ? "No news items match your current filters."
                : "Start creating news and updates to keep participants informed!"
              }
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy font-bold rounded-lg hover:scale-105 transform transition-all duration-300"
            >
              Create Your First News
            </button>
          </div>
        ) : (
          filteredNews.map((news) => (
            <div key={news._id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-starlight-white">{news.title}</h3>
                    {news.featured && (
                      <span className="px-2 py-1 bg-supernova-gold/20 text-supernova-gold rounded-full text-xs font-medium">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                  {news.subtitle && (
                    <p className="text-starlight-white/80 mb-2">{news.subtitle}</p>
                  )}
                  <p className="text-starlight-white/70 text-sm line-clamp-2 mb-3">
                    {news.content}
                  </p>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(news)}
                    className="px-3 py-2 bg-stellar-blue/20 text-stellar-blue rounded-lg hover:bg-stellar-blue/30 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(news._id)}
                    className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(news.category)}`}>
                  {news.category}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(news.status)}`}>
                  {news.status}
                </span>
                <span className="text-starlight-white/60">
                  📅 {new Date(news.publishDate).toLocaleDateString()}
                </span>
                <span className="text-starlight-white/60">
                  👁️ {news.views} views
                </span>
                <span className="text-starlight-white/60">
                  ✍️ {news.authorName}
                </span>
              </div>

              {news.image && (
                <div className="mt-4">
                  <img 
                    src={news.image} 
                    alt={news.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <NewsManagementModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        authorEmail={authorEmail}
        authorName={authorName}
        editingNews={editingNews}
      />
    </div>
  );
}