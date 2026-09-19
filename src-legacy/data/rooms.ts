export interface ScheduleSlot {
  id: string;
  startTime: string; // e.g. "08:30"
  endTime: string;   // e.g. "09:30"
  timeSlot: string;  // e.g. "08:30 - 09:30 AM"
  isOccupied: boolean;
  title: string;     // e.g. "B.Tech CSE - Data Structures" or "Open Self-Study Slot"
  courseCode?: string;
  faculty?: string;
  batch?: string;
  type: 'lecture' | 'lab' | 'tutorial' | 'free' | 'workshop' | 'seminar';
}

export type RoomCategory = 'Smart Classroom' | 'Computer / Tech Lab' | 'Silent Study Pod' | 'Seminar Amphitheatre' | 'Design & Innovation Studio';

export interface Room {
  id: string;
  name: string;      // e.g. "Room 121 A", "Room 301B", "Room 318B", "Room 201", "Room 402"
  code: string;      // "121 A", "301B", "318B", "201", "402", "105", "204", "305A", "412"
  category: RoomCategory;
  wing: 'West Wing' | 'Central Block' | 'East Wing';
  block: 'Block A' | 'Block B';
  floor: number;     // 1 = 1st Floor, 2 = 2nd Floor, 3 = 3rd Floor, 4 = 4th Floor
  floorLabel: string;
  capacity: number;  // Seats
  chargingPoints: number; // Functional power sockets
  totalSockets: number;
  hasAC: boolean;
  acType: string;
  acStatus: string;  // "Optimal (21°C)", "Chilled (19°C)", etc.
  hasProjector: boolean;
  hasSmartBoard: boolean;
  wifiStrength: 'Ultra-fast (6GHz)' | 'Excellent' | 'Good' | 'Fair';
  noiseVibe: 'Silent Study' | 'Moderate / Group Work' | 'Collaborative Buzz' | 'Quick Break';
  comfortScore: number; // e.g. 9.5 out of 10
  currentOccupancy: number; // percentage e.g. 25
  crowdLevel: 'Empty (0-15%)' | 'Light (15-35%)' | 'Moderate (35-65%)' | 'Crowded (65-90%)' | 'Full';
  todaySchedule: ScheduleSlot[];
  amenities: string[];
  description: string;
  bestFor: string[];
}

function createSlots(roomId: string, occupiedIndexes: number[], customTitles: { [key: number]: { title: string; courseCode?: string; faculty?: string; type: 'lecture' | 'lab' | 'tutorial' | 'workshop' | 'seminar' } } = {}): ScheduleSlot[] {
  const times = [
    { start: '08:30', end: '09:30', slot: '08:30 - 09:30 AM' },
    { start: '09:30', end: '10:30', slot: '09:30 - 10:30 AM' },
    { start: '10:30', end: '11:30', slot: '10:30 - 11:30 AM' },
    { start: '11:30', end: '12:30', slot: '11:30 AM - 12:30 PM' },
    { start: '12:30', end: '13:30', slot: '12:30 - 01:30 PM' },
    { start: '13:30', end: '14:30', slot: '01:30 - 02:30 PM' },
    { start: '14:30', end: '15:30', slot: '02:30 - 03:30 PM' },
    { start: '15:30', end: '16:30', slot: '03:30 - 04:30 PM' },
    { start: '16:30', end: '17:30', slot: '04:30 - 05:30 PM' },
  ];

  return times.map((t, idx) => {
    const isOcc = occupiedIndexes.includes(idx);
    const custom = customTitles[idx];
    return {
      id: `${roomId}-${idx + 1}`,
      startTime: t.start,
      endTime: t.end,
      timeSlot: t.slot,
      isOccupied: isOcc,
      title: isOcc ? (custom ? custom.title : 'Scheduled Department Session') : 'Open Self-Study & Study Hub',
      courseCode: custom?.courseCode,
      faculty: custom?.faculty,
      type: isOcc ? (custom ? custom.type : 'lecture') : 'free',
    };
  });
}

