import React from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Event } from '../../types/event';

interface EventRegistrationProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export const EventRegistration = ({ event, isOpen, onClose }: EventRegistrationProps) => {
  const registerParticipant = useMutation(api.participantRegistrations.registerParticipant);
  const [formData, setFormData] = React.useState({
    fullName: '',
    emailId: '',
    contactNumber: '',
    collegeUniversity: '',
    collegeName: '', // Added for API compatibility
    departmentYear: '',
    teamName: '',
    teamSize: 1,
    roleInTeam: 'Leader',
    technicalSkills: '',
    previousExperience: '',
    agreeToRules: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure collegeName is set to the same value as collegeUniversity for API compatibility
      // Convert teamSize to a number for the API
      const submissionData = {
        ...formData,
        collegeName: formData.collegeUniversity,
        teamSize: Number(formData.teamSize),
        agreeToRules: Boolean(formData.agreeToRules)
      };
      
      await registerParticipant({
        eventId: event._id,
        registrationData: submissionData
      });
      
      alert('Registration successful!');
      onClose();
    } catch (error) {
      console.error('Registration failed:', error);
      alert(`Registration failed: ${error}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-xl w-full max-w-2xl shadow-2xl border border-gray-700 animate-slideIn">
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
          <h2 className="text-2xl font-bold text-white">Register for <span className="text-blue-400">{event.title}</span></h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors duration-200 text-2xl focus:outline-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-gray-300 text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-gray-300 text-sm font-medium">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                name="emailId"
                value={formData.emailId}
                onChange={handleChange}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-gray-300 text-sm font-medium">Contact Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Your contact number"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-gray-300 text-sm font-medium">College/University <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="collegeUniversity"
                value={formData.collegeUniversity}
                onChange={handleChange}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Your institution name"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-gray-300 text-sm font-medium">Department/Year <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="departmentYear"
                value={formData.departmentYear}
                onChange={handleChange}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., Computer Science, 3rd Year"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-gray-300 text-sm font-medium">Team Name</label>
              <input
                type="text"
                name="teamName"
                value={formData.teamName}
                onChange={handleChange}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Your team name (if applicable)"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-gray-300 text-sm font-medium">Team Size</label>
              <input
                type="number"
                name="teamSize"
                value={formData.teamSize}
                onChange={handleChange}
                min={1}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Number of team members"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-gray-300 text-sm font-medium">Technical Skills <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="technicalSkills"
                value={formData.technicalSkills}
                onChange={handleChange}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., React, Node.js, Python"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-gray-300 text-sm font-medium">Previous Experience</label>
            <textarea
              name="previousExperience"
              value={formData.previousExperience}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              rows={3}
              placeholder="Briefly describe your relevant experience"
            />
          </div>
          
          <div className="pt-2">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  name="agreeToRules"
                  checked={formData.agreeToRules}
                  onChange={handleChange}
                  className="sr-only"
                  required
                />
                <div className="w-6 h-6 border-2 border-gray-600 rounded-md group-hover:border-blue-400 transition-colors duration-200"></div>
                {formData.agreeToRules && (
                  <div className="absolute inset-0 flex items-center justify-center text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <span className="text-gray-300 text-sm group-hover:text-white transition-colors duration-200">
                I agree to the rules and regulations
              </span>
            </label>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-900 transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Register Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventRegistration;