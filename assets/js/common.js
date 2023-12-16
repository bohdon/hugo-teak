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

/** Init highlighting of elements when scrolled into view. */
function initScrollSpy() {
  // the threshold from the top of the window above which an element is considered in view
  var threshold = 150;

  // track all elements in content with an 'id'
  var elements = document.querySelectorAll(".content [id]");
  if (elements.length == 0) {
    // nothing to track
    return;
  }

  // build list of entries that have an associated anchor referencing the id
  var entries = Array.from(elements)
    .map((elem) => {
      var id = elem.getAttribute("id");
      var referencer = document.querySelector(`nav a[href="#${id}"]`);
      return {
        section: elem,
        referencer: referencer ? referencer.parentElement : null,
      };
    })
    .filter((entry) => {
      return entry.referencer != null;
    });

  function updateActive() {
    // iterate from bottom to top and find the first one above threshold
    var activeIdx = -1;
    for (var idx = entries.length - 1; idx >= 0; idx--) {
      // check if this is the active element
      var rect = entries[idx].section.getBoundingClientRect();
      if ((rect.top < threshold || idx == 0) && activeIdx == -1) {
        // only allow 1 section to be active
        activeIdx = idx;
        entries[idx].referencer.classList.add("is-active");
      } else {
        entries[idx].referencer.classList.remove("is-active");
      }
    }
  }

  // listen for scroll event
  window.addEventListener("scroll", updateActive);
  window.addEventListener("resize", updateActive);
  // update once during initialize
  updateActive();
}

/** Setup all .img-magnifier-container elements to support mouse-over magnification. */
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

/**
 * Create a magnifying glass popup that tracks the mouse for an image.
 * Should be called with a pointerenter event to initialize the position.
 */
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

  var glassHalfWidth = glass.offsetWidth / 2;
  var glassHalfHeight = glass.offsetHeight / 2;
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

  img.addEventListener("pointerleave", remove);
  img.addEventListener("pointerup", remove);
  img.addEventListener("pointercancel", remove);
  // repeat pointer enters are possible on ios, remove this instance in those situations
  img.addEventListener("pointerenter", remove);
  // if magnifier gets stuck on for some reason, allow removing on tap
  glass.addEventListener("pointerdown", remove);

  function remove() {
    glass.remove();
  }

  // magnify will be with a pointerenter event
  onMoveMagnifier(e);
}

/**
 * Initializes functionality for mousing over some images and comparing them with
 * an alternate image.
 */
function initImageCompare() {
  var containers = document.querySelectorAll(".img-compare-container");

  for (var idx = 0; idx < containers.length; idx++) {
    var container = containers[idx];

    function addMoveListener(element, container) {
      element.addEventListener("mousemove", (e) => {
        onMoveCompare(e, container);
      });
      element.addEventListener("touchmove", (e) => {
        onMoveCompare(e, container);
      });
    }

    var imgA = container.querySelector(".img-a");
    var imgB = container.querySelector(".img-b");
    addMoveListener(imgA, container);
    addMoveListener(imgB, container);
    addMoveListener(container, container);
  }

  function onMoveCompare(e, container) {
    var imgA = container.querySelector(".img-a");
    var imgRect = imgA.getBoundingClientRect();

    function clamp(val, min, max) {
      return Math.min(Math.max(val, min), max);
    }

    var localX = e.pageX - imgRect.left;

    // the parent container mousemove will allow dragging out of bounds to cleanly
    // wipe to 0% or 100%, but it shouldn't work outside of a certain margin otherwise
    // the change feels accidental since the mouse is nowhere near the image.
    var margin = 20;
    if (localX < -margin || localX - imgRect.width > margin) {
      return;
    }

    e.preventDefault();

    var maskPct = clamp(1 - localX / imgRect.width, 0, 1) * 100;

    var imgB = container.querySelector(".img-b");
    imgB.style.clipPath = `inset(0 ${maskPct}% 0 0)`;
  }
}

/** Handle initializing behavior on content load. */
document.addEventListener("DOMContentLoaded", function (event) {
  initHoverVideos();
  initNavScroll();
  initMagnify();
  initImageCompare();
  initScrollSpy();
});
