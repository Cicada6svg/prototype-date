/*
  Simple social prototype using localStorage.

	* posts: array of {id, author, content, likes, likedBy:[], ts}
	* users: array of {id, name, following: boolean}
*/
(() => {
const STORAGE_KEY = 'dateapp-demo-v1';

// Sample users
const sampleUsers = [
{ id: 'u1', name: 'Alex' },
{ id: 'u2', name: 'Jordan' },
{ id: 'u3', name: 'Sam' },
];

// DOM
const feedList = document.getElementById('feed-list');
const postBtn = document.getElementById('post-btn');
const postContent = document.getElementById('post-content');
const postName = document.getElementById('post-name');
const suggestedList = document.getElementById('suggested-list');
const toggleFollowBtn = document.getElementById('toggle-follow-btn');
const profileFollowingCount = document.getElementById('profile-following-count');
const resetBtn = document.getElementById('reset-btn');

// State
let state = loadState();

// Initialize sample data if empty
if (!state.users.length && !state.posts.length) {
state.users = sampleUsers.map(u => ({ ...u, following: false }));
state.posts = [
  createPost('Alex', 'Hello! This is a sample post.'),
  createPost('Jordan', 'Welcome to the Date App demo.'),
  createPost('Sam', 'Try creating a post using the box above.'),
];
saveState();
}

render();

// Event listeners
postBtn.addEventListener('click', onCreatePost);
toggleFollowBtn.addEventListener('click', onToggleFollowAll);
resetBtn.addEventListener('click', onReset);

// Functions
function loadState() {
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { users: [], posts: [] };
  return JSON.parse(raw);
} catch (e) {
  console.error('Could not load state', e);
  return { users: [], posts: [] };
}
}

function saveState() {
localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createPost(author, content) {
return {
  id: 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2,8),
  author,
  content,
  likes: 0,
  likedBy: [],
  ts: Date.now()
};
}

function onCreatePost() {
const content = postContent.value.trim();
const name = postName.value.trim() || 'You';
if (!content) {
  alert('Please enter a message.');
  return;
}
const p = createPost(name, content);
state.posts.unshift(p); // newest first
saveState();
postContent.value = '';
postName.value = '';
render();
}

function render() {
// Suggested users
suggestedList.innerHTML = '';
state.users.forEach(u => {
  const li = document.createElement('li');
  li.className = 'suggested-list-item';
  li.innerHTML = <span>${u.name}</span>;
  const btn = document.createElement('button');
  btn.className = u.following ? 'secondary' : '';
  btn.textContent = u.following ? 'Following' : 'Follow';
  btn.addEventListener('click', () => {
    u.following = !u.following;
    saveState();
    render();
  });
  li.appendChild(btn);
  suggestedList.appendChild(li);
});

profileFollowingCount.textContent = 'Following ' + state.users.filter(u=>u.following).length;

// Feed
feedList.innerHTML = '';
state.posts.forEach(post => {
  const card = document.createElement('article');
  card.className = 'post';
  const header = document.createElement('div');
  header.className = 'post-header';
  header.innerHTML = `<div class="avatar">(post.author||^′ U^′).slice(0,2).toUpperCase() </div >< div >< div >< strong >{escapeHtml(post.author)}</strong></div>
                        <div class="meta">${timeAgo(post.ts)}</div>
                      </div>`;
  const content = document.createElement('div');
  content.className = 'content';
  content.textContent = post.content;

  const actions = document.createElement('div');
  actions.className = 'actions';
  const likeBtn = document.createElement('button');
  likeBtn.className = 'like-btn';
  likeBtn.textContent = ❤ ${post.likes};
  if (post.likedBy && post.likedBy.includes('me')) {
    likeBtn.classList.add('liked');
  }
  likeBtn.addEventListener('click', () => {
    toggleLike(post.id);
  });

  actions.appendChild(likeBtn);

  card.appendChild(header);
  card.appendChild(content);
  card.appendChild(actions);
  feedList.appendChild(card);
});
}

function toggleLike(postId) {
const p = state.posts.find(x=>x.id===postId);
if (!p) return;
p.likedBy = p.likedBy || [];
if (p.likedBy.includes('me')) {
  p.likedBy = p.likedBy.filter(x=>'me'!==x);
  p.likes = Math.max(0, p.likes - 1);
} else {
  p.likedBy.push('me');
  p.likes = (p.likes || 0) + 1;
}
saveState();
render();
}

function onToggleFollowAll() {
const anyFollowing = state.users.some(u=>u.following);
state.users.forEach(u => u.following = !anyFollowing);
saveState();
render();
}

function onReset() {
if (!confirm('Reset demo data? This will clear posts and follows in your browser.')) return;
localStorage.removeItem(STORAGE_KEY);
state = { users: [], posts: [] };
// re-init
state.users = sampleUsers.map(u => ({ ...u, following: false }));
state.posts = [
  createPost('Alex', 'Hello! This is a sample post.'),
  createPost('Jordan', 'Welcome to the Date App demo.'),
  createPost('Sam', 'Try creating a post using the box above.'),
];
saveState();
render();
}

// Utilities
function timeAgo(ts){
const diff = Math.floor((Date.now()-ts)/1000);
if (diff < 60) return ${diff}s;
if (diff < 3600) return ${Math.floor(diff/60)}m;
if (diff < 86400) return ${Math.floor(diff/3600)}h;
return ${Math.floor(diff/86400)}d;
}

function escapeHtml(str){
return String(str).replace(/[&<>"']/g, s => ({'&':'&','<':'<','>':'>','"':'“',"'":'&#39;'}[s]));
}
})();
