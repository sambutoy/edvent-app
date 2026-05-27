export const SEED = [
  {
    id: 1,
    name: "Sam & Jeo's Wedding",
    status: "in_progress",
    date: "2026-06-14",
    client: "Sam Reyes",
    budget: 150000,
    categories: {
      food: {
        label: "Food",
        items: [
          { id: 11, name: "Fried Chicken",   vendor: "ABC's Catering", cost: 8000,  assignees: ["Donald P.", "Vladimir T."] },
          { id: 12, name: "Bistek",           vendor: "ABC's Catering", cost: 5000,  assignees: [] },
          { id: 13, name: "5000 Layer Cake",  vendor: "Sweet Dreams",   cost: 12000, assignees: [] },
          { id: 14, name: "Softdrinks",       vendor: "Central Market", cost: 3500,  assignees: [] },
        ],
      },
      sound: {
        label: "Sound",
        items: [
          { id: 15, name: "PA System Setup",  vendor: "The Bomb Audio", cost: 15000, assignees: ["Vladimir T."] },
          { id: 16, name: "Microphones (x4)", vendor: "The Bomb Audio", cost: 4000,  assignees: [] },
        ],
      },
      venue: {
        label: "Venue",
        items: [
          { id: 17, name: "Main Hall Booking", vendor: "Eden's Garden", cost: 45000, assignees: ["Donald P."] },
          { id: 18, name: "Decorations",       vendor: "Bloom & Co.",   cost: 18000, assignees: [] },
        ],
      },
    },
  },
  {
    id: 2,
    name: "ABC's 18th Birthday",
    status: "unfinished",
    date: "2026-07-04",
    client: "Abby Cruz",
    budget: 50000,
    categories: {
      food:  { label: "Food",  items: [{ id: 21, name: "Birthday Cake",  vendor: "TBD", cost: 0, assignees: [] }] },
      sound: { label: "Sound", items: [] },
      venue: { label: "Venue", items: [{ id: 22, name: "Function Hall",  vendor: "TBD", cost: 0, assignees: [] }] },
    },
  },
  {
    id: 3,
    name: "Sam Vincent N. Crisostomo's Burial",
    status: "completed",
    date: "2026-05-10",
    client: "Crisostomo Family",
    budget: 30000,
    categories: {
      food:  { label: "Food",  items: [{ id: 31, name: "Reception Meal",      vendor: "Home Catering", cost: 8000,  assignees: [] }] },
      sound: { label: "Sound", items: [] },
      venue: { label: "Venue", items: [{ id: 32, name: "Chapel of Memories",  vendor: "Memorial Park", cost: 18000, assignees: [] }] },
    },
  },
];
