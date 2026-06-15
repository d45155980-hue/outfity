'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineLocationMarker, HiX } from 'react-icons/hi';

interface Address {
  id: string;
  label: string;
  fullName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([
    { id: '1', label: 'Home', fullName: 'Dhruv', address: '123 Main Street, Apt 4B', city: 'Mumbai', state: 'Maharashtra', country: 'India', zipCode: '400001', phone: '+91 99999 99999', isDefault: true },
    { id: '2', label: 'Office', fullName: 'Dhruv', address: '456 Business Park, Suite 200', city: 'Mumbai', state: 'Maharashtra', country: 'India', zipCode: '400050', phone: '+91 88888 88888', isDefault: false },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: '', fullName: '', address: '', city: '', state: '', country: 'India', zipCode: '', phone: '' });

  const openNew = () => {
    setForm({ label: '', fullName: '', address: '', city: '', state: '', country: 'India', zipCode: '', phone: '' });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (addr: Address) => {
    setForm({ label: addr.label, fullName: addr.fullName, address: addr.address, city: addr.city, state: addr.state, country: addr.country, zipCode: addr.zipCode, phone: addr.phone });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.label.trim()) return;
    if (editingId) {
      setAddresses((prev) => prev.map((a) => a.id === editingId ? { ...a, ...form } : a));
    } else {
      setAddresses((prev) => [...prev, { ...form, id: Date.now().toString(), isDefault: prev.length === 0 }]);
    }
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const setDefault = (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Saved Addresses</h2>
          <p className="text-sm text-stone-500 mt-0.5">{addresses.length} address(es) saved</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-full hover:bg-stone-800 transition-colors">
          <HiOutlinePlus size={14} />
          Add New
        </button>
      </div>

      <div className="space-y-3">
        {addresses.map((addr, idx) => (
          <motion.div
            key={addr.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`bg-white border rounded-xl p-5 transition-all ${addr.isDefault ? 'border-stone-900' : 'border-stone-100'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-stone-50 flex items-center justify-center shrink-0">
                  <HiOutlineLocationMarker size={18} className="text-stone-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-stone-900">{addr.label}</p>
                    {addr.isDefault && <span className="text-[10px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">Default</span>}
                  </div>
                  <p className="text-sm text-stone-600 mt-1">{addr.fullName}</p>
                  <p className="text-sm text-stone-500">{addr.address}</p>
                  <p className="text-sm text-stone-500">{addr.city}, {addr.state} - {addr.zipCode}</p>
                  <p className="text-sm text-stone-500">{addr.country}</p>
                  <p className="text-sm text-stone-500 mt-0.5">Phone: {addr.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!addr.isDefault && (
                  <button onClick={() => setDefault(addr.id)} className="px-3 py-1.5 text-[11px] text-stone-500 hover:text-stone-900 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
                    Set Default
                  </button>
                )}
                <button onClick={() => openEdit(addr)} className="p-1.5 text-stone-400 hover:text-stone-900 transition-colors">
                  <HiOutlinePencil size={14} />
                </button>
                <button onClick={() => handleDelete(addr.id)} className="p-1.5 text-stone-400 hover:text-red-500 transition-colors">
                  <HiOutlineTrash size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowForm(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-stone-900">{editingId ? 'Edit Address' : 'Add New Address'}</h3>
                  <button onClick={() => setShowForm(false)}><HiX size={18} className="text-stone-400" /></button>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Label', field: 'label', placeholder: 'Home, Office, etc.' },
                    { label: 'Full Name', field: 'fullName', placeholder: 'John Doe' },
                    { label: 'Address', field: 'address', placeholder: '123 Main Street, Apt 4B' },
                    { label: 'City', field: 'city', placeholder: 'Mumbai' },
                    { label: 'State', field: 'state', placeholder: 'Maharashtra' },
                    { label: 'ZIP Code', field: 'zipCode', placeholder: '400001' },
                    { label: 'Phone', field: 'phone', placeholder: '+91 99999 99999' },
                  ].map(({ label, field, placeholder }) => (
                    <div key={field}>
                      <label className="block text-xs font-medium text-stone-700 mb-1">{label}</label>
                      <input
                        type="text"
                        value={(form as any)[field]}
                        onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Country</label>
                    <input type="text" value={form.country} onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))} className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-stone-200 text-stone-600 text-sm rounded-full hover:bg-stone-50 transition-colors">Cancel</button>
                  <button onClick={handleSave} className="flex-1 py-2.5 bg-stone-900 text-white text-sm rounded-full hover:bg-stone-800 transition-colors">Save</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
