/** Scroll to the top of the page. */
function goToTop() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

/** Set up videos with .thumb-hover class to play on mouse enter. */
function initHoverVideos() {
  const videos = document.querySelectorAll(
    "video.thumb-hover, .thumb-hover video"
  );

  videos.forEach((video) => {
    video.addEventListener("mouseenter", () => {
      video.play();
    });

    video.addEventListener("mouseleave", () => {
      video.pause();
      video.currentTime = 0;
    });
  });
}

/** Add the .scrolled class to .navbar.is-fixed-top based on window scroll. */
function initNavScroll() {
  var nav = document.querySelector(".navbar.is-fixed-top");
  if (!nav) {
    return;
  }

  document.addEventListener("scroll", function (event) {
    if (window.scrollY > nav.offsetHeight * 0.5) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  });
}

document.addEventListener("DOMContentLoaded", function (event) {
  initHoverVideos();
  initNavScroll();
});
