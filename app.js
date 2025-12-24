// Firebase config 
const firebaseConfig = {
  apiKey: "AIzaSyBfjPPJ7bm4lnyUTA7bQ2cz9X8StcPi0WE",
  authDomain: "campus-issue-tracker-f8523.firebaseapp.com",
  databaseURL:
    "https://campus-issue-tracker-f8523-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "campus-issue-tracker-f8523",
  storageBucket: "campus-issue-tracker-f8523.appspot.com",
  messagingSenderId: "1085666846344",
  appId: "1:1085666846344:web:2736638ab829640123e13d"
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  update,
  remove
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

// Initialize Firebase and Realtime Database
const app = initializeApp(firebaseConfig);
const rtdb = getDatabase(app);
const issuesRef = ref(rtdb, "issues");

// ----- Submit form ( To create issue) -----
document.getElementById("issue-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value;

  const now = Date.now();

  await push(issuesRef, {
    title,
    description,
    category,
    votes: 0,
    status: "Open",
    createdAt: now,
    inProgressAt: null,
    resolvedAt: null
  });

  alert("Issue submitted");
  e.target.reset();
});

// ----- DOM elements -----
const listDiv = document.getElementById("issues-list");
const issuesBody = document.getElementById("issuesBody");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const categoryFilter = document.getElementById("categoryFilter");

const statOpen = document.getElementById("statOpen");
const statProgress = document.getElementById("statProgress");
const statResolved = document.getElementById("statResolved");
const statAge = document.getElementById("statAge");

// Simple PIN-based admin access
const ADMIN_PIN = "4321";

const adminPinForm = document.getElementById("admin-pin-form");
const adminPinInput = document.getElementById("adminPinInput");
const adminSection = document.getElementById("adminSection");

if (adminPinForm) {
  adminPinForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (adminPinInput.value === ADMIN_PIN) {
      adminSection.style.display = "block";
      adminPinForm.style.display = "none";
    } else {
      alert("Wrong PIN");
    }
    adminPinInput.value = "";
  });
}

// Local cache of issues for filtering and stats
let currentEntries = [];

// Helper: age in hours
function hoursSince(ts) {
  if (!ts) return null;
  return (Date.now() - ts) / (1000 * 60 * 60);
}

// Format timestamp  for display
function formatTime(ts) {
  if (!ts) return "-";
  return new Date(ts).toLocaleString("en-IN", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

// ----- Realtime listener for all issues -----
onValue(issuesRef, (snapshot) => {
  const data = snapshot.val();

  if (!data) {
    currentEntries = [];
  } else {
    currentEntries = Object.entries(data).sort(
      (a, b) => b[1].createdAt - a[1].createdAt
    );
  }

  renderViews();
});

// Re‑render when search/status/category filters change
if (searchInput) searchInput.addEventListener("input", renderViews);
if (statusFilter) statusFilter.addEventListener("change", renderViews);
if (categoryFilter) categoryFilter.addEventListener("change", renderViews);

// ----- Render student cards and  admin table and  stats -----
function renderViews() {
  if (!listDiv || !issuesBody) return;

  listDiv.innerHTML = "";
  issuesBody.innerHTML = "";

  const searchText = (searchInput?.value || "").toLowerCase();
  const statusValue = statusFilter?.value || "all";
  const categoryValue = categoryFilter?.value || "all";

  // Stats
  let openCount = 0;
  let progressCount = 0;
  let resolvedCount = 0;
  let ageSumHours = 0;
  let ageCount = 0;

  currentEntries.forEach(([id, issue]) => {
    if (issue.status === "Open") openCount++;
    if (issue.status === "In Progress") progressCount++;
    if (issue.status === "Resolved") resolvedCount++;

    const age = hoursSince(issue.createdAt);
    if (age != null) {
      ageSumHours += age;
      ageCount++;
    }
  });

  statOpen.textContent = openCount;
  statProgress.textContent = progressCount;
  statResolved.textContent = resolvedCount;
  statAge.textContent = ageCount ? ageSumHours.toFixed(1) : "0";

  // Filter + sort
  const filtered = currentEntries
    .filter(([id, issue]) => {
      if (statusValue !== "all" && issue.status !== statusValue) return false;
      if (categoryValue !== "all" && issue.category !== categoryValue)
        return false;

      const combined = `${issue.title} ${issue.description}`.toLowerCase();
      if (searchText && !combined.includes(searchText)) return false;

      return true;
    })
    .sort((a, b) => {
      const ia = a[1];
      const ib = b[1];

      // Higher votes first
      if (ib.votes !== ia.votes) return ib.votes - ia.votes;

      // Newer first
      return ib.createdAt - ia.createdAt;
    });

  filtered.forEach(([id, issue]) => {
    const created = formatTime(issue.createdAt);
    const inProg = formatTime(issue.inProgressAt);
    const resolved = formatTime(issue.resolvedAt);

    // ----- Student card -----
    const card = document.createElement("div");
    card.className = "issue";
    card.innerHTML = `
      <div class="issue-header">
        <h3>${issue.title}</h3>
        <span class="badge status">${issue.status}</span>
      </div>
      <p>${issue.description}</p>
      <div class="issue-meta-row">
        <span class="badge category">${issue.category}</span>
        <span class="time-chip">Opened: ${created}</span>
        ${
          issue.resolvedAt
            ? `<span class="time-chip resolved-chip">Resolved: ${resolved}</span>`
            : ""
        }
        <button class="vote-btn">👍 ${issue.votes || 0}</button>
      </div>
    `;
    const voteBtn = card.querySelector(".vote-btn");

    voteBtn.addEventListener("click", async () => {
      const newVotes = (issue.votes || 0) + 1;
      await update(ref(rtdb, `issues/${id}`), { votes: newVotes });
    });

    listDiv.appendChild(card);

    // ----- Admin table row -----
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${issue.title}</td>
      <td>${issue.description}</td>
      <td>${issue.category}</td>
      <td>${issue.status}</td>
      <td>${issue.votes || 0}</td>
      <td class="timeline-cell">
        <span class="timeline-line">Opened: ${created}</span>
        <span class="timeline-line">In progress: ${inProg}</span>
        <span class="timeline-line">Resolved: ${resolved}</span>
      </td>
      <td>
        <button class="progress-btn">In Progress</button>
        <button class="resolve-btn">Resolved</button>
        <button class="delete-btn">Delete</button>
      </td>
    `;

    tr.querySelector(".progress-btn").addEventListener("click", async () => {
      const updates = { status: "In Progress" };
      if (!issue.inProgressAt) {
        updates.inProgressAt = Date.now();
      }
      await update(ref(rtdb, `issues/${id}`), updates);
    });

    tr.querySelector(".resolve-btn").addEventListener("click", async () => {
      const updates = { status: "Resolved" };
      if (!issue.resolvedAt) {
        updates.resolvedAt = Date.now();
      }
      await update(ref(rtdb, `issues/${id}`), updates);
    });

    tr.querySelector(".delete-btn").addEventListener("click", async () => {
      if (!confirm("Delete this issue?")) return;
      await remove(ref(rtdb, `issues/${id}`));
    });

    issuesBody.appendChild(tr);
  });
}