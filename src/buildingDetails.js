const floor = (name, zones) => ({ name, zones });
const zone = (side, rooms) => ({ side, rooms });

export const buildingDetails = {
  'lh': {
    description: 'The Lecture Hall (LH) is located beside the FabLab and near the football ground. It serves as a venue for lectures, seminars, and academic events.',
    floors: [],
  },
  'old chem lab': {
    description: "The Old Chemistry Lab is located below the Gymnasium. It is currently being used as a girls' hostel.",
    floors: [],
  },
  'convention hall': {
    description: 'The Convention Hall is located below the IT Building and the Academic Block. It is used for conferences, meetings, and institutional events.',
    floors: [],
  },
  'library': {
    description: 'A campus library building that also contains student services, training, and academic spaces.',
    floors: [
      floor('Ground and first floors', []),
      floor('Second floor', [zone('Rooms listed', ['Training Centre', 'Student Service Center', 'SSO Office'])]),
      floor('Third floor', [zone('Rooms listed', ['Microgrid Lab', 'Drawing Studio 04 (DS04)', 'Drawing Studio 05 (DS05)', 'Drawing Studio 02', 'CR14', 'CR15', 'CR16', 'CR17', 'CR18'])]),
      floor('Fourth floor', [zone('Rooms listed', ['Drawing Studio 03', 'Architecture Department'])]),
    ],
  },
  'classroom': {
    description: 'The Classroom Building is situated next to the Academic Block and provides teaching rooms ranging from CR01 to CR13. It also accommodates the Teamwork Hall and GNH Hall.',
    floors: [
      floor('Ground floor', [
        zone('Left side', ['CR01', 'CR02', 'CR03', 'CR04', 'CR05', 'CR06']),
        zone('Right side', ['CR07', 'CR08', 'CR09']),
      ]),
      floor('First floor', [
        zone('Right side', ['CR10', 'CR11', 'CR12', 'CR13']),
        zone('Beside CR13', ['Engineering Mechanics Laboratory']),
        zone('Above the CR02–CR06 section', ['Team Work Hall']),
      ]),
    ],
  },
  'it building': {
    description: 'A three-floor academic building for information technology classes, laboratories, research, and collaboration.',
    floors: [
      floor('Ground floor', [
        zone('Right side', ['IT01', 'IT02', 'IT03', 'Programming Labs 2 and 3', 'Simulation Lab', 'BYOD Lab']),
        zone('Left side', ['Programming Lab 1', 'InnoTech Hall']),
      ]),
      floor('First floor', [
        zone('Right side', ['IT04', 'IT05', 'Data Science Lab', 'OSS Lab', 'Software Lab', 'Database Lab']),
        zone('Left side', ['NLP Lab', 'IT HOD Office']),
      ]),
      floor('Top floor', [zone('Rooms listed', ['IT06', 'Tech Innovation Hall', 'Tech Conference Halls', 'IT Lab Technician’s Office'])]),
    ],
  },
  'fab-lab': {
    description: 'A specialist laboratory building with fabrication, electronics, robotics, and engineering teaching facilities.',
    floors: [
      floor('Ground floor', [zone('Rooms listed', ['Fab Lab', 'ECE Communication Lab', 'ECD Lab'])]),
      floor('First floor', []),
      floor('Second floor', [zone('Rooms listed', ['Switch Gear and Protection Lab', 'Staff Room', 'Robotics Lab', 'Microprocessor and Microcontroller Lab', 'Hydraulics and Pneumatics Lab', 'Digital Electronics Lab'])]),
    ],
  },
  'new lab': {
    description: 'A laboratory building with chemistry, physics, fluid mechanics, environmental, and surveying facilities.',
    floors: [
      floor('Ground floor', [zone('Right side', ['Survey Lab']), zone('Left side', ['Chemistry Lab 02'])]),
      floor('First floor', []),
      floor('Second floor', [zone('Right side', ['Physics Lab']), zone('Left side', ['Fluid Mechanics Lab'])]),
      floor('Third floor', [zone('Left side', ['Environmental Lab']), zone('Right side', ['Chemistry Lab 01'])]),
    ],
  },
  'administrative block': {
    description: "The Academic Block is located beside the Classroom Building and serves as the main academic building on campus. It consists of four floors and houses most departmental offices, including the President's Office.",
    floors: [
      floor('Ground floor', [zone('Rooms listed', ['College cafeteria'])]),
      floor('First floor', [
        zone('Left side', ['ICT and Estate']),
        zone('Right side', ['Civil Engineering Department']),
      ]),
      floor('Second floor', [
        zone('Left side', ['Science and Humanities Department']),
        zone('Right side', ['Electronics and Communication Engineering Department']),
      ]),
      floor('Third floor', [
        zone('Left side', ['Electrical Engineering Department']),
        zone('Right side', ['Administrative Section', "President's Office", 'Integrity Hall', 'Prayer Hall (Chue Khang)']),
      ]),
    ],
  },
  'lt 2 & 3': {
    description: 'LT-02 and LT-03 are situated adjacent to the IT Building. These two lecture theatres are located side by side, with LT-02 on the right and LT-03 on the left.',
    floors: [floor('Classrooms', [zone('Left side', ['LT03']), zone('Right side', ['LT02'])])],
  },
  'indoor stadium': {
    description: 'The Indoor Stadium is located below the football ground. It includes a gymnasium and a basketball court, providing facilities for sports and fitness activities.',
    floors: [],
  },
  'rk-a': { description: 'RK-A is a four-storey boys’ hostel that provides accommodation for male students.', floors: [] },
  'rk-b': { description: 'RK-B is a four-storey boys’ hostel that provides accommodation for male students.', floors: [] },
  'nk': {
    description: "NK is a four-storey boys' hostel located below the Lecturer's Quarters, offering residential facilities for male students.",
    floors: [],
  },
  'hc-hd': { description: 'HC and HD are three-storey girls’ hostels that provide accommodation for female students.', floors: [] },
  'ha-hb': { description: 'HA and HB are three-storey boys’ hostels located beside the Architecture Building.', floors: [] },
  'hf': { description: 'HF is a three-storey girls’ hostel situated near the Mess Building.', floors: [] },
  'he & mess': { description: 'HE is a boys’ hostel located above the Mess Building and provides residential accommodation for male students.', floors: [] },
  'lab': {
    description: 'The map marks this as a laboratory building. Supplied notes list additional laboratories in the area near the football ground, but do not identify their host building or floors.',
    areaFacilities: ['Structure Timber Testing', 'StarC Lab', 'Rock Mechanics Lab', 'Power Electronics and Control System Laboratory', 'Hydraulics and Plumbing Lab', 'ME Workshop', 'Electrical Workshop Testing Lab', 'Electrical Machine and Instrumentation Laboratory', 'Construction Lab', 'Civil Engineering Soil Mechanics Lab', 'Civil Engineering Material Testing Lab', 'Carpentry Workshop'],
  },
};

export function getBuildingDetails(name = '', use = '') {
  const key = name.trim().toLowerCase();
  const supplied = buildingDetails[key];
  if (supplied) return supplied;
  const kind = use && use !== 'Other' ? use : 'campus facility';
  return {
    description: `${name || 'This building'} is listed on the CST campus map as a ${kind.toLowerCase()}. Room-by-room and floor information has not been added yet.`,
    floors: [],
  };
}
