const authStatus = document.getElementById("auth-status");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const postList = document.getElementById("post-list");
const postForm = document.getElementById("post-form");
const saveBtn = document.getElementById("save-btn");
const resetBtn = document.getElementById("reset-btn");

const titleInput = document.getElementById("title");
const dateInput = document.getElementById("date");
const summaryInput = document.getElementById("summary");
const mealsInput = document.getElementById("meals");
const receiptInput = document.getElementById("receiptTotal");
const imagesInput = document.getElementById("images");
const videoInput = document.getElementById("video");

let currentPostId = null;

const setStatus = (message) => {
  if (authStatus) authStatus.textContent = message;
};

const toggleAuthButtons = (loggedIn) => {
  if (loginBtn) loginBtn.disabled = loggedIn;
  if (logoutBtn) logoutBtn.disabled = !loggedIn;
  if (saveBtn) saveBtn.disabled = !loggedIn;
};

const resetForm = () => {
  currentPostId = null;
  postForm.reset();
  saveBtn.textContent = "Publish post";
};

const parseImages = () =>
  imagesInput.value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const renderPosts = (posts) => {
  postList.innerHTML = "";
  if (!posts.length) {
    postList.innerHTML = "<p class=\"admin-status\">No posts yet.</p>";
    return;
  }

  posts.forEach((post) => {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.flexWrap = "wrap";
    row.style.gap = "0.5rem";

    const editBtn = document.createElement("button");
    editBtn.className = "btn ghost";
    editBtn.textContent = `${post.title} (${post.date || "No date"})`;
    editBtn.addEventListener("click", () => {
      currentPostId = post.id;
      titleInput.value = post.title || "";
      dateInput.value = post.date || "";
      summaryInput.value = post.summary || "";
      mealsInput.value = post.meals || "";
      receiptInput.value = post.receiptTotal || "";
      imagesInput.value = (post.images || []).join("\n");
      videoInput.value = post.video || "";
      saveBtn.textContent = "Update post";
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.style.background = "#f5a3c7";
    deleteBtn.addEventListener("click", async () => {
      if (!post.id) return;
      const confirmed = window.confirm(
        `Delete "${post.title}"? This cannot be undone.`
      );
      if (!confirmed) return;
      await db.collection("posts").doc(post.id).delete();
      if (currentPostId === post.id) {
        resetForm();
      }
      loadPosts();
    });

    row.appendChild(editBtn);
    row.appendChild(deleteBtn);
    postList.appendChild(row);
  });
};

if (!window.firebaseConfig || !window.firebase) {
  setStatus("Missing Firebase config.");
} else {
  if (!window.firebase.apps.length) {
    window.firebase.initializeApp(window.firebaseConfig);
  }

  const auth = window.firebase.auth();
  const db = window.firebase.firestore();
  const provider = new window.firebase.auth.GoogleAuthProvider();

  loginBtn.addEventListener("click", () => {
    auth.signInWithPopup(provider);
  });

  logoutBtn.addEventListener("click", () => {
    auth.signOut();
  });

  resetBtn.addEventListener("click", resetForm);

  auth.onAuthStateChanged((user) => {
    if (user) {
      setStatus(`Signed in as ${user.email}`);
      toggleAuthButtons(true);
      loadPosts();
    } else {
      setStatus("Not signed in.");
      toggleAuthButtons(false);
      postList.innerHTML = "";
    }
  });

  const loadPosts = async () => {
    const snapshot = await db
      .collection("posts")
      .orderBy("date", "desc")
      .get();
    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    renderPosts(posts);
  };

  postForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      title: titleInput.value.trim(),
      date: dateInput.value,
      summary: summaryInput.value.trim(),
      meals: mealsInput.value ? Number(mealsInput.value) : null,
      receiptTotal: receiptInput.value.trim(),
      images: parseImages(),
      video: videoInput.value.trim(),
    };

    if (currentPostId) {
      await db.collection("posts").doc(currentPostId).set(payload);
    } else {
      await db.collection("posts").add(payload);
    }

    resetForm();
    loadPosts();
  });
}
