export interface UnionNode {
  nameEn: string;
  nameBn: string;
  lat: number;
  lng: number;
}

export interface UpazilaNode {
  nameEn: string;
  nameBn: string;
  unions: UnionNode[];
}

export interface DistrictNode {
  nameEn: string;
  nameBn: string;
  upazilas: UpazilaNode[];
}

export interface DivisionNode {
  nameEn: string;
  nameBn: string;
  districts: DistrictNode[];
}

/**
 * Helper to scaffold a district with its Sadar Upazila and default Pourashava / Union
 * nodes while keeping the structure trivial to expand with additional Upazilas & Unions.
 */
function buildStandardDistrict(
  nameEn: string,
  nameBn: string,
  lat: number,
  lng: number,
  extraUpazilas: UpazilaNode[] = []
): DistrictNode {
  return {
    nameEn,
    nameBn,
    upazilas: [
      {
        nameEn: `${nameEn} Sadar`,
        nameBn: `${nameBn} সদর`,
        unions: [
          { nameEn: `${nameEn} Pourashava`, nameBn: `${nameBn} পৌরসভা`, lat, lng },
          {
            nameEn: `${nameEn} Sadar Union`,
            nameBn: `${nameBn} সদর ইউনিয়ন`,
            lat: Number((lat + 0.015).toFixed(4)),
            lng: Number((lng + 0.015).toFixed(4)),
          },
        ],
      },
      ...extraUpazilas,
    ],
  };
}

/**
 * Complete administrative hierarchy of Bangladesh:
 * All 8 Divisions and all 64 Districts with Upazila -> Union/Ward GPS coordinates.
 */
