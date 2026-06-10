export type Permission = 'manage_team' | 'manage_roles' | 'view_global_pipeline' | 'view_own_pipeline' | 'manage_inventory';

export interface RoleDefinition {
  id: string;
  name: string;
  permissions: Permission[];
  level: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  status: string;
  reportsTo?: string;
  assignedAgentId?: string;
  avatar?: string;
}

export interface UnitType {
  id: string;
  type: string;
  name?: string;
  size?: string;
  totalUnits: number;
  availableUnits: number;
  basePrice: string;
}

export interface Unit {
  id: string;
  unitNumber: string;
  floor: number;
  typeId: string;
  status: 'Available' | 'On Hold' | 'Booked' | 'Sold';
  price: string;
  facing?: string;
  buyerId?: string;
  wing?: string;
}

export interface Milestone {
  id: string;
  name: string;
  targetDate: string;
  actualDate?: string;
  status: 'pending' | 'in_progress' | 'completed';
  percentageDue: number;
}

export interface Project {
  id: string;
  name: string;
  developerId: string;
  location?: string;
  image?: string;
  status?: string;
  unitTypes: UnitType[];
  units: Unit[];
  milestones?: Milestone[];
}

export interface DealDocument {
  id: string;
  name: string;
  type: 'pdf' | 'img' | 'doc';
  status: 'missing' | 'pending_signature' | 'under_review' | 'executed';
  updatedAt: string;
  required: boolean;
}

export interface Deal {
  id: string;
  buyerName: string;
  buyerId?: string;
  email?: string;
  phone?: string;
  buyerProfile: string;
  projectId: string;
  unitId?: string;
  finalUnitId?: string;
  interestedUnitIds?: string[];
  unitName: string;
  amount: string;
  status: 'Lead' | 'Site Visit' | 'Negotiation' | 'Booked' | 'Lost';
  date: string;
  temperature: 'Hot' | 'Warm' | 'Cold';
  daysInStage: number;
  probability: number;
  history: { date: string; note: string; author: string }[];
  verification: string;
  nextAction: string;
  actionRequired?: boolean;
  source?: string;
  visitCount?: number;
  interest?: string;
  askingPrice?: string;
  offeredPrice?: string;
  blocker?: string;
  paymentMilestone?: string;
  nextPaymentDue?: { date: string; amount: string };
  concern?: string;
  concessions?: string[];
  documentStatus?: string;
  documents?: DealDocument[];
  timeline?: string;
  assignedTo?: string;
}

export const ROLES: RoleDefinition[] = [
  { id: 'r_dir', name: 'Director', permissions: ['manage_team', 'manage_roles', 'view_global_pipeline', 'manage_inventory'], level: 1 },
  { id: 'r_adv', name: 'Sales Advisor', permissions: ['view_own_pipeline'], level: 3 },
  { id: 'r_buyer', name: 'Buyer', permissions: [], level: 5 },
  { id: 'r_developer', name: 'Developer', permissions: ['view_global_pipeline'], level: 4 }
];

export const USERS: User[] = [];

// Generate some mock units for the project (all available for realtime testing)
const generateMockUnits = (): Unit[] => {
  const units: Unit[] = [];
  const wings = ['A', 'B'];
  const floors = 17;
  
  wings.forEach(wing => {
    for (let floor = 1; floor <= floors; floor++) {
      // 2 2BHKs per wing per floor
      units.push({
        id: `u_${wing}_${floor}01`,
        unitNumber: `${wing}-${floor}01`,
        floor: floor,
        typeId: 't_2bhk',
        status: 'Available',
        price: '₹50 L',
        facing: 'East',
        wing: wing
      });
      units.push({
        id: `u_${wing}_${floor}02`,
        unitNumber: `${wing}-${floor}02`,
        floor: floor,
        typeId: 't_2bhk',
        status: 'Available',
        price: '₹50 L',
        facing: 'West',
        wing: wing
      });
      
      // 2 3BHKs per wing per floor
      units.push({
        id: `u_${wing}_${floor}03`,
        unitNumber: `${wing}-${floor}03`,
        floor: floor,
        typeId: 't_3bhk',
        status: 'Available',
        price: '₹75 L',
        facing: 'East',
        wing: wing
      });
      units.push({
        id: `u_${wing}_${floor}04`,
        unitNumber: `${wing}-${floor}04`,
        floor: floor,
        typeId: 't_3bhk',
        status: 'Available',
        price: '₹75 L',
        facing: 'West',
        wing: wing
      });
    }
  });

  return units;
};

