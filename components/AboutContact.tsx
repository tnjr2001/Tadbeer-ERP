
import React from 'react';
import { TRANSLATIONS } from '../constants';

const AboutContact: React.FC<{ page: string }> = ({ page }) => {
  if (page === 'about') {
    return (
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-2xl border border-slate-200 shadow-sm text-center">
        <div className="bg-blue-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-6">من نحن - تدبير</h2>
        <p className="text-slate-600 leading-loose text-lg">
          "تدبير" هو نظام متكامل لإدارة الأعمال مصمم خصيصاً لتلبية احتياجات الشركات الصغيرة والمتوسطة. 
          نهدف إلى تبسيط العمليات اليومية من خلال إدارة المخزون، تتبع الفواتير، وتنظيم علاقات الزبائن والموردين 
          في واجهة عربية سهلة الاستخدام ومدعومة بأحدث تقنيات الذكاء الاصطناعي.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-10 rounded-2xl border border-slate-200 shadow-sm">
      <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">اتصل بنا</h2>
      <div className="space-y-6">
        <ContactItem icon="📧" label="البريد الإلكتروني" value="nekroufjr11@gmail.com" />
        <ContactItem icon="📱" label="الهاتف" value="+213 555 123 456" />
        <div className="flex justify-center gap-6 pt-6">
           <SocialIcon color="bg-blue-600" name="فيسبوك" />
           <SocialIcon color="bg-sky-500" name="لينكد إن" />
           <SocialIcon color="bg-red-500" name="يوتيوب" />
        </div>
      </div>
    </div>
  );
};

const ContactItem = ({ icon, label, value }: any) => (
  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
    <span className="text-2xl">{icon}</span>
    <div>
      <p className="text-xs text-slate-500 font-bold">{label}</p>
      <p className="text-slate-800 font-medium">{value}</p>
    </div>
  </div>
);

const SocialIcon = ({ color, name }: any) => (
  <div className={`${color} text-white px-4 py-2 rounded-lg cursor-pointer hover:opacity-80 transition`}>
    {name}
  </div>
);

export default AboutContact;