export const JAIN_ROOMS: Room[] = [
  // ==========================================
  // FLOOR 1 (13 ROOMS)
  // ==========================================
  {
    id: 'room-121a',
    name: 'Design Thinking Studio 121 A',
    code: '121 A',
    category: 'Design & Innovation Studio',
    wing: 'Central Block',
    block: 'Block A',
    floor: 1,
    floorLabel: '1st Floor',
    capacity: 65,
    chargingPoints: 18,
    totalSockets: 20,
    hasAC: true,
    acType: 'Dual Split AC (2.0 Ton)',
    acStatus: 'Optimal (21°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Silent Study',
    comfortScore: 9.6,
    currentOccupancy: 20,
    crowdLevel: 'Light (15-35%)',
    amenities: ['Dual Split AC', '18 Power Sockets', '75" Interactive Touch Screen', '4K Laser Projector', 'Ergonomic Desks'],
    description: 'Flagship smart classroom on 1st Floor Block A. Features high-power socket strips and pin-drop quiet atmosphere during free periods.',
    bestFor: ['Laptop coding sessions', 'Focused exam revision', 'Individual study with power', 'Slide presentations'],
    todaySchedule: createSlots('121a', [0, 1, 5, 6], {
      0: { title: 'B.Tech CSE - Data Structures & Algorithms', courseCode: 'CSE301', faculty: 'Dr. Ramesh Rao', type: 'lecture' },
      1: { title: 'Design Thinking & Innovation Studio', courseCode: 'DT302', faculty: 'Prof. Ananya Sen', type: 'workshop' },
      5: { title: 'Discrete Mathematics & Logic', courseCode: 'MAT303', faculty: 'Dr. Sunita Kulkarni', type: 'lecture' },
      6: { title: 'Digital System Design Tutorial', courseCode: 'ECE304', faculty: 'Prof. Varun Gowda', type: 'tutorial' }
    })
  },
  {
    id: 'room-105',
    name: 'Classroom 105 (Quick Break Hub)',
    code: '105',
    category: 'Smart Classroom',
    wing: 'West Wing',
    block: 'Block A',
    floor: 1,
    floorLabel: '1st Floor',
    capacity: 40,
    chargingPoints: 12,
    totalSockets: 14,
    hasAC: true,
    acType: 'Split AC (1.5 Ton)',
    acStatus: 'Optimal (21°C)',
    hasProjector: true,
    hasSmartBoard: false,
    wifiStrength: 'Good',
    noiseVibe: 'Quick Break',
    comfortScore: 8.8,
    currentOccupancy: 35,
    crowdLevel: 'Light (15-35%)',
    amenities: ['Split AC', '12 Fast Sockets', 'Whiteboard', 'Adjacent to Canteen Walkway'],
    description: 'Ground-adjacent 1st floor classroom right by the cafeteria entrance. Perfect for rapid 20-40 min charging stops.',
    bestFor: ['Quick recharge between lectures', 'Quick food & assignment review', 'Short 30m break'],
    todaySchedule: createSlots('105', [1, 5], {
      1: { title: 'Technical Communication & Soft Skills', courseCode: 'ENG301', faculty: 'Prof. Geetha S', type: 'tutorial' },
      5: { title: 'Environmental Studies & Sustainability', courseCode: 'EVS301', faculty: 'Dr. Manjunath', type: 'lecture' }
    })
  },
  {
    id: 'room-101',
    name: 'Applied Physics & IoT Lab 101',
    code: '101',
    category: 'Computer / Tech Lab',
    wing: 'East Wing',
    block: 'Block A',
    floor: 1,
    floorLabel: '1st Floor',
    capacity: 45,
    chargingPoints: 24,
    totalSockets: 26,
    hasAC: true,
    acType: 'Dual Split AC',
    acStatus: 'Chilled (19°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Collaborative Buzz',
    comfortScore: 9.3,
    currentOccupancy: 25,
    crowdLevel: 'Light (15-35%)',
    amenities: ['Dual Split AC', '24 Multi-plug Sockets', 'High Speed Wi-Fi 6', 'Sensor Benches'],
    description: 'Advanced engineering physics and electronics prototyping laboratory on Floor 1 with dedicated high-output power rails.',
    bestFor: ['Hardware projects', 'High-current laptop charging', 'Sensor coding'],
    todaySchedule: createSlots('101', [0, 5, 6], {
      0: { title: 'Engineering Physics Practical', courseCode: 'PHY101L', faculty: 'Dr. Raghavan K', type: 'lab' },
      5: { title: 'IoT Sensors & Actuators Lab', courseCode: 'IOT302', faculty: 'Prof. Sandeep M', type: 'lab' },
      6: { title: 'IoT Sensors Lab (Cont.)', courseCode: 'IOT302', faculty: 'Prof. Sandeep M', type: 'lab' }
    })
  },
  {
    id: 'room-102',
    name: 'Analog Electronics Studio 102',
    code: '102',
    category: 'Computer / Tech Lab',
    wing: 'East Wing',
    block: 'Block A',
    floor: 1,
    floorLabel: '1st Floor',
    capacity: 40,
    chargingPoints: 20,
    totalSockets: 22,
    hasAC: true,
    acType: 'Dual Split AC',
    acStatus: 'Optimal (21°C)',
    hasProjector: true,
    hasSmartBoard: false,
    wifiStrength: 'Excellent',
    noiseVibe: 'Moderate / Group Work',
    comfortScore: 9.0,
    currentOccupancy: 15,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Dual Split AC', '20 Sockets', 'Circuit Simulators', 'HD Projector'],
    description: 'Analog circuits and power electronics studio with spacious test benches and power strips.',
    bestFor: ['Circuit design', 'Laptop work', 'Group assignments'],
    todaySchedule: createSlots('102', [1, 2, 7], {
      1: { title: 'Analog Circuits & Analysis', courseCode: 'ECE201', faculty: 'Prof. Nithya P', type: 'lecture' },
      2: { title: 'Electronic Devices & Circuits', courseCode: 'ECE202', faculty: 'Dr. Balaji S', type: 'lecture' },
      7: { title: 'Remedial Circuit Tutorial', courseCode: 'ECE201T', faculty: 'Prof. Nithya P', type: 'tutorial' }
    })
  },
  {
    id: 'room-103',
    name: 'CADD & 3D Engineering Lab 103',
    code: '103',
    category: 'Computer / Tech Lab',
    wing: 'West Wing',
    block: 'Block A',
    floor: 1,
    floorLabel: '1st Floor',
    capacity: 50,
    chargingPoints: 30,
    totalSockets: 32,
    hasAC: true,
    acType: 'Central Climate Control',
    acStatus: 'Chilled (19°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Silent Study',
    comfortScore: 9.5,
    currentOccupancy: 10,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Central Climate Control', '30 High-Power Workstations', 'AutoCAD & SolidWorks', 'Dual 4K Laser Screens'],
    description: 'Large CADD lab with high-density power outlets at every seat and high-performance climate control.',
    bestFor: ['Heavy 3D modeling', 'Rendering', 'Power-hungry laptop chargers'],
    todaySchedule: createSlots('103', [0, 1, 6], {
      0: { title: 'Computer Aided Engineering Drawing', courseCode: 'ME101', faculty: 'Prof. Chethan V', type: 'lab' },
      1: { title: 'CAED Lab (Cont.)', courseCode: 'ME101', faculty: 'Prof. Chethan V', type: 'lab' },
      6: { title: '3D Solid Modeling Workshop', courseCode: 'ME304', faculty: 'Dr. Praveen G', type: 'workshop' }
    })
  },
  {
    id: 'room-104',
    name: 'Classroom 104 (Lecture Wing)',
    code: '104',
    category: 'Smart Classroom',
    wing: 'Central Block',
    block: 'Block A',
    floor: 1,
    floorLabel: '1st Floor',
    capacity: 70,
    chargingPoints: 16,
    totalSockets: 18,
    hasAC: true,
    acType: 'Split AC Units',
    acStatus: 'Optimal (22°C)',
    hasProjector: true,
    hasSmartBoard: false,
    wifiStrength: 'Excellent',
    noiseVibe: 'Moderate / Group Work',
    comfortScore: 8.9,
    currentOccupancy: 20,
    crowdLevel: 'Light (15-35%)',
    amenities: ['Split AC', '16 Power Outlets', 'Wide Whiteboards', 'HD Projector'],
    description: 'Spacious 1st-floor classroom frequently open for general study between first-year lectures.',
    bestFor: ['Group discussion', 'Spacious individual seating', 'Note taking'],
    todaySchedule: createSlots('104', [2, 3, 5], {
      2: { title: 'Engineering Mathematics I', courseCode: 'MAT101', faculty: 'Dr. Shobha K', type: 'lecture' },
      3: { title: 'Basic Electrical Engineering', courseCode: 'EEE101', faculty: 'Prof. Girish T', type: 'lecture' },
      5: { title: 'Constitution & Professional Ethics', courseCode: 'HUM101', faculty: 'Prof. Leela M', type: 'lecture' }
    })
  },
  {
    id: 'room-106',
    name: 'Mathematics Tutorial Nook 106',
    code: '106',
    category: 'Smart Classroom',
    wing: 'West Wing',
    block: 'Block A',
    floor: 1,
    floorLabel: '1st Floor',
    capacity: 35,
    chargingPoints: 10,
    totalSockets: 12,
    hasAC: true,
    acType: 'Split AC',
    acStatus: 'Optimal (21°C)',
    hasProjector: true,
    hasSmartBoard: false,
    wifiStrength: 'Good',
    noiseVibe: 'Silent Study',
    comfortScore: 8.7,
    currentOccupancy: 12,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Split AC', '10 Sockets', 'Triple Whiteboards', 'Sound Insulated'],
    description: 'Cozy mathematics tutorial room with three large whiteboards. Favorite of students solving calculus & algebra.',
    bestFor: ['Math problem solving', 'Quiet solo work', 'Small group practice'],
    todaySchedule: createSlots('106', [0, 4, 7], {
      0: { title: 'Calculus & Linear Algebra Tutorial', courseCode: 'MAT102', faculty: 'Dr. Anand Kumar', type: 'tutorial' },
      4: { title: 'Probability & Statistics Tutoring', courseCode: 'MAT201', faculty: 'Dr. Sunita K', type: 'tutorial' },
      7: { title: 'Open Remedial Math Session', courseCode: 'MAT102', faculty: 'Prof. Ramesh N', type: 'tutorial' }
    })
  },
  {
    id: 'room-107',
    name: 'Innovation & Career Lounge 107',
    code: '107',
    category: 'Design & Innovation Studio',
    wing: 'Central Block',
    block: 'Block A',
    floor: 1,
    floorLabel: '1st Floor',
    capacity: 35,
    chargingPoints: 18,
    totalSockets: 20,
    hasAC: true,
    acType: 'Central AC',
    acStatus: 'Optimal (20°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Moderate / Group Work',
    comfortScore: 9.4,
    currentOccupancy: 20,
    crowdLevel: 'Light (15-35%)',
    amenities: ['Central AC', '18 Fast Sockets', 'Cushioned Sofas', 'Mock Interview Pods', 'Smart Screen'],
    description: 'Premium executive lounge equipped with comfortable modular seating, presentation screens, and fast charging.',
    bestFor: ['Placement prep', 'Mock interviews', 'Resume reviews', 'Casual team meetings'],
    todaySchedule: createSlots('107', [3, 7], {
      3: { title: 'Corporate Soft Skills & GD Training', courseCode: 'PLC301', faculty: 'Trainer Rohit S', type: 'workshop' },
      7: { title: 'Mock Coding Interview Sprint', courseCode: 'PLC302', faculty: 'Placement Cell', type: 'workshop' }
    })
  },
  {
    id: 'room-108',
    name: 'Digital Media Studio 108',
    code: '108',
    category: 'Computer / Tech Lab',
    wing: 'East Wing',
    block: 'Block A',
    floor: 1,
    floorLabel: '1st Floor',
    capacity: 40,
    chargingPoints: 24,
    totalSockets: 26,
    hasAC: true,
    acType: 'Dual Split AC',
    acStatus: 'Chilled (19°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Silent Study',
    comfortScore: 9.2,
    currentOccupancy: 15,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Dual Split AC', '24 Audio Workstations', 'Noise Isolating Headsets', 'Fiber Wi-Fi'],
    description: 'Digital audio-visual lab with soundproof booths and desktop stations. Exceptional acoustic isolation.',
    bestFor: ['Listening to video lectures', 'Podcasts', 'Audio coding', 'Deep silent focus'],
    todaySchedule: createSlots('108', [1, 2], {
      1: { title: 'Foreign Language Elective (German A1)', courseCode: 'GER101', faculty: 'Prof. Claudia M', type: 'lecture' },
      2: { title: 'Foreign Language Elective (Japanese A1)', courseCode: 'JPN101', faculty: 'Prof. Tanaka H', type: 'lecture' }
    })
  },
  {
    id: 'room-109',
    name: 'Robotics & Automation Studio 109',
    code: '109',
    category: 'Computer / Tech Lab',
    wing: 'East Wing',
    block: 'Block A',
    floor: 1,
    floorLabel: '1st Floor',
    capacity: 45,
    chargingPoints: 22,
    totalSockets: 24,
    hasAC: true,
    acType: 'Dual Split AC',
    acStatus: 'Optimal (21°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Collaborative Buzz',
    comfortScore: 9.1,
    currentOccupancy: 18,
    crowdLevel: 'Light (15-35%)',
    amenities: ['Dual Split AC', '22 Heavy Sockets', 'Robotic Arms', '3D Printers', 'Soldering Stations'],
    description: 'Robotics hub with heavy-duty power outlets and wide anti-static testing tables.',
    bestFor: ['Robotics coding', 'Microcontroller flashing', 'Team hardware projects'],
    todaySchedule: createSlots('109', [5, 6], {
      5: { title: 'Robotics Kinematics & ROS Lab', courseCode: 'ROB301', faculty: 'Dr. Vivek B', type: 'lab' },
      6: { title: 'Robotics Kinematics Lab (Cont.)', courseCode: 'ROB301', faculty: 'Dr. Vivek B', type: 'lab' }
    })
  },
  {
    id: 'room-110',
    name: 'Silent Reading Cubicle Pods 110',
    code: '110',
    category: 'Silent Study Pod',
    wing: 'West Wing',
    block: 'Block A',
    floor: 1,
    floorLabel: '1st Floor',
    capacity: 22,
    chargingPoints: 22,
    totalSockets: 22,
    hasAC: true,
    acType: 'Inverter Split AC',
    acStatus: 'Chilled (18°C)',
    hasProjector: false,
    hasSmartBoard: false,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Silent Study',
    comfortScore: 9.8,
    currentOccupancy: 8,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Inverter Split AC (18°C)', 'Dedicated Socket at Every Desk', 'Acoustic Partition Walls', 'Ergonomic Mesh Chairs'],
    description: 'Dedicated silent micro-pod room. Each seat has an individual power socket, reading light, and acoustic divider. 100% open for study all day.',
    bestFor: ['Pin-drop silent study', 'Coding marathons', 'Zero distraction reading', 'Exam cramming'],
    todaySchedule: createSlots('110', [])
  },
  {
    id: 'room-111',
    name: 'Silent Study Pods Suite 111',
    code: '111',
    category: 'Silent Study Pod',
    wing: 'West Wing',
    block: 'Block A',
    floor: 1,
    floorLabel: '1st Floor',
    capacity: 20,
    chargingPoints: 20,
    totalSockets: 20,
    hasAC: true,
    acType: 'Inverter Split AC',
    acStatus: 'Chilled (18°C)',
    hasProjector: false,
    hasSmartBoard: false,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Silent Study',
    comfortScore: 9.7,
    currentOccupancy: 5,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Inverter Split AC', '1 Socket Per Seat', 'Individual Desk Lamps', 'Noise Absorbing Carpet'],
    description: 'Second dedicated quiet cubicle suite on Floor 1. Zero lectures scheduled — permanently open for self-study and laptop work.',
    bestFor: ['Coding with headphones', 'Deep focus', 'Writing assignments'],
    todaySchedule: createSlots('111', [])
  },
  {
    id: 'room-112',
    name: 'Foundations Seminar Room 112',
    code: '112',
    category: 'Smart Classroom',
    wing: 'Central Block',
    block: 'Block A',
    floor: 1,
    floorLabel: '1st Floor',
    capacity: 60,
    chargingPoints: 16,
    totalSockets: 18,
    hasAC: true,
    acType: 'Dual Split AC',
    acStatus: 'Optimal (21°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Excellent',
    noiseVibe: 'Moderate / Group Work',
    comfortScore: 9.0,
    currentOccupancy: 20,
    crowdLevel: 'Light (15-35%)',
    amenities: ['Dual Split AC', '16 Power Sockets', 'Smart Interactive Board', 'Surround Sound'],
    description: 'Modern seminar room with presentation podium and wide tables.',
    bestFor: ['Group presentations', 'Rehearsals', 'Laptop work'],
    todaySchedule: createSlots('112', [2, 3], {
      2: { title: 'Principles of Management & Economics', courseCode: 'HUM201', faculty: 'Dr. Radhika P', type: 'lecture' },
      3: { title: 'Intellectual Property Rights (IPR)', courseCode: 'LAW301', faculty: 'Prof. Kiran J', type: 'lecture' }
    })
  },

  // ==========================================
  // FLOOR 2 (13 ROOMS)
  // ==========================================
  {
    id: 'room-201',
    name: 'Auditorium Hall 201',
    code: '201',
    category: 'Seminar Amphitheatre',
    wing: 'Central Block',
    block: 'Block A',
    floor: 2,
    floorLabel: '2nd Floor',
    capacity: 80,
    chargingPoints: 24,
    totalSockets: 26,
    hasAC: true,
    acType: 'Central Climate Control (HVAC)',
    acStatus: 'Chilled (19°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Moderate / Group Work',
    comfortScore: 9.7,
    currentOccupancy: 15,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Central Chilled AC', '24 Multi-Plug Sockets', 'Dual 4K Projectors', 'Wireless Mic Podium', 'Stepped Tiered Seating', 'Cushioned Chairs'],
    description: 'High-capacity tiered lecture hall with central climate control and multi-port charging stations on every second row.',
    bestFor: ['Team presentations', 'Fast laptop charging', 'Staying cool during hot afternoons', 'Large study groups'],
    todaySchedule: createSlots('201', [1, 2, 6], {
      1: { title: 'AI & Machine Learning Foundations', courseCode: 'AIML301', faculty: 'Dr. Siddharth Mehta', type: 'lecture' },
      2: { title: 'Computer Networks & Protocols', courseCode: 'CSE305', faculty: 'Prof. Deepa Nair', type: 'lecture' },
      6: { title: 'Software Engineering & Agile Methodologies', courseCode: 'CSE308', faculty: 'Dr. Arvind Kumar', type: 'lecture' }
    })
  },
  {
    id: 'room-204',
    name: 'Classroom 204 (Core CSE)',
    code: '204',
    category: 'Smart Classroom',
    wing: 'West Wing',
    block: 'Block B',
    floor: 2,
    floorLabel: '2nd Floor',
    capacity: 55,
    chargingPoints: 16,
    totalSockets: 18,
    hasAC: true,
    acType: 'Dual Split AC (2.0 Ton)',
    acStatus: 'Optimal (20°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Moderate / Group Work',
    comfortScore: 9.2,
    currentOccupancy: 20,
    crowdLevel: 'Light (15-35%)',
    amenities: ['Dual Split AC', '16 Fast Outlets', 'HD Projector', 'Smart Touch Screen', 'Padded Benches'],
    description: 'Central 2nd-floor learning center in Block B with abundant natural light and dedicated power strips on every alternating row.',
    bestFor: ['Group coding', 'Presentation dry runs', 'Comfortable AC seating'],
    todaySchedule: createSlots('204', [0, 1, 6], {
      0: { title: 'Object Oriented Programming with Java', courseCode: 'CSE303', faculty: 'Prof. Harish R', type: 'lecture' },
      1: { title: 'Object Oriented Programming (Cont.)', courseCode: 'CSE303', faculty: 'Prof. Harish R', type: 'lecture' },
      6: { title: 'Database Management Systems (DBMS)', courseCode: 'CSE306', faculty: 'Dr. Kavitha M', type: 'lecture' }
    })
  },
  {
    id: 'room-202',
    name: 'Data Structures & Algorithms Lab 202',
    code: '202',
    category: 'Computer / Tech Lab',
    wing: 'East Wing',
    block: 'Block B',
    floor: 2,
    floorLabel: '2nd Floor',
    capacity: 60,
    chargingPoints: 35,
    totalSockets: 36,
    hasAC: true,
    acType: 'Central Climate Control',
    acStatus: 'Chilled (19°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Silent Study',
    comfortScore: 9.6,
    currentOccupancy: 10,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Central AC', '35 High-Power Sockets', 'Gigabit Ethernet', 'Dual Monitors'],
    description: 'Flagship DSA computer laboratory with 35 power outlets and high-speed fiber internet.',
    bestFor: ['Competitive programming', 'LeetCode practice', 'High-power laptop workstations'],
    todaySchedule: createSlots('202', [0, 1, 5], {
      0: { title: 'Data Structures Lab Batch 1', courseCode: 'CSE301L', faculty: 'Prof. Shailaja V', type: 'lab' },
      1: { title: 'Data Structures Lab (Cont.)', courseCode: 'CSE301L', faculty: 'Prof. Shailaja V', type: 'lab' },
      5: { title: 'Algorithm Analysis Lab', courseCode: 'CSE303L', faculty: 'Dr. Ramesh R', type: 'lab' }
    })
  },
  {
    id: 'room-203',
    name: 'Java & Backend Studio 203',
    code: '203',
    category: 'Computer / Tech Lab',
    wing: 'East Wing',
    block: 'Block B',
    floor: 2,
    floorLabel: '2nd Floor',
    capacity: 50,
    chargingPoints: 28,
    totalSockets: 30,
    hasAC: true,
    acType: 'Dual Split AC',
    acStatus: 'Optimal (20°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Collaborative Buzz',
    comfortScore: 9.3,
    currentOccupancy: 15,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Dual Split AC', '28 Sockets', 'Spring Boot Testbeds', 'Smart Board'],
    description: 'Enterprise Java and backend engineering studio with abundant wall and floor power boxes.',
    bestFor: ['Backend development', 'Docker/Spring projects', 'Team coding'],
    todaySchedule: createSlots('203', [2, 3], {
      2: { title: 'Advanced Java Programming Lab', courseCode: 'CSE309L', faculty: 'Prof. Harish R', type: 'lab' },
      3: { title: 'Advanced Java Lab (Cont.)', courseCode: 'CSE309L', faculty: 'Prof. Harish R', type: 'lab' }
    })
  },
  {
    id: 'room-205',
    name: 'Database Management Systems Lab 205',
    code: '205',
    category: 'Computer / Tech Lab',
    wing: 'West Wing',
    block: 'Block B',
    floor: 2,
    floorLabel: '2nd Floor',
    capacity: 55,
    chargingPoints: 30,
    totalSockets: 32,
    hasAC: true,
    acType: 'Central Climate Control',
    acStatus: 'Chilled (19°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Silent Study',
    comfortScore: 9.5,
    currentOccupancy: 12,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Central AC', '30 Sockets', 'PostgreSQL/Oracle Servers', 'Wide Desks'],
    description: 'Dedicated DBMS and SQL query optimization lab with high power outlet density.',
    bestFor: ['Database design', 'Full-stack development', 'Charging heavy laptops'],
    todaySchedule: createSlots('205', [5, 6], {
      5: { title: 'DBMS Practical Batch C', courseCode: 'CSE306L', faculty: 'Dr. Kavitha M', type: 'lab' },
      6: { title: 'DBMS Practical (Cont.)', courseCode: 'CSE306L', faculty: 'Dr. Kavitha M', type: 'lab' }
    })
  },
  {
    id: 'room-206',
    name: 'Discrete Math & Logic Classroom 206',
    code: '206',
    category: 'Smart Classroom',
    wing: 'Central Block',
    block: 'Block B',
    floor: 2,
    floorLabel: '2nd Floor',
    capacity: 65,
    chargingPoints: 14,
    totalSockets: 16,
    hasAC: true,
    acType: 'Dual Split AC',
    acStatus: 'Optimal (21°C)',
    hasProjector: true,
    hasSmartBoard: false,
    wifiStrength: 'Excellent',
    noiseVibe: 'Silent Study',
    comfortScore: 8.9,
    currentOccupancy: 20,
    crowdLevel: 'Light (15-35%)',
    amenities: ['Dual Split AC', '14 Sockets', 'Double Full-length Whiteboards', 'High Ceilings'],
    description: 'Airy 2nd floor lecture hall featuring double full-length whiteboards for mathematical derivations.',
    bestFor: ['Solo study', 'Graph theory & math practice', 'Note revision'],
    todaySchedule: createSlots('206', [0, 1, 7], {
      0: { title: 'Discrete Mathematical Structures', courseCode: 'MAT303', faculty: 'Dr. Sunita K', type: 'lecture' },
      1: { title: 'Formal Languages & Automata Theory', courseCode: 'CSE307', faculty: 'Dr. Anand Murthy', type: 'lecture' },
      7: { title: 'Automata Problem Solving Circle', courseCode: 'CSE307T', faculty: 'Dr. Anand Murthy', type: 'tutorial' }
    })
  },
  {
    id: 'room-207',
    name: 'Microprocessors & Embedded Lab 207',
    code: '207',
    category: 'Computer / Tech Lab',
    wing: 'East Wing',
    block: 'Block B',
    floor: 2,
    floorLabel: '2nd Floor',
    capacity: 45,
    chargingPoints: 25,
    totalSockets: 28,
    hasAC: true,
    acType: 'Dual Split AC',
    acStatus: 'Optimal (20°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Collaborative Buzz',
    comfortScore: 9.1,
    currentOccupancy: 15,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Dual Split AC', '25 Sockets', '8086/ARM Trainer Kits', 'Logic Analyzers'],
    description: 'Hardware microprocessing lab with power outlets at every desk bench.',
    bestFor: ['Assembly language', 'Embedded systems', 'Device charging'],
    todaySchedule: createSlots('207', [2, 3], {
      2: { title: 'Microprocessors 8086 & ARM Lab', courseCode: 'ECE310L', faculty: 'Prof. Tejaswi K', type: 'lab' },
      3: { title: 'Microprocessors Lab (Cont.)', courseCode: 'ECE310L', faculty: 'Prof. Tejaswi K', type: 'lab' }
    })
  },
  {
    id: 'room-208',
    name: 'Mentoring & Peer Pod 208',
    code: '208',
    category: 'Silent Study Pod',
    wing: 'West Wing',
    block: 'Block B',
    floor: 2,
    floorLabel: '2nd Floor',
    capacity: 18,
    chargingPoints: 14,
    totalSockets: 14,
    hasAC: true,
    acType: 'Inverter AC',
    acStatus: 'Chilled (19°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Silent Study',
    comfortScore: 9.6,
    currentOccupancy: 6,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Inverter AC', '14 Sockets', 'Acoustic Soundproofing', 'Mini Smart Screen'],
    description: 'Quiet mentoring suite designed for deep study sessions or small team thesis reviews.',
    bestFor: ['Deep coding', '1-on-1 tutoring', 'Silent reading'],
    todaySchedule: createSlots('208', [])
  },
  {
    id: 'room-209',
    name: 'Peer Collaboration Suite 209',
    code: '209',
    category: 'Silent Study Pod',
    wing: 'West Wing',
    block: 'Block B',
    floor: 2,
    floorLabel: '2nd Floor',
    capacity: 18,
    chargingPoints: 14,
    totalSockets: 14,
    hasAC: true,
    acType: 'Inverter AC',
    acStatus: 'Chilled (19°C)',
    hasProjector: false,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Silent Study',
    comfortScore: 9.6,
    currentOccupancy: 4,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Inverter AC', '14 Sockets', 'Whiteboard Walls', 'Cushioned Swivel Chairs'],
    description: 'Sound-insulated study suite with whiteboard walls for group sketching without noise leakage.',
    bestFor: ['Whiteboard brainstorming', 'Solo sprint', 'Power charging'],
    todaySchedule: createSlots('209', [])
  },
  {
    id: 'room-210',
    name: 'Operating Systems Kernel Studio 210',
    code: '210',
    category: 'Computer / Tech Lab',
    wing: 'East Wing',
    block: 'Block B',
    floor: 2,
    floorLabel: '2nd Floor',
    capacity: 50,
    chargingPoints: 26,
    totalSockets: 28,
    hasAC: true,
    acType: 'Dual Split AC',
    acStatus: 'Chilled (19°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Silent Study',
    comfortScore: 9.4,
    currentOccupancy: 14,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Dual Split AC', '26 Sockets', 'Linux Ubuntu Workstations', 'Dual 4K Displays'],
    description: 'Linux systems development studio with dedicated root development workstations.',
    bestFor: ['C/C++ development', 'Linux kernels', 'Fast laptop recharge'],
    todaySchedule: createSlots('210', [0, 1], {
      0: { title: 'Operating Systems & Concurrency Lab', courseCode: 'CSE304L', faculty: 'Dr. Swetha Hegde', type: 'lab' },
      1: { title: 'OS Lab (Cont.)', courseCode: 'CSE304L', faculty: 'Dr. Swetha Hegde', type: 'lab' }
    })
  },
  {
    id: 'room-211',
    name: 'Computer Architecture Hall 211',
    code: '211',
    category: 'Smart Classroom',
    wing: 'Central Block',
    block: 'Block B',
    floor: 2,
    floorLabel: '2nd Floor',
    capacity: 70,
    chargingPoints: 18,
    totalSockets: 20,
    hasAC: true,
    acType: 'Dual Split AC',
    acStatus: 'Optimal (21°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Excellent',
    noiseVibe: 'Moderate / Group Work',
    comfortScore: 9.1,
    currentOccupancy: 22,
    crowdLevel: 'Light (15-35%)',
    amenities: ['Dual Split AC', '18 Sockets', 'Surround Sound', 'Smart Podium'],
    description: 'Spacious 2nd floor lecture amphitheatre with 18 power outlets and high airflow.',
    bestFor: ['Study groups', 'Staying cool', 'Laptop work'],
    todaySchedule: createSlots('211', [3, 4, 7], {
      3: { title: 'Computer Organization & Architecture', courseCode: 'CSE312', faculty: 'Prof. Ramesh Rao', type: 'lecture' },
      4: { title: 'Digital Logic Optimization', courseCode: 'ECE205', faculty: 'Dr. Varun G', type: 'lecture' },
      7: { title: 'Architecture Seminar Series', courseCode: 'CSE312S', faculty: 'Guest Speaker', type: 'seminar' }
    })
  },
  {
    id: 'room-212',
    name: 'Competitive Programming Arena 212',
    code: '212',
    category: 'Computer / Tech Lab',
    wing: 'East Wing',
    block: 'Block B',
    floor: 2,
    floorLabel: '2nd Floor',
    capacity: 40,
    chargingPoints: 24,
    totalSockets: 26,
    hasAC: true,
    acType: 'Dual Split AC',
    acStatus: 'Chilled (18°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Silent Study',
    comfortScore: 9.7,
    currentOccupancy: 8,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Dual Split AC (18°C)', '24 Sockets', 'Gigabit Low-Latency Fiber', 'Mechanical Keyboards'],
    description: 'Hackathon and competitive coding arena. Ultra-fast Wi-Fi, chilled AC, and power outlets on every desk.',
    bestFor: ['Codeforces/LeetCode contests', 'Zero-lag testing', 'Fast laptop charging'],
    todaySchedule: createSlots('212', [6, 7], {
      6: { title: 'ICPC & Competitive Coding Training', courseCode: 'CP301', faculty: 'Prof. Harish R', type: 'workshop' },
      7: { title: 'Live Coding Contest Simulation', courseCode: 'CP301', faculty: 'Prof. Harish R', type: 'workshop' }
    })
  },
  {
    id: 'room-214',
    name: 'AICTE Innovation Studio 214',
    code: '214',
    category: 'Design & Innovation Studio',
    wing: 'Central Block',
    block: 'Block B',
    floor: 2,
    floorLabel: '2nd Floor',
    capacity: 48,
    chargingPoints: 20,
    totalSockets: 22,
    hasAC: true,
    acType: 'Central Climate Control',
    acStatus: 'Optimal (20°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Collaborative Buzz',
    comfortScore: 9.5,
    currentOccupancy: 14,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Central AC', '20 Fast Outlets', 'Modular Hexagon Tables', 'Movable Smart Displays'],
    description: 'Hexagon-configured modular design studio for agile team ideation and hackathon builds.',
    bestFor: ['Design Thinking teamwork', 'Group sprint', 'Prototyping'],
    todaySchedule: createSlots('214', [1, 5], {
      1: { title: 'Startup Incubation & Pitch Workshop', courseCode: 'ENT302', faculty: 'Prof. Rohit Bhat', type: 'workshop' },
      5: { title: 'Patent Drafting & IP Strategy', courseCode: 'IPR401', faculty: 'Dr. Praveen S', type: 'workshop' }
    })
  },

  // ==========================================
  // FLOOR 3 (13 ROOMS)
  // ==========================================
  {
    id: 'room-301b',
    name: 'AI & Machine Learning Hub 301B',
    code: '301B',
    category: 'Smart Classroom',
    wing: 'West Wing',
    block: 'Block B',
    floor: 3,
    floorLabel: '3rd Floor',
    capacity: 45,
    chargingPoints: 16,
    totalSockets: 18,
    hasAC: true,
    acType: 'Inverter Split AC (1.5 Ton)',
    acStatus: 'Optimal (21°C)',
    hasProjector: true,
    hasSmartBoard: false,
    wifiStrength: 'Excellent',
    noiseVibe: 'Silent Study',
    comfortScore: 9.3,
    currentOccupancy: 15,
    crowdLevel: 'Light (15-35%)',
    amenities: ['Inverter Split AC', '16 Power Sockets', 'High-Definition Projector', 'Magnetic Whiteboard', 'Natural Daylight Corner'],
    description: 'Quiet corner room on the 3rd floor of Block B. Natural daylight and silent atmosphere make it ideal for deep study.',
    bestFor: ['Pin-drop silent reading', 'Thesis & assignment writing', 'Individual focus time'],
    todaySchedule: createSlots('301b', [2, 3, 7], {
      2: { title: 'Cybersecurity Fundamentals & Cryptography', courseCode: 'IS302', faculty: 'Prof. Karthik G', type: 'lecture' },
      3: { title: 'Operating Systems & Concurrency', courseCode: 'CSE304', faculty: 'Dr. Swetha Hegde', type: 'lecture' },
      7: { title: 'Cloud Computing Architecture Seminar', courseCode: 'CC309', faculty: 'Prof. Rajesh Menon', type: 'seminar' }
    })
  },
  {
    id: 'room-318b',
    name: 'Design Thinking Studio 318B',
    code: '318B',
    category: 'Design & Innovation Studio',
    wing: 'Central Block',
    block: 'Block B',
    floor: 3,
    floorLabel: '3rd Floor',
    capacity: 50,
    chargingPoints: 22,
    totalSockets: 24,
    hasAC: true,
    acType: 'Dual Split Inverter AC',
    acStatus: 'Optimal (20°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Collaborative Buzz',
    comfortScore: 9.6,
    currentOccupancy: 25,
    crowdLevel: 'Light (15-35%)',
    amenities: ['Dual Split Inverter AC', '22 Fast Charging Outlets', 'Dual Interactive Smart Boards', 'Mobile Whiteboard Stands', 'Acoustic Wall Panels'],
    description: 'Modern collaborative design studio on the 3rd floor. Equipped with 22 fast power sockets and movable whiteboards tailored for Design Thinking group work.',
    bestFor: ['Design Thinking teamwork', 'Group brainstorming & Miro boards', 'Charging multiple laptops simultaneously', 'UI/UX prototyping'],
    todaySchedule: createSlots('318b', [3, 5, 6], {
      3: { title: 'Human-Computer Interaction (HCI)', courseCode: 'CSE311', faculty: 'Dr. Nilotpal Roy', type: 'lecture' },
      5: { title: 'Web Tech & Cloud Full-Stack Lab', courseCode: 'CSE314', faculty: 'Prof. Sneha Verma', type: 'lab' },
      6: { title: 'Web Tech & Cloud Lab (Cont.)', courseCode: 'CSE314', faculty: 'Prof. Sneha Verma', type: 'lab' }
    })
  },
  {
    id: 'room-305a',
    name: 'Silent Focus Sanctuary 305A',
    code: '305A',
    category: 'Smart Classroom',
    wing: 'West Wing',
    block: 'Block A',
    floor: 3,
    floorLabel: '3rd Floor',
    capacity: 48,
    chargingPoints: 16,
    totalSockets: 18,
    hasAC: true,
    acType: 'Inverter Split AC',
    acStatus: 'Optimal (21°C)',
    hasProjector: true,
    hasSmartBoard: false,
    wifiStrength: 'Excellent',
    noiseVibe: 'Silent Study',
    comfortScore: 9.1,
    currentOccupancy: 12,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Inverter AC', '16 Sockets', 'Whiteboard', 'Double Glazed Soundproof Windows'],
    description: 'Sound-insulated classroom on Floor 3 with double-glazed windows shielding quadrangle noise.',
    bestFor: ['Exam revision', 'Deep reading', 'Quiet coding with headphones'],
    todaySchedule: createSlots('305a', [2, 7], {
      2: { title: 'Theory of Computation & Automata', courseCode: 'CSE307', faculty: 'Dr. Anand Murthy', type: 'lecture' },
      7: { title: 'Microprocessors & Embedded Systems', courseCode: 'ECE310', faculty: 'Prof. Tejaswi K', type: 'lecture' }
    })
  },
  {
    id: 'room-302a',
    name: 'Full Stack Web Development Lab 302A',
    code: '302A',
    category: 'Computer / Tech Lab',
    wing: 'East Wing',
    block: 'Block A',
    floor: 3,
    floorLabel: '3rd Floor',
    capacity: 60,
    chargingPoints: 32,
    totalSockets: 34,
    hasAC: true,
    acType: 'Central Climate Control',
    acStatus: 'Chilled (19°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Collaborative Buzz',
    comfortScore: 9.5,
    currentOccupancy: 20,
    crowdLevel: 'Light (15-35%)',
    amenities: ['Central AC', '32 Sockets', 'Node.js & React Frameworks', '4K Projector'],
    description: 'Full stack development lab with 32 power outlets and high-speed network connections.',
    bestFor: ['Web development', 'Next.js projects', 'High-power devices'],
    todaySchedule: createSlots('302a', [0, 1, 5], {
      0: { title: 'Full Stack Web Development Lab Batch 1', courseCode: 'CSE315L', faculty: 'Prof. Abhishek Rao', type: 'lab' },
      1: { title: 'Full Stack Web Lab (Cont.)', courseCode: 'CSE315L', faculty: 'Prof. Abhishek Rao', type: 'lab' },
      5: { title: 'Full Stack Web Lab Batch 2', courseCode: 'CSE315L', faculty: 'Prof. Abhishek Rao', type: 'lab' }
    })
  },
  {
    id: 'room-303b',
    name: 'Cloud Computing & AWS Academy 303B',
    code: '303B',
    category: 'Computer / Tech Lab',
    wing: 'East Wing',
    block: 'Block B',
    floor: 3,
    floorLabel: '3rd Floor',
    capacity: 55,
    chargingPoints: 28,
    totalSockets: 30,
    hasAC: true,
    acType: 'Central Climate Control',
    acStatus: 'Chilled (19°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Silent Study',
    comfortScore: 9.4,
    currentOccupancy: 15,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Central AC', '28 Sockets', 'AWS Cloud Sandbox', 'Smart Presentation Screen'],
    description: 'Cloud architecture lab authorized for AWS Academy certifications and cloud computing labs.',
    bestFor: ['Cloud deployments', 'Certification study', 'Laptop charging'],
    todaySchedule: createSlots('303b', [2, 3], {
      2: { title: 'Cloud Infrastructure & Virtualization', courseCode: 'CC301L', faculty: 'Dr. Shalini Roy', type: 'lab' },
      3: { title: 'Cloud Infrastructure Lab (Cont.)', courseCode: 'CC301L', faculty: 'Dr. Shalini Roy', type: 'lab' }
    })
  },
  {
    id: 'room-304a',
    name: 'Cybersecurity & Ethical Hacking Lab 304A',
    code: '304A',
    category: 'Computer / Tech Lab',
    wing: 'West Wing',
    block: 'Block A',
    floor: 3,
    floorLabel: '3rd Floor',
    capacity: 45,
    chargingPoints: 24,
    totalSockets: 26,
    hasAC: true,
    acType: 'Dual Split AC',
    acStatus: 'Chilled (19°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Silent Study',
    comfortScore: 9.3,
    currentOccupancy: 10,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Dual Split AC', '24 Sockets', 'Isolated Cyber Range Network', 'Dual Displays'],
    description: 'Cyber forensics and network defense laboratory with isolated testbeds and high power availability.',
    bestFor: ['Cybersecurity practice', 'CTF challenges', 'Heavy laptop work'],
    todaySchedule: createSlots('304a', [5, 6], {
      5: { title: 'Ethical Hacking & Penetration Testing', courseCode: 'SEC302L', faculty: 'Prof. Karthik G', type: 'lab' },
      6: { title: 'Ethical Hacking (Cont.)', courseCode: 'SEC302L', faculty: 'Prof. Karthik G', type: 'lab' }
    })
  },
  {
    id: 'room-306b',
    name: 'Natural Language Processing Hub 306B',
    code: '306B',
    category: 'Computer / Tech Lab',
    wing: 'East Wing',
    block: 'Block B',
    floor: 3,
    floorLabel: '3rd Floor',
    capacity: 40,
    chargingPoints: 20,
    totalSockets: 22,
    hasAC: true,
    acType: 'Dual Split AC',
    acStatus: 'Optimal (20°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Silent Study',
    comfortScore: 9.2,
    currentOccupancy: 12,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Dual Split AC', '20 Sockets', 'PyTorch / Transformers Environments', 'HD Screen'],
    description: 'NLP and LLM experimentation center with GPU servers connected over campus intranet.',
    bestFor: ['AI/NLP coding', 'Model training', 'Focus study'],
    todaySchedule: createSlots('306b', [1, 2], {
      1: { title: 'Natural Language Processing Algorithms', courseCode: 'AIML304', faculty: 'Dr. Siddharth M', type: 'lecture' },
      2: { title: 'NLP Project Tutorial', courseCode: 'AIML304T', faculty: 'Dr. Siddharth M', type: 'tutorial' }
    })
  },
  {
    id: 'room-307a',
    name: 'Mobile App Development Studio 307A',
    code: '307A',
    category: 'Computer / Tech Lab',
    wing: 'West Wing',
    block: 'Block A',
    floor: 3,
    floorLabel: '3rd Floor',
    capacity: 42,
    chargingPoints: 26,
    totalSockets: 28,
    hasAC: true,
    acType: 'Dual Split AC',
    acStatus: 'Optimal (21°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Collaborative Buzz',
    comfortScore: 9.3,
    currentOccupancy: 18,
    crowdLevel: 'Light (15-35%)',
    amenities: ['Dual Split AC', '26 Sockets', 'Flutter & Swift SDKs', 'Testing Device Hubs'],
    description: 'iOS and Android application studio with USB charging testbeds and power strips.',
    bestFor: ['Mobile coding', 'App testing on devices', 'Fast charging'],
    todaySchedule: createSlots('307a', [3, 4], {
      3: { title: 'Cross-Platform Mobile App Dev (Flutter)', courseCode: 'CSE316L', faculty: 'Prof. Divya S', type: 'lab' },
      4: { title: 'Mobile App Dev Lab (Cont.)', courseCode: 'CSE316L', faculty: 'Prof. Divya S', type: 'lab' }
    })
  },
  {
    id: 'room-308b',
    name: 'UI/UX Ergonomics Studio 308B',
    code: '308B',
    category: 'Design & Innovation Studio',
    wing: 'Central Block',
    block: 'Block B',
    floor: 3,
    floorLabel: '3rd Floor',
    capacity: 35,
    chargingPoints: 18,
    totalSockets: 20,
    hasAC: true,
    acType: 'Inverter Split AC',
    acStatus: 'Optimal (20°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Collaborative Buzz',
    comfortScore: 9.6,
    currentOccupancy: 12,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Inverter AC', '18 Sockets', 'Figma Wacom Tablets', 'Ergonomic Pod Desks'],
    description: 'Design Thinking and UI/UX laboratory with digital drawing tablets and acoustic comfort.',
    bestFor: ['Figma wireframing', 'UI design', 'Design Thinking sprints'],
    todaySchedule: createSlots('308b', [0, 6], {
      0: { title: 'Design Thinking UI/UX Sprint', courseCode: 'DT305', faculty: 'Prof. Ananya Sen', type: 'workshop' },
      6: { title: 'Usability Testing & Eye Tracking', courseCode: 'DT306', faculty: 'Dr. Nilotpal Roy', type: 'lab' }
    })
  },
  {
    id: 'room-309a',
    name: 'Software Testing & DevOps Lab 309A',
    code: '309A',
    category: 'Computer / Tech Lab',
    wing: 'West Wing',
    block: 'Block A',
    floor: 3,
    floorLabel: '3rd Floor',
    capacity: 50,
    chargingPoints: 26,
    totalSockets: 28,
    hasAC: true,
    acType: 'Dual Split AC',
    acStatus: 'Chilled (19°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Silent Study',
    comfortScore: 9.3,
    currentOccupancy: 14,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Dual Split AC', '26 Sockets', 'Selenium / Jenkins Testbeds', 'Smart Screen'],
    description: 'Automated software testing and CI/CD studio with extensive desktop power points.',
    bestFor: ['Software testing', 'Solo coding', 'Device charging'],
    todaySchedule: createSlots('309a', [2, 3], {
      2: { title: 'Software Testing & Automation Lab', courseCode: 'CSE317L', faculty: 'Prof. Vinay K', type: 'lab' },
      3: { title: 'Software Testing Lab (Cont.)', courseCode: 'CSE317L', faculty: 'Prof. Vinay K', type: 'lab' }
    })
  },
  {
    id: 'room-310b',
    name: 'Quiet Study Pods Suite 310B',
    code: '310B',
    category: 'Silent Study Pod',
    wing: 'West Wing',
    block: 'Block B',
    floor: 3,
    floorLabel: '3rd Floor',
    capacity: 18,
    chargingPoints: 18,
    totalSockets: 18,
    hasAC: true,
    acType: 'Inverter Split AC',
    acStatus: 'Chilled (18°C)',
    hasProjector: false,
    hasSmartBoard: false,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Silent Study',
    comfortScore: 9.8,
    currentOccupancy: 6,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Inverter Split AC (18°C)', '1 Socket Per Seat', 'Acoustic Soundproofing', 'Private Carrels'],
    description: '3rd Floor quiet study haven with 18 private study carrels, each with dedicated power and lamp.',
    bestFor: ['Pin-drop silence', 'Extended reading', 'Coding without distractions'],
    todaySchedule: createSlots('310b', [])
  },
  {
    id: 'room-311a',
    name: 'Silent Study Pods Suite 311A',
    code: '311A',
    category: 'Silent Study Pod',
    wing: 'West Wing',
    block: 'Block A',
    floor: 3,
    floorLabel: '3rd Floor',
    capacity: 18,
    chargingPoints: 18,
    totalSockets: 18,
    hasAC: true,
    acType: 'Inverter Split AC',
    acStatus: 'Chilled (18°C)',
    hasProjector: false,
    hasSmartBoard: false,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Silent Study',
    comfortScore: 9.7,
    currentOccupancy: 4,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Inverter AC', '18 Sockets', 'Carrel Dividers', 'High-Speed Wi-Fi'],
    description: 'Sister silent study pod on 3rd Floor Block A. Uninterrupted access all day.',
    bestFor: ['Solo coding sprints', 'Exam prep', 'Laptop power charging'],
    todaySchedule: createSlots('311a', [])
  },
  {
    id: 'room-315b',
    name: 'Open Source Guild Room 315B',
    code: '315B',
    category: 'Design & Innovation Studio',
    wing: 'Central Block',
    block: 'Block B',
    floor: 3,
    floorLabel: '3rd Floor',
    capacity: 40,
    chargingPoints: 20,
    totalSockets: 22,
    hasAC: true,
    acType: 'Dual Split AC',
    acStatus: 'Optimal (21°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Collaborative Buzz',
    comfortScore: 9.4,
    currentOccupancy: 16,
    crowdLevel: 'Light (15-35%)',
    amenities: ['Dual Split AC', '20 Sockets', 'Dual Smart Monitors', 'Whiteboard Stands'],
    description: 'Community guild room for open source contributions, club meetings, and hackathons.',
    bestFor: ['GitHub collaboration', 'Team hackathons', 'Tech talks'],
    todaySchedule: createSlots('315b', [4, 7], {
      4: { title: 'Open Source Contribution Sprint', courseCode: 'OSS201', faculty: 'Student Club', type: 'workshop' },
      7: { title: 'Weekly Tech Seminar & Demo', courseCode: 'OSS202', faculty: 'Student Club', type: 'seminar' }
    })
  },

  // ==========================================
  // FLOOR 4 (13 ROOMS)
  // ==========================================
  {
    id: 'room-402',
    name: 'Terrace Smart Classroom 402',
    code: '402',
    category: 'Smart Classroom',
    wing: 'Central Block',
    block: 'Block A',
    floor: 4,
    floorLabel: '4th Floor',
    capacity: 70,
    chargingPoints: 20,
    totalSockets: 22,
    hasAC: true,
    acType: 'High-Ventilation Smart AC (3.0 Ton)',
    acStatus: 'Optimal (22°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Excellent',
    noiseVibe: 'Moderate / Group Work',
    comfortScore: 9.3,
    currentOccupancy: 10,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['High-Ventilation AC', '20 Power Sockets', 'Panoramic Terrace View', 'Full HD Smart Projector', 'Ergonomic Wide Desks'],
    description: 'Spacious 4th-floor room with panoramic rooftop breeze, floor-to-ceiling glass windows, and high-ventilation air cooling.',
    bestFor: ['Spacious comfortable study', 'Catching scenic daylight', 'Power charging with room to stretch', 'Afternoon discussions'],
    todaySchedule: createSlots('402', [0, 5], {
      0: { title: 'Data Analytics & Visualization', courseCode: 'CSE320', faculty: 'Dr. Kiran Deshmukh', type: 'lecture' },
      5: { title: 'Entrepreneurship & Innovation (DT E-Cell)', courseCode: 'ENT301', faculty: 'Prof. Rohit Bhat', type: 'workshop' }
    })
  },
  {
    id: 'room-412',
    name: 'Smart Seminar Amphitheatre 412',
    code: '412',
    category: 'Seminar Amphitheatre',
    wing: 'Central Block',
    block: 'Block B',
    floor: 4,
    floorLabel: '4th Floor',
    capacity: 60,
    chargingPoints: 24,
    totalSockets: 26,
    hasAC: true,
    acType: 'Central Climate Control (20°C)',
    acStatus: 'Chilled (19°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Collaborative Buzz',
    comfortScore: 9.7,
    currentOccupancy: 20,
    crowdLevel: 'Light (15-35%)',
    amenities: ['Central Climate Control', '24 Fast Power Outlets', 'Dual 4K Laser Screens', 'Surround Audio', 'Ergonomic Executive Seating'],
    description: 'Executive smart seminar hall on the top floor of Block B. High power outlet density and high-speed Wi-Fi make it ideal for power users.',
    bestFor: ['Group hackathons', 'All-day laptop work', 'High-power device setups', 'Presentations'],
    todaySchedule: createSlots('412', [3, 6], {
      3: { title: 'Full Stack Web Development Capstone', courseCode: 'CSE315', faculty: 'Prof. Abhishek Rao', type: 'workshop' },
      6: { title: 'Cloud DevOps & CI/CD Pipeline Workshop', courseCode: 'CSE318', faculty: 'Dr. Shalini Roy', type: 'workshop' }
    })
  },
  {
    id: 'room-401',
    name: 'DevOps & Cloud Orchestration Lab 401',
    code: '401',
    category: 'Computer / Tech Lab',
    wing: 'East Wing',
    block: 'Block A',
    floor: 4,
    floorLabel: '4th Floor',
    capacity: 50,
    chargingPoints: 28,
    totalSockets: 30,
    hasAC: true,
    acType: 'Central Climate Control',
    acStatus: 'Chilled (19°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Silent Study',
    comfortScore: 9.5,
    currentOccupancy: 12,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Central AC', '28 Sockets', 'Kubernetes Clusters', 'Dual Screens'],
    description: 'High-end server infrastructure and DevOps testing lab on Floor 4 with abundant power capacity.',
    bestFor: ['Docker/K8s builds', 'Laptop charging', 'Silent focus'],
    todaySchedule: createSlots('401', [1, 2], {
      1: { title: 'DevOps & Containerization Lab', courseCode: 'CSE401L', faculty: 'Dr. Shalini Roy', type: 'lab' },
      2: { title: 'DevOps Lab (Cont.)', courseCode: 'CSE401L', faculty: 'Dr. Shalini Roy', type: 'lab' }
    })
  },
  {
    id: 'room-403',
    name: 'Distributed Systems & Blockchain Studio 403',
    code: '403',
    category: 'Computer / Tech Lab',
    wing: 'West Wing',
    block: 'Block A',
    floor: 4,
    floorLabel: '4th Floor',
    capacity: 45,
    chargingPoints: 22,
    totalSockets: 24,
    hasAC: true,
    acType: 'Dual Split AC',
    acStatus: 'Optimal (21°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Silent Study',
    comfortScore: 9.3,
    currentOccupancy: 10,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Dual Split AC', '22 Sockets', 'Solidity & Web3 SDKs', 'HD Projector'],
    description: 'Decentralized systems and smart contracts lab with private testing nodes.',
    bestFor: ['Blockchain coding', 'Smart contract audits', 'Individual study'],
    todaySchedule: createSlots('403', [5, 6], {
      5: { title: 'Blockchain & Smart Contracts Lab', courseCode: 'BC301L', faculty: 'Prof. Varun Gowda', type: 'lab' },
      6: { title: 'Blockchain Lab (Cont.)', courseCode: 'BC301L', faculty: 'Prof. Varun Gowda', type: 'lab' }
    })
  },
  {
    id: 'room-404',
    name: 'Computer Vision & AR/VR Studio 404',
    code: '404',
    category: 'Computer / Tech Lab',
    wing: 'West Wing',
    block: 'Block A',
    floor: 4,
    floorLabel: '4th Floor',
    capacity: 38,
    chargingPoints: 22,
    totalSockets: 24,
    hasAC: true,
    acType: 'Dual Split AC',
    acStatus: 'Chilled (19°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Collaborative Buzz',
    comfortScore: 9.4,
    currentOccupancy: 15,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Dual Split AC', '22 Sockets', 'Meta Quest VR Headsets', 'RTX 4080 Workstations'],
    description: 'Spatial computing and computer vision studio with high-wattage power supplies.',
    bestFor: ['Game dev (Unity/Unreal)', 'VR testing', 'High power device charging'],
    todaySchedule: createSlots('404', [2, 3], {
      2: { title: 'Computer Vision & OpenCV Lab', courseCode: 'CV301L', faculty: 'Dr. Siddharth M', type: 'lab' },
      3: { title: 'Computer Vision Lab (Cont.)', courseCode: 'CV301L', faculty: 'Dr. Siddharth M', type: 'lab' }
    })
  },
  {
    id: 'room-405',
    name: 'Quantum Computing Research Hub 405',
    code: '405',
    category: 'Silent Study Pod',
    wing: 'East Wing',
    block: 'Block A',
    floor: 4,
    floorLabel: '4th Floor',
    capacity: 30,
    chargingPoints: 18,
    totalSockets: 20,
    hasAC: true,
    acType: 'Inverter Split AC',
    acStatus: 'Chilled (18°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Silent Study',
    comfortScore: 9.7,
    currentOccupancy: 6,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Inverter AC (18°C)', '18 Sockets', 'Qiskit Sandbox', 'Double Soundproof Walls'],
    description: 'Research center with double soundproof isolation and high-speed simulation nodes.',
    bestFor: ['Deep mathematical research', 'Paper writing', 'Extreme quiet study'],
    todaySchedule: createSlots('405', [0, 7], {
      0: { title: 'Quantum Algorithms & Linear Algebra', courseCode: 'QC401', faculty: 'Dr. Arvind Kumar', type: 'lecture' },
      7: { title: 'Qiskit Simulation Workshop', courseCode: 'QC401W', faculty: 'Dr. Arvind Kumar', type: 'workshop' }
    })
  },
  {
    id: 'room-406',
    name: 'Big Data & Apache Spark Studio 406',
    code: '406',
    category: 'Computer / Tech Lab',
    wing: 'East Wing',
    block: 'Block B',
    floor: 4,
    floorLabel: '4th Floor',
    capacity: 55,
    chargingPoints: 30,
    totalSockets: 32,
    hasAC: true,
    acType: 'Central Climate Control',
    acStatus: 'Chilled (19°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Silent Study',
    comfortScore: 9.5,
    currentOccupancy: 12,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Central AC', '30 Sockets', 'Hadoop / Spark Clusters', 'Wide Monitors'],
    description: 'Distributed computing studio with 30 high-amp power sockets and fiber connection.',
    bestFor: ['Big data pipeline builds', 'Machine learning', 'Laptop charging'],
    todaySchedule: createSlots('406', [1, 2], {
      1: { title: 'Big Data Analytics & Spark Lab', courseCode: 'BDA301L', faculty: 'Dr. Kiran Deshmukh', type: 'lab' },
      2: { title: 'Big Data Analytics Lab (Cont.)', courseCode: 'BDA301L', faculty: 'Dr. Kiran Deshmukh', type: 'lab' }
    })
  },
  {
    id: 'room-407',
    name: 'FinTech & Algorithmic Trading Lab 407',
    code: '407',
    category: 'Computer / Tech Lab',
    wing: 'Central Block',
    block: 'Block B',
    floor: 4,
    floorLabel: '4th Floor',
    capacity: 40,
    chargingPoints: 22,
    totalSockets: 24,
    hasAC: true,
    acType: 'Dual Split AC',
    acStatus: 'Optimal (20°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Silent Study',
    comfortScore: 9.3,
    currentOccupancy: 10,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Dual Split AC', '22 Sockets', 'Financial Time-Series Feeds', 'Dual Screen Desks'],
    description: 'Financial computing laboratory with dual-monitor trading workstations.',
    bestFor: ['Quantitative finance', 'Data analysis', 'Focus work'],
    todaySchedule: createSlots('407', [3, 4], {
      3: { title: 'Algorithmic Trading & FinTech Lab', courseCode: 'FIN301L', faculty: 'Prof. Rajesh Menon', type: 'lab' },
      4: { title: 'Algorithmic Trading Lab (Cont.)', courseCode: 'FIN301L', faculty: 'Prof. Rajesh Menon', type: 'lab' }
    })
  },
  {
    id: 'room-408',
    name: 'IoT Edge & Embedded Systems Studio 408',
    code: '408',
    category: 'Computer / Tech Lab',
    wing: 'East Wing',
    block: 'Block B',
    floor: 4,
    floorLabel: '4th Floor',
    capacity: 45,
    chargingPoints: 26,
    totalSockets: 28,
    hasAC: true,
    acType: 'Dual Split AC',
    acStatus: 'Optimal (21°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Collaborative Buzz',
    comfortScore: 9.2,
    currentOccupancy: 15,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Dual Split AC', '26 Sockets', 'ESP32 & Raspberry Pi Benches', 'Soldering Stations'],
    description: 'Edge computing laboratory with multi-pin power sockets on every desk.',
    bestFor: ['IoT programming', 'Hardware debugging', 'Device charging'],
    todaySchedule: createSlots('408', [5, 6], {
      5: { title: 'Embedded Systems & Real-Time OS Lab', courseCode: 'ECE402L', faculty: 'Prof. Sandeep M', type: 'lab' },
      6: { title: 'Embedded Systems Lab (Cont.)', courseCode: 'ECE402L', faculty: 'Prof. Sandeep M', type: 'lab' }
    })
  },
  {
    id: 'room-409',
    name: 'Bioinformatics Compute Studio 409',
    code: '409',
    category: 'Computer / Tech Lab',
    wing: 'West Wing',
    block: 'Block B',
    floor: 4,
    floorLabel: '4th Floor',
    capacity: 36,
    chargingPoints: 20,
    totalSockets: 22,
    hasAC: true,
    acType: 'Dual Split AC',
    acStatus: 'Chilled (19°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Silent Study',
    comfortScore: 9.4,
    currentOccupancy: 8,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Dual Split AC', '20 Sockets', 'Genomic Pipeline Workstations', 'HD Screen'],
    description: 'Computational biology and genomics lab with comfortable ergonomic seating.',
    bestFor: ['Sequence analysis', 'Heavy computing', 'Silent study'],
    todaySchedule: createSlots('409', [0, 1], {
      0: { title: 'Computational Biology & Genomics', courseCode: 'BIO301L', faculty: 'Dr. Manjunath', type: 'lab' },
      1: { title: 'Computational Biology (Cont.)', courseCode: 'BIO301L', faculty: 'Dr. Manjunath', type: 'lab' }
    })
  },
  {
    id: 'room-410',
    name: 'Rooftop Solarium Focus Lounge 410',
    code: '410',
    category: 'Silent Study Pod',
    wing: 'Central Block',
    block: 'Block A',
    floor: 4,
    floorLabel: '4th Floor',
    capacity: 25,
    chargingPoints: 18,
    totalSockets: 20,
    hasAC: true,
    acType: 'Inverter Climate Control',
    acStatus: 'Chilled (20°C)',
    hasProjector: false,
    hasSmartBoard: false,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Silent Study',
    comfortScore: 9.9,
    currentOccupancy: 8,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Inverter Climate Control', '18 Sockets', 'Skyline Daylight Windows', 'Cushioned Lounge Recliners', 'Zero Scheduled Lectures'],
    description: 'Crown jewel quiet study solarium on Floor 4 with skyline views of Bangalore green canopy. 100% open all day for student focus.',
    bestFor: ['Relaxing study', 'Laptop work with a view', 'Pin-drop silence', 'All-day focus'],
    todaySchedule: createSlots('410', [])
  },
  {
    id: 'room-411',
    name: 'Capstone Project Review Suite 411',
    code: '411',
    category: 'Design & Innovation Studio',
    wing: 'Central Block',
    block: 'Block B',
    floor: 4,
    floorLabel: '4th Floor',
    capacity: 32,
    chargingPoints: 18,
    totalSockets: 20,
    hasAC: true,
    acType: 'Dual Split AC',
    acStatus: 'Optimal (21°C)',
    hasProjector: true,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Collaborative Buzz',
    comfortScore: 9.5,
    currentOccupancy: 12,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Dual Split AC', '18 Fast Sockets', 'Demo Stage & Screen', 'Conference Table'],
    description: 'Presentation suite for final year thesis demos and 3rd sem project sprint presentations.',
    bestFor: ['Presentation dry runs', 'Team project demos', 'Charging multiple laptops'],
    todaySchedule: createSlots('411', [2, 7], {
      2: { title: 'Design Thinking 3rd Sem Prototype Review', courseCode: 'DT309', faculty: 'Dr. Nilotpal Roy', type: 'workshop' },
      7: { title: 'Capstone Milestone Evaluation', courseCode: 'PRJ401', faculty: 'Department Committee', type: 'workshop' }
    })
  },
  {
    id: 'room-415',
    name: 'Research Scholars Pod 415',
    code: '415',
    category: 'Silent Study Pod',
    wing: 'West Wing',
    block: 'Block B',
    floor: 4,
    floorLabel: '4th Floor',
    capacity: 22,
    chargingPoints: 16,
    totalSockets: 16,
    hasAC: true,
    acType: 'Inverter Split AC',
    acStatus: 'Chilled (18°C)',
    hasProjector: false,
    hasSmartBoard: true,
    wifiStrength: 'Ultra-fast (6GHz)',
    noiseVibe: 'Silent Study',
    comfortScore: 9.8,
    currentOccupancy: 5,
    crowdLevel: 'Empty (0-15%)',
    amenities: ['Inverter Split AC (18°C)', '16 Sockets', 'Ergonomic High-Back Chairs', 'Soundproofing'],
    description: 'Quiet research haven on 4th floor west wing. Always open for serious academic writing and research coding.',
    bestFor: ['Research papers', 'Thesis writing', 'Uninterrupted deep work'],
    todaySchedule: createSlots('415', [])
  }
];

