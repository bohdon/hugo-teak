window.addEventListener("DOMContentLoaded", function(event)
{
  var index = null;
  var lookup = null;
  var queuedTerm = null;

  var form = document.getElementById("search");
  var input = document.getElementById("search-input");

  form.addEventListener("submit", function(event)
  {
    event.preventDefault();

    var term = input.value.trim();
    if (!term)
      return;

    startSearch(term);
  }, false);

  function startSearch(term)
  {
    // Start icon animation.
    form.setAttribute("data-running", "true");

    if (index)
    {
      // Index already present, search directly.
      search(term);
    }
    else if (queuedTerm)
    {
      // Index is being loaded, replace the term we want to search for.
      queuedTerm = term;
    }
    else
    {
      // Start loading index, perform the search when done.
      queuedTerm = term;
      initIndex();
    }
  }

  function searchDone()
  {
    // Stop icon animation.
    form.removeAttribute("data-running");

    queuedTerm = null;
  }

  function initIndex()
  {
    var request = new XMLHttpRequest();
    request.open("GET", "/search.json");
    request.responseType = "json";
    request.addEventListener("load", function(event)
    {
      lookup = {};
      index = lunr(function()
      {
        // Uncomment the following line and replace de by the right language
        // code to use a lunr language pack.

        // this.use(lunr.de);

        this.ref("uri");

        // If you added more searchable fields to the search index, list them here.
        this.field("title");
        this.field("content");
        this.field("description");
        this.field("categories");

        for (var doc of request.response)
        {
          this.add(doc);
          lookup[doc.uri] = doc;
        }
      });

      // Search index is ready, perform the search now
      search(queuedTerm);
    }, false);
    request.addEventListener("error", searchDone, false);
    request.send(null);
  }

  function search(term)
  {
    var results = index.search(term);

    // The element where search results should be displayed, adjust as needed.
    var target = document.querySelector(".main-inner");

    while (target.firstChild)
      target.removeChild(target.firstChild);

    var title = document.querySelector(".search-result-msg");

    if (results.length == 0)
      title.textContent = `No results found for “${term}”`;
    else if (results.length == 1)
      title.textContent = `Found one result for “${term}”`;
    else
      title.textContent = `Found ${results.length} results for “${term}”`;

    document.title = title.textContent;

    var knownTypes = ['links', 'notes', 'work'];

    // card classes per page type
    var cardClasses = new Map();
    cardClasses.set('links', ['link-card']);
    cardClasses.set('notes', ['notes-card']);
    cardClasses.set('work', ['work-card']);

    // icons per page type
    var icons = new Map();
    icons.set('links', ['fa-regular', 'fa-arrow-up-right']);
    icons.set('notes', ['fa-solid', 'fa-memo']);
    icons.set('work', ['fa-solid', 'fa-photo-film']);

    var template = document.getElementById("search-result");
    for (var result of results)
    {
      var doc = lookup[result.ref];
    //   console.log(doc);
      var entryType = doc.type;

      // skip unknown page types
      if (!knownTypes.includes(entryType)) {
        continue;
      }

      var uri = entryType == 'links' ? doc.link : doc.uri;

      // Fill out search result template, adjust as needed.
      var element = template.content.cloneNode(true);
      element.querySelector(".card").classList.add(...cardClasses.get(entryType));
      if (doc.image) {
        // set card image
        element.querySelector(".entry-image-link").href = uri;
        element.querySelector(".entry-image").setAttribute('src', doc.image);
      } else {
        // remove card image completely
        var cardImage = element.querySelector(".card-image");
        cardImage.parentNode.removeChild(cardImage);
      }
      element.querySelector(".entry-icon").classList.add(...icons.get(entryType));
      element.querySelector(".entry-title-link").href = uri;

      if (entryType == 'links') {
        element.querySelector(".column").classList.add("is-half");
        element.querySelector(".entry-title-link").setAttribute('target', '_blank');
      }

      element.querySelector(".entry-title-text").textContent = doc.title;
      element.querySelector(".entry-summary-text").textContent = truncate(doc.content, 70);
      target.appendChild(element);
    }
    // title.scrollIntoView(true);

    searchDone();
  }

  // This matches Hugo's own summary logic:
  // https://github.com/gohugoio/hugo/blob/b5f39d23b8/helpers/content.go#L543
  function truncate(text, minWords)
  {
    var match;
    var result = "";
    var wordCount = 0;
    var regexp = /(\S+)(\s*)/g;
    while (match = regexp.exec(text))
    {
      wordCount++;
      if (wordCount <= minWords)
        result += match[0];
      else
      {
        var char1 = match[1][match[1].length - 1];
        var char2 = match[2][0];
        if (/[.?!"]/.test(char1) || char2 == "\n")
        {
          result += match[1];
          break;
        }
        else
          result += match[0];
      }
    }
    return result;
  }
}, false);