(() => {
  const citations = document.getElementsByClassName("cite");

  let cite_map = {};
  citations.forEach((c) => {
    cite_map[c.innerText] = c;
  });

  let counter = 1;
  document.getElementsByClassName("refs").forEach((r) => {
    r.getElementsByTagName("li").forEach((l) => {
      const ref_id = l.attributes.value.value;
      l.style.counterSet = `cnt ${counter}`;

      try {
        cite_map[ref_id].innerText = counter;
      } catch (error) {
      }

      counter++;
    });
  });
})();