export function parseTimeString(timeStr: string): number {
  const parts = timeStr.trim().split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours * 60 + minutes;
}

export function getCurrentSlot(room: Room, currentTimeStr: string): ScheduleSlot | undefined {
  const currentMinutes = parseTimeString(currentTimeStr);
  return room.todaySchedule.find((slot) => {
    const start = parseTimeString(slot.startTime);
    const end = parseTimeString(slot.endTime);
    return currentMinutes >= start && currentMinutes < end;
  });
}

export function isRoomFreeAt(room: Room, currentTimeStr: string): boolean {
  const slot = getCurrentSlot(room, currentTimeStr);
  if (!slot) return true;
  return !slot.isOccupied;
}

export function getRemainingFreeMinutes(room: Room, currentTimeStr: string): number {
  const currentMinutes = parseTimeString(currentTimeStr);
  const currentSlotIndex = room.todaySchedule.findIndex((slot) => {
    const start = parseTimeString(slot.startTime);
    const end = parseTimeString(slot.endTime);
    return currentMinutes >= start && currentMinutes < end;
  });

  if (currentSlotIndex === -1) {
    if (currentMinutes < parseTimeString('08:30')) return 60;
    return 180;
  }

  const currentSlot = room.todaySchedule[currentSlotIndex];
  if (currentSlot.isOccupied) return 0;

  const currentEnd = parseTimeString(currentSlot.endTime);
  let totalFree = currentEnd - currentMinutes;

  for (let i = currentSlotIndex + 1; i < room.todaySchedule.length; i++) {
    const nextSlot = room.todaySchedule[i];
    if (nextSlot.isOccupied) break;
    const nextStart = parseTimeString(nextSlot.startTime);
    const nextEnd = parseTimeString(nextSlot.endTime);
    totalFree += nextEnd - nextStart;
  }

  return totalFree;
}

