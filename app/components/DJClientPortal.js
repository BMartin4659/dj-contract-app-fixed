'use client';
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { sendConfirmationEmail, sendReminderEmail } from '@/lib/emailTemplates';

export default function DJClientPortal({ djId }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchClients();
  }, [djId]);

  const fetchClients = async () => {
    if (!djId) return;
    
    try {
      const querySnapshot = await getDocs(collection(db, 'users', djId, 'clients'));
      const clientList = [];
      querySnapshot.forEach((doc) => {
        clientList.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by creation date, newest first
      clientList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setClients(clientList);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (clientId, newStatus) => {
    setActionLoading(prev => ({ ...prev, [clientId]: true }));
    try {
      await updateDoc(doc(db, 'users', djId, 'clients', clientId), {
        status: newStatus,
        updatedAt: Date.now()
      });
      
      // Update local state
      setClients(prev => prev.map(client => 
        client.id === clientId 
          ? { ...client, status: newStatus, updatedAt: Date.now() }
          : client
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [clientId]: false }));
    }
  };

  const handleSendReminder = async (client) => {
    setActionLoading(prev => ({ ...prev, [`reminder_${client.id}`]: true }));
    try {
      await sendReminderEmail(djId, client.email, {
        clientName: client.name,
        eventDate: client.eventDate,
        eventType: client.eventType,
        venueName: client.venueName,
        totalAmount: client.totalAmount
      });
      alert('Reminder email sent successfully!');
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Error sending reminder email. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [`reminder_${client.id}`]: false }));
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [`delete_${clientId}`]: true }));
    try {
      await deleteDoc(doc(db, 'users', djId, 'clients', clientId));
      setClients(prev => prev.filter(client => client.id !== clientId));
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Error deleting client. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete_${clientId}`]: false }));
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border p-4 rounded-md">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Clients</h2>
        <button
          onClick={fetchClients}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No clients yet. Generate a client link to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {clients.map(client => (
            <div key={client.id} className="border border-gray-200 p-4 rounded-md hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">
                      {client.name || 'Unnamed Client'}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                      {client.status || 'pending'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <p><strong>Email:</strong> {client.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {client.phone || 'N/A'}</p>
                    <p><strong>Event Date:</strong> {client.eventDate || 'N/A'}</p>
                    <p><strong>Event Type:</strong> {client.eventType || 'N/A'}</p>
                    <p><strong>Venue:</strong> {client.venueName || 'N/A'}</p>
                    <p><strong>Budget:</strong> {client.budget || 'N/A'}</p>
                    <p><strong>Created:</strong> {formatDate(client.createdAt)}</p>
                    <p><strong>Form Completed:</strong> {client.formCompleted ? 'Yes' : 'No'}</p>
                  </div>

                  {client.specialRequests && (
                    <div className="mt-2">
                      <p className="text-sm"><strong>Special Requests:</strong></p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {client.specialRequests}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <select
                    value={client.status || 'pending'}
                    onChange={(e) => handleStatusUpdate(client.id, e.target.value)}
                    disabled={actionLoading[client.id]}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>

                  {client.email && (
                    <button
                      onClick={() => handleSendReminder(client)}
                      disabled={actionLoading[`reminder_${client.id}`]}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {actionLoading[`reminder_${client.id}`] ? 'Sending...' : 'Send Reminder'}
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    disabled={actionLoading[`delete_${client.id}`]}
                    className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:bg-gray-400"
                  >
                    {actionLoading[`delete_${client.id}`] ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium text-gray-800 mb-2">Client Management Tips:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Update client status as you progress through the booking process</li>
          <li>• Send reminder emails to keep clients engaged</li>
          <li>• Use the special requests section to note important details</li>
          <li>• Completed forms will show all client-provided information</li>
        </ul>
      </div>
    </div>
  );
} 