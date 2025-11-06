const owlCarouselConfig_one_and_Half_Box = {
  0: {
    items: 1,
    center: true,
    stagePadding: 40,
  },
  576: {
    items: 1,
    center: true,
    stagePadding: 150,
  },
  768: {
    items: 1,
    center: true,
    stagePadding: 150,
  },
  992: {
    items: 1,
    center: true,
    stagePadding: 180,
  },
  1200: {
    items: 1,
    center: true,
    stagePadding: 230,
  },
  1440: {
    items: 1,
    center: false,
    stagePadding: 380,
  },
};
const owlConfig_two_and_half_box = {
  0: {
    items: 1.1,
  },
  576: {
    items: 1.2,
  },
  768: {
    items: 2.5,
  },
  992: {
    items: 2.5,
  },
};
const owlConfig_three_and_half_box = {
  0: {
    items: 1.1,
  },
  576: {
    items: 1.2,
  },
  768: {
    items: 2.5,
  },
  992: {
    items: 3.5,
  },
};
const owlConfig_two_box = {
  0: {
    items: 1.1,
  },
  576: {
    items: 1.2,
  },
  768: {
    items: 2,
  },
  992: {
    items: 2,
  },
};

let activeIndex = 0;
let ticking = false;
let lastScrollY = window.scrollY;
const vh = window.innerHeight;
const imgs = document.querySelectorAll(".dac-parralex-effect");
const header = document.querySelector(".dac-sticky-header");
const cards = document.querySelectorAll(".dac-events_card");
const hamburger = document.querySelector(".dac-mobile-hambuger");
const mobileMenu = document.getElementById("mobileMenu");
const closeButton = document.querySelector(".dac-menu-close");
header.classList.remove("hide");

// const dacBtn = document.getElementById("dacBtn");
// const memberBtn = document.getElementById("memberBtn");
// const dacEvents = document.getElementById("dacEvents");
// const memberEvents = document.getElementById("memberEvents");

const buttons = document.querySelectorAll(".toggle-button");
const sections = document.querySelectorAll(".event-section");

document.addEventListener("DOMContentLoaded", () => {
  //   Initialize Owl Carousel
  handleOWLcarous("#carousel-container", owlCarouselConfig_one_and_Half_Box);
  handleOWLcarous("#owl-carousel-one", owlConfig_two_and_half_box);
  handleOWLcarous("#owl-carousel-two", owlConfig_two_and_half_box);
  handleOWLcarous("#owl-carousel-three", owlConfig_three_and_half_box);
  handleOWLcarous("#owl-carousel-four", owlConfig_three_and_half_box);
  handleOWLcarous("#owl-carousel-full-two", owlConfig_two_box);
  //sticky header functionality

  window.addEventListener("scroll", () => {
    // const currentScrollY = window.scrollY;

    // if (currentScrollY == 0) {
    //   header.classList.remove("dac-hide");
    // }

    // if (currentScrollY > lastScrollY && currentScrollY > 10) {
    //   // Scrolling down - hide header
    //   header.classList.add("dac-hide");
    // }
    // if ((currentScrollY || lastScrollY) > 50) {
    //   header.classList.remove("dac-hide");
    // }

    // lastScrollY = currentScrollY;

    // Parallax effect for main image

    const image = document.querySelector(".dac-main-image");
    const speed = 0.2;
    const offset = window.scrollY * speed;
    if (image) {
      image.style.transform = `translateY(${offset}px)`;
    }
  });

  // Mobile menu toggle

  hamburger.addEventListener("click", () => {
    mobileMenu.classList.add("dac-open");
    document.body.classList.add("dac-no-scroll");
  });

  closeButton.addEventListener("click", () => {
    mobileMenu.classList.remove("dac-open");
    document.body.classList.remove("dac-no-scroll");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      mobileMenu.classList.remove("dac-open");
    }
  });

  // Intersection Observer for fade-in effect

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("dac-is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll(".dac-section").forEach((sec) => {
    sec.classList.add("dac-fade-in-section");
    observer.observe(sec);
  });

  // Card carousel functionality

  document.querySelectorAll(".dac-card__link").forEach((link) => {
    link.addEventListener("click", (e) => {
      console.log(link);
      e.preventDefault();
      // Remove active class from current card
      cards[activeIndex].classList.remove("dac-active");
      cards[activeIndex].classList.add("dac-behind");

      // Move to next card
      activeIndex = (activeIndex + 1) % cards.length;

      // Show next card
      cards[activeIndex].classList.add("dac-active");
      cards[activeIndex].classList.remove("dac-behind");
    });
  });

  // Video play button functionality
  const video = document.getElementById("myVideo");
  const playBtn = document.getElementById("playBtn");

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      video.play();
      playBtn.classList.add("hidden");
    });
  }
  if (video) {
    video.addEventListener("pause", () => {
      playBtn.classList.remove("hidden");
    });
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  });

  window.addEventListener("resize", updateParallax);
  updateParallax();

  // dacBtn.addEventListener("click", function () {
  //   dacBtn.classList.add("active");
  //   memberBtn.classList.remove("active");
  //   dacEvents.classList.add("active");
  //   memberEvents.classList.remove("active");
  // });

  // memberBtn.addEventListener("click", function () {
  //   memberBtn.classList.add("active");
  //   dacBtn.classList.remove("active");
  //   memberEvents.classList.add("active");
  //   dacEvents.classList.remove("active");
  // });

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class from all buttons and sections
      buttons.forEach((b) => b.classList.remove("active"));
      sections.forEach((s) => s.classList.remove("active"));

      // Add active class to clicked button
      btn.classList.add("active");

      // Show matching section
      const targetId = btn.getAttribute("data-target");
      document.getElementById(targetId).classList.add("active");
      resetOWL();
    });
  });
});