export const PROJECTS: Project[] = [
  {
    id: 'proj_mynest',
    name: 'My Nest',
    developerId: 'u_dev1',
    location: 'Beed Bypass Road, near MIT College, Chhatrapati Sambhaji Nagar',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1000',
    status: 'Under Construction',
    unitTypes: [
      { id: 't_2bhk', type: '2 BHK', name: 'Premium Space', size: '850 sq.ft', totalUnits: 68, availableUnits: 40, basePrice: '₹50 L' },
      { id: 't_3bhk', type: '3 BHK', name: 'Ultra Luxury', size: '1200 sq.ft', totalUnits: 68, availableUnits: 40, basePrice: '₹75 L' }
    ],
    units: generateMockUnits(),
    milestones: [
      { id: 'm1', name: 'Booking & Plinth', targetDate: '2025-12-01', actualDate: '2025-12-15', status: 'completed', percentageDue: 25 },
      { id: 'm2', name: 'Slab 1', targetDate: '2026-02-01', actualDate: '2026-02-10', status: 'completed', percentageDue: 10 },
      { id: 'm3', name: 'Slab 6', targetDate: '2026-04-15', status: 'in_progress', percentageDue: 10 },
      { id: 'm4', name: 'Slab 12', targetDate: '2026-08-01', status: 'pending', percentageDue: 10 },
      { id: 'm5', name: 'Brickwork', targetDate: '2026-11-01', status: 'pending', percentageDue: 15 },
      { id: 'm6', name: 'Flooring & Finishing', targetDate: '2027-02-01', status: 'pending', percentageDue: 20 },
      { id: 'm7', name: 'Possession', targetDate: '2027-06-01', status: 'pending', percentageDue: 10 }
    ]
  }
];

export const DEALS: Deal[] = [];

export const DEVELOPER_DEALS: Deal[] = DEALS;

export interface ActivityLog {
  id: string;
  time: string;
  message: string;
  type: 'milestone' | 'approval' | 'sale' | 'system';
}

export const ACTIVITY_FEED: ActivityLog[] = [];

