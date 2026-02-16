

import React, { useState, useEffect } from 'react';
import { 
  Plus, Download, Eye, Edit, Trash2, CheckCircle, XCircle, X, Phone 
} from 'lucide-react';
import { createParticipant, deleteParticipant, generatdPdf, getParticipants, updateParticipant } from '../api/api';
import { toast } from 'react-toastify';

// --- CREATE MODAL COMPONENT (New) ---
const CreateModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({ name: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '' }); 
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required!");
      return;
    }
    setLoading(true);
    await onCreate({ name: formData.name.trim() });
    setLoading(false);
    setFormData({ name: '' }); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Add New Participant</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            {loading ? 'Creating...' : 'Create Participant'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- DELETE MODAL COMPONENT ---
const DeleteModal = ({ isOpen, onClose, onConfirm, participantName }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Delete Participant</h3>
          <p className="text-sm text-gray-500 mt-2">
            Are you sure you want to delete <strong>{participantName}</strong>?
          </p>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
          <button onClick={onConfirm} className="w-full inline-flex justify-center rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 sm:w-auto">
            Delete
          </button>
          <button onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// --- EDIT MODAL COMPONENT ---
const EditModal = ({ isOpen, onClose, onSave, participant }) => {
  const [formData, setFormData] = useState({ name: "", checkedIn: false });

  useEffect(() => {
    if (participant) {
      setFormData({
        name: participant.name || "",
        checkedIn: participant.checkedIn || false
      });
    }
  }, [participant]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Edit Participant</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.checkedIn ? "In" : "Out"}
              onChange={(e) => setFormData({ ...formData, checkedIn: e.target.value === "In" })}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              <option value="In">Checked In</option>
              <option value="Out">Not Checked In</option>
            </select>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50">Cancel</button>
          <button onClick={() => onSave(formData)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD ---
const AdminDashboard = () => {
  const [participants, setParticipants] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false); 
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [generatingPdfIds, setGeneratingPdfIds] = useState({});
  const [checkedInParticipants, setCheckedInParticipants] = useState(0);
  const [notCheckedInParticipants, setNotCheckedInParticipants] = useState(0);
  
  // Sorting & Filtering States
  const [sortOrder, setSortOrder] = useState('oldest');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const data = await getParticipants();
        setCheckedInParticipants(data.checkedInParticipants);
        setNotCheckedInParticipants(data.notCheckedInParticipants);
        setParticipants(data.participantsList); 
      } catch (err) {
        console.error("Failed to fetch participants:", err);
        toast.error("Failed to load participants");
      } 
    };
    fetchParticipants();
  }, []);

  const handleDownloadPdf = async (participantId) => {
    try {
      setGeneratingPdfIds(prev => ({ ...prev, [participantId]: true }));
      await generatdPdf(participantId);
    } catch (err) {
      console.error("Failed to download PDF:", err);  
    } finally {
      setGeneratingPdfIds(prev => ({ ...prev, [participantId]: false }));
    }
  };

  const handleCreate = async (newUserData) => {
    try {
      const response = await createParticipant(newUserData);
      setParticipants(prev => [...prev, response.participant]);
      setIsCreateOpen(false);
      toast.success("Participant created successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create participant");
    }
  };

  const handleEditClick = (user) => { setSelectedUser(user); setIsEditOpen(true); };
  const handleDeleteClick = (user) => { setSelectedUser(user); setIsDeleteOpen(true); };
  
  const handleSaveEdit = async (updatedData) => {
    try {
      const response = await updateParticipant(selectedUser._id, updatedData);
      setParticipants(prev => prev.map(p => p._id === selectedUser._id ? response.participant : p));
      setIsEditOpen(false);
      toast.success("Participant updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update participant");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteParticipant(selectedUser._id);
      setParticipants(prev => prev.filter(p => p._id !== selectedUser._id));
      toast.success("Participant deleted successfully");
      setIsDeleteOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete participant");
    }
  };

  const stats = [
    { label: 'Total Participants', value: participants.length, color: 'text-blue-600' },
    { label: 'Checked-in Participants', value: checkedInParticipants, color: 'text-green-600' },
    { label: 'Not Checked-in Participants', value: notCheckedInParticipants, color: 'text-orange-600' },
  ];

  const formatCheckInTime = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleTimeString("en-AE", {
      timeZone: "Asia/Dubai",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true 
    });
  };

  // --- FILTER LOGIC ---
  const filteredParticipants = participants.filter(p => {
    if (statusFilter === 'checkedIn') return p.checkedIn === true;
    if (statusFilter === 'notCheckedIn') return p.checkedIn !== true;
    return true; // 'all'
  });

  // --- SORT LOGIC ---
  const processedParticipants = [...filteredParticipants].sort((a, b) => {
    if (sortOrder === 'newest') {
      if (!a.checkedIn) return 1;
      if (!b.checkedIn) return -1;
      return new Date(b.checkedInAt || 0) - new Date(a.checkedInAt || 0);
    } else if (sortOrder === 'oldest') {
      if (!a.checkedIn) return 1;
      if (!b.checkedIn) return -1;
      return new Date(a.checkedInAt || 0) - new Date(b.checkedInAt || 0);
    } else if (sortOrder === 'name_asc') {
      return (a.name || "").localeCompare(b.name || "");
    } else if (sortOrder === 'name_desc') {
      return (b.name || "").localeCompare(a.name || "");
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans relative">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus size={20} />
            <span>Create Participant</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-32">
              <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wide">{stat.label}</h3>
              <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Table Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">Participants List</h2>
            
            {/* Filters & Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              
              {/* STATUS FILTER */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm font-medium"
              >
                <option value="all">All Participants</option>
                <option value="checkedIn">Checked In</option>
                <option value="notCheckedIn">Not Checked In</option>
              </select>

              {/* SORT DROPDOWN */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm font-medium"
              >
                <option value="oldest">Time (Oldest First)</option>
                <option value="newest">Time (Newest First)</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    {/* BOLDED HEADERS HERE */}
                    <th className="p-4 text-sm font-bold text-gray-900 text-center uppercase tracking-wider">NO</th>
                    <th className="p-4 text-sm font-bold text-gray-900 text-center uppercase tracking-wider">Queue No</th>
                    <th className="p-4 text-sm font-bold text-gray-900 text-center uppercase tracking-wider">Name</th>
                    <th className="p-4 text-sm font-bold text-gray-900 text-center uppercase tracking-wider">Status</th>
                    <th className="p-4 text-sm font-bold text-gray-900 text-center uppercase tracking-wider">Time</th>
                    <th className="p-4 text-sm font-bold text-gray-900 text-center uppercase tracking-wider">QR</th>
                    <th className="p-4 text-sm font-bold text-gray-900 text-right uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {processedParticipants.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-6 text-center text-gray-500">
                        No participants found
                      </td>
                    </tr>
                  ) : (
                    processedParticipants.map((item, idx) => (
                      <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                        
                        {/* 1. VISUAL ROW NUMBER */}
                        <td className="p-4 text-gray-400 text-center text-sm">
                          {idx + 1}
                        </td>

                        {/* 2. QUEUE NUMBER (From Backend) */}
                        <td className="p-4 text-indigo-600 font-bold text-center">
                          {item.checkedIn ? (item.listNumber || "—") : "—"}
                        </td>

                        <td className="p-4 font-medium text-center text-gray-900">
                          {item.name}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                              item.checkedIn
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {item.checkedIn ? <CheckCircle size={12} /> : <XCircle size={12} />}
                            {item.checkedIn ? "In" : "Out"}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600 font-mono text-sm text-center">
                          {formatCheckInTime(item.checkedInAt)}
                        </td>
                        <td className="p-4 flex items-center justify-center ">
                          <button
                            className="text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 text-sm font-medium"
                            onClick={() => handleDownloadPdf(item._id)}
                          >
                            {generatingPdfIds[item._id] === true ? (
                              <span className="ml-2 text-xs text-gray-500">Generating...</span>
                            ) : (
                              <><Download size={16} /> Download</>
                            )}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditClick(item)}
                              className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(item)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* --- RENDER MODALS --- */}
      <CreateModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreate={handleCreate} />
      <EditModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onSave={handleSaveEdit} participant={selectedUser} />
      <DeleteModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleConfirmDelete} participantName={selectedUser?.name} />
    </div>
  );
};

export default AdminDashboard;