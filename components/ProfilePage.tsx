
import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants';
import { UserProfile } from '../types';
import { InputField } from './BusinessTable';

interface ProfilePageProps {
  user: UserProfile;
  onSave: (user: UserProfile) => void;
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onSave, onLogout }) => {
  const [formData, setFormData] = useState<UserProfile>(user);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-blue-600 h-32 relative">
          <div className="absolute -bottom-12 right-10">
            <img src="https://picsum.photos/120/120" className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg" alt="Profile" />
          </div>
        </div>
        <div className="p-8 pt-16 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{user.companyName}</h1>
            <p className="text-slate-500">{user.ownerName} | {user.email}</p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-6 py-2 rounded-xl">{TRANSLATIONS.edit}</button>
            ) : (
              <button onClick={handleSave} className="bg-green-600 text-white px-6 py-2 rounded-xl">{TRANSLATIONS.save}</button>
            )}
            <button onClick={onLogout} className="bg-red-50 text-red-600 px-6 py-2 rounded-xl border border-red-100">خروج</button>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100">
          <DisplayField label={TRANSLATIONS.companyName} value={formData.companyName} isEditing={isEditing} onChange={v => setFormData({...formData, companyName: v})} />
          <DisplayField label={TRANSLATIONS.ownerName} value={formData.ownerName} isEditing={isEditing} onChange={v => setFormData({...formData, ownerName: v})} />
          <DisplayField label={TRANSLATIONS.location} value={formData.location} isEditing={isEditing} onChange={v => setFormData({...formData, location: v})} />
          <DisplayField label={TRANSLATIONS.phone} value={formData.phone} isEditing={isEditing} onChange={v => setFormData({...formData, phone: v})} />
          <DisplayField label={TRANSLATIONS.nif} value={formData.nif} isEditing={isEditing} onChange={v => setFormData({...formData, nif: v})} />
          <DisplayField label={TRANSLATIONS.nis} value={formData.nis} isEditing={isEditing} onChange={v => setFormData({...formData, nis: v})} />
          <DisplayField label={TRANSLATIONS.article} value={formData.article} isEditing={isEditing} onChange={v => setFormData({...formData, article: v})} />
          <DisplayField label={TRANSLATIONS.email} value={formData.email} isEditing={isEditing} onChange={v => setFormData({...formData, email: v})} />
        </div>
      </div>
    </div>
  );
};

const DisplayField = ({ label, value, isEditing, onChange }: any) => (
  <div>
    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{label}</label>
    {isEditing ? (
      <input 
        type="text" 
        value={value} 
        onChange={e => onChange(e.target.value)}
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    ) : (
      <p className="text-slate-800 font-medium">{value || '---'}</p>
    )}
  </div>
);

export default ProfilePage;
