Campus Issue Tracker is a web application that helps students report campus problems and enables administrators to track and resolve them in real time.

 It replaces informal WhatsApp messages and paper forms with a single transparent system where every issue is recorded, given a status and kept with its full timeline.

The frontend is built with HTML, CSS and vanilla JavaScript, while Firebase Realtime Database is used as the backend to store issues and push live updates to all connected clients.


The main problem this project addresses is the lack of a structured complaint channel in many colleges, where issues like damaged furniture, broken lights, water leakage or unclean facilities are reported verbally or through scattered messages.

In such setups there is no reliable way for management to see all open issues, understand which categories are most common or verify how long a complaint has been pending.

Campus Issue Tracker brings all of this information into one place, making it easier for staff to prioritize work and for students to see that their complaints are being handled.

The application offers two roles in a single interface: students and admins. Students use a simple form to submit a new issue by entering a title, a detailed description and a category such as electricity, water, cleanliness, infrastructure or other. When they click “Submit Issue”, the data is pushed into the issues  node of Firebase Realtime Database with fields for status, timestamps and vote count. The issue immediately appears in the “Recent issues” section as a card showing the description, category badge, current status, and a chip with the time when the issue was opened, so students know the system received their complaint.

To avoid duplicate complaints about the same problem, the student card also includes a small voting button with a thumbs‑up icon and the current vote count.Any student can click this button to say “I’m facing this too”, and the app increments the votes  field for that issue in the database and updates all clients in real time. When issues are rendered, they are sorted by vote count and creation time, so highly voted and newer complaints naturally rise to the top of the list, helping administrators focus on what affects the most people.

Administrators access a dedicated section using a small PIN‑based gate 

this is for the demo  purpose only 

the admin 
PIN is **4321**

 which is checked on the frontend before showing the admin controls.Once authenticated, admins see a table view of all issues along with a compact analytics bar. The analytics bar displays four key metrics: the number of Open issues, the number In Progress, the number Resolved and the average age of issues in hours, all calculated from the stored timestamps in Realtime Database.These numbers give a quick health check of how the campus is handling maintenance requests and whether complaints are getting stuck for too long.

The issue table supports searching and filtering so admins can quickly find what they need.A text search box matches against titles and descriptions, and dropdowns filter by status and category, allowing views such as “all cleanliness issues that are still open”. Each row shows the vote count and a timeline column with three lines: when the issue was opened, when it first moved to “In Progress”, and when it was finally marked “Resolved”. Buttons in the last column let admins change the status to “In Progress” or “Resolved” and, when they do so for the first time, the app automatically fills the corresponding timestamp fields (inprogressAt and resolvedAt) and writes them back to Firebase.

Under the hood, the app uses the Firebase Web SDK (modular form, loaded from CDN) to connect the client directly to Realtime Database. On startup it calls  initializeApp   with the project configuration, creates a reference to the issues path and attaches a single  onValue listener so that any change—new issue, vote update, status change or deletion—is reflected immediately in the local  currentEntries array and in the rendered UI.Because everything is implemented in plain HTML, CSS and JavaScript without any custom backend server, the project is easy to deploy as a static site and runs comfortably within the free tier of Firebase.


 for live demo
 https://dhruva207-ctrml.github.io/Campus_Issue_Tracker/
 pin
 4321
