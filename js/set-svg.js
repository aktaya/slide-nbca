const svgs = document.getElementsByClassName("annotation-layer");
svgs.forEach((s)=>{
  let W = 1600;
  let H = 780;
  s.setAttribute("viewBox", `0 0 ${W} ${H}`);
});