function updateParallax() {
  if (imgs) {
    imgs.forEach((img) => {
      const rect = img.parentElement.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= vh) return;

      const progress = rect.top / vh;
      const yOffset = progress * -100; // adjust depth/speed
      img.style.transform = `translate(0%, ${yOffset}px)`;
    });
  }
  ticking = false;
}

function handleOWLcarous(className, responsive) {
  let isRTL = $("html").attr("lang") === "ar";

  // Destroy existing carousel before reinitializing
  let carousel = $(className);
  if (carousel.hasClass("owl-loaded")) {
    carousel.trigger("destroy.owl.carousel").removeClass("owl-loaded");
    carousel.find(".owl-stage-outer").children().unwrap();
  }

  let checkIfClassNameExists = $(className).length > 0;

  if (checkIfClassNameExists) {
    $(className).owlCarousel({
      loop: true,
      responsiveClass: true,
      nav: false,
      dots: false,
      autoplay: true,
      autoplayTimeout: 5000,
      margin: 24,
      responsive: responsive,
      rtl: isRTL,
      autoplayTimeout: 3000, // ⏱ Delay between slides (ms)
      autoplaySpeed: 1000, // 🎞 Slide animation speed
      autoplayHoverPause: true,
    });
  }
}

const countdown = () => {
  const targetDate = new Date("2025-12-19T00:00:00Z"); // SET FUTURE DATE HERE
  const now = new Date();
  const diff = targetDate - now;

  if (diff <= 0) {
    document.getElementById("days").textContent = "00";
    document.getElementById("hours").textContent = "00";
    document.getElementById("minutes").textContent = "00";
    document.getElementById("seconds").textContent = "00";
    clearInterval(timer);
    return;
  }

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (
    document.getElementById("days") ||
    document.getElementById("hours") ||
    document.getElementById("minutes") ||
    document.getElementById("seconds")
  ) {
    document.getElementById("days").textContent = String(days).padStart(2, "0");
    document.getElementById("hours").textContent = String(hours).padStart(
      2,
      "0"
    );
    document.getElementById("minutes").textContent = String(minutes).padStart(
      2,
      "0"
    );
    document.getElementById("seconds").textContent = String(seconds).padStart(
      2,
      "0"
    );
  }
};

const resetOWL = () => {
  handleOWLcarous("#carousel-container", owlCarouselConfig_one_and_Half_Box);
  handleOWLcarous("#owl-carousel-one", owlConfig_two_and_half_box);
  handleOWLcarous("#owl-carousel-two", owlConfig_two_and_half_box);
  handleOWLcarous("#owl-carousel-three", owlConfig_three_and_half_box);
  handleOWLcarous("#owl-carousel-four", owlConfig_three_and_half_box);
  handleOWLcarous("#owl-carousel-full-two", owlConfig_two_box);
};

const timer = setInterval(countdown, 1000);
countdown();
