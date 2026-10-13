# CampusRoll

Attendance tracker for college **virtual classes**. Students in each department sign in with their roll number, join a live session with a six-digit code, and see course-wise attendance against the usual 75% eligibility line. Faculty start and close rooms; admins see department risk at a glance.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Every demo account uses password `campus123`.

| Who | Login |
| --- | --- |
| CSE student (healthy %) | `CSE2024001` |
| CSE student (below 75% in DSA) | `CSE2024004` |
| ECE student | `ECE2024001` |
| CSE faculty | `faculty.cse` |
| Admin | `admin` |

The first launch writes `data/db.json`. Use **Reset demo data** on the admin page to rebuild the seed, including a live CSE class with code `749201`.

## How a class works

1. Faculty opens **Faculty desk**, starts a virtual class, and shares the code (and optional Meet/Zoom link).
2. Enrolled students enter the code. After 10 minutes they are marked late instead of present.
3. Faculty can override present / late / absent on the live roster, then end the class. Missing students become absent.
4. Students see bars per course. Red means they are under the course minimum (75%).

Data stays on this machine (JSON file). Swap the store later if you want a campus database.
