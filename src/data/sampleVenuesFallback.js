export const sampleVenuesFallback = [
  // --- New Additions: Cognizant Lab & Mini Auditorium ---
  {
    id: 'vn-cog-lab',
    code: 'COG-LAB',
    new_hall_name: 'Cognizant Lab',
    old_hall_name: 'COG-LAB (Computer Dept)',
    department: 'Computer Engineering',
    building: 'Computer New Building',
    type: 'Lab',
    benches: 200,
    capacity: 400,
    is_active: true,
    status: 'Available',
    image: '/coep_building.png',
    description: 'A computer laboratory for technical workshops, programming sessions, academic activities, and approved technical events.',
    features: ['High-End Workstations', 'LAN & High-Speed Wi-Fi', 'Smart Projectors', 'Central AC', 'Surround Sound']
  },
  {
    id: 'vn-mini-aud',
    code: 'MINI-AUD',
    new_hall_name: 'Mini Auditorium',
    old_hall_name: 'MINI-AUD (Heritage Wing)',
    department: 'Academics Complex',
    building: 'Main Heritage Building',
    type: 'Auditorium',
    benches: 138,
    capacity: 275,
    is_active: true,
    status: 'Available',
    image: '/coep_building.png',
    description: 'A mini auditorium for academic presentations, departmental events, seminars, and student activities.',
    features: ['Stage Lighting', 'Acoustic Treatment', 'Dolby Acoustics', 'Dual Mics', 'Overhead Projector', 'Central AC']
  },
  // --- Civil Engineering Classrooms ---
  {
    id: 'vn-ce-sc06',
    new_hall_name: 'SC06',
    old_hall_name: 'South Classroom 06',
    department: 'Civil Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Overhead Projector', 'Whiteboard', 'Sound System']
  },
  {
    id: 'vn-ce-sc07',
    new_hall_name: 'SC07',
    old_hall_name: 'South Classroom 07',
    department: 'Civil Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Overhead Projector', 'Whiteboard', 'Sound System']
  },
  {
    id: 'vn-ce-nc16',
    new_hall_name: 'NC16',
    old_hall_name: 'New Classroom Complex 16',
    department: 'Civil Engineering',
    type: 'Classrooms',
    benches: 45,
    capacity: 90,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Interactive Screen', 'Sound System', 'Wi-Fi 6']
  },
  {
    id: 'vn-ce-sc20',
    new_hall_name: 'SC20',
    old_hall_name: 'South Classroom 20',
    department: 'Civil Engineering',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Overhead Projector', 'Whiteboard', 'Dual Podium']
  },
  {
    id: 'vn-ce-sc21',
    new_hall_name: 'SC21',
    old_hall_name: 'South Classroom 21',
    department: 'Civil Engineering',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Overhead Projector', 'Whiteboard', 'Audio System']
  },

  // --- Academics Complex Classrooms: NC01 - NC14 ---
  ...['NC01', 'NC02', 'NC03', 'NC04', 'NC05', 'NC06', 'NC07', 'NC08', 'NC09', 'NC10', 'NC11', 'NC12', 'NC13', 'NC14'].map((code) => ({
    id: `vn-ac-${code.toLowerCase()}`,
    new_hall_name: code,
    old_hall_name: `Academic Complex ${code}`,
    department: 'Academics Complex',
    type: 'Classrooms',
    benches: 45,
    capacity: 90,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Interactive Screen', 'Central AC', 'Motorized Screen', 'Digital Podium']
  })),

  // --- Electrical Engineering Classrooms ---
  {
    id: 'vn-ee-sc01',
    new_hall_name: 'SC01',
    old_hall_name: 'South Classroom 01',
    department: 'Electrical Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Board', 'Audio System', 'Projector']
  },
  {
    id: 'vn-ee-sc02',
    new_hall_name: 'SC02',
    old_hall_name: 'South Classroom 02',
    department: 'Electrical Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Board', 'Audio System', 'Projector']
  },
  {
    id: 'vn-ee-sc03',
    new_hall_name: 'SC03',
    old_hall_name: 'South Classroom 03',
    department: 'Electrical Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Board', 'Audio System', 'Projector']
  },
  {
    id: 'vn-ee-st06',
    new_hall_name: 'ST06',
    old_hall_name: 'South Tutorial Hall 06',
    department: 'Electrical Engineering',
    type: 'Classrooms',
    benches: 30,
    capacity: 60,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Whiteboard', 'Overhead Projector', 'Wi-Fi 6']
  },

  // --- Electronics and Telecommunication Engineering Classrooms ---
  {
    id: 'vn-entc-nc22',
    new_hall_name: 'NC22',
    old_hall_name: 'New Classroom Complex 22',
    department: 'Electronics and Telecommunication Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Interactive Board', 'Air Conditioned', 'Audio System']
  },
  {
    id: 'vn-entc-nt10',
    new_hall_name: 'NT10',
    old_hall_name: 'New Tutorial Hall 10',
    department: 'Electronics and Telecommunication Engineering',
    type: 'Classrooms',
    benches: 30,
    capacity: 60,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Interactive Display', 'LAN Port', 'Whiteboard']
  },
  {
    id: 'vn-entc-nc23',
    new_hall_name: 'NC23',
    old_hall_name: 'New Classroom Complex 23',
    department: 'Electronics and Telecommunication Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Interactive Board', 'Air Conditioned', 'Audio System']
  },
  {
    id: 'vn-entc-nc24',
    new_hall_name: 'NC24',
    old_hall_name: 'New Classroom Complex 24',
    department: 'Electronics and Telecommunication Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Interactive Board', 'Air Conditioned', 'Audio System']
  },
  {
    id: 'vn-entc-nt11',
    new_hall_name: 'NT11',
    old_hall_name: 'New Tutorial Hall 11',
    department: 'Electronics and Telecommunication Engineering',
    type: 'Classrooms',
    benches: 30,
    capacity: 60,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Interactive Screen', 'LAN Port', 'Whiteboard']
  },

  // --- Mechanical Engineering Classrooms ---
  {
    id: 'vn-me-nc18',
    new_hall_name: 'NC18',
    old_hall_name: 'New Classroom Complex 18',
    department: 'Mechanical Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Tiered Seating', 'Overhead Projector', 'Whiteboard']
  },
  {
    id: 'vn-me-nc19',
    new_hall_name: 'NC19',
    old_hall_name: 'New Classroom Complex 19',
    department: 'Mechanical Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Tiered Seating', 'Overhead Projector', 'Whiteboard']
  },
  {
    id: 'vn-me-nc20',
    new_hall_name: 'NC20',
    old_hall_name: 'New Classroom Complex 20',
    department: 'Mechanical Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Tiered Seating', 'Overhead Projector', 'Whiteboard']
  },
  {
    id: 'vn-me-nc21',
    new_hall_name: 'NC21',
    old_hall_name: 'New Classroom Complex 21',
    department: 'Mechanical Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Tiered Seating', 'Overhead Projector', 'Whiteboard']
  },
  {
    id: 'vn-me-nt06',
    new_hall_name: 'NT06',
    old_hall_name: 'New Tutorial Hall 06',
    department: 'Mechanical Engineering',
    type: 'Classrooms',
    benches: 30,
    capacity: 60,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Whiteboard', 'Overhead Projector', 'Audio System']
  },
  {
    id: 'vn-me-nd01',
    new_hall_name: 'ND01',
    old_hall_name: 'North Drawing Hall 01',
    department: 'Mechanical Engineering',
    type: 'Classrooms',
    benches: 90,
    capacity: 180,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
    features: ['High-Ceiling Hall', 'Dual Projectors', 'PA Sound System']
  },

  // --- Metallurgy and Materials Science Classrooms ---
  {
    id: 'vn-mme-sc14',
    new_hall_name: 'SC14',
    old_hall_name: 'South Classroom 14',
    department: 'Metallurgy and Materials Science',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Overhead Projector', 'Whiteboard', 'Audio System']
  },
  {
    id: 'vn-mme-sc15',
    new_hall_name: 'SC15',
    old_hall_name: 'South Classroom 15',
    department: 'Metallurgy and Materials Science',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Overhead Projector', 'Whiteboard', 'Audio System']
  },
  {
    id: 'vn-mme-sc16',
    new_hall_name: 'SC16',
    old_hall_name: 'South Classroom 16',
    department: 'Metallurgy and Materials Science',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Overhead Projector', 'Whiteboard', 'Audio System']
  },

  // --- Management Classrooms ---
  {
    id: 'vn-mgmt-sc17',
    new_hall_name: 'SC17',
    old_hall_name: 'South Classroom 17',
    department: 'Management',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Executive Desks', 'Projection Display', 'Air Conditioned']
  },
  {
    id: 'vn-mgmt-sc18',
    new_hall_name: 'SC18',
    old_hall_name: 'South Classroom 18',
    department: 'Management',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Executive Desks', 'Projection Display', 'Air Conditioned']
  },
  {
    id: 'vn-mgmt-sc19',
    new_hall_name: 'SC19',
    old_hall_name: 'South Classroom 19',
    department: 'Management',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Executive Desks', 'Projection Display', 'Air Conditioned']
  },

  // --- Manufacturing Engineering and Industrial Management Classrooms ---
  {
    id: 'vn-mfg-sc10',
    new_hall_name: 'SC10',
    old_hall_name: 'South Classroom 10',
    department: 'Manufacturing Engineering and Industrial Management',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Tiered Seating', 'Overhead Projector', 'Whiteboard']
  },
  {
    id: 'vn-mfg-sc11',
    new_hall_name: 'SC11',
    old_hall_name: 'South Classroom 11',
    department: 'Manufacturing Engineering and Industrial Management',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Tiered Seating', 'Overhead Projector', 'Whiteboard']
  },
  {
    id: 'vn-mfg-sc12',
    new_hall_name: 'SC12',
    old_hall_name: 'South Classroom 12',
    department: 'Manufacturing Engineering and Industrial Management',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Tiered Seating', 'Overhead Projector', 'Whiteboard']
  },
  {
    id: 'vn-mfg-sc13',
    new_hall_name: 'SC13',
    old_hall_name: 'South Classroom 13',
    department: 'Manufacturing Engineering and Industrial Management',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Tiered Seating', 'Overhead Projector', 'Whiteboard']
  },

  // --- Computer New Building Classrooms ---
  {
    id: 'vn-cnb-nc27',
    new_hall_name: 'NC-27',
    old_hall_name: 'Computer New Building 27',
    department: 'Computer New Building',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['High-speed Wi-Fi', 'Dual Displays', 'Central AC']
  },
  {
    id: 'vn-cnb-nc28',
    new_hall_name: 'NC-28',
    old_hall_name: 'Computer New Building 28',
    department: 'Computer New Building',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['High-speed Wi-Fi', 'Dual Displays', 'Central AC']
  },
  {
    id: 'vn-cnb-p1',
    new_hall_name: 'Near NC-27 Passage-1',
    old_hall_name: 'Computer New Building Passage Hall 01',
    department: 'Computer New Building',
    type: 'Classrooms',
    benches: 30,
    capacity: 60,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Projector Display', 'Whiteboard', 'Wi-Fi 6']
  },
  {
    id: 'vn-cnb-p2',
    new_hall_name: 'Near NC-27 Passage-2',
    old_hall_name: 'Computer New Building Passage Hall 02',
    department: 'Computer New Building',
    type: 'Classrooms',
    benches: 30,
    capacity: 60,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Projector Display', 'Whiteboard', 'Wi-Fi 6']
  },

  // --- Specialized Campus Venues ---
  {
    id: 'vn-bhau-aud',
    new_hall_name: 'BHAU Aud',
    old_hall_name: 'BHAU Institute Main Auditorium',
    department: 'BHAU Institute',
    type: 'Auditoriums',
    benches: 125,
    capacity: 250,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
    features: ['Acoustic Paneling', 'Stage Lighting', 'Dolby PA System']
  },
  {
    id: 'vn-comp-sh',
    new_hall_name: 'COMP SH',
    old_hall_name: 'Computer Department Seminar Hall',
    department: 'Computer Engineering',
    type: 'Seminar Halls',
    benches: 60,
    capacity: 120,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
    features: ['Video Conferencing', 'Dual HD Displays', 'Central AC']
  },
  {
    id: 'vn-mr-04',
    new_hall_name: 'MR 04',
    old_hall_name: 'Main Building Meeting Room 04',
    department: 'Central Estate & Infrastructure',
    type: 'Meeting Rooms',
    benches: 12,
    capacity: 24,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    features: ['Conference Table', 'Executive Seating', 'Display Screen']
  },
  {
    id: 'vn-entc-mr',
    new_hall_name: 'ENTC MR',
    old_hall_name: 'ENTC Department Conference Room',
    department: 'Electronics and Telecommunication Engineering',
    type: 'Meeting Rooms',
    benches: 15,
    capacity: 30,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    features: ['High-speed Wi-Fi', 'HDMI Connectivity', 'Speakerphone']
  }
]
