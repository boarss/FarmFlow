import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, User, MapPin, Phone, LogOut, Edit2, Save, X } from 'lucide-react';

export function UserProfile() {
  const { user, farmer, signOut, updateFarmerProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editData, setEditData] = useState({
    name: farmer?.name || '',
    state: farmer?.state || '',
    lga: farmer?.lga || '',
    farmSize: farmer?.farmSize?.toString() || '',
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      name: farmer?.name || '',
      state: farmer?.state || '',
      lga: farmer?.lga || '',
      farmSize: farmer?.farmSize?.toString() || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      await updateFarmerProfile({
        name: editData.name,
        state: editData.state,
        lga: editData.lga,
        farmSize: parseFloat(editData.farmSize) || undefined,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        await signOut();
      } catch (err) {
        console.error('Sign out error:', err);
      }
    }
  };

  if (!user || !farmer) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{farmer.name}</h2>
                <p className="text-green-100">Farmer Profile</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="p-2 hover:bg-green-500 rounded-lg transition-colors"
              >
                <Edit2 className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Profile Fields */}
          <div className="space-y-4">
            {/* Phone */}
            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-gray-400 mt-1" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <p className="text-gray-900">{user.phone}</p>
              </div>
            </div>

            {/* Name */}
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-gray-400 mt-1" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{farmer.name}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-1" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="State"
                      value={editData.state}
                      onChange={(e) => setEditData({ ...editData, state: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="LGA"
                      value={editData.lga}
                      onChange={(e) => setEditData({ ...editData, lga: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <p className="text-gray-900">
                    {farmer.lga}, {farmer.state}
                  </p>
                )}
              </div>
            </div>

            {/* Farm Size */}
            <div className="flex items-start space-x-3">
              <span className="text-xl mt-1">🌾</span>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Farm Size
                </label>
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={editData.farmSize}
                      onChange={(e) => setEditData({ ...editData, farmSize: e.target.value })}
                      className="block w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <span className="text-gray-600">hectares</span>
                  </div>
                ) : (
                  <p className="text-gray-900">
                    {farmer.farmSize ? `${farmer.farmSize} hectares` : 'Not specified'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing ? (
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5 mr-2" />
                Cancel
              </button>
            </div>
          ) : (
            <div className="pt-4">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Made with Bob