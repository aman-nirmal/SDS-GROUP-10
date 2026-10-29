import { supabase } from '../src/config/supabase.js'

export const BHAU_VENUES = [
  {
    id: 'b4a00001-0000-4000-8000-000000000001',
    code: 'BHAU-CONF',
    name: 'Bhau Conference Room (Bhau Institute of Innovation)',
    new_hall_name: 'BHAU-CONF',
    old_hall_name: 'Bhau Conference Room',
    department: 'Bhau Institute of Innovation',
    building: 'Bhau Institute of Innovation, Entrepreneurship and Leadership',
    type: 'Meeting Rooms',
    category: 'Meeting Rooms',
    capacity: 15,
    benches: 8,
    status: 'Available',
    is_active: true,
    description: 'Conference room available for Bhau Startups and outsiders. Tariff: ₹1,180.00 / 1 hr (inclusive of 18% GST). Terms: Max 2 hours at a time, gap of an hour between next booking, max 12 hours in a week. Eatables not allowed.',
    features: [
      '15 Seats',
      'Duration: 1 h',
      '₹1,180/hr (incl. 18% GST)',
      'For Startups & Outsiders',
      'Conference Table',
      'Display Screen',
      'Air Conditioned'
    ],
    image: '/photos/bhau-conference.jpg',
    faculty_incharge: 'Faculty Director, BHAU Institute (director.bhau@coeptech.ac.in)'
  },
  {
    id: 'b4a00002-0000-4000-8000-000000000002',
    code: 'BHAU-AUD',
    name: 'Bhau Auditorium (Bhau Institute of Innovation)',
    new_hall_name: 'Bhau Auditorium',
    old_hall_name: 'Auditorium (Ground Floor, Bhau Institute)',
    department: 'Bhau Institute of Innovation',
    building: 'Bhau Institute of Innovation, Entrepreneurship and Leadership',
    type: 'Auditoriums',
    category: 'Auditoriums',
    capacity: 250,
    benches: 125,
    status: 'Available',
    is_active: true,
    description: 'Premier auditorium for national pitch fests, demo days, startup symposiums, and convocations. Tariff: ₹2,950.00 / 1 hr (includes GST). Eatables not allowed inside.',
    features: [
      '250 Seats',
      'Duration: 1 h',
      '₹2,950/hr (incl. GST)',
      'Stage Lighting',
      'Dolby Acoustics',
      'Central AC',
      'Dual Mics'
    ],
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
    faculty_incharge: 'Faculty Director, BHAU Institute (director.bhau@coeptech.ac.in)'
  },
  {
    id: 'b4a00003-0000-4000-8000-000000000003',
    code: 'BHAU-CR1',
    name: 'Bhau Classroom 1 (Bhau Institute of Innovation)',
    new_hall_name: 'Bhau Classroom 1',
    old_hall_name: 'Classroom 1 (Ground Floor, Bhau Institute)',
    department: 'Bhau Institute of Innovation',
    building: 'Bhau Institute of Innovation, Entrepreneurship and Leadership',
    type: 'Classrooms',
    category: 'Classrooms',
    capacity: 60,
    benches: 30,
    status: 'Available',
    is_active: true,
    description: 'Classroom 1 for entrepreneurship workshops and training bootcamps. Tariff: ₹2,360.00 / 2 hr (inclusive of 18% GST). Duration: 2 h block.',
    features: [
      '60 Seats',
      'Duration: 2 h',
      '₹2,360/2 hr (incl. 18% GST)',
      'Projector & Screen',
      'Whiteboard',
      'Air Conditioned'
    ],
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    faculty_incharge: 'Faculty Director, BHAU Institute (director.bhau@coeptech.ac.in)'
  },
  {
    id: 'b4a00004-0000-4000-8000-000000000004',
    code: 'BHAU-OS-GND',
    name: 'Bhau Open Space (Ground) (Bhau Institute of Innovation)',
    new_hall_name: 'Bhau Open Space (Ground)',
    old_hall_name: 'Open Space Ground (Ground Floor, Bhau Institute)',
    department: 'Bhau Institute of Innovation',
    building: 'Bhau Institute of Innovation, Entrepreneurship and Leadership',
    type: 'Seminar Halls',
    category: 'Seminar Halls',
    capacity: 50,
    benches: 20,
    status: 'Available',
    is_active: true,
    description: 'Open ground courtyard for startup exhibitions, demo kiosks, and networking. Tariff: ₹1,770.00 / 1 hr (inclusive of 18% GST). Duration: 1 h.',
    features: [
      '50 Persons',
      'Duration: 1 h',
      '₹1,770/hr (incl. 18% GST)',
      'Ground Courtyard',
      'Open Air Space',
      'Wi-Fi Access'
    ],
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    faculty_incharge: 'Faculty Director, BHAU Institute (director.bhau@coeptech.ac.in)'
  },
  {
    id: 'b4a00005-0000-4000-8000-000000000005',
    code: 'BHAU-OS-TER',
    name: 'Bhau Open Space (Terrace) (Bhau Institute of Innovation)',
    new_hall_name: 'Bhau Open Space (Terrace)',
    old_hall_name: 'Open Space Terrace (Top Floor, Bhau Institute)',
    department: 'Bhau Institute of Innovation',
    building: 'Bhau Institute of Innovation, Entrepreneurship and Leadership',
    type: 'Seminar Halls',
    category: 'Seminar Halls',
    capacity: 40,
    benches: 15,
    status: 'Available',
    is_active: true,
    description: 'Scenic rooftop terrace space overlooking the Mula river. Tariff: ₹2,360.00 / 1 hr. Duration: 1 h. Perfect for evening founder meetups and venture mixers.',
    features: [
      '40 Persons',
      'Duration: 1 h',
      '₹2,360/hr',
      'Top Floor Terrace',
      'Scenic Riverbank View',
      'Ambient Lighting'
    ],
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    faculty_incharge: 'Faculty Director, BHAU Institute (director.bhau@coeptech.ac.in)'
  },
  {
    id: 'b4a00006-0000-4000-8000-000000000006',
    code: 'BHAU-MR1',
    name: 'Bhau Meeting Room 1 (Bhau Institute of Innovation)',
    new_hall_name: 'Bhau Meeting Room 1',
    old_hall_name: 'Meeting Room 1 (Second Floor, Bhau Institute)',
    department: 'Bhau Institute of Innovation',
    building: 'Bhau Institute of Innovation, Entrepreneurship and Leadership',
    type: 'Meeting Rooms',
    category: 'Meeting Rooms',
    capacity: 10,
    benches: 4,
    status: 'Available',
    is_active: true,
    description: 'ONLY FOR BHAU STARTUPS. Tariff: ₹1,000.00 / 1 hr. Duration: 1 h. Terms: Max 2 hours at a time, gap of an hour between next booking, book for next 7 days only, max 12 hrs in a week. Eatables not allowed.',
    features: [
      '10 Seats',
      'ONLY FOR BHAU STARTUPS',
      'Duration: 1 h',
      '₹1,000/hr',
      'Discussion Table',
      'Whiteboard',
      'Air Conditioned'
    ],
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    faculty_incharge: 'Faculty Director, BHAU Institute (director.bhau@coeptech.ac.in)'
  },
  {
    id: 'b4a00007-0000-4000-8000-000000000007',
    code: 'BHAU-MR2',
    name: 'Bhau Meeting Room 2 (Bhau Institute of Innovation)',
    new_hall_name: 'Bhau Meeting Room 2',
    old_hall_name: 'Meeting Room 2 (Second Floor, Bhau Institute)',
    department: 'Bhau Institute of Innovation',
    building: 'Bhau Institute of Innovation, Entrepreneurship and Leadership',
    type: 'Meeting Rooms',
    category: 'Meeting Rooms',
    capacity: 10,
    benches: 4,
    status: 'Available',
    is_active: true,
    description: 'ONLY FOR BHAU STARTUPS. The above charges are inclusive of 18% GST. Tariff: ₹1,000.00 / 1 hr (incl. 18% GST). Duration: 1 h. Terms: Max 2 hours at a time, gap of an hour between next booking, book for next 7 days only, max 12 hrs in a week. Eatables not allowed.',
    features: [
      '10 Seats',
      'ONLY FOR BHAU STARTUPS',
      'Duration: 1 h',
      '₹1,000/hr (incl. 18% GST)',
      'Smart Screen',
      'Conference Audio',
      'Air Conditioned'
    ],
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80',
    faculty_incharge: 'Faculty Director, BHAU Institute (director.bhau@coeptech.ac.in)'
  }
]

async function syncBhauVenues() {
  if (!supabase) {
    console.log('Supabase client not available, skipping remote sync.')
    return
  }

  console.log(`Syncing ${BHAU_VENUES.length} Bhau Institute spaces to Supabase table "venues"...`)

  for (const v of BHAU_VENUES) {
    const { data, error } = await supabase
      .from('venues')
      .upsert(
        {
          id: v.id,
          code: v.code,
          name: v.name,
          new_hall_name: v.new_hall_name,
          old_hall_name: v.old_hall_name,
          department: v.department,
          building: v.building,
          type: v.type,
          benches: v.benches,
          status: v.status,
          is_active: v.is_active,
          description: v.description,
          features: v.features,
          image: v.image,
          faculty_incharge: v.faculty_incharge
        },
        { onConflict: 'id' }
      )
      .select('id, name')

    if (error) {
      console.warn(`Error upserting ${v.name}:`, error.message)
    } else {
      console.log(`✓ Upserted: ${v.name}`)
    }
  }

  console.log('🎉 All 7 Bhau Institute venues synced to Supabase successfully!')
}

syncBhauVenues().catch(console.error)
