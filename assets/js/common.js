function goToTop() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function setupHoverVideos() {
  const videos = document.querySelectorAll("video.thumb-hover, .thumb-hover video");

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

document.addEventListener("DOMContentLoaded", function (event) {
  setupHoverVideos();
});
