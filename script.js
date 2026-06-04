const menuToggle = document.querySelector("#menuToggle");
const navLinks = document.querySelector("#navLinks");
const progressBar = document.querySelector("#progressBar");
const sections = [...document.querySelectorAll("main section[id]")];
const navItems = [...document.querySelectorAll(".nav-links a")];

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navItems.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const updateProgressAndNav = () => {
  const scrollTop = window.scrollY;
  const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = pageHeight > 0 ? (scrollTop / pageHeight) * 100 : 0;
  progressBar.style.width = `${progress}%`;

  const current = sections.filter((section) => section.offsetTop <= scrollTop + 140).at(-1);

  navItems.forEach((item) => {
    item.classList.toggle("active", current && item.getAttribute("href") === `#${current.id}`);
  });
};

window.addEventListener("scroll", updateProgressAndNav, { passive: true });
updateProgressAndNav();

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    document.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    document.querySelectorAll(".project-card").forEach((card) => {
      const categories = card.dataset.category.split(" ");
      card.classList.toggle("is-hidden", filter !== "all" && !categories.includes(filter));
    });
  });
});

document.querySelectorAll(".details-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".project-card");
    const isOpen = card.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
    button.textContent = isOpen ? "Hide" : "Details";
  });
});

const canvas = document.querySelector("#terrainCanvas");
const ctx = canvas.getContext("2d");

const workflowPoints = [
  { x: 0.14, y: 0.28, r: 4, speed: 0.55, color: "#3f6a52" },
  { x: 0.3, y: 0.36, r: 5, speed: 0.42, color: "#2d7f8b" },
  { x: 0.48, y: 0.18, r: 4, speed: 0.5, color: "#c38747" },
  { x: 0.66, y: 0.38, r: 6, speed: 0.36, color: "#3f6a52" },
  { x: 0.82, y: 0.6, r: 4, speed: 0.48, color: "#2d7f8b" },
  { x: 0.56, y: 0.72, r: 5, speed: 0.4, color: "#c38747" },
  { x: 0.3, y: 0.68, r: 4, speed: 0.52, color: "#3f6a52" },
  { x: 0.16, y: 0.5, r: 5, speed: 0.34, color: "#2d7f8b" }
];
const workflowLinks = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 0],
  [1, 6],
  [3, 5]
];

const resizeCanvas = () => {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * ratio);
  canvas.height = Math.floor(rect.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
};

const drawGrid = (width, height) => {
  ctx.strokeStyle = "rgba(31, 53, 44, 0.06)";
  ctx.lineWidth = 1;

  for (let x = 0; x <= width; x += 56) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y <= height; y += 56) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
};

const drawWorkflow = (width, height, time) => {
  const positioned = workflowPoints.map((point, index) => {
    const drift = Math.sin(time * 0.001 * point.speed + index) * 8;
    return {
      x: point.x * width + drift,
      y: point.y * height + Math.cos(time * 0.001 * point.speed + index) * 8,
      r: point.r,
      color: point.color
    };
  });

  ctx.lineWidth = 2;
  workflowLinks.forEach(([start, end]) => {
    const a = positioned[start];
    const b = positioned[end];
    ctx.strokeStyle = "rgba(45, 127, 139, 0.24)";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  });

  positioned.forEach((point, index) => {
    ctx.beginPath();
    ctx.fillStyle = point.color;
    ctx.arc(point.x, point.y, point.r + Math.sin(time * 0.004 + index) * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = "rgba(110, 159, 116, 0.14)";
    ctx.lineWidth = 8;
    ctx.arc(point.x, point.y, point.r + 10, 0, Math.PI * 2);
    ctx.stroke();
  });
};

const drawLegend = (width, height) => {
  ctx.fillStyle = "rgba(31, 53, 44, 0.82)";
  ctx.font = "700 13px Arial";
  ctx.fillText("Geospatial workflow network", width * 0.08, height * 0.13);

  ctx.fillStyle = "rgba(63, 106, 82, 0.92)";
  ctx.fillRect(width * 0.08, height * 0.16, width * 0.22, 4);

  ctx.fillStyle = "rgba(45, 127, 139, 0.92)";
  ctx.fillRect(width * 0.08, height * 0.19, width * 0.14, 4);

  ctx.fillStyle = "rgba(195, 135, 71, 0.92)";
  ctx.fillRect(width * 0.08, height * 0.22, width * 0.09, 4);
};

const drawScene = (time = 0) => {
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  ctx.clearRect(0, 0, width, height);
  drawGrid(width, height);
  drawWorkflow(width, height, time);
  drawLegend(width, height);

  requestAnimationFrame(drawScene);
};

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
requestAnimationFrame(drawScene);
