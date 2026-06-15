'use client';

import { motion } from 'framer-motion';

const instagramPosts = [
  { id: '1', gradient: 'bg-gradient-to-br from-pink-400 to-purple-600' },
  { id: '2', gradient: 'bg-gradient-to-br from-blue-400 to-teal-500' },
  { id: '3', gradient: 'bg-gradient-to-br from-orange-400 to-red-500' },
  { id: '4', gradient: 'bg-gradient-to-br from-green-400 to-emerald-600' },
  { id: '5', gradient: 'bg-gradient-to-br from-yellow-400 to-orange-500' },
  { id: '6', gradient: 'bg-gradient-to-br from-violet-400 to-purple-700' },
];

export default function InstagramGallery() {
  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl lg:text-3xl font-bold text-stone-900 tracking-tight">Follow Us @OUTFITY</h2>
          <p className="mt-2 text-sm text-stone-500">Tag us for a chance to be featured</p>
        </motion.div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {instagramPosts.map((post, idx) => (
            <motion.a
              key={post.id}
              href="#"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className={`block aspect-square rounded-xl ${post.gradient} hover:opacity-90 transition-opacity relative overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100">@OUTFITY</span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
