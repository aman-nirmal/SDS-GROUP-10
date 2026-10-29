import React, { useState, useMemo } from 'react'
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Shield,
  GraduationCap,
  Trophy,
  BookOpen,
  ShieldCheck,
  FileText,
  Calendar,
  X,
  Check,
  Eye
} from 'lucide-react'

export default function RoleRequests({
  roleRequests = [],
  onApproveRequest,
  onRejectRequest
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All') // 'All' | 'Pending' | 'Approved' | 'Rejected'
  const [roleFilter, setRoleFilter] = useState('All')

  // Selected request for detail modal
  const [selectedRequest, setSelectedRequest] = useState(null)

  // Modals for approval confirmation and rejection reason
  const [actionConfirm, setActionConfirm] = useState(null) // { type: 'approve' | 'reject', request: {...} }
  const [rejectionReason, setRejectionReason] = useState('')
  const [approvalNotes, setApprovalNotes] = useState('')

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return roleRequests.filter((req) => {
      const q = searchTerm.toLowerCase().trim()
      const matchesSearch =
        !q ||
        req.userName.toLowerCase().includes(q) ||
        req.userEmail.toLowerCase().includes(q) ||
        (req.department && req.department.toLowerCase().includes(q)) ||
        (req.clubName && req.clubName.toLowerCase().includes(q)) ||
        req.justification.toLowerCase().includes(q)

      const matchesStatus = statusFilter === 'All' || req.status === statusFilter
      const matchesRole = roleFilter === 'All' || req.requestedRole === roleFilter

      return matchesSearch && matchesStatus && matchesRole
    })
  }, [roleRequests, searchTerm, statusFilter, roleFilter])

  // Count metrics
  const stats = useMemo(() => {
    const total = roleRequests.length
    const pending = roleRequests.filter((r) => r.status === 'Pending').length
    const approved = roleRequests.filter((r) => r.status === 'Approved').length
    const rejected = roleRequests.filter((r) => r.status === 'Rejected').length
    return { total, pending, approved, rejected }
  }, [roleRequests])

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Administrator':
        return <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
      case 'Faculty':
        return <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
      case 'Club Lead':
        return <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
      case 'Security Guard':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      case 'Student':
      default:
        return <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
    }
  }

  const getRoleBadge = (role) => {
    const icon = getRoleIcon(role)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
        {icon}
        <span>{role}</span>
      </span>
    )
  }

  const handleStartApprove = (req) => {
    setApprovalNotes('')
    setActionConfirm({ type: 'approve', request: req })
  }

  const handleStartReject = (req) => {
    setRejectionReason('')
    setActionConfirm({ type: 'reject', request: req })
  }

  const handleConfirmDecision = () => {
    if (!actionConfirm) return
    const { type, request } = actionConfirm

    if (type === 'approve') {
      onApproveRequest(request.id, approvalNotes)
      if (selectedRequest && selectedRequest.id === request.id) {
        setSelectedRequest((prev) => ({ ...prev, status: 'Approved', reviewedAt: new Date().toISOString().slice(0, 10) }))
      }
    } else if (type === 'reject') {
      onRejectRequest(request.id, rejectionReason || 'Requirements not fulfilled per campus authorization policies.')
      if (selectedRequest && selectedRequest.id === request.id) {
        setSelectedRequest((prev) => ({
          ...prev,
          status: 'Rejected',
          rejectionReason: rejectionReason || 'Requirements not fulfilled per campus authorization policies.',
          reviewedAt: new Date().toISOString().slice(0, 10)
        }))
      }
    }

    setActionConfirm(null)
  }

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Role Elevation Requests
              </h2>
              {stats.pending > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
                  {stats.pending} Pending
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review credential upgrades and permission requests from students, faculty, and student body organizations.
            </p>
          </div>

          {/* Quick status tabs */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('All')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === 'All'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              All ({roleRequests.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Pending')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                statusFilter === 'Pending'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-amber-600'
              }`}
            >
              <span>Pending</span>
              {stats.pending > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
                  {stats.pending}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Approved')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === 'Approved'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
            >
              Approved ({stats.approved})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Rejected')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === 'Rejected'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-rose-600'
              }`}
            >
              Rejected ({stats.rejected})
            </button>
          </div>
        </div>

        {/* Filter Inputs */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user name, email, department, club, or justification..."
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

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
            >
              <option value="All">All Requested Roles</option>
              <option value="Faculty">Faculty</option>
              <option value="Club Lead">Club Lead</option>
              <option value="Administrator">Administrator</option>
              <option value="Security Guard">Security Guard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Listing */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-12 text-center shadow-2xs">
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No role change requests found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {searchTerm || statusFilter !== 'All' || roleFilter !== 'All'
                ? 'Try broadening your search criteria or resetting filters.'
                : 'All incoming role change requests have been reviewed and processed.'}
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isPending = req.status === 'Pending'
            const isApproved = req.status === 'Approved'
            const isRejected = req.status === 'Rejected'

            return (
              <div
                key={req.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all p-4 sm:p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: User details and Role Transition */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {req.userName}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        ({req.userEmail})
                      </span>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                        {req.id}
                      </span>
                    </div>

                    {/* Role Elevation Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                          Current:
                        </span>
                        {getRoleBadge(req.currentRole)}
                      </div>

                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-blue-500 dark:text-blue-400 uppercase font-bold tracking-wider">
                          Requested:
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {getRoleIcon(req.requestedRole)}
                          <span>{req.requestedRole}</span>
                        </span>
                      </div>

                      {(req.department || req.clubName) && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          • {req.clubName ? `Club: ${req.clubName}` : req.department}
                        </span>
                      )}
                    </div>

                    {/* Justification quote */}
                    <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100/60 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 leading-relaxed">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>Applicant Justification</span>
                      </div>
                      <p className="line-clamp-2">{req.justification}</p>
                    </div>

                    {/* Status & Date Metadata */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Submitted: {req.submittedAt}</span>
                      </span>
                      {req.reviewedAt && (
                        <span>
                          • Decision Recorded: {req.reviewedAt}
                        </span>
                      )}
                      {req.rejectionReason && (
                        <span className="text-rose-600 dark:text-rose-400 font-medium">
                          • Reason: {req.rejectionReason}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Status & Decision Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    <div>
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <Clock className="w-3 h-3" />
                          Pending Review
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Approved
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRequest(req)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>

                      {isPending && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStartReject(req)}
                            className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartApprove(req)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Role Change Application
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Reference: <span className="font-mono font-bold">{selectedRequest.id}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
              {/* Applicant Card */}
              <div className="p-4 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {selectedRequest.userName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {selectedRequest.userEmail}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Status
                    </span>
                    <span className="font-bold text-xs">
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Current Role:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{selectedRequest.currentRole}</strong>
                  </div>
                  <div>
                    <span className="text-blue-500 text-[11px] block">Requested Role:</span>
                    <strong className="text-blue-600 dark:text-blue-400">{selectedRequest.requestedRole}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Department / Org:</span>
                    <span className="text-slate-700 dark:text-slate-300">{selectedRequest.department || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Club / Committee:</span>
                    <span className="text-slate-700 dark:text-slate-300">{selectedRequest.clubName || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Justification */}
              <div className="space-y-1.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Detailed Justification & Responsibilities
                </h5>
                <p className="text-xs text-slate-700 dark:text-slate-200 bg-slate-100/60 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedRequest.justification}
                </p>
              </div>

              {/* If Rejected */}
              {selectedRequest.rejectionReason && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Rejection Feedback
                  </span>
                  <p className="text-xs text-rose-700 dark:text-rose-300">
                    {selectedRequest.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-100/60 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>

              {selectedRequest.status === 'Pending' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStartReject(selectedRequest)}
                    className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Reject Application
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartApprove(selectedRequest)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    Approve Elevation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Decision Confirmation Modal (Approve / Reject Dialog) */}
      {actionConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4"
            role="alertdialog"
            aria-modal="true"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  actionConfirm.type === 'approve'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                }`}
              >
                {actionConfirm.type === 'approve' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {actionConfirm.type === 'approve'
                    ? 'Confirm Role Elevation'
                    : 'Reject Role Change Request'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Application for <strong>{actionConfirm.request.userName}</strong>
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100/60 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div>
                Target User: <strong className="text-slate-900 dark:text-white">{actionConfirm.request.userName}</strong> ({actionConfirm.request.userEmail})
              </div>
              <div>
                Role Transition:{' '}
                <span className="font-semibold">{actionConfirm.request.currentRole}</span> →{' '}
                <strong className="text-blue-600 dark:text-blue-400">{actionConfirm.request.requestedRole}</strong>
              </div>
            </div>

            {actionConfirm.type === 'approve' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Optional Approval Notes:
                </label>
                <textarea
                  rows={2}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="e.g. Verified by Department Head, granted full laboratory booking privileges."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Rejection Reason / Guidance <span className="text-rose-500">*</span>:
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Official faculty advisor authorization letter required before club lead role can be granted."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActionConfirm(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDecision}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold transition-colors cursor-pointer ${
                  actionConfirm.type === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionConfirm.type === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

