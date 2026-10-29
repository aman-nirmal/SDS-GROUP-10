// Format date helper (e.g., '16 Oct 2026')
export function formatDateDisplay(dateStr) {
  if (!dateStr) return 'Select Date'
  try {
    const [year, month, day] = dateStr.split('-')
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

// Format Date object to YYYY-MM-DD
export function formatDateISO(date) {
  if (!date || !(date instanceof Date)) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Helper function to identify engineering laboratories that require 3-stage governance (Lab Assistant -> HOD -> Dean)
export function isLabVenue(venue) {
  if (!venue) return false
  if (venue.isLab === true) return true
  const type = (venue.type || '').toLowerCase()
  const name = `${venue.new_hall_name || ''} ${venue.old_hall_name || ''} ${venue.name || ''}`.toLowerCase()
  const code = (venue.code || venue.hall_code || '').toLowerCase()
  return (
    type.includes('lab') ||
    type.includes('laboratory') ||
    name.includes('lab') ||
    name.includes('laboratory') ||
    code.includes('lab') ||
    code.includes('cog-lab') ||
    code.includes('se-lab') ||
    code.includes('iot-lab') ||
    code.includes('sm-lab') ||
    code.includes('geo-lab') ||
    code.includes('robo-lab') ||
    code.includes('vlsi-lab')
  )
}

// Helper function to get multiple authentic high-quality images from the campus photos repository
export function getVenueImages(venue) {
  const list = []
  if (Array.isArray(venue?.images) && venue.images.length > 0) {
    venue.images.forEach((img) => {
      if (img) list.push(img.startsWith('/') || img.startsWith('http') ? img : `/${img}`)
    })
  } else if (venue?.image) {
    list.push(venue.image.startsWith('/') || venue.image.startsWith('http') ? venue.image : `/${venue.image}`)
  }

  const name = `${venue?.new_hall_name || ''} ${venue?.old_hall_name || ''} ${venue?.name || ''}`.toLowerCase()
  const type = `${venue?.type || ''}`.toLowerCase()
  const code = `${venue?.code || ''}`.toLowerCase()
  const dept = `${venue?.department || ''}`.toLowerCase()

  // Deterministic seed from venue identifiers so each classroom gets a unique primary view
  const seedString = `${venue?.id || ''}_${code}_${venue?.new_hall_name || ''}_${venue?.old_hall_name || ''}_${dept}`
  let hash = 0
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash * 31 + seedString.charCodeAt(i)) >>> 0
  }

  // Extract room number if present (e.g. SC07 -> 7, AC 202 -> 202)
  const roomNum = parseInt((venue?.new_hall_name || code || name).replace(/\D/g, ''), 10) || hash

  let defaults = []

  // Engineering Laboratories (Computer Labs, Robotics Labs, Mechanics Labs)
  if (isLabVenue(venue) || type.includes('lab') || name.includes('lab') || code.includes('lab')) {
    if (dept.includes('computer') || dept.includes('data') || dept.includes('ai') || name.includes('cognizant') || name.includes('software')) {
      defaults = ['/photos/computer-lab.jpg', '/photos/smart-classroom.jpg', '/photos/robotics-lab.jpg']
    } else {
      defaults = ['/photos/robotics-lab.jpg', '/photos/computer-lab.jpg', '/photos/smart-classroom.jpg']
    }
  }
  // Mini Auditorium
  else if (name.includes('mini') || code.includes('mini')) {
    defaults = ['/photos/mini audi 1.jpg', '/photos/mini audi 2.jpg', '/photos/audi 2.jpeg']
  }
  // Auditoriums (COEP Main Auditorium, Bhau Auditorium, etc.)
  else if (type.includes('auditorium') || name.includes('aud') || code.includes('aud')) {
    defaults = ['/photos/audi 2.jpeg', '/photos/mini audi 1.jpg', '/photos/mini audi 2.jpg', '/photos/seminar hall.webp']
  }
  // Meeting & Executive Conference Rooms
  else if (type.includes('meeting') || name.includes('meeting') || name.includes('conference') || code.includes('conf') || name.includes('mr')) {
    defaults = ['/photos/bhau-conference.jpg', '/photos/bhau-meeting-room.jpg', '/photos/ac 2.jpeg', '/photos/seminar hall 2.jpeg']
  }
  // Engineering Drawing Hall / Design Studio (North Drawing Hall, ND01, CDH)
  else if (name.includes('drawing') || name.includes('nd01') || code.includes('nd01') || name.includes('studio')) {
    defaults = ['/photos/drawing-hall.jpg', '/photos/heritage-classroom.jpg', '/photos/classroom.jpg']
  }
  // Seminar Halls & Smart Classrooms
  else if (type.includes('seminar') || name.includes('sh') || name.includes('seminar') || name.includes('smart')) {
    const seminarPool = [
      ['/photos/smart-classroom.jpg', '/photos/seminar hall 2.jpeg', '/photos/seminar hall.webp', '/photos/ac 2.jpeg'],
      ['/photos/seminar hall 2.jpeg', '/photos/smart-classroom.jpg', '/photos/seminar hall.webp', '/photos/ac 2.jpeg'],
      ['/photos/seminar hall.webp', '/photos/smart-classroom.jpg', '/photos/seminar hall 2.jpeg', '/photos/ac 2.jpeg'],
      ['/photos/ac 2.jpeg', '/photos/smart-classroom.jpg', '/photos/seminar hall 2.jpeg', '/photos/seminar hall.webp']
    ]
    defaults = seminarPool[roomNum % seminarPool.length]
  }
  // South Classrooms (SC01-SC28, CDH, South Complex Heritage Wing)
  else if (name.includes('sc') || code.includes('sc') || name.includes('south')) {
    const southPool = [
      ['/photos/south-wing-classroom.jpg', '/photos/heritage-classroom.jpg', '/photos/sc1.jpeg', '/photos/classroom.jpg'],
      ['/photos/heritage-classroom.jpg', '/photos/south-wing-classroom.jpg', '/photos/sc1.jpeg', '/photos/academic-complex-clean.jpg'],
      ['/photos/sc1.jpeg', '/photos/south-wing-classroom.jpg', '/photos/heritage-classroom.jpg', '/photos/academic-complex-clean.jpg'],
      ['/photos/classroom.jpg', '/photos/south-wing-classroom.jpg', '/photos/heritage-classroom.jpg', '/photos/sc1.jpeg']
    ]
    defaults = southPool[roomNum % southPool.length]
  }
  // Academic Complex & North Classrooms (NC01 - NC14, AC 101 - AC 304)
  else if (
    dept.includes('academic') ||
    name.includes('ac ') ||
    name.includes('ac-') ||
    name.includes('ac1') ||
    name.includes('ac2') ||
    name.includes('ac3') ||
    /^nc0[1-9]|^nc1[0-4]/.test(code) ||
    /^nc0[1-9]|^nc1[0-4]/.test(venue?.new_hall_name?.toLowerCase() || '')
  ) {
    const acPool = [
      ['/photos/academic-complex-clean.jpg', '/photos/ac 1.jpeg', '/photos/ac 2.jpeg', '/photos/ac 3.webp'],
      ['/photos/ac 1.jpeg', '/photos/academic-complex-clean.jpg', '/photos/ac 3.webp', '/photos/ac 2.jpeg'],
      ['/photos/ac 2.jpeg', '/photos/smart-classroom.jpg', '/photos/academic-complex-clean.jpg', '/photos/ac 1.jpeg'],
      ['/photos/ac 3.webp', '/photos/academic-complex-clean.jpg', '/photos/ac 1.jpeg', '/photos/smart-classroom.jpg']
    ]
    defaults = acPool[roomNum % acPool.length]
  }
  // General Department Classrooms (Civil, Mechanical, Computer, Electrical, etc.) with rich variety
  else {
    const generalPool = [
      ['/photos/heritage-classroom.jpg', '/photos/south-wing-classroom.jpg', '/photos/academic-complex-clean.jpg', '/photos/classroom.jpg'],
      ['/photos/academic-complex-clean.jpg', '/photos/smart-classroom.jpg', '/photos/ac 1.jpeg', '/photos/heritage-classroom.jpg'],
      ['/photos/south-wing-classroom.jpg', '/photos/heritage-classroom.jpg', '/photos/sc1.jpeg', '/photos/academic-complex-clean.jpg'],
      ['/photos/smart-classroom.jpg', '/photos/academic-complex-clean.jpg', '/photos/drawing-hall.jpg', '/photos/classroom.jpg'],
      ['/photos/classroom.jpg', '/photos/heritage-classroom.jpg', '/photos/south-wing-classroom.jpg', '/photos/sc1.jpeg']
    ]
    defaults = generalPool[roomNum % generalPool.length]
  }

  const merged = Array.from(new Set([...list, ...defaults])).filter(Boolean)
  return merged.length > 0 ? merged : ['/photos/academic-complex-clean.jpg']
}

// Helper function to get authentic high-quality image from the campus photos repository
export function getVenueImageUrl(venue) {
  const images = getVenueImages(venue)
  return images[0] || '/photos/academic-complex-clean.jpg'
}

// Helper function to get official faculty in-charge & department coordinator for any venue
export function getVenueFaculty(venue) {
  if (venue?.faculty_incharge) {
    if (typeof venue.faculty_incharge === 'string') {
      return {
        name: venue.faculty_incharge,
        designation: 'Faculty In-Charge',
        email: 'estate@coeptech.ac.in',
        office: 'COEP Technological University'
      }
    }
    return {
      name: venue.faculty_incharge.name || 'Central Estate Officer',
      designation: venue.faculty_incharge.designation || 'Faculty In-Charge',
      email: venue.faculty_incharge.email || 'estate@coeptech.ac.in',
      office: venue.faculty_incharge.office || 'Central Estate Office'
    }
  }

  const dept = (venue?.department || '').toLowerCase()
  if (dept.includes('civil')) {
    return {
      name: 'Prof. K. A. Patil',
      designation: 'Faculty In-Charge & Head of Department',
      email: 'hod.civil@coeptech.ac.in',
      office: 'Civil Main Building, Room 102'
    }
  }
  if (dept.includes('academics')) {
    return {
      name: 'Dr. P. R. Dhamangaonkar',
      designation: 'Dean Academics & Complex In-Charge',
      email: 'dean.acad@coeptech.ac.in',
      office: 'Academic Complex Administrative Block, 1st Floor'
    }
  }
  if (dept.includes('electrical')) {
    return {
      name: 'Dr. V. N. Pande',
      designation: 'Faculty In-Charge, Electrical Dept',
      email: 'hod.elec@coeptech.ac.in',
      office: 'Electrical Dept Building, Room 105'
    }
  }
  if (dept.includes('electronics') || dept.includes('entc')) {
    return {
      name: 'Dr. P. P. Bartakke',
      designation: 'Faculty In-Charge, ENTC Dept',
      email: 'hod.extc@coeptech.ac.in',
      office: 'ENTC Building, 2nd Floor'
    }
  }
  if (dept.includes('mechanical')) {
    return {
      name: 'Dr. S. S. Pardeshi',
      designation: 'Faculty In-Charge, Mechanical Dept',
      email: 'hod.mech@coeptech.ac.in',
      office: 'Mechanical Dept Main Hall, Room 14'
    }
  }
  if (dept.includes('metallurgy')) {
    return {
      name: 'Dr. S. T. Vagge',
      designation: 'Faculty In-Charge, Metallurgy Dept',
      email: 'hod.meta@coeptech.ac.in',
      office: 'Metallurgy Dept Block, Ground Floor'
    }
  }
  if (dept.includes('management')) {
    return {
      name: 'Dr. S. K. Patil',
      designation: 'Faculty Coordinator, Department of Management',
      email: 'hod.mgmt@coeptech.ac.in',
      office: 'Management Studies Wing, Room 05'
    }
  }
  if (dept.includes('manufacturing')) {
    return {
      name: 'Dr. Rajiv B.',
      designation: 'Faculty In-Charge, Manufacturing & Industrial Mgmt',
      email: 'hod.mfg@coeptech.ac.in',
      office: 'Production & Manufacturing Block, Room 12'
    }
  }
  if (dept.includes('computer')) {
    return {
      name: 'Dr. V. K. Pachghare',
      designation: 'Faculty In-Charge & HOD, Computer Dept',
      email: 'hod.comp@coeptech.ac.in',
      office: 'Computer New Building, 3rd Floor, Room 301'
    }
  }
  if (dept.includes('bhau')) {
    return {
      name: 'Dr. S. Radhakrishnan',
      designation: 'Faculty Director, BHAU Institute',
      email: 'director.bhau@coeptech.ac.in',
      office: 'BHAU Incubation Center, Executive Suite'
    }
  }
  return {
    name: 'Central Estate Officer',
    designation: 'Faculty In-Charge, Campus Infrastructure & Estate',
    email: 'estate@coeptech.ac.in',
    office: 'Central Estate Office, Main Victorian Quadrangle'
  }
}

// Classrooms are mostly occupied 10:30 to 5:30 with regular lectures, with free gaps in between
export const classroomTimeSlots = [
  { time: '08:30 AM - 10:30 AM', status: 'free' },
  { time: '10:30 AM - 12:30 PM', status: 'occupied', label: 'Lecture' },
  { time: '12:30 PM - 01:30 PM', status: 'free', label: 'Tutorial Gap' },
  { time: '01:30 PM - 02:30 PM', status: 'free', label: 'Lunch Gap' },
  { time: '02:30 PM - 04:30 PM', status: 'occupied', label: 'Lab Class' },
  { time: '04:30 PM - 05:30 PM', status: 'free', label: 'Evening Gap' },
  { time: '05:30 PM - 07:30 PM', status: 'free' }
]

export function extractNumericPrice(priceStr) {
  if (typeof priceStr === 'number') return priceStr
  if (!priceStr) return 0
  const match = String(priceStr).replace(/,/g, '').match(/(\d+(\.\d+)?)/)
  return match ? parseFloat(match[1]) : 0
}

export function isClassroomVenue(venue) {
  if (!venue) return false
  if (isLabVenue(venue)) return false // Laboratories require 3-stage governance (Lab Assistant -> HOD -> Dean)
  const type = (venue.type || '').toLowerCase()
  const name = `${venue.new_hall_name || ''} ${venue.old_hall_name || ''} ${venue.name || ''}`.toLowerCase()
  if (type.includes('auditorium') || type.includes('meeting') || type.includes('open space')) return false
  return type.includes('classroom') ||
         type.includes('drawing hall') ||
         type.includes('class') ||
         name.includes('classroom') ||
         name.includes('lecture hall') ||
         name.includes('drawing hall') ||
         /^sc\d+|^nc\d+|^nt\d+/.test(name)
}

export function isDepartmentMatch(userDept, venueDept) {
  if (!userDept || !venueDept) return false
  const u = String(userDept).toLowerCase().trim()
  const v = String(venueDept).toLowerCase().trim()
  if (u === v) return true
  if (u.includes(v) || v.includes(u)) return true
  const normalize = (s) => s.replace(/\bdepartment\b|\bdept\b|\bof\b|\band\b|&/gi, '').replace(/\s+/g, ' ').trim()
  const nu = normalize(u)
  const nv = normalize(v)
  return nu.length > 3 && nv.length > 3 && (nu.includes(nv) || nv.includes(nu))
}

// Helper to identify Academic Complex (AC) classrooms (NC01 to NC14)
export function isAcClassroom(venue) {
  if (!venue) return false
  const dept = (venue.department || '').toLowerCase()
  const newName = (venue.new_hall_name || venue.name || '').toUpperCase()
  const oldName = (venue.old_hall_name || '').toUpperCase()
  const type = (venue.type || '').toLowerCase()

  if (type.includes('auditorium') || newName.includes('AUDITORIUM') || oldName.includes('AUDITORIUM')) return false

  return (
    dept.includes('academic') ||
    oldName.startsWith('AC ') ||
    oldName.startsWith('AC-') ||
    oldName.startsWith('AC1') ||
    oldName.startsWith('AC2') ||
    oldName.startsWith('AC3') ||
    oldName.startsWith('AC4') ||
    ((newName.startsWith('NC0') || /^NC1[0-4]$/.test(newName)) && dept.includes('academic'))
  )
}