export function getNextClassInfo(room: Room, currentTimeStr: string): { title: string; startTime: string; timeUntilMinutes: number } | null {
  const currentMinutes = parseTimeString(currentTimeStr);
  for (const slot of room.todaySchedule) {
    const start = parseTimeString(slot.startTime);
    if (slot.isOccupied && start >= currentMinutes) {
      return {
        title: slot.title,
        startTime: slot.startTime,
        timeUntilMinutes: start - currentMinutes,
      };
    }
  }
  return null;
}

export interface StatusBadgeInfo {
  isFree: boolean;
  statusText: string;
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  subText: string;
  urgency: 'free' | 'busy' | 'soon';
}

export function getStatusBadge(room: Room, currentTimeStr: string): StatusBadgeInfo {
  const isFree = isRoomFreeAt(room, currentTimeStr);
  const currentSlot = getCurrentSlot(room, currentTimeStr);
  const nextClass = getNextClassInfo(room, currentTimeStr);

  if (isFree) {
    const remainingMins = getRemainingFreeMinutes(room, currentTimeStr);
    const hours = Math.floor(remainingMins / 60);
    const mins = remainingMins % 60;
    const durationText = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim() : `${mins}m`;

    if (remainingMins <= 20 && remainingMins > 0) {
      return {
        isFree: true,
        statusText: `Free for ${durationText}`,
        badgeColor: 'text-amber-700 dark:text-amber-300',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/50',
        badgeBorder: 'border-amber-300 dark:border-amber-700',
        subText: nextClass ? `Next: ${nextClass.title} at ${nextClass.startTime}` : 'Next class soon',
        urgency: 'soon',
      };
    }

    return {
      isFree: true,
      statusText: remainingMins >= 180 ? 'Free for Rest of Day' : `Free for next ${durationText}`,
      badgeColor: 'text-emerald-700 dark:text-emerald-300',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/50',
      badgeBorder: 'border-emerald-300 dark:border-emerald-700',
      subText: nextClass ? `Next class at ${nextClass.startTime}` : 'No further classes today',
      urgency: 'free',
    };
  } else {
    const currentEnd = currentSlot ? currentSlot.endTime : '17:30';
    return {
      isFree: false,
      statusText: 'Class in Session',
      badgeColor: 'text-rose-700 dark:text-rose-300',
      badgeBg: 'bg-rose-50 dark:bg-rose-950/50',
      badgeBorder: 'border-rose-300 dark:border-rose-700',
      subText: currentSlot ? `${currentSlot.title} (Until ${currentEnd})` : `Occupied until ${currentEnd}`,
      urgency: 'busy',
    };
  }
}
