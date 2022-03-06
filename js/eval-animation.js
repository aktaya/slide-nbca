(() => {
  const btn = {
    "start": document.getElementById("eval-start"),
    "stop": document.getElementById("eval-stop"),
    "cmap": document.getElementById("eval-cmap"),
  };

  const canvas = {
    "conv": document.getElementById("eval-canvas-conv"),
    "prop": document.getElementById("eval-canvas-prop"),
  };
  const ctx = {
    "conv": canvas.conv.getContext('2d'),
    "prop": canvas.prop.getContext('2d'),
  }
  const width = 1000;
  const height = 500;
  const pos = [
    { x: 400, y: 200 },
    { x: 250, y: 100 },
    { x: 100, y: 200 },
    { x: 150, y: 350 },
    { x: 350, y: 350 },
    { x: 750, y: 100 },
    { x: 900, y: 200 },
    { x: 850, y: 350 },
    { x: 650, y: 350 },
    { x: 600, y: 200 },
  ]
  const radius = 50;
  let cmap_absolute = true;

  let timer;
  let counter = 0;
  const N = 10;
  let values = {
    "conv": Array.from({ length: N }),
    "prop": Array.from({ length: N }),
  };
  let mv_avg_vals = Array.from({length: N}).map(()=>0);
  const neighbors = [
    [1, 2, 3, 4, 9],
    [0, 2, 3, 4],
    [0, 1, 3, 4],
    [0, 1, 2, 4],
    [0, 1, 2, 3],
    [6, 7, 8, 9],
    [5, 7, 8, 9],
    [5, 6, 8, 9],
    [5, 6, 7, 9],
    [5, 6, 7, 8, 0],
  ]
  let beta;
  let epsilon;

  function cmap(values, absolute=false, vmax=1, vmin=0) {
    function cmap_inner(v) {
      let r = 1;
      let g = 1;
      let b = 1;
      if (v < 0.25) {
        r = 0;
        g = 4 * v;
      } else if (v < 0.5 ) {
        r = 0;
        b = 2 - 4 * v;
      } else if (v < 0.75) {
        r = 4 * v - 2;
        b = 0;
      } else {
        g = 4 - 4 * v;
        b = 0;
      }
      return `rgb(${r*255},${g*255},${b*255})`;
    }

    if (!absolute) {
      vmax = Math.max(...values);
      vmin = Math.min(...values);
    }
    dv = vmax - vmin;
    scaler = ((x) => (x - vmin) / dv);
    return values.map((v) => cmap_inner(scaler(v)));
  }

  function drawCircle(ctx, x, y, r, color) {
    ctx.beginPath();

    ctx.arc(x, y, r, 0, 2 * Math.PI, true);

    ctx.fillStyle = color;
    ctx.fill();

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawLine(ctx, x1, y1, x2, y2, color) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 5;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  function drawEdges() {
    for (let i = 0; i < N / 2; i++) {
      for (let j = i + 1; j < N / 2; j++){
        drawLine(ctx.conv, pos[i].x, pos[i].y, pos[j].x, pos[j].y, 'black');
        drawLine(ctx.prop, pos[i].x, pos[i].y, pos[j].x, pos[j].y, 'black');
      }
    }
    for (let i = N / 2; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        drawLine(ctx.conv, pos[i].x, pos[i].y, pos[j].x, pos[j].y, 'black');
        drawLine(ctx.prop, pos[i].x, pos[i].y, pos[j].x, pos[j].y, 'black');
      }
    }
    drawLine(ctx.conv, pos[0].x, pos[0].y, pos[9].x, pos[9].y, 'black');
    drawLine(ctx.prop, pos[0].x, pos[0].y, pos[9].x, pos[9].y, 'black');
  }

  function drawNodes() {
    const color_list = {
      "conv": cmap(values.conv, absolute = cmap_absolute, vmax = 10, vmin = 0),
      "prop": cmap(values.prop, absolute = cmap_absolute, vmax = 10, vmin = 0),
    }
    for (let i = 0; i < N; i++) {
      drawCircle(ctx.conv, pos[i].x, pos[i].y, radius, color_list.conv[i]);
      drawCircle(ctx.prop, pos[i].x, pos[i].y, radius, color_list.prop[i]);
    }
  }

  function loadValues() {
    for (let i = 0; i < N; i++){
      const input_id = `prm-val${i}`;
      values.conv[i] = parseFloat(document.getElementById(input_id).value);
      values.prop[i] = parseFloat(document.getElementById(input_id).value);
    }
    mv_avg_vals = Array.from({length: N}).map(()=>0.0);
  }

  function loadParams() {
    epsilon = parseFloat(document.getElementById("prm-eps").value);
    beta = parseFloat(document.getElementById("prm-beta").value);
  }

  function init() {
    canvas.conv.setAttribute("width", `${width}`);
    canvas.conv.setAttribute("height", `${height}`);
    canvas.prop.setAttribute("width", `${width}`);
    canvas.prop.setAttribute("height", `${height}`);
  }

  function reset() {
    loadValues();
    loadParams();

    ctx.conv.clearRect(0, 0, width, height);
    ctx.prop.clearRect(0, 0, width, height);
    drawEdges();
    drawNodes();

    counter = 0;
  }

  function update() {
    updateValues();

    ctx.conv.clearRect(0, 0, width, height);
    ctx.prop.clearRect(0, 0, width, height);
    drawEdges();
    drawNodes();

    counter++;
    document.getElementById("eval-counter").innerHTML = counter;
  }

  function updateValues() {
    // console.log("val", values);
    for (let i = 0; i < N; i++) {
      mv_avg_vals[i] = values.prop[i] + 2 * beta * mv_avg_vals[i];
    }
    const current_vals = Array.from(values.conv);
    // console.log("mva", mv_avg_vals);
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < neighbors[i].length; j++) {
        neighbor = neighbors[i][j];
        values.prop[i] -= epsilon * (mv_avg_vals[i] - mv_avg_vals[neighbor]);
        values.conv[i] -= epsilon * (current_vals[i] - current_vals[neighbor]);
      }
    }
    // console.log("val", values);
  }

  init();
  reset();

  btn.start.addEventListener("click", () => {
    clearInterval(timer);
    reset();
    const fps = document.getElementById("prm-fps").value;
    const time_interval = 1000 / fps;
    timer = setInterval(() => {
      update();
    }, time_interval);
  });

  btn.stop.addEventListener("click", () => {
    clearInterval(timer);
  });

  btn.cmap.addEventListener("click", () => {
    cmap_absolute = !cmap_absolute;
    const label = document.getElementById("cmap-state");
    label.innerHTML = cmap_absolute ? "absolute" : "relative";
    drawNodes();
  });
})();