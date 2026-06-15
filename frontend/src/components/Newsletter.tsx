'use client';

import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlinePaperAirplane } from 'react-icons/hi';
import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <section className="py-16 lg:py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 to-stone-800 px-6 py-12 lg:px-16 lg:py-16 max-w-5xl mx-auto"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.05)_0%,_transparent_50%)]" />
        <div className="relative text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <HiOutlineMail size={20} className="text-white" />
          </div>
          <h3 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Join the OUTFITY Club</h3>
          <p className="mt-3 text-sm text-stone-400">Subscribe for exclusive access to new drops, early sale access, and style inspiration.</p>
          <form onSubmit={handleSubmit} className="mt-6 flex items-center gap-2 max-w-sm mx-auto">
            <div className="relative flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 bg-white/10 border border-stone-700 rounded-full text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-white text-stone-900 rounded-full text-sm font-medium hover:bg-stone-100 transition-colors shrink-0"
            >
              {subscribed ? 'Subscribed!' : 'Subscribe'}
            </button>
          </form>
        </div>
      </motion.div>
    </section>
  );
}