export const BANGLADESH_DIVISIONS: DivisionNode[] = [
  {
    nameEn: 'Dhaka',
    nameBn: 'ঢাকা',
    districts: [
      {
        nameEn: 'Dhaka',
        nameBn: 'ঢাকা',
        upazilas: [
          {
            nameEn: 'Savar',
            nameBn: 'সাভার',
            unions: [
              { nameEn: 'Ashulia', nameBn: 'আশুলিয়া', lat: 23.8975, lng: 90.3239 },
              { nameEn: 'Birulia', nameBn: 'বিরুলিয়া', lat: 23.8479, lng: 90.3081 },
              { nameEn: 'Tetuljhora', nameBn: 'তেঁতুলঝোড়া', lat: 23.7972, lng: 90.2683 },
              { nameEn: 'Savar Pourashava', nameBn: 'সাভার পৌরসভা', lat: 23.8583, lng: 90.2667 },
            ],
          },
          {
            nameEn: 'Dhanmondi',
            nameBn: 'ধানমন্ডি',
            unions: [
              { nameEn: 'Ward 15 (Dhanmondi)', nameBn: 'ওয়ার্ড ১৫ (ধানমন্ডি)', lat: 23.7461, lng: 90.3742 },
              { nameEn: 'Ward 16 (Kalabagan)', nameBn: 'ওয়ার্ড ১৬ (কলাবাগান)', lat: 23.7495, lng: 90.3827 },
              { nameEn: 'Ward 17 (Sukrabad)', nameBn: 'ওয়ার্ড ১৭ (শুক্রাবাদ)', lat: 23.7524, lng: 90.3778 },
            ],
          },
          {
            nameEn: 'Mirpur',
            nameBn: 'মিরপুর',
            unions: [
              { nameEn: 'Ward 06 (Pallabi)', nameBn: 'ওয়ার্ড ০৬ (পল্লবী)', lat: 23.8223, lng: 90.3654 },
              { nameEn: 'Ward 10 (Mirpur 10)', nameBn: 'ওয়ার্ড ১০ (মিরপুর ১০)', lat: 23.8069, lng: 90.3687 },
              { nameEn: 'Ward 14 (Kazipara)', nameBn: 'ওয়ার্ড ১৪ (কাজীপাড়া)', lat: 23.7979, lng: 90.3728 },
            ],
          },
          {
            nameEn: 'Uttara',
            nameBn: 'উত্তরা',
            unions: [
              { nameEn: 'Ward 01 (Uttara Sector 1-7)', nameBn: 'ওয়ার্ড ০১ (উত্তরা সেক্টর ১-৭)', lat: 23.8759, lng: 90.3795 },
              { nameEn: 'Dakshin Khan', nameBn: 'দক্ষিণখান', lat: 23.8617, lng: 90.4222 },
            ],
          },
        ],
      },
      {
        nameEn: 'Gazipur',
        nameBn: 'গাজীপুর',
        upazilas: [
          {
            nameEn: 'Gazipur Sadar',
            nameBn: 'গাজীপুর সদর',
            unions: [
              { nameEn: 'Baria', nameBn: 'বাড়িয়া', lat: 24.0221, lng: 90.4712 },
              { nameEn: 'Mirzapur', nameBn: 'মির্জাপুর', lat: 24.0958, lng: 90.4125 },
              { nameEn: 'Tongi East', nameBn: 'টঙ্গী পূর্ব', lat: 23.8915, lng: 90.4023 },
            ],
          },
          {
            nameEn: 'Kaliakair',
            nameBn: 'কালিয়াকৈর',
            unions: [
              { nameEn: 'Mouchak', nameBn: 'মৌচাক', lat: 24.0281, lng: 90.2892 },
              { nameEn: 'Chapair', nameBn: 'চাপাইর', lat: 24.0752, lng: 90.2215 },
            ],
          },
        ],
      },
      {
        nameEn: 'Narayanganj',
        nameBn: 'নারায়ণগঞ্জ',
        upazilas: [
          {
            nameEn: 'Narayanganj Sadar',
            nameBn: 'নারায়ণগঞ্জ সদর',
            unions: [
              { nameEn: 'Fatullah', nameBn: 'ফতুল্লা', lat: 23.6435, lng: 90.4839 },
              { nameEn: 'Siddhirganj', nameBn: 'সিদ্ধিরগঞ্জ', lat: 23.6812, lng: 90.5179 },
            ],
          },
        ],
      },
      buildStandardDistrict('Faridpur', 'ফরিদপুর', 23.6071, 89.8429),
      buildStandardDistrict('Gopalganj', 'গোপালগঞ্জ', 23.0051, 89.8266),
      buildStandardDistrict('Kishoreganj', 'কিশোরগঞ্জ', 24.4449, 90.7766),
      buildStandardDistrict('Madaripur', 'মাদারীপুর', 23.1641, 90.1897),
      buildStandardDistrict('Manikganj', 'মানিকগঞ্জ', 23.8617, 90.0003),
      buildStandardDistrict('Munshiganj', 'মুন্সীগঞ্জ', 23.5422, 90.5305),
      buildStandardDistrict('Narsingdi', 'নরসিংদী', 23.9229, 90.7177),
      buildStandardDistrict('Rajbari', 'রাজবাড়ী', 23.7574, 89.6445),
      buildStandardDistrict('Shariatpur', 'শরীয়তপুর', 23.2423, 90.4348),
      buildStandardDistrict('Tangail', 'টাঙ্গাইল', 24.2513, 89.9167),
    ],
  },
  {
    nameEn: 'Chattogram',
    nameBn: 'চট্টগ্রাম',
    districts: [
      {
        nameEn: 'Chattogram',
        nameBn: 'চট্টগ্রাম',
        upazilas: [
          {
            nameEn: 'Panchlaish',
            nameBn: 'পাঁচলাইশ',
            unions: [
              { nameEn: 'Ward 08 (Sholashahar)', nameBn: 'ওয়ার্ড ০৮ (ষোলশহর)', lat: 22.3646, lng: 91.8257 },
              { nameEn: 'Ward 16 (Chawkbazar)', nameBn: 'ওয়ার্ড ১৬ (চকবাজার)', lat: 22.3569, lng: 91.8364 },
            ],
          },
          {
            nameEn: 'Hathazari',
            nameBn: 'হাটহাজারী',
            unions: [
              { nameEn: 'Fatehpur (CU Campus)', nameBn: 'ফতেপুর (চবি ক্যাম্পাস)', lat: 22.4716, lng: 91.7877 },
              { nameEn: 'Chikandandi', nameBn: 'চিকনদণ্ডী', lat: 22.4418, lng: 91.8112 },
            ],
          },
          {
            nameEn: 'Sitakunda',
            nameBn: 'সীতাকুণ্ড',
            unions: [
              { nameEn: 'Kumira', nameBn: 'কুমিরা', lat: 22.5121, lng: 91.7165 },
              { nameEn: 'Bhatiary', nameBn: 'ভাটিয়ারী', lat: 22.4439, lng: 91.7418 },
            ],
          },
        ],
      },
      {
        nameEn: "Cox's Bazar",
        nameBn: 'কক্সবাজার',
        upazilas: [
          {
            nameEn: "Cox's Bazar Sadar",
            nameBn: 'কক্সবাজার সদর',
            unions: [
              { nameEn: 'Jhilongja', nameBn: 'ঝিলংজা', lat: 21.4272, lng: 92.0058 },
              { nameEn: 'Khurushkul', nameBn: 'খুরুশকুল', lat: 21.4648, lng: 92.0117 },
            ],
          },
          {
            nameEn: 'Ukhiya',
            nameBn: 'উখিয়া',
            unions: [
              { nameEn: 'Rajapalong', nameBn: 'রাজাপালং', lat: 21.2836, lng: 92.1047 },
              { nameEn: 'Palong Khali', nameBn: 'পালংখালী', lat: 21.1864, lng: 92.1422 },
            ],
          },
        ],
      },
      buildStandardDistrict('Bandarban', 'বান্দরবান', 22.1953, 92.2184),
      buildStandardDistrict('Brahmanbaria', 'ব্রাহ্মণবাড়িয়া', 23.9571, 91.1119),
      buildStandardDistrict('Chandpur', 'চাঁদপুর', 23.2333, 90.6713),
      buildStandardDistrict('Cumilla', 'কুমিল্লা', 23.4607, 91.1809),
      buildStandardDistrict('Feni', 'ফেনী', 23.0159, 91.3976),
      buildStandardDistrict('Khagrachhari', 'খাগড়াছড়ি', 23.1193, 91.9847),
      buildStandardDistrict('Lakshmipur', 'লক্ষ্মীপুর', 22.9447, 90.8282),
      buildStandardDistrict('Noakhali', 'নোয়াখালী', 22.8696, 91.0994),
      buildStandardDistrict('Rangamati', 'রাঙ্গামাটি', 22.7324, 92.2985),
    ],
  },
  {
    nameEn: 'Rajshahi',
    nameBn: 'রাজশাহী',
    districts: [
      {
        nameEn: 'Rajshahi',
        nameBn: 'রাজশাহী',
        upazilas: [
          {
            nameEn: 'Boalia',
            nameBn: 'বোয়ালিয়া',
            unions: [
              { nameEn: 'Ward 12 (Shaheb Bazar)', nameBn: 'ওয়ার্ড ১২ (সাহেব বাজার)', lat: 24.3636, lng: 88.6011 },
              { nameEn: 'Motihar (RU Campus)', nameBn: 'মতিহার (রাবি ক্যাম্পাস)', lat: 24.3702, lng: 88.6368 },
            ],
          },
          {
            nameEn: 'Paba',
            nameBn: 'পবা',
            unions: [
              { nameEn: 'Harian', nameBn: 'হরিয়ান', lat: 24.3845, lng: 88.6852 },
              { nameEn: 'Damkura', nameBn: 'দামকুড়া', lat: 24.4021, lng: 88.5326 },
            ],
          },
        ],
      },
      {
        nameEn: 'Bogura',
        nameBn: 'বগুড়া',
        upazilas: [
          {
            nameEn: 'Bogura Sadar',
            nameBn: 'বগুড়া সদর',
            unions: [
              { nameEn: 'Satmatha Ward 05', nameBn: 'সাতমাথা ওয়ার্ড ০৫', lat: 24.8481, lng: 89.373 },
              { nameEn: 'Erulia', nameBn: 'এরুলিয়া', lat: 24.8685, lng: 89.3274 },
            ],
          },
        ],
      },
      buildStandardDistrict('Chapainawabganj', 'চাঁপাইনবাবগঞ্জ', 24.5965, 88.2775),
      buildStandardDistrict('Joypurhat', 'জয়পুরহাট', 25.0968, 89.0227),
      buildStandardDistrict('Naogaon', 'নওগাঁ', 24.7936, 88.9318),
      buildStandardDistrict('Natore', 'নাটোর', 24.4206, 89.0003),
      buildStandardDistrict('Pabna', 'পাবনা', 24.0064, 89.2372),
      buildStandardDistrict('Sirajganj', 'সিরাজগঞ্জ', 24.4534, 89.7007),
    ],
  },
  {
    nameEn: 'Khulna',
    nameBn: 'খুলনা',
    districts: [
      {
        nameEn: 'Khulna',
        nameBn: 'খুলনা',
        upazilas: [
          {
            nameEn: 'Sonadanga',
            nameBn: 'সোনাডাঙ্গা',
            unions: [
              { nameEn: 'Ward 18 (Sonadanga)', nameBn: 'ওয়ার্ড ১৮ (সোনাডাঙ্গা)', lat: 22.8156, lng: 89.5467 },
              { nameEn: 'Gollamari (KU)', nameBn: 'গল্লামারী (খুবি)', lat: 22.8022, lng: 89.5339 },
            ],
          },
          {
            nameEn: 'Dumuria',
            nameBn: 'ডুমুরিয়া',
            unions: [
              { nameEn: 'Gutudia', nameBn: 'গুটুদিয়া', lat: 22.8087, lng: 89.4295 },
              { nameEn: 'Raghunathpur', nameBn: 'রঘুনাথপুর', lat: 22.8452, lng: 89.4422 },
            ],
          },
        ],
      },
      {
        nameEn: 'Jashore',
        nameBn: 'যশোর',
        upazilas: [
          {
            nameEn: 'Jashore Sadar',
            nameBn: 'যশোর সদর',
            unions: [
              { nameEn: 'Churamankathi', nameBn: 'চুড়ামনকাটি', lat: 23.2245, lng: 89.1391 },
              { nameEn: 'Arabpur', nameBn: 'আরবপুর', lat: 23.1697, lng: 89.1803 },
            ],
          },
        ],
      },
      buildStandardDistrict('Bagerhat', 'বাগেরহাট', 22.6516, 89.7859),
      buildStandardDistrict('Chuadanga', 'চুয়াডাঙ্গা', 23.6402, 88.8418),
      buildStandardDistrict('Jhenaidah', 'ঝিনাইদহ', 23.545, 89.1726),
      buildStandardDistrict('Kushtia', 'কুষ্টিয়া', 23.9013, 89.1205),
      buildStandardDistrict('Magura', 'মাগুরা', 23.4873, 89.4199),
      buildStandardDistrict('Meherpur', 'মেহেরপুর', 23.7622, 88.6318),
      buildStandardDistrict('Narail', 'নড়াইল', 23.1725, 89.5127),
      buildStandardDistrict('Satkhira', 'সাতক্ষীরা', 22.7185, 89.0705),
    ],
  },
  {
    nameEn: 'Sylhet',
    nameBn: 'সিলেট',
    districts: [
      {
        nameEn: 'Sylhet',
        nameBn: 'সিলেট',
        upazilas: [
          {
            nameEn: 'Sylhet Sadar',
            nameBn: 'সিলেট সদর',
            unions: [
              { nameEn: 'Akhalia (SUST)', nameBn: 'আখালিয়া (শাবিপ্রবি)', lat: 24.9172, lng: 91.8319 },
              { nameEn: 'Khadimnagar', nameBn: 'খাদিমনগর', lat: 24.9225, lng: 91.9188 },
              { nameEn: 'Tukerbazar', nameBn: 'টুকেরবাজার', lat: 24.9102, lng: 91.8165 },
            ],
          },
          {
            nameEn: 'Beanibazar',
            nameBn: 'বিয়ানীবাজার',
            unions: [
              { nameEn: 'Tilpara', nameBn: 'তিলপাড়া', lat: 24.8354, lng: 92.1652 },
              { nameEn: 'Lauta', nameBn: 'লাউতা', lat: 24.8012, lng: 92.1981 },
            ],
          },
        ],
      },
      buildStandardDistrict('Habiganj', 'হবিগঞ্জ', 24.3749, 91.4155),
      buildStandardDistrict('Moulvibazar', 'মৌলভীবাজার', 24.4829, 91.7774),
      buildStandardDistrict('Sunamganj', 'সুনামগঞ্জ', 25.0658, 91.395),
    ],
  },
  {
    nameEn: 'Barishal',
    nameBn: 'বরিশাল',
    districts: [
      {
        nameEn: 'Barishal',
        nameBn: 'বরিশাল',
        upazilas: [
          {
            nameEn: 'Barishal Sadar',
            nameBn: 'বরিশাল সদর',
            unions: [
              { nameEn: 'Kashipur', nameBn: 'কাশীপুর', lat: 22.7322, lng: 90.3444 },
              { nameEn: 'Charbaria', nameBn: 'চরবাড়িয়া', lat: 22.7481, lng: 90.3822 },
            ],
          },
        ],
      },
      buildStandardDistrict('Barguna', 'বরগুনা', 22.1592, 90.1255),
      buildStandardDistrict('Bhola', 'ভোলা', 22.6859, 90.6482),
      buildStandardDistrict('Jhalokati', 'ঝালকাঠি', 22.6406, 90.1987),
      buildStandardDistrict('Patuakhali', 'পটুয়াখালী', 22.3596, 90.3299),
      buildStandardDistrict('Pirojpur', 'পিরোজপুর', 22.5841, 89.972),
    ],
  },
  {
    nameEn: 'Rangpur',
    nameBn: 'রংপুর',
    districts: [
      {
        nameEn: 'Rangpur',
        nameBn: 'রংপুর',
        upazilas: [
          {
            nameEn: 'Rangpur Sadar',
            nameBn: 'রংপুর সদর',
            unions: [
              { nameEn: 'Chandanpat', nameBn: 'চন্দনপাট', lat: 25.7362, lng: 89.1931 },
              { nameEn: 'Lalbag (Begum Rokeya Univ)', nameBn: 'লালবাগ (বেরোবি)', lat: 25.7166, lng: 89.2612 },
            ],
          },
        ],
      },
      buildStandardDistrict('Dinajpur', 'দিনাজপুর', 25.6217, 88.6355),
      buildStandardDistrict('Gaibandha', 'গাইবান্ধা', 25.3288, 89.5281),
      buildStandardDistrict('Kurigram', 'কুড়িগ্রাম', 25.8054, 89.6362),
      buildStandardDistrict('Lalmonirhat', 'লালমনিরহাট', 25.9923, 89.2847),
      buildStandardDistrict('Nilphamari', 'নীলফামারী', 25.9318, 88.856),
      buildStandardDistrict('Panchagarh', 'পঞ্চগড়', 26.3411, 88.5542),
      buildStandardDistrict('Thakurgaon', 'ঠাকুরগাঁও', 26.0337, 88.4617),
    ],
  },
  {
    nameEn: 'Mymensingh',
    nameBn: 'ময়মনসিংহ',
    districts: [
      {
        nameEn: 'Mymensingh',
        nameBn: 'ময়মনসিংহ',
        upazilas: [
          {
            nameEn: 'Mymensingh Sadar',
            nameBn: 'ময়মনসিংহ সদর',
            unions: [
              { nameEn: 'Char Nilakshmia', nameBn: 'চর নিলক্ষিয়া', lat: 24.7245, lng: 90.4435 },
              { nameEn: 'BAU Campus', nameBn: 'বাকৃবি ক্যাম্পাস', lat: 24.7241, lng: 90.4368 },
            ],
          },
        ],
      },
      buildStandardDistrict('Jamalpur', 'জামালপুর', 24.9375, 89.9378),
      buildStandardDistrict('Netrokona', 'নেত্রকোণা', 24.8709, 90.7279),
      buildStandardDistrict('Sherpur', 'শেরপুর', 25.0205, 90.0153),
    ],
  },
];

