// Venue and date utilities for LOCUS

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


// Helper function to get authentic high-quality image for any campus venue
export function getVenueImageUrl(venue) {
  if (venue?.image) return venue.image
  if (venue?.image_url) return venue.image_url

  const name = `${venue?.new_hall_name || ''} ${venue?.old_hall_name || ''} ${venue?.name || ''}`.toLowerCase()
  const type = `${venue?.type || ''}`.toLowerCase()

  if (type.includes('auditorium') || name.includes('aud')) {
    return 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80'
  }
  if (type.includes('seminar') || name.includes('sh') || name.includes('seminar') || name.includes('drawing') || name.includes('nd')) {
    return 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80'
  }
  if (type.includes('meeting') || name.includes('mr') || name.includes('conference')) {
    return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'
  }
  // Default authentic university classroom interior with desks and chalkboard
  return 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80'
}

// Helper function to get official faculty in-charge & department coordinator for any venue
export function getVenueFaculty(venue) {
  if (venue?.faculty_incharge) return venue.faculty_incharge

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

