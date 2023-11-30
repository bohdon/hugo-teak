/** Scroll to the top of the page. */
function goToTop() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

/** Scroll down by the window's height. */
function scrollDownOnePage(elementQuery) {
  var element = document.querySelector(elementQuery);
  var rect = element.getBoundingClientRect();
  var targetY = rect.bottom + window.scrollY;
  window.scrollTo({ top: targetY, behavior: "smooth" });
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

function initMagnify() {
  var zoomAmount = 4;
  var images = document.querySelectorAll(".img-magnifier-container img");
  for (var idx = 0; idx < images.length; idx++) {
    var img = images[idx];
    img.addEventListener("pointerenter", function (e) {
      magnify(this, zoomAmount, e);
    });
  }
}

function magnify(img, zoom, e) {
  // create magnifying glass
  var glass = document.createElement("div");
  glass.setAttribute("class", "img-magnifier-glass");
  img.parentElement.insertBefore(glass, img);

  // set magnifying glass image
  glass.style.backgroundImage = "url('" + img.src + "')";
  glass.style.backgroundRepeat = "no-repeat";
  glass.style.backgroundSize =
    img.width * zoom + "px " + img.height * zoom + "px";

  var glassHalfHeight = glass.offsetWidth / 2;
  var glassHalfWidth = glass.offsetHeight / 2;
  var glassOffsetY = -(glassHalfHeight + 50);

  glass.addEventListener("mousemove", onMoveMagnifier);
  glass.addEventListener("touchmove", onMoveMagnifier);
  img.addEventListener("mousemove", onMoveMagnifier);
  img.addEventListener("touchmove", onMoveMagnifier);

  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  function onMoveMagnifier(e) {
    // stop other events from occurring while moving over the image
    e.preventDefault();
    var pos = getLocalCursorPos(e);
    var x = pos.x;
    var y = pos.y;

    // clamp to image bounds
    var rect = img.getBoundingClientRect();
    x = clamp(x, rect.left, rect.right);
    y = clamp(y, rect.top, rect.bottom);

    var localX = x - rect.left;
    var localY = y - rect.top;

    glass.style.left = x - glassHalfWidth + "px";
    glass.style.top = y - glassHalfHeight + glassOffsetY + "px";
    var bgPosX = -localX * zoom + glassHalfWidth;
    var bgPosY = -localY * zoom + glassHalfHeight;
    glass.style.backgroundPosition = bgPosX + "px " + bgPosY + "px";
  }

  function getLocalCursorPos(e) {
    // cant use e.clientX/Y with touch events
    var x = e.pageX - window.scrollX;
    var y = e.pageY - window.scrollY;
    return { x: x, y: y };
  }

  img.addEventListener("pointerleave", function () {
    glass.remove();
  });

  // magnify will be with a pointerenter event
  onMoveMagnifier(e);
}

document.addEventListener("DOMContentLoaded", function (event) {
  initHoverVideos();
  initNavScroll();
  initMagnify();
});
