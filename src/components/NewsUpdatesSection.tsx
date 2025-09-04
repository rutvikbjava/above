import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function NewsUpdatesSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedNews, setExpandedNews] = useState<string | null>(null);

  const publishedNews = useQuery(api.newsUpdates.getPublished, { limit: 20 });
  const featuredNews = useQuery(api.newsUpdates.getFeatured, { limit: 3 });
  const incrementViews = useMutation(api.newsUpdates.incrementViews);

  const filteredNews = publishedNews?.filter(news => 
    selectedCategory === "all" || news.category === selectedCategory
  ) || [];

  const handleReadMore = async (newsId: string) => {
    if (expandedNews === newsId) {
      setExpandedNews(null);
    } else {
      setExpandedNews(newsId);
      // Increment view count
      try {
        await incrementViews({ id: newsId as any });
      } catch (error) {
        console.error("Error incrementing views:", error);
      }
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Announcement": return "bg-supernova-gold/20 text-supernova-gold border-supernova-gold/30";
      case "Event Update": return "bg-stellar-blue/20 text-stellar-blue border-stellar-blue/30";
      case "Important Notice": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "General News": return "bg-cosmic-purple/20 text-cosmic-purple border-cosmic-purple/30";
      default: return "bg-white/20 text-starlight-white border-white/30";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Announcement": return "📢";
      case "Event Update": return "🎯";
      case "Important Notice": return "⚠️";
      case "General News": return "📰";
      default: return "📝";
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const extractVideoId = (url: string) => {
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    
    if (youtubeMatch) return { platform: 'youtube', id: youtubeMatch[1] };
    if (vimeoMatch) return { platform: 'vimeo', id: vimeoMatch[1] };
    return null;
  };

  if (!publishedNews || publishedNews.length === 0) {
    return (
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-starlight-white mb-8">
            📰 News & Updates
          </h2>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-bold text-starlight-white mb-2">Stay Tuned!</h3>
            <p className="text-starlight-white/70">
              News and updates will be posted here. Check back soon for the latest announcements!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-starlight-white mb-8 sm:mb-12">
          📰 News & Updates
        </h2>

        {/* Featured News */}
        {featuredNews && featuredNews.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-bold text-starlight-white mb-6 flex items-center gap-2">
              <span>⭐</span>
              Featured News
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredNews.map((news) => (
                <div key={news._id} className="bg-gradient-to-br from-supernova-gold/10 to-plasma-orange/10 backdrop-blur-md border border-supernova-gold/30 rounded-2xl p-6 hover:scale-105 transform transition-all duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{getCategoryIcon(news.category)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(news.category)}`}>
                      {news.category}
                    </span>
                    <span className="px-2 py-1 bg-supernova-gold/20 text-supernova-gold rounded-full text-xs font-medium">
                      Featured
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-bold text-starlight-white mb-2">{news.title}</h4>
                  {news.subtitle && (
                    <p className="text-starlight-white/80 text-sm mb-3">{news.subtitle}</p>
                  )}
                  
                  <p className="text-starlight-white/70 text-sm line-clamp-3 mb-4">
                    {news.content}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-starlight-white/60">
                    <span>{formatDate(news.publishDate)}</span>
                    <span>👁️ {news.views}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              selectedCategory === "all"
                ? "bg-supernova-gold text-space-navy"
                : "bg-white/10 text-starlight-white hover:bg-white/20"
            }`}
          >
            All News
          </button>
          {["Announcement", "Event Update", "Important Notice", "General News"].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                selectedCategory === category
                  ? "bg-supernova-gold text-space-navy"
                  : "bg-white/10 text-starlight-white hover:bg-white/20"
              }`}
            >
              <span>{getCategoryIcon(category)}</span>
              {category}
            </button>
          ))}
        </div>

        {/* News List */}
        <div className="space-y-6">
          {filteredNews.map((news) => (
            <div key={news._id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-supernova-gold/30 transition-all duration-300">
              {/* News Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{getCategoryIcon(news.category)}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(news.category)}`}>
                        {news.category}
                      </span>
                      {news.featured && (
                        <span className="px-2 py-1 bg-supernova-gold/20 text-supernova-gold rounded-full text-xs font-medium">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl sm:text-2xl font-bold text-starlight-white mb-2">
                      {news.title}
                    </h3>
                    
                    {news.subtitle && (
                      <p className="text-starlight-white/80 mb-3">{news.subtitle}</p>
                    )}
                  </div>
                  
                  <div className="text-right text-sm text-starlight-white/60 ml-4">
                    <div>{formatDate(news.publishDate)}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span>👁️ {news.views}</span>
                      <span>✍️ {news.authorName}</span>
                    </div>
                  </div>
                </div>

                {/* News Image */}
                {news.image && (
                  <div className="mb-4">
                    <img 
                      src={news.image} 
                      alt={news.title}
                      className="w-full h-48 sm:h-64 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* News Content */}
                <div className="text-starlight-white/70 leading-relaxed">
                  {expandedNews === news._id ? (
                    <div className="whitespace-pre-wrap">{news.content}</div>
                  ) : (
                    <div className="line-clamp-3">{news.content}</div>
                  )}
                </div>

                {/* Video Embed */}
                {news.videoLink && expandedNews === news._id && (
                  <div className="mt-4">
                    {(() => {
                      const videoInfo = extractVideoId(news.videoLink);
                      if (videoInfo?.platform === 'youtube') {
                        return (
                          <div className="aspect-video">
                            <iframe
                              src={`https://www.youtube.com/embed/${videoInfo.id}`}
                              className="w-full h-full rounded-lg"
                              allowFullScreen
                              title={news.title}
                            />
                          </div>
                        );
                      } else if (videoInfo?.platform === 'vimeo') {
                        return (
                          <div className="aspect-video">
                            <iframe
                              src={`https://player.vimeo.com/video/${videoInfo.id}`}
                              className="w-full h-full rounded-lg"
                              allowFullScreen
                              title={news.title}
                            />
                          </div>
                        );
                      } else {
                        return (
                          <a 
                            href={news.videoLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-stellar-blue/20 text-stellar-blue rounded-lg hover:bg-stellar-blue/30 transition-colors"
                          >
                            🎥 Watch Video
                          </a>
                        );
                      }
                    })()}
                  </div>
                )}

                {/* Read More Button */}
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => handleReadMore(news._id)}
                    className="px-4 py-2 bg-stellar-blue/20 text-stellar-blue rounded-lg hover:bg-stellar-blue/30 transition-colors text-sm font-medium"
                  >
                    {expandedNews === news._id ? "Show Less" : "Read More"}
                  </button>
                  
                  {news.attachments && news.attachments.length > 0 && (
                    <div className="text-starlight-white/60 text-sm">
                      📎 {news.attachments.length} attachment(s)
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNews.length === 0 && selectedCategory !== "all" && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-starlight-white mb-2">No News Found</h3>
            <p className="text-starlight-white/70 mb-4">
              No news items found in the "{selectedCategory}" category.
            </p>
            <button
              onClick={() => setSelectedCategory("all")}
              className="px-6 py-3 bg-stellar-blue/20 text-stellar-blue rounded-lg hover:bg-stellar-blue/30 transition-colors"
            >
              View All News
            </button>
          </div>
        )}
      </div>
    </section>
  );
}