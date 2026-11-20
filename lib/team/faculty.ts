// Faculty are not in team_members: they are fixed here and shown first on /team.
// Add a picture path to show a real photo; null shows the shared placeholder.
export const HOD = { name: "Dr. Sandeep Kumar", title: "Head of Department", picture: null };

export const FACULTY_COORDINATORS = [
  { name: "Mr. Shivam Pandey", title: "Faculty Coordinator", picture: null },
  { name: "Mr. Abhishek Rawat", title: "Faculty Coordinator", picture: null },
] as const;
