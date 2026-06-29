import React from "react";
import { Instagram, MessageSquareHeart, Send, Heart } from "lucide-react";

export default function ContactView() {
  const contacts = [
    {
      name: "Jineesh",
      link: "https://www.instagram.com/jineesh__90?igsh=MXAzN3d2ODRkaXliNA%3D%3D",
    },
    {
      name: "Prince",
      link: "https://www.instagram.com/_i__m_prince_?igsh=cGEwNWg4aGxkcGdy",
    }
  ];

  const feedbackLink = "https://docs.google.com/forms/d/e/1FAIpQLSfuqb0svl_E-iap-lTYKNn-b-DV856-om7jWh3hN6BbK3zGdQ/viewform";

  return (
    <div className="page-enter w-full space-y-6 pb-4">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">
          Contact Us
        </h2>
      </div>

      {/* Grid of Founders / Admins */}
      <div className="grid grid-cols-2 gap-4">
        {contacts.map((contact) => (
          <div
            key={contact.name}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/50 flex flex-col items-center justify-center text-center space-y-3"
          >
            <h3 className="text-base font-bold text-slate-800">
              {contact.name}
            </h3>
            
            <a
              href={contact.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2 px-4 rounded-xl w-full text-center hover:bg-slate-100 hover:border-slate-300 transition-all flex items-center justify-center space-x-1.5 text-xs cursor-pointer"
            >
              <Instagram className="w-4 h-4 text-brand-600" />
              <span>Instagram</span>
            </a>
          </div>
        ))}
      </div>

      {/* Feedback Form Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 text-center space-y-4">
        <div className="flex flex-col items-center space-y-1.5">
          <div className="bg-brand-50 p-2.5 rounded-full text-brand-600">
            <MessageSquareHeart className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Feedback
          </h3>
        </div>

        <a
          href={feedbackLink}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-6 rounded-xl w-full text-center shadow-sm transition-all text-sm flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>Give Feedback</span>
        </a>
      </div>
    </div>
  );
}
