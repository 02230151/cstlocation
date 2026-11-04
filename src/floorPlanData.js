const room = (name, side = 'center', note = '') => ({ name, side, note });
const floor = (name, rooms, note = '') => ({ name, rooms, note });
const building = (name, floors, note = '') => ({ name, floors, note });

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
    floor('Third floor', ['Microgrid lab', 'DS04', 'DS05', 'Drawing studio 02', 'CR14', 'CR15', 'CR16', 'CR17', 'CR18'].map((name) => room(name, 'center'))),
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
