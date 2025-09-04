import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { FileUpload } from "./FileUpload";

interface NewsManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorEmail: string;
  authorName: string;
  editingNews?: any;
}

export function NewsManagementModal({ 
  isOpen, 
  onClose, 
  authorEmail, 
  authorName,
  editingNews 
}: NewsManagementModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: "",
    category: "General News" as "Announcement" | "Event Update" | "Important Notice" | "General News",
    image: "",
    videoLink: "",
    publishDate: new Date().toISOString().slice(0, 16),
    status: "draft" as "draft" | "published",
    featured: false,
    attachments: [] as Id<"files">[]
  });

  const createNews = useMutation(api.newsUpdates.create);
  const updateNews = useMutation(api.newsUpdates.update);

  useEffect(() => {
    if (editingNews) {
      setFormData({
        title: editingNews.title || "",
        subtitle: editingNews.subtitle || "",
        content: editingNews.content || "",
        category: editingNews.category || "General News",
        image: editingNews.image || "",
        videoLink: editingNews.videoLink || "",
        publishDate: new Date(editingNews.publishDate).toISOString().slice(0, 16),
        status: editingNews.status || "draft",
        featured: editingNews.featured || false,
        attachments: editingNews.attachments || []
      });
    } else {
      // Reset form for new news
      setFormData({
        title: "",
        subtitle: "",
        content: "",
        category: "General News",
        image: "",
        videoLink: "",
        publishDate: new Date().toISOString().slice(0, 16),
        status: "draft",
        featured: false,
        attachments: []
      });
    }
  }, [editingNews, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const publishDate = new Date(formData.publishDate).getTime();
      
      if (editingNews) {
        await updateNews({
          id: editingNews._id,
          ...formData,
          publishDate
        });
        toast.success("News updated successfully!");
      } else {
        await createNews({
          ...formData,
          publishDate,
          authorName,
          authorEmail
        });
        toast.success("News created successfully!");
      }
      
      onClose();
    } catch (error) {
      toast.error("Failed to save news. Please try again.");
      console.error("Error saving news:", error);
    }
  };

  const handleFileUpload = (fileId: Id<"files">) => {
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, fileId]
    }));
  };

  const removeAttachment = (fileId: Id<"files">) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(id => id !== fileId)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-space-navy/95 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-starlight-white">
              {editingNews ? "Edit News/Update" : "Create News/Update"}
            </h2>
            <button
              onClick={onClose}
              className="text-starlight-white/60 hover:text-starlight-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-starlight-white font-medium mb-2">
              News Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-starlight-white placeholder-starlight-white/50 focus:outline-none focus:border-supernova-gold"
              placeholder="Enter a clear and engaging title"
              required
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-starlight-white font-medium mb-2">
              Subtitle/Tagline
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-starlight-white placeholder-starlight-white/50 focus:outline-none focus:border-supernova-gold"
              placeholder="Optional one-line highlight"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-starlight-white font-medium mb-2">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-starlight-white focus:outline-none focus:border-supernova-gold"
              required
            >
              <option value="General News">General News</option>
              <option value="Announcement">Announcement</option>
              <option value="Event Update">Event Update</option>
              <option value="Important Notice">Important Notice</option>
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-starlight-white font-medium mb-2">
              News Content/Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={8}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-starlight-white placeholder-starlight-white/50 focus:outline-none focus:border-supernova-gold resize-vertical"
              placeholder="Enter detailed information with formatting..."
              required
            />
            <p className="text-starlight-white/60 text-sm mt-1">
              You can use line breaks and basic formatting in your content.
            </p>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-starlight-white font-medium mb-2">
              Image/Media URL
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-starlight-white placeholder-starlight-white/50 focus:outline-none focus:border-supernova-gold"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Video Link */}
          <div>
            <label className="block text-starlight-white font-medium mb-2">
              Video Link (YouTube/Vimeo)
            </label>
            <input
              type="url"
              value={formData.videoLink}
              onChange={(e) => setFormData(prev => ({ ...prev, videoLink: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-starlight-white placeholder-starlight-white/50 focus:outline-none focus:border-supernova-gold"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          {/* Publish Date & Time */}
          <div>
            <label className="block text-starlight-white font-medium mb-2">
              Publish Date & Time <span className="text-red-400">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.publishDate}
              onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-starlight-white focus:outline-none focus:border-supernova-gold"
              required
            />
          </div>

          {/* Status and Featured */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-starlight-white font-medium mb-2">
                Status <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-starlight-white focus:outline-none focus:border-supernova-gold"
                required
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-3 text-starlight-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-5 h-5 text-supernova-gold bg-white/10 border-white/20 rounded focus:ring-supernova-gold focus:ring-2"
                />
                <span>Featured News</span>
              </label>
            </div>
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-starlight-white font-medium mb-2">
              Attachments (PDFs, Documents)
            </label>
            <FileUpload
              onFileUploaded={handleFileUpload}
              acceptedTypes={[".pdf", ".doc", ".docx", ".txt"]}
              maxSize={10 * 1024 * 1024} // 10MB
            />
            {formData.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {formData.attachments.map((fileId, index) => (
                  <div key={index} className="flex items-center justify-between bg-white/5 p-2 rounded">
                    <span className="text-starlight-white/80 text-sm">Attachment {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(fileId)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Author Info */}
          <div className="bg-white/5 p-4 rounded-lg">
            <h3 className="text-starlight-white font-medium mb-2">Author Information</h3>
            <p className="text-starlight-white/70 text-sm">
              <strong>Name:</strong> {authorName}
            </p>
            <p className="text-starlight-white/70 text-sm">
              <strong>Email:</strong> {authorEmail}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-white/20 text-starlight-white rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy font-bold rounded-lg hover:scale-105 transform transition-all duration-300"
            >
              {editingNews ? "Update News" : "Save & Publish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}