export const PROJECT_DETAILS = {
  name: "My Nest",
  developer: "Baheti Housing",
  location: "Beed Bypass Road, near MIT College, Chhatrapati Sambhaji Nagar",
  description: "A modern luxurious standalone building set within a secure gated community. Offering an exclusive lifestyle for just 136 families.",
  totalUnits: 136,
  configurations: [
    {
      type: "2 BHK",
      units: 68,
      carpetArea: "Premium Space",
      description: "Thoughtfully designed 2 BHK residences maximizing space and natural light for modern families.",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1000",
    },
    {
      type: "3 BHK",
      units: 68,
      carpetArea: "Ultra Luxury",
      description: "Expansive 3 BHK luxury apartments with premium finishes, panoramic views, and ultimate privacy.",
      image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1000",
    }
  ],
  amenities: [
    { name: "24/7 Security", icon: "ShieldCheck" },
    { name: "Premium Grand Lobby", icon: "Home" },
    { name: "Landscaped Gardens", icon: "TreePine" },
    { name: "Dedicated Parking", icon: "Car" },
    { name: "CCTV Surveillance", icon: "Cctv" },
    { name: "100% Power Backup", icon: "Zap" },
    { name: "Children's Play Area", icon: "Baby" },
    { name: "Modern Gymnasium", icon: "Dumbbell" }
  ],
  categorizedAmenities: [
    {
      category: "Recreation & Wellness",
      items: [
        { name: "State-of-the-art Fitness Center", icon: "Dumbbell", description: "Fully equipped gym with modern cardiovascular and strength training equipment." },
        { name: "Yoga & Meditation Deck", icon: "TreePine", description: "Serene outdoor spaces designed for mindfulness and relaxation." },
        { name: "Landscaped Gardens", icon: "TreePine", description: "Lush green spaces with walking trails and seating areas." }
      ]
    },
    {
      category: "Modern Convenience",
      items: [
        { name: "EV Charging Stations", icon: "Zap", description: "Dedicated electric vehicle charging points in the parking area." },
        { name: "Co-working Lounge", icon: "Home", description: "Quiet, Wi-Fi enabled spaces perfect for remote work." },
        { name: "Dedicated Parking", icon: "Car", description: "Ample covered parking spaces for residents and visitors." }
      ]
    },
    {
      category: "Building Facilities",
      items: [
        { name: "Premium Grand Lobby", icon: "Home", description: "Double-height entrance lobby with luxurious waiting lounge." },
        { name: "Multi-tier Security", icon: "ShieldCheck", description: "24/7 manned security with advanced access control systems." },
        { name: "CCTV Surveillance", icon: "Cctv", description: "Comprehensive camera coverage across all common areas." }
      ]
    },
    {
      category: "Premium Infrastructure",
      items: [
        { name: "100% Power Backup", icon: "Zap", description: "Uninterrupted power supply for common areas and elevators." },
        { name: "High-speed Elevators", icon: "ArrowRight", description: "Premium branded elevators with ARD (Automatic Rescue Device)." },
        { name: "Rainwater Harvesting", icon: "TreePine", description: "Eco-friendly water conservation systems." }
      ]
    }
  ],
  specifications: [
    {
      category: "Structure & Walls",
      details: [
        "Earthquake-resistant RCC framed structure",
        "Premium quality AAC blocks for external and internal walls",
        "Gypsum finish for internal walls and ceiling",
        "Double coat sand faced plaster for external walls"
      ]
    },
    {
      category: "Flooring & Tiling",
      details: [
        "Premium 800x800mm vitrified tiles in living, dining, and bedrooms",
        "Anti-skid ceramic tiles in bathrooms and terraces",
        "Designer dado tiles in kitchen up to lintel level",
        "Premium dado tiles in all bathrooms up to lintel level"
      ]
    },
    {
      category: "Kitchen",
      details: [
        "Premium granite kitchen platform",
        "Branded stainless steel sink",
        "Provision for water purifier and exhaust fan",
        "Ample electrical points for kitchen appliances"
      ]
    },
    {
      category: "Bathrooms & Plumbing",
      details: [
        "Premium CP fittings (Jaguar/Grohe or equivalent)",
        "Designer sanitaryware (Hindware/Kohler or equivalent)",
        "Concealed plumbing with premium quality CPVC/UPVC pipes",
        "Provision for geyser and exhaust fan in all bathrooms"
      ]
    },
    {
      category: "Doors & Windows",
      details: [
        "Elegant main door with premium laminate and security lock",
        "Laminated flush doors for all bedrooms and bathrooms",
        "Powder-coated aluminum sliding windows with mosquito net",
        "MS safety grills for all windows"
      ]
    },
    {
      category: "Electricals",
      details: [
        "Concealed fire-resistant copper wiring",
        "Premium modular switches (Legrand/Schneider or equivalent)",
        "Adequate electrical points in all rooms",
        "Provision for AC in living room and all bedrooms",
        "TV and telephone points in living room and master bedroom"
      ]
    }
  ],
  locationHighlights: [
    { place: "MIT College", time: "2 Mins", distance: "0.5 km" },
    { place: "Beed Bypass Highway", time: "0 Mins", distance: "0 km" },
    { place: "Railway Station", time: "10 Mins", distance: "4 km" },
    { place: "Prozone Mall", time: "15 Mins", distance: "6 km" },
    { place: "Airport", time: "20 Mins", distance: "9 km" }
  ],
  gallery: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000"
  ]
};
