import { render, html, svg } from './uhtml.js';
import { delete_node } from "./actions/delete_node.js";

const drawNodeInput = (k, index, name) => html`
  <div class="node-input">
    <div
      class=${[
        "node-input-circle", 
        "socket"
      ].join(" ")}
      data-id=${`${k}:in:${index}`}></div>
    <div class="node-input-name">${name}</div>
  </div>
`

const drawNodeOutput = (k, index, name) => html`
  <div class="node-output">
    <div class="node-output-name">${name}</div>
    <div
      class="node-output-circle socket"
      data-id=${`${k}:out:${index}`}></div>
  </div>
`

const drawNode = (item, state) => { // TODO: make this a keyed-render
  const [ k, node ] = item;

  const selected = state.selectedNodes.includes(k);

  return html.for(node, k)`
    <div
      class=${["node", selected ? "selected-node" : ""].join(" ")}
      data-id=${k}
      style=${`left: ${node.x}px; top: ${node.y}px;`}>
      <div class="node-title">
        <div class="node-name">${node.name}</div>
      </div>
      ${node.inputs.map((x, i) => drawNodeInput(k, i, x))}
      ${node.outputs.map((x, i) => drawNodeOutput(k, i, x))}
      <div class="node-view"></div>
    </div>
  `
}


function getRelative(selector0, selector1) {
  // Get the top, left coordinates of two elements
  const el0 = document.querySelector(selector0);
  const el1 = document.querySelector(selector1);
  const eleRect = el0?.getBoundingClientRect() || { top: 0, left: 0 };
  const targetRect = el1?.getBoundingClientRect() || { top: 1, left: 1 };

  // Calculate the top and left positions
  const top = eleRect.top - targetRect.top;
  const left = eleRect.left - targetRect.left;

  return [ left, top ];
}

function drawEdge(edge, state) { // there muse be a better way to do this
  const { nodes } = state;
  const [ outNode, inNode ] = edge.map(x => x.split(":")[0]);
  const { x: outX, y: outY } = nodes[outNode];
  const { x: inX, y: inY } = nodes[inNode];

  if (!document.querySelector(".socket") || state.dataflow === null) return "";

  const offset0 = getRelative(`[data-id="${edge[0]}"]`, `.dataflow`);
  const offset1 = getRelative(`[data-id="${edge[1]}"]`, `.dataflow`);
  const rect0 = document.querySelector(`[data-id="${edge[0]}"]`)?.getBoundingClientRect() || { top: 0, left: 0 };
  const rect1 = document.querySelector(`[data-id="${edge[1]}"]`)?.getBoundingClientRect() || { top: 0, left: 0 };

  const x0 = offset0[0]+rect0.width/2;
  const y0 = offset0[1]+rect0.height/2;
  const x1 = offset1[0]+rect1.width/2;
  const y1 = offset1[1]+rect1.height/2;


  let xDist = Math.abs(x0 - x1);
  xDist = xDist/1.3;

  const data = `M ${x0} ${y0} C ${x0 + xDist} ${y0}, ${x1 - xDist} ${y1}, ${x1} ${y1}`;

  return svg`
    <path class="edge" stroke-width=${`${3*state.dataflow.scale()}px`} vector-effect="non-scaling-stroke" d=${data}/>
  `
}

function drawTempEdge(edge, state) {
  if (!document.querySelector(".socket")) return;

  const [ from, [x1, y1] ] = edge;

  if (from === "" || state.dataflow === null) return svg``;

  const offset0 = getRelative(`[data-id="${from}"]`, `.dataflow`);

  const x0 = offset0[0]+document.querySelector(`[data-id="${from}"]`).getBoundingClientRect().width/2;
  const y0 = offset0[1]+document.querySelector(`[data-id="${from}"]`).getBoundingClientRect().height/2;

  let xDist = Math.abs(x0 - x1);
  xDist = xDist/1.3;

  const data = `M ${x0} ${y0} C ${x0 + xDist} ${y0}, ${x1 - xDist} ${y1}, ${x1} ${y1}`;

  return svg`
    <path class="edge" stroke-width=${`${3*state.dataflow.scale()}px`} vector-effect="non-scaling-stroke" d=${data}>
  `
}

const drawSelectBox = box => {
  if (!box || !box.start || !box.end) return "";

  return html`
    <div
      class="select-box"
      style=${`
        background: blue;
        opacity: 0.1;
        z-index: 100;
        position: absolute;
        left: ${box.start[0]}px;
        top:${box.start[1]}px;
        width: ${Math.abs(box.end[0] - box.start[0])}px;
        height:${Math.abs(box.end[1] - box.start[1])}px;
      `}>
    </div>
  `
}

const dropdown = () => html`
  <div class="menu-item dropdown-container">
    list menu
    <div class="dropdown-list">
      <div class="menu-item">option 1</div>
      <div class="menu-item">option 2</div>
    </div>
  </div>
`

export function view(state) {
  return html`
    <div class="root">
      <div class="menu">
        
        <div class="menu-item" @click=${() => { } }}>load nodes</div>
        <div class="menu-item" @click=${() => { console.log({ nodes: state.nodes, edges: state.connections }) }}>print graph</div>
        <div class="menu-item" @click=${() => {
          state.selectedNodes.forEach(delete_node);
        }}>delete selected: ${state.selectedNodes.length}</div>

        <a class="menu-item" href="https://github.com/leomcelroy/yada" target="_blank">github</a>
      </div>

      <div class="dataflow">
        <svg class="edges">
          <g>
            ${state.connections.map(x => drawEdge(x, state))}
            ${drawTempEdge(state.tempEdge, state)}
          </g>
        </svg>
        <div class="nodes">
          <div class="transform-group">
            ${Object.entries(state.nodes).map(e => drawNode(e, state))}
            ${drawSelectBox(state.selectBox)}
          </div>
        </div>
      </div>

    </div>
  `
}