export function getAllDistrictsCount(): number {
  return BANGLADESH_DIVISIONS.reduce((sum, div) => sum + div.districts.length, 0);
}

export function getDistrictsForDivision(divisionEn: string): DistrictNode[] {
  return BANGLADESH_DIVISIONS.find((d) => d.nameEn === divisionEn)?.districts ?? [];
}

export function getUpazilasForDistrict(divisionEn: string, districtEn: string): UpazilaNode[] {
  return getDistrictsForDivision(divisionEn).find((d) => d.nameEn === districtEn)?.upazilas ?? [];
}

export function getUnionsForUpazila(
  divisionEn: string,
  districtEn: string,
  upazilaEn: string
): UnionNode[] {
  return getUpazilasForDistrict(divisionEn, districtEn).find((u) => u.nameEn === upazilaEn)?.unions ?? [];
}

export function findUnionCoordinates(
  divisionEn: string,
  districtEn: string,
  upazilaEn: string,
  unionEn: string
): { lat: number; lng: number } {
  const union = getUnionsForUpazila(divisionEn, districtEn, upazilaEn).find(
    (u) => u.nameEn === unionEn
  );
  if (union) {
    return { lat: union.lat, lng: union.lng };
  }
  const firstUnion = getUnionsForUpazila(divisionEn, districtEn, upazilaEn)[0];
  if (firstUnion) {
    return { lat: firstUnion.lat, lng: firstUnion.lng };
  }
  return { lat: 23.8103, lng: 90.4125 }; // Default Dhaka center
}
