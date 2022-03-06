// const svgs = document.getElementsByClassName("annotation-layer");
svgs.forEach((s)=>{
  let W = 1600;
  let H = 780;
  let majorTick = 100;

  for(var i = 0; i < H / majorTick; i++) {
    let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", `0`);
    line.setAttribute("x2", `${W}`);
    line.setAttribute("y1", `${i * majorTick}`);
    line.setAttribute("y2", `${i * majorTick}`);
    line.setAttribute("stroke", "lightgray");
    line.setAttribute("stroke-width", "1");
    s.appendChild(line);
  }

  for(var i = 0; i < W / majorTick; i++) {
    let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", `${i * majorTick}`);
    line.setAttribute("x2", `${i * majorTick}`);
    line.setAttribute("y1", `0`);
    line.setAttribute("y2", `${H}`);
    line.setAttribute("stroke", "#f0f0f0");
    line.setAttribute("stroke-width", "1");
    s.appendChild(line);
  }
});

const elem_areas = document.getElementsByClassName("elem-area");
elem_areas.forEach((e) => {
  e.style.border = "thin dashed";
});

const pages = document.getElementsByClassName("page");
pages.forEach((p) => {
  p.style.border = "thin dashed";
});