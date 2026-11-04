const room = (name, side = 'center', note = '') => ({ name, side, note, description: describeSpace(name) });
const floor = (name, rooms, note = '') => ({ name, rooms, note });
const building = (name, floors, note = '') => ({ name, floors, note });

export function describeSpace(name) {
  const label = name.toLowerCase();
  if (/cafeteria/.test(label)) return 'A dining space for meals and refreshments for students and staff.';
  if (/civil engineering department/.test(label)) return 'Home to Civil Engineering teaching, academic support, and departmental activities.';
  if (/ict and statistics department/.test(label)) return 'Supports teaching and academic work in information and communications technology and statistics.';
  if (/instrumentation and control/.test(label)) return 'Supports teaching and practical work in instrumentation, measurement, and control engineering.';
  if (/science and humanities/.test(label)) return 'Supports science and humanities teaching and related academic activities.';
  if (/electrical engineering department/.test(label)) return 'Home to Electrical Engineering teaching, academic support, and departmental activities.';
  if (/administrative section/.test(label)) return 'The college’s central administrative offices and student-facing services.';
  if (/president.s office/.test(label)) return 'The President’s office for college leadership and institutional administration.';
  if (/integrity hall/.test(label)) return 'A campus hall for meetings, events, and institutional activities.';
  if (/prayer hall/.test(label)) return 'A quiet space for prayer and reflection, locally known as Chue Khang.';
  if (/^(cr|it\d|lt\d)/i.test(name)) return 'A classroom for lectures, tutorials, and collaborative learning.';
  if (/drawing studio/.test(label)) return 'A studio workspace for architecture students to develop, draft, and review design projects.';
  if (/structure timber|carpentry/.test(label)) return 'Supports practical work with timber, including basic fabrication and material testing.';
  if (/star\s*c/.test(label)) return 'A specialist lab for supervised practical work and technical projects.';
  if (/rock mechanics/.test(label)) return 'Supports the study and testing of rock properties for civil and geotechnical engineering.';
  if (/soil mechanics/.test(label)) return 'Used for soil classification and geotechnical tests that support civil engineering study.';
  if (/material testing/.test(label)) return 'Provides practical testing of construction materials and their engineering properties.';
  if (/power electronics/.test(label)) return 'For practical study of power conversion, electronic drives, and control systems.';
  if (/electrical machine/.test(label)) return 'Supports experiments with electrical machines, measurement, and instrumentation.';
  if (/electrical workshop|switch gear|protection/.test(label)) return 'For hands-on electrical installation, equipment testing, and protection studies.';
  if (/electronics|microprocessor|microcontroller|ece communication|\becd\b/.test(label)) return 'Supports practical electronics, embedded systems, and communication engineering work.';
  if (/hydraulics|fluid mechanics/.test(label)) return 'For experiments in fluid flow, hydraulic systems, and related engineering principles.';
  if (/pneumatic/.test(label)) return 'For practical study of pneumatic components, circuits, and automation.';
  if (/chemistry/.test(label)) return 'For supervised experiments in chemical analysis, reactions, and laboratory methods.';
  if (/physics/.test(label)) return 'Supports practical investigations of core physics concepts and measurements.';
  if (/environmental/.test(label)) return 'For practical work in environmental sampling, analysis, and monitoring.';
  if (/survey/.test(label)) return 'Supports field and laboratory practice in surveying and measurement.';
  if (/construction/.test(label)) return 'For practical construction methods, materials, and civil engineering exercises.';
  if (/engineering mechanics/.test(label)) return 'Supports practical learning in forces, motion, and engineering mechanics.';
  if (/robotics/.test(label)) return 'For hands-on work with robotic systems, sensors, and automation.';
  if (/digital electronics/.test(label)) return 'For experiments with digital logic, circuits, and electronic systems.';
  if (/programming|software|database|data science|simulation|nlp|oss lab|byod/.test(label)) return 'Supports practical computing, software development, and project-based learning.';
  if (/\blab(oratory)?\b|workshop/.test(label)) return 'A specialist space for supervised practical work, experiments, and technical projects.';
  if (/team work hall|innovation hall|conference hall/.test(label)) return 'A shared space for teamwork, presentations, and collaborative academic activities.';
  return '';
}

