'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ArrowLeft, Trash2, Edit3, X, Check, FolderTree, Tag, Sparkles, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useCategories, AppCategory } from '@/hooks/useCategories'

const EMOJI_PRESETS = ['🛵', '🏍️', '🚗', '⛽', '🛠️', '🍜', '☕', '🛒', '🛍️', '💊', '🏠', '💻', '🎮', '💡', '💰', '📦', '🐾', '✈️']
const COLOR_PRESETS = ['#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F97316', '#EAB308', '#64748B']

export default function CategoriesPage() {
  const { categories, customCategories, addOrUpdateCategory, deleteCategory, loading } = useCategories()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<AppCategory | null>(null)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('📦')
  const [color, setColor] = useState('#10B981')
  const [parentCategory, setParentCategory] = useState<string>('')
  const [budgetBucket, setBudgetBucket] = useState<'needs' | 'wants' | 'savings'>('needs')
  const [isSubcategory, setIsSubcategory] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const openAddModal = (parent?: string) => {
    setEditingCat(null)
    setName('')
    setEmoji('📦')
    setColor('#10B981')
    if (parent) {
      setIsSubcategory(true)
      setParentCategory(parent)
    } else {
      setIsSubcategory(false)
      setParentCategory('')
    }
    setBudgetBucket('needs')
    setError('')
    setModalOpen(true)
  }

  const openEditModal = (cat: AppCategory) => {
    setEditingCat(cat)
    setName(cat.name)
    setEmoji(cat.emoji)
    setColor(cat.color)
    setIsSubcategory(!!cat.parent_category)
    setParentCategory(cat.parent_category || '')
    setBudgetBucket(cat.budget_bucket)
    setError('')
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Nama kategori tidak boleh kosong')
      return
    }

    setSaving(true)
    setError('')
    try {
      await addOrUpdateCategory({
        name: name.trim(),
        emoji,
        color,
        parent_category: isSubcategory && parentCategory ? parentCategory : null,
        budget_bucket: budgetBucket,
      })
      setModalOpen(false)
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan kategori')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (cat: AppCategory) => {
    if (!confirm(`Hapus kategori kustom "${cat.name}"?`)) return
    try {
      await deleteCategory(cat.name, cat.id)
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus')
    }
  }

  // Parent category options (main categories that don't have parents)
  const parentOptions = categories.filter(c => !c.parent_category)

  return (
    <div className="flex flex-col gap-5 pb-12">
      {/* Header */}
      <div className="px-5 pt-8 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="h-10 w-10 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-slate-900 dark:text-slate-50 text-2xl font-black tracking-tight">Kelola Kategori</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Tambah atau sesuaikan kategori & subkategori</p>
          </div>
        </div>

        <button
          onClick={() => openAddModal()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah</span>
        </button>
      </div>

      <div className="px-5 space-y-6">
        {/* Custom Categories Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Kategori Kustom Anda ({customCategories.length})</span>
            </h2>
          </div>

          {customCategories.length === 0 ? (
            <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Belum ada kategori kustom</p>
              <p className="text-[11px] text-slate-400">
                Kamu bisa menambahkan kategori atau subkategori baru (misal: "Bensin Motor" di bawah Transportasi).
              </p>
              <button
                type="button"
                onClick={() => openAddModal()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-200 dark:border-emerald-800/50"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Buat Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {customCategories.map((cat) => (
                <div key={cat.name} className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0">
                      {cat.emoji}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{cat.name}</span>
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        {cat.parent_category ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Sub dari: {cat.parent_category}
                          </span>
                        ) : (
                          <span>Kategori Utama</span>
                        )}
                        <span>•</span>
                        <span className="uppercase text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {cat.budget_bucket}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(cat)}
                      className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit kategori"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat)}
                      className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Hapus kategori"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Default Categories Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FolderTree className="h-3.5 w-3.5" />
              <span>Kategori Bawaan Standar ({categories.filter(c => !c.is_custom).length})</span>
            </h2>
          </div>

          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
            {categories.filter(c => !c.is_custom).map((cat) => (
              <div key={cat.name} className="p-3 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{cat.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">{cat.name}</span>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase">{cat.budget_bucket}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openAddModal(cat.name)}
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Subkategori</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0E1524] rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-50">
                  {editingCat ? 'Edit Kategori' : isSubcategory ? 'Tambah Subkategori' : 'Tambah Kategori'}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nama {isSubcategory ? 'Subkategori' : 'Kategori'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isSubcategory ? 'Contoh: Bensin Motor' : 'Contoh: Hobi & Kreasi'}
                    className="w-full h-11 px-3.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-400 font-medium"
                    required
                    autoFocus
                  />
                </div>

                {/* Subcategory Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isSub"
                    checked={isSubcategory}
                    onChange={(e) => setIsSubcategory(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="isSub" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Jadikan ini sebagai Subkategori
                  </label>
                </div>

                {isSubcategory && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Kategori Induk
                    </label>
                    <select
                      value={parentCategory}
                      onChange={(e) => setParentCategory(e.target.value)}
                      className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100"
                      required={isSubcategory}
                    >
                      <option value="">Pilih Kategori Induk</option>
                      {parentOptions.map(p => (
                        <option key={p.name} value={p.name}>{p.emoji} {p.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Emoji Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Emoji Ikon
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl p-2 rounded-xl bg-slate-100 dark:bg-slate-800">{emoji}</span>
                    <input
                      type="text"
                      value={emoji}
                      onChange={(e) => setEmoji(e.target.value)}
                      className="w-20 h-10 px-2 text-center text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {EMOJI_PRESETS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setEmoji(em)}
                        className={`text-base p-1.5 rounded-lg transition-colors ${emoji === em ? 'bg-emerald-500/20 border border-emerald-500' : 'bg-slate-100 dark:bg-slate-800'}`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Warna Penanda
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setColor(col)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${color === col ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : ''}`}
                        style={{ backgroundColor: col }}
                      >
                        {color === col && <Check className="h-3.5 w-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget Bucket (50/30/20) */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Klasifikasi 50/30/20
                  </label>
                  <select
                    value={budgetBucket}
                    onChange={(e) => setBudgetBucket(e.target.value as any)}
                    className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100"
                  >
                    <option value="needs">Needs (Kebutuhan Pokok - Max 50%)</option>
                    <option value="wants">Wants (Keinginan / Gaya Hidup - Max 30%)</option>
                    <option value="savings">Savings / Investment (Tabungan & Investasi - 20%)</option>
                  </select>
                </div>

                {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>{saving ? 'Menyimpan...' : 'Simpan Kategori'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
