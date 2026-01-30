const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const copyButton = document.getElementById("copy-link");
if (copyButton) {
  copyButton.addEventListener("click", async () => {
    const link = window.location.href;
    try {
      await navigator.clipboard.writeText(link);
      copyButton.textContent = "Copied!";
      setTimeout(() => {
        copyButton.textContent = "Copy site link";
      }, 2000);
    } catch (error) {
      copyButton.textContent = "Copy failed";
      setTimeout(() => {
        copyButton.textContent = "Copy site link";
      }, 2000);
    }
  });
}

const postsContainer = document.getElementById("posts-list");
const totalMealsEl = document.getElementById("total-meals");
const totalCostEl = document.getElementById("total-cost");

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const isVideoFile = (url) => /\.(mp4|webm|ogg)$/i.test(url || "");
const parseCurrency = (value) => {
  if (!value) return 0;
  const numeric = String(value).replace(/[^0-9.]/g, "");
  return Number.parseFloat(numeric) || 0;
};

const shouldLoadPosts = postsContainer || totalMealsEl || totalCostEl;
if (shouldLoadPosts) {
  fetch("posts.json")
    .then((response) => response.json())
    .then((data) => {
      const posts = Array.isArray(data) ? data : data.posts || [];
      const sorted = [...posts].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      if (totalMealsEl || totalCostEl) {
        const totalMeals = posts.reduce(
          (sum, post) => sum + (Number(post.meals) || 0),
          0
        );
        const totalCost = posts.reduce(
          (sum, post) => sum + parseCurrency(post.receiptTotal),
          0
        );
        if (totalMealsEl) totalMealsEl.textContent = totalMeals.toString();
        if (totalCostEl) {
          totalCostEl.textContent = `$${totalCost.toFixed(2)}`;
        }
      }

      if (postsContainer) {
        if (!sorted.length) {
          postsContainer.innerHTML = "<p>No posts yet.</p>";
          return;
        }

        sorted.forEach((post) => {
          const card = document.createElement("article");
          card.className = "card";

          const title = document.createElement("h3");
          title.textContent = post.title;

          const meta = document.createElement("div");
          meta.className = "post-meta";
          const date = document.createElement("span");
          date.textContent = formatDate(post.date);
          meta.appendChild(date);

          if (post.meals) {
            const meals = document.createElement("span");
            meals.textContent = `${post.meals} meals`;
            meta.appendChild(meals);
          }

          if (post.receiptTotal) {
            const receipt = document.createElement("span");
            receipt.textContent = `Receipts: ${post.receiptTotal}`;
            meta.appendChild(receipt);
          }

          const summary = document.createElement("p");
          summary.textContent = post.summary || "";

          card.appendChild(meta);
          card.appendChild(title);
          card.appendChild(summary);

          if (Array.isArray(post.images) && post.images.length) {
            const media = document.createElement("div");
            media.className = "post-media";
            post.images.forEach((src) => {
              const img = document.createElement("img");
              img.src = src;
              img.alt = post.title || "Cook day photo";
              media.appendChild(img);
            });
            card.appendChild(media);
          }

          if (post.video) {
            const media = document.createElement("div");
            media.className = "post-media";
            if (isVideoFile(post.video)) {
              const video = document.createElement("video");
              video.src = post.video;
              video.controls = true;
              media.appendChild(video);
            } else {
              const link = document.createElement("a");
              link.href = post.video;
              link.className = "post-link";
              link.textContent = "Watch video";
              media.appendChild(link);
            }
            card.appendChild(media);
          }

          postsContainer.appendChild(card);
        });
      }
    })
    .catch(() => {
      if (postsContainer) {
        postsContainer.innerHTML = "<p>Unable to load posts right now.</p>";
      }
    });
}