export const floorPlanBuildings = [
  building('Football ground area', [floor('Grounds & nearby', [
    room('Structure timber testing', 'left'), room('STAR C lab', 'left'), room('Rock mechanics lab', 'left'),
    room('Power electronics and control system laboratory', 'left'), room('Hydraulics plumbing lab', 'left'),
    room('ME Workshop', 'left'), room('Electrical workshop testing lab', 'right'),
    room('Electrical machine and instrumentation laboratory', 'right'), room('Construction lab', 'right'),
    room('Civil Engineering lab — Soil Mechanics', 'right'), room('Civil Engineering lab — Material Testing', 'right'),
    room('Carpentry workshop', 'right'),
  ], 'Laboratories and workshops near the football ground. Floor levels were not specified.')], 'Near the football ground'),
  building('Library Building', [
    floor('Second floor', [room('Training Centre', 'left'), room('Student Service Center', 'left'), room('SSO office', 'right')]),
    floor('Third floor', ['Microgrid lab', 'Drawing Studio 04', 'Drawing Studio 05', 'Drawing Studio 02', 'CR14', 'CR15', 'CR16', 'CR17', 'CR18'].map((name) => room(name, 'center'))),
    floor('Fourth floor', [room('Drawing studio 03', 'left'), room('Architecture department', 'right')]),
  ]),
  building('Near football post', [floor('Nearby facilities', [room('Stationarykdee', 'left'), room('LT01', 'center'), room('ECE laboratory', 'right')], 'Floor levels were not specified.')]),
  building('Fab Lab building', [
    floor('Ground floor', [room('Fab Lab', 'left'), room('ECE Communication lab', 'right'), room('ECD lab', 'right')]),
    floor('Second floor', [room('Switch gear and protection lab', 'left'), room('Staff', 'left'), room('Robotics lab', 'right'), room('Microprocessor and microcontroller lab', 'right'), room('Hydraulics and pneumatics lab', 'right'), room('Digital electronics lab', 'right')]),
  ]),
  building('New Lab building', [
    floor('Ground floor', [room('Survey lab', 'right'), room('Chemistry lab 02', 'left')]),
    floor('Second floor', [room('Physics lab', 'right'), room('Fluid mechanics', 'left')]),
    floor('Third floor', [room('Environmental lab', 'left'), room('Chemistry lab 01', 'right')]),
  ]),
  building('Administrative Block', [
    floor('Ground floor', [room('College cafeteria', 'center', 'Meals and refreshments for students and staff.')]),
    floor('First floor', [room('Civil Engineering Department', 'right'), room('ICT and Statistics Department', 'left')]),
    floor('Second floor', [room('Instrumentation and Control Engineering Department', 'right'), room('Science and Humanities Department', 'left')]),
    floor('Third floor', [room('Electrical Engineering Department', 'left'), room('Administrative Section', 'right'), room("President's Office", 'right'), room('Integrity Hall', 'right'), room('Prayer Hall (Chue Khang)', 'right')]),
  ], 'Academic departments, administration, and student facilities.'),
  building('Classroom Block', [
    floor('Ground floor', [room('CR01', 'left', 'Near the entrance.'), ...['CR02', 'CR03', 'CR04', 'CR05', 'CR06'].map((name) => room(name, 'left')), ...['CR07', 'CR08', 'CR09'].map((name) => room(name, 'right'))]),
    floor('First floor', [...['CR10', 'CR11', 'CR12', 'CR13'].map((name) => room(name, 'right', name === 'CR13' ? 'CR13 is at the far end.' : '')), room('Engineering Mechanics Laboratory', 'right', 'Adjacent to CR13.'), room('Team work hall', 'left', 'Directly above the section occupied by CR02–CR06 on the ground floor.')]),
  ]),
  building('IT Building', [
    floor('Ground floor', [room('Programming Lab 1', 'left'), room('InnoTech Hall', 'left'), ...['IT01', 'IT02', 'IT03', 'Programming Lab 2', 'Programming Lab 3', 'Simulation Lab', 'BYOD Lab'].map((name) => room(name, 'right'))]),
    floor('First floor', [room('NLP Lab', 'left'), room('IT Head of Department (HOD) Office', 'left'), ...['IT04', 'IT05', 'Data Science Lab', 'OSS Lab', 'Software Lab', 'Database Lab'].map((name) => room(name, 'right'))]),
    floor('Second floor', [room('IT06', 'left'), room('Tech Innovation Hall', 'right'), room('Tech Conference Halls', 'right'), room("IT Lab Technician's Office", 'right')], 'Top floor.'),
  ], 'Above the Convention Hall, below the Classroom Block, and adjacent to the Administrative Block.'),
  building('LT Block', [floor('Classrooms', [room('LT02', 'left'), room('LT03', 'right')], 'The two classrooms are side by side. Floor level was not specified.')], 'Adjacent to the IT Building and below the Classroom Block.'),
];

export const allPlanRooms = floorPlanBuildings.flatMap((building) => building.floors.flatMap((level) => level.rooms.map((item) => ({ ...item, building: building.name, floor: level.name }))));
