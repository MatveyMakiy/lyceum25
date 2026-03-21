import { getPosts } from "../../api/posts.js";
import { renderSidebar } from "../../components/layout/sidebar.js";
import { createPostCard } from "../../components/post/postCard.js";

const sidebarContainer = document.getElementById("sidebar");
const postsContainer = document.getElementById("posts");
const loadMoreButton = document.getElementById("load-more-btn");

let currentPage = 1;
const limit = 2;

renderSidebar(sidebarContainer);

async function loadPage() {
  const result = await getPosts(currentPage, limit);

  result.items.forEach((post) => {
    postsContainer.appendChild(createPostCard(post));
  });

  if (!result.hasMore) {
    loadMoreButton.style.display = "none";
  }

  currentPage += 1;
}

loadMoreButton.addEventListener("click", loadPage);

loadPage();