import React, { useState, useMemo } from 'react'
import {
  Building,
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  Ban,
  Wrench,
  Eye,
  Edit2,
  Trash2,
  RotateCcw,
  X
} from 'lucide-react'
import VenueFormModal from './VenueFormModal'
import VenueDetailsModal from './VenueDetailsModal'
import { DEPARTMENTS_LIST, VENUE_TYPES_LIST } from './mockAdminData'

export default function AdminVenues({
  venues = [],
  bookings = [],
  onAddVenue,
  onUpdateVenue,
  onDeleteVenue,
  onToggleActive,
  onToggleMaintenance,
  onBlockVenue
}) {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [activeFilter, setActiveFilter] = useState('All') // 'All' | 'Active' | 'Inactive'
  const [statusFilter, setStatusFilter] = useState('All') // 'All' | 'Available' | 'Occupied' | 'Under Maintenance' | 'Blocked'
  const [sortField, setSortField] = useState('name') // 'name' | 'capacity' | 'department' | 'status'
  const [sortDirection, setSortDirection] = useState('asc') // 'asc' | 'desc'
  const [isLoading, setIsLoading] = useState(false)

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingVenue, setEditingVenue] = useState(null)
  const [selectedDetailsVenue, setSelectedDetailsVenue] = useState(null)
  const [deletingVenue, setDeletingVenue] = useState(null)

  // Simulate refresh / loading skeleton
  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 400)
  }

  // Handle sorting toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('')
    setDeptFilter('All')
    setTypeFilter('All')
    setActiveFilter('All')
    setStatusFilter('All')
  }

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    deptFilter !== 'All' ||
    typeFilter !== 'All' ||
    activeFilter !== 'All' ||
    statusFilter !== 'All'

  // Filtered and sorted venues list
  const filteredVenues = useMemo(() => {
    return venues
      .filter((v) => {
        // Search filter
        const q = searchTerm.toLowerCase().trim()
        const matchesSearch =
          !q ||
          v.name.toLowerCase().includes(q) ||
          (v.code && v.code.toLowerCase().includes(q)) ||
          v.department.toLowerCase().includes(q) ||
          v.building.toLowerCase().includes(q) ||
          (v.type && v.type.toLowerCase().includes(q))

        // Department filter
        const matchesDept = deptFilter === 'All' || v.department === deptFilter

        // Type filter
        const matchesType = typeFilter === 'All' || v.type === typeFilter

        // Active status filter
        const matchesActive =
          activeFilter === 'All' ||
          (activeFilter === 'Active' && v.isActive) ||
          (activeFilter === 'Inactive' && !v.isActive)

        // Availability status filter
        const matchesStatus = statusFilter === 'All' || v.status === statusFilter

        return matchesSearch && matchesDept && matchesType && matchesActive && matchesStatus
      })
      .sort((a, b) => {
        let valA = a[sortField]
        let valB = b[sortField]

        if (typeof valA === 'string') {
          valA = valA.toLowerCase()
          valB = (valB || '').toLowerCase()
          return sortDirection === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA)
        }

        if (typeof valA === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA
        }

        return 0
      })
  }, [venues, searchTerm, deptFilter, typeFilter, activeFilter, statusFilter, sortField, sortDirection])

  // Count metrics for quick filter badges
  const stats = useMemo(() => {
    const total = venues.length
    const active = venues.filter((v) => v.isActive).length
    const available = venues.filter((v) => v.status === 'Available').length
    const occupied = venues.filter((v) => v.status === 'Occupied').length
    const maintenance = venues.filter((v) => v.status === 'Under Maintenance').length
    const blocked = venues.filter((v) => v.status === 'Blocked').length
    return { total, active, available, occupied, maintenance, blocked }
  }, [venues])

  // Handlers for Add/Edit
  const handleOpenAddModal = () => {
    setEditingVenue(null)
    setIsFormModalOpen(true)
  }

  const handleOpenEditModal = (venue) => {
    setEditingVenue(venue)
    setIsFormModalOpen(true)
  }

  const handleSaveVenueForm = (venueData) => {
    if (editingVenue) {
      onUpdateVenue({ ...venueData, id: editingVenue.id })
    } else {
      onAddVenue(venueData)
    }
    setIsFormModalOpen(false)
    setEditingVenue(null)
  }

  const confirmDelete = () => {
    if (deletingVenue) {
      onDeleteVenue(deletingVenue.id)
      setDeletingVenue(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Banner and Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Campus Venues Directory
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {venues.length} Facilities
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage classrooms, halls, auditoriums, laboratories, and physical spaces across COEP Tech.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer bg-white dark:bg-slate-800 shadow-2xs flex items-center gap-1.5"
              title="Refresh venue states"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Venue</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search venue name, code, dept, building..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Department Filter */}
            <div>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
              >
                <option value="All">All Departments</option>
                {DEPARTMENTS_LIST.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Venue Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
              >
                <option value="All">All Venue Types</option>
                {VENUE_TYPES_LIST.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
              >
                <option value="All">All Availabilities</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
          </div>

          {/* Quick status filter pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Active State:
              </span>
              <button
                type="button"
                onClick={() => setActiveFilter('All')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeFilter === 'All'
                    ? 'bg-slate-900 text-white dark:bg-slate-700 dark:text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All ({venues.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('Active')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeFilter === 'Active'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                }`}
              >
                Active ({stats.active})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('Inactive')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeFilter === 'Inactive'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                }`}
              >
                Inactive ({venues.length - stats.active})
              </button>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset all filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table / Skeletons */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/4 animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : filteredVenues.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-4 text-center">
            <Building className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No venues matched your criteria
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              Try adjusting your search query, clearing active filters, or adding a new venue to the campus directory.
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All Filters</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Your First Venue</span>
              </button>
            )}
          </div>
        ) : (
          /* Responsive Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/75 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">
                    <button
                      type="button"
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 font-bold cursor-pointer"
                    >
                      <span>Venue & Identifier</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort('department')}
                      className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 font-bold cursor-pointer"
                    >
                      <span>Department / Building</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4">Venue Type</th>
                  <th className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort('capacity')}
                      className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 font-bold cursor-pointer"
                    >
                      <span>Seating Capacity</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4 text-center">Active Status</th>
                  <th className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleSort('status')}
                      className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 font-bold cursor-pointer"
                    >
                      <span>Availability</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredVenues.map((venue) => {
                  return (
                    <tr
                      key={venue.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Venue Name & Code */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={venue.image || '/coep_building.png'}
                            alt={venue.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null
                              e.currentTarget.src = '/coep_building.png'
                            }}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white text-xs hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                                onClick={() => setSelectedDetailsVenue(venue)}
                              >
                                {venue.name}
                              </span>
                              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                                {venue.code || venue.id}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs mt-0.5">
                              {venue.features && venue.features.length > 0
                                ? venue.features.slice(0, 3).join(', ') + (venue.features.length > 3 ? '...' : '')
                                : 'Standard seating'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department / Building */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">
                          {venue.department}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {venue.building}
                        </div>
                      </td>

                      {/* Venue Type */}
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                        {venue.type}
                      </td>

                      {/* Seating Capacity */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {venue.capacity} <span className="font-normal text-slate-500 dark:text-slate-400">seats</span>
                        </div>
                        {venue.benches && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {venue.benches} benches
                          </div>
                        )}
                      </td>

                      {/* Active Status Badge */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onToggleActive(venue.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-colors border ${
                            venue.isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                          }`}
                          title={`Click to ${venue.isActive ? 'Deactivate' : 'Activate'}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              venue.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span>{venue.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      {/* Availability Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            venue.status === 'Available'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : venue.status === 'Occupied'
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                              : venue.status === 'Under Maintenance'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {venue.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailsVenue(venue)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors cursor-pointer"
                            title="View venue details & reservations"
                            aria-label={`View details for ${venue.name}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(venue)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-colors cursor-pointer"
                            title="Edit venue metadata"
                            aria-label={`Edit ${venue.name}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onToggleMaintenance(venue.id)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              venue.status === 'Under Maintenance'
                                ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-600 hover:border-amber-300'
                            }`}
                            title={
                              venue.status === 'Under Maintenance'
                                ? 'Clear maintenance flag'
                                : 'Flag for maintenance'
                            }
                            aria-label="Toggle maintenance"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (onBlockVenue) onBlockVenue(venue)
                            }}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              venue.status === 'Blocked'
                                ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-purple-600 hover:border-purple-300'
                            }`}
                            title="Block venue time slots"
                            aria-label="Block venue"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingVenue(venue)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete venue"
                            aria-label={`Delete ${venue.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer with totals */}
        <div className="p-3.5 sm:px-6 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <span>
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredVenues.length}</strong> of{' '}
            <strong className="text-slate-800 dark:text-slate-200">{venues.length}</strong> total spaces
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Available: {stats.available}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Occupied: {stats.occupied}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Maintenance: {stats.maintenance}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Blocked: {stats.blocked}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Add / Edit Venue Modal */}
      <VenueFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setEditingVenue(null)
        }}
        onSave={handleSaveVenueForm}
        venue={editingVenue}
        existingVenues={venues}
      />

      {/* Venue Details Modal */}
      <VenueDetailsModal
        isOpen={!!selectedDetailsVenue}
        onClose={() => setSelectedDetailsVenue(null)}
        venue={selectedDetailsVenue}
        bookings={bookings}
        onEdit={(v) => {
          setSelectedDetailsVenue(null)
          handleOpenEditModal(v)
        }}
        onToggleActive={(id) => onToggleActive(id)}
        onToggleMaintenance={(id) => onToggleMaintenance(id)}
        onBlockVenue={(v) => {
          setSelectedDetailsVenue(null)
          if (onBlockVenue) onBlockVenue(v)
        }}
      />

      {/* Delete Confirmation Modal */}
      {deletingVenue && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4"
            role="alertdialog"
            aria-modal="true"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Remove Venue from LOCUS?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Are you sure you want to remove <strong>{deletingVenue.name}</strong>?
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
              This space will no longer be visible in booking catalogs. Any existing past reservations will remain in audit logs.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingVenue(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

