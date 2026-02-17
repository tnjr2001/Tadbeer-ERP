
import React, { useState, useEffect } from 'react';
import { TRANSLATIONS } from '../constants';

interface AuthProps {
  onLogin: () => void;
}

interface RegisteredUser {
  email: string;
  password: string;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => {
    const saved = localStorage.getItem('tadbier_registered_users');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('tadbier_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSuccessMessage('');

    if (isLogin) {
      const existingUser = registeredUsers.find(u => u.email === formData.email);
      if (!existingUser) {
        setAuthError('الحساب غير موجود. يرجى إنشاء حساب أولاً.');
        return;
      }
      if (existingUser.password !== formData.password) {
        setAuthError('كلمة المرور غير صحيحة.');
        return;
      }
      onLogin();
    } else {
      if (formData.password !== formData.confirmPassword) {
        setAuthError('كلمات المرور غير متطابقة.');
        return;
      }
      
      const userExists = registeredUsers.some(u => u.email === formData.email);
      if (userExists) {
        setAuthError('هذا البريد الإلكتروني مسجل بالفعل.');
        return;
      }

      const newUser = { email: formData.email, password: formData.password };
      setRegisteredUsers([...registeredUsers, newUser]);
      
      setSuccessMessage(`تم إنشاء الحساب بنجاح! تم إرسال رسالة تأكيد إلى بريدك الإلكتروني: ${formData.email}. يرجى التحقق من بريدك لتفعيل الحساب.`);
      setFormData({ ...formData, password: '', confirmPassword: '' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-cairo" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8 text-center">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200 mb-2">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Tadbeer</h1>
            <span className="text-xl font-bold text-blue-600">تدبير</span>
          </div>
          
          <h2 className="text-xl font-bold text-slate-700 mb-2">
            {isLogin ? TRANSLATIONS.login : TRANSLATIONS.createAccount}
          </h2>

          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2 text-right">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              {authError}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-xl text-sm mb-4 text-right leading-relaxed">
              <div className="flex items-center gap-2 font-bold mb-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                تم بنجاح
              </div>
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-right">
            <div>
              <label className="block text-sm font-black text-slate-700 mb-1">{TRANSLATIONS.email}</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition bg-slate-50 focus:bg-white text-black font-bold"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-black text-slate-700 mb-1">{TRANSLATIONS.phone}</label>
                <input 
                  type="tel" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition bg-slate-50 focus:bg-white text-black font-bold"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-black text-slate-700 mb-1">{TRANSLATIONS.password}</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition bg-slate-50 focus:bg-white text-black font-bold"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-black text-slate-700 mb-1">{TRANSLATIONS.confirmPassword}</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition bg-slate-50 focus:bg-white text-black font-bold"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                />
              </div>
            )}

            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100 mt-6 text-lg">
              {isLogin ? TRANSLATIONS.login : TRANSLATIONS.createAccount}
            </button>
          </form>

          <div className="mt-8">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setAuthError('');
                setSuccessMessage('');
              }}
              className="text-blue-600 font-black hover:underline transition-colors"
            >
              {isLogin ? 'لا تملك حساباً؟ أنشئ حساباً جديداً' : 'لديك حساب بالفعل؟ سجل دخولك'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
