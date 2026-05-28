const menuToggle = document.querySelector("#menuToggle");
const navLinks = document.querySelector("#navLinks");
const progressBar = document.querySelector("#progressBar");
const sections = [...document.querySelectorAll("main section[id]")];
const navItems = [...document.querySelectorAll(".nav-links a")];

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

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
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const updateProgressAndNav = () => {
  const scrollTop = window.scrollY;
  const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = pageHeight > 0 ? (scrollTop / pageHeight) * 100 : 0;
  progressBar.style.width = `${progress}%`;

  const current = sections
    .filter((section) => section.offsetTop <= scrollTop + 120)
    .at(-1);

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

const canvas = document.querySelector("#mapCanvas");
const ctx = canvas.getContext("2d");
const points = [
  { x: 0.14, y: 0.22, r: 4, speed: 0.55 },
  { x: 0.32, y: 0.36, r: 5, speed: 0.42 },
  { x: 0.5, y: 0.18, r: 4, speed: 0.5 },
  { x: 0.68, y: 0.38, r: 6, speed: 0.36 },
  { x: 0.82, y: 0.62, r: 4, speed: 0.48 },
  { x: 0.55, y: 0.72, r: 5, speed: 0.4 },
  { x: 0.28, y: 0.68, r: 4, speed: 0.52 },
  { x: 0.16, y: 0.5, r: 5, speed: 0.34 }
];
const links = [
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
  ctx.strokeStyle = "rgba(20, 94, 168, 0.08)";
  ctx.lineWidth = 1;

  for (let x = 0; x <= width; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y <= height; y += 46) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
};

const drawMap = (time = 0) => {
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  ctx.clearRect(0, 0, width, height);
  drawGrid(width, height);

  //To get the position object of the points, this fn is used
  const positioned = points.map((point, index) => {
    const drift = Math.sin(time * 0.001 * point.speed + index) * 8;
    return {
      x: point.x * width + drift,
      y: point.y * height + Math.cos(time * 0.001 * point.speed + index) * 8,
      r: point.r
    };
  });


  //To connect the two points, this fn is used. 
  ctx.lineWidth = 2;
  links.forEach(([start, end]) => {
    const a = positioned[start];
    const b = positioned[end];
    ctx.strokeStyle = "rgba(20, 94, 168, 0.28)";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  });

  positioned.forEach((point, index) => {
    ctx.beginPath();
    ctx.fillStyle = index % 3 === 0 ? "#21a7a8" : "#145ea8";
    ctx.arc(point.x, point.y, point.r + Math.sin(time * 0.004 + index) * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = "rgba(33, 167, 168, 0.18)";
    ctx.lineWidth = 8;
    ctx.arc(point.x, point.y, point.r + 10, 0, Math.PI * 2);
    ctx.stroke();
  });

  ctx.fillStyle = "rgba(242, 184, 75, 0.92)";
  ctx.fillRect(width * 0.08, height * 0.82, width * 0.3, 4);
  ctx.fillStyle = "#0a2540";
  ctx.font = "700 13px Arial";
  ctx.fillText("Spatial workflow network", width * 0.08, height * 0.79);

  requestAnimationFrame(drawMap);
};

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
requestAnimationFrame(drawMap);
