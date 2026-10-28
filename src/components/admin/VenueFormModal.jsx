import React, { useState, useEffect } from 'react'
import { X, Building, CheckCircle2, AlertCircle } from 'lucide-react'
import { DEPARTMENTS_LIST, VENUE_TYPES_LIST, BUILDINGS_LIST } from './mockAdminData'

const COMMON_FEATURES = [
  'Overhead Projector',
  'Public Address Mic',
  'Air Conditioned',
  'Smart Interactive Screen',
  'Sound System',
  'LAN Port',
  'Document Camera',
  'Whiteboard',
  'Dual Podium',
  'WiFi 6 Access Point',
  'Surround Sound',
  'Green Board',
  'Tiered Seating',
  'Stage Lighting'
]

export default function VenueFormModal({
  isOpen,
  onClose,
  onSubmit,
  existingVenues = [],
  venueToEdit = null
}) {
  const isEditing = Boolean(venueToEdit)

  const [form, setForm] = useState({
    code: '',
    name: '',
    department: DEPARTMENTS_LIST[0],
    building: BUILDINGS_LIST[0],
    type: VENUE_TYPES_LIST[0],
    capacity: 60,
    benches: 30,
    isActive: true,
    status: 'Available',
    description: '',
    features: ['Overhead Projector', 'Whiteboard']
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  useEffect(() => {
    if (venueToEdit) {
      setForm({
        code: venueToEdit.code || '',
        name: venueToEdit.name || '',
        department: venueToEdit.department || DEPARTMENTS_LIST[0],
        building: venueToEdit.building || BUILDINGS_LIST[0],
        type: venueToEdit.type || VENUE_TYPES_LIST[0],
        capacity: venueToEdit.capacity || 60,
        benches: venueToEdit.benches || Math.round((venueToEdit.capacity || 60) / 2),
        isActive: venueToEdit.isActive !== false,
        status: venueToEdit.status || 'Available',
        description: venueToEdit.description || '',
        features: venueToEdit.features || ['Overhead Projector', 'Whiteboard']
      })
    } else {
      setForm({
        code: '',
        name: '',
        department: DEPARTMENTS_LIST[0],
        building: BUILDINGS_LIST[0],
        type: VENUE_TYPES_LIST[0],
        capacity: 60,
        benches: 30,
        isActive: true,
        status: 'Available',
        description: '',
        features: ['Overhead Projector', 'Whiteboard']
      })
    }
    setErrors({})
    setTouched({})
  }, [venueToEdit, isOpen])

  if (!isOpen) return null

  const validate = (currentForm = form) => {
    const errs = {}

    if (!currentForm.code.trim()) {
      errs.code = 'Venue code/identifier is required (e.g. SC06, ND01).'
    } else {
      const isDuplicateCode = existingVenues.some((v) => {
        if (isEditing && v.id === venueToEdit.id) return false
        return (v.code || '').trim().toLowerCase() === currentForm.code.trim().toLowerCase()
      })
      if (isDuplicateCode) {
        errs.code = `A venue with identifier '${currentForm.code.trim()}' already exists.`
      }
    }

    if (!currentForm.name.trim()) {
      errs.name = 'Official venue name is required.'
    } else {
      const isDuplicateName = existingVenues.some((v) => {
        if (isEditing && v.id === venueToEdit.id) return false
        return (v.name || '').trim().toLowerCase() === currentForm.name.trim().toLowerCase()
      })
      if (isDuplicateName) {
        errs.name = `A venue named '${currentForm.name.trim()}' already exists.`
      }
    }

    if (!currentForm.capacity || Number(currentForm.capacity) <= 0) {
      errs.capacity = 'Capacity must be a positive number greater than 0.'
    }

    if (!currentForm.benches || Number(currentForm.benches) <= 0) {
      errs.benches = 'Benches count must be a positive number.'
    }

    return errs
  }

  const handleChange = (field, value) => {
    const nextForm = { ...form, [field]: value }

    // If benches changes, automatically suggest 2x capacity unless manually edited
    if (field === 'benches') {
      const parsedBenches = Number(value) || 0
      nextForm.capacity = parsedBenches * 2
    }

    setForm(nextForm)

    if (touched[field]) {
      const errs = validate(nextForm)
      setErrors(errs)
    }
  }

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors(validate())
  }

  const handleToggleFeature = (feat) => {
    setForm((prev) => {
      const exists = prev.features.includes(feat)
      const nextFeatures = exists
        ? prev.features.filter((f) => f !== feat)
        : [...prev.features, feat]
      return { ...prev, features: nextFeatures }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched({
      code: true,
      name: true,
      capacity: true,
      benches: true
    })

    const validationErrors = validate()
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    const payload = {
      ...(venueToEdit || {}),
      id: venueToEdit ? venueToEdit.id : `VN-${Date.now().toString().slice(-4)}`,
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      department: form.department,
      building: form.building,
      type: form.type,
      capacity: Number(form.capacity),
      benches: Number(form.benches),
      isActive: Boolean(form.isActive),
      status: form.status,
      description: form.description.trim(),
      features: form.features,
      image: venueToEdit?.image || '/coep_building.png'
    }

    onSubmit(payload)
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="venue-form-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 my-8 text-slate-900 dark:text-slate-100"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 id="venue-form-title" className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                {isEditing ? 'Edit Venue Specification' : 'Add New Campus Venue'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing ? `Modifying space: ${venueToEdit.code}` : 'Register a classroom, drawing hall, or seminar space in LOCUS.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Code and Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Venue Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => handleChange('code', e.target.value)}
                onBlur={() => handleBlur('code')}
                placeholder="e.g. SC06, ND01"
                className={`w-full h-10 px-3 rounded-xl border text-xs font-semibold uppercase outline-none transition-all ${
                  errors.code
                    ? 'border-red-400 bg-red-50/30 dark:bg-red-950/20 text-red-700 dark:text-red-300'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800'
                }`}
              />
              {errors.code && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.code}</span>
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Official Venue Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="e.g. North Drawing Hall (ND01)"
                className={`w-full h-10 px-3 rounded-xl border text-xs font-semibold outline-none transition-all ${
                  errors.name
                    ? 'border-red-400 bg-red-50/30 dark:bg-red-950/20 text-red-700 dark:text-red-300'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800'
                }`}
              />
              {errors.name && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Department and Building */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Managing Department <span className="text-red-500">*</span>
              </label>
              <select
                value={form.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
              >
                {DEPARTMENTS_LIST.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Campus Building / Complex <span className="text-red-500">*</span>
              </label>
              <select
                value={form.building}
                onChange={(e) => handleChange('building', e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
              >
                {BUILDINGS_LIST.map((bldg) => (
                  <option key={bldg} value={bldg}>
                    {bldg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Venue Type, Capacity, and Benches */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Venue Type <span className="text-red-500">*</span>
              </label>
              <select
                value={form.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
              >
                {VENUE_TYPES_LIST.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Benches Count <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={form.benches}
                onChange={(e) => handleChange('benches', e.target.value)}
                onBlur={() => handleBlur('benches')}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Seating Capacity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) => handleChange('capacity', e.target.value)}
                onBlur={() => handleBlur('capacity')}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 4: Active Status & Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Active Status</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {form.isActive ? 'Visible in campus booking catalog' : 'Deactivated / Hidden from bookings'}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Availability Status <span className="text-red-500">*</span>
              </label>
              <select
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Available">Available (Ready for Booking)</option>
                <option value="Occupied">Occupied (Currently in use)</option>
                <option value="Under Maintenance">Under Maintenance (Temporarily offline)</option>
                <option value="Blocked">Blocked (Administrative hold)</option>
              </select>
            </div>
          </div>

          {/* Row 5: Description */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Venue Notes & Description (Optional)
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="e.g. Equipped with high-speed WiFi, smart interactive whiteboard, and podium microphone."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Row 6: Facilities & Equipment checklist */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Installed Equipment & Features
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
              {COMMON_FEATURES.map((feat) => {
                const isSelected = form.features.includes(feat)
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => handleToggleFeature(feat)}
                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <span className="truncate">{feat}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Register Venue'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

