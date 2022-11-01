import { addPanZoom } from "./addPanZoom.js";
import { addSelectBox } from "./addSelectBox.js";
import { addDropUpload } from "./addDropUpload.js";

import { add_connection } from "./actions/add_connection.js";
import { delete_connection } from "./actions/delete_connection.js";
import { move_node } from "./actions/move_node.js";
import { send_add_connection, send_delete_connection,  } from "./websocket/manager.js";


const trigger = e => e.composedPath()[0];
const matchesTrigger = (e, selectorString) => trigger(e).matches(selectorString);
const pathContains = (e, selectorString) => e.composedPath().some(el => el.matches && el.matches(selectorString));
// create on listener
const createListener = (target) => (eventName, selectorString, event) => { // focus doesn't work with this, focus doesn't bubble, need focusin
  target.addEventListener(eventName, (e) => {
    e.trigger = trigger(e); // Do I need this? e.target seems to work in many (all?) cases
    if (selectorString === "" || matchesTrigger(e, selectorString)) event(e);
  })
}

function pauseEvent(e) {
  if(e.stopPropagation) e.stopPropagation();
  if(e.preventDefault) e.preventDefault();
  e.cancelBubble=true;
  e.returnValue=false;
  return false;
}

function getRelative(selector0, selector1) {
  // Get the top, left coordinates of two elements
  const el0 = document.querySelector(selector0);
  const el1 = document.querySelector(selector1);
  const eleRect = el0.getBoundingClientRect();
  const targetRect = el1.getBoundingClientRect();

  // Calculate the top and left positions
  const top = eleRect.top - targetRect.top;
  const left = eleRect.left - targetRect.left;

  return [ left, top ];
}

const getXY = (e, selector) => {
  let rect = document.querySelector(selector).getBoundingClientRect();
  let x = e.clientX - rect.left; //x position within the element.
  let y = e.clientY - rect.top;  //y position within the element.

  return [ x, y ];
}

function addWireManipulation(listen, state) {
  let from = "";
  let to = "";
  let currentIndex = -1;

  listen("mousedown", ".node-input-circle", e => {
    // if connected clickedKey is current input
    const temp = e.target.dataset.id;
    const currentConnection = state.connections.find( x => x[1] === temp);
    currentIndex = state.connections.findIndex( x => x[1] === temp);
    if (currentConnection) {
      from = currentConnection[0];
    }
  })

  listen("mousedown", ".node-output-circle", e => {
    from = e.target.dataset.id;
  })

  listen("mouseup", ".node-input-circle", e => {
    to = e.target.dataset.id;
  })

  listen("mousemove", "", e => {
    if (from !== "") {
      const rect = document.querySelector(`[data-id="${from}"]`).getBoundingClientRect();
      const [ rx, ry ] = getRelative(`[data-id="${from}"]`, ".dataflow");
      state.tempEdge = [
        from,
        getXY(e, ".dataflow")
      ];
    }

    if (currentIndex !== -1) {
      // console.log("remove", currentIndex);
      if (state.websocket != null) {
        send_delete_connection(...state.connections[currentIndex]);
      }
      delete_connection(currentIndex);
      currentIndex = -1;
    }
  })


  listen("mouseup", "", e => {
    if (from === "") return;

    if (from !== "" && to !== "") {
      // console.log("add", from, to);
      currentIndex = state.connections.findIndex( x => x[1] === to);
      if (currentIndex !== -1) {
        if (state.websocket != null) {
          send_delete_connection(...state.connections[currentIndex]);
        }
        delete_connection(currentIndex);
      }
      if (state.websocket != null) {
        send_add_connection(from, to);
      }
      add_connection(from, to);
    }

    from = "";
    to = "";
    currentIndex = -1;

    state.tempEdge = ["", [0, 0]];

  })
}

function addNodeDragging(listen, state) {
  let nodeClicked = false;
  let nodeId = "";
  let moved = false;

  listen("mousedown", "", e => {

    document.body.classList.add("no-select");
    const path = e.composedPath();
    if (path.some(div => div.matches && div.matches(".socket"))) {
      state.dataflow.togglePanZoom(true);
      return;
    }

    if (!pathContains(e, ".dataflow")) return;

    nodeClicked = path.find(div => div.matches && div.matches(".node"));

    if (nodeClicked) {
      state.dataflow.togglePanZoom(true);
      nodeId = nodeClicked.dataset.id;
      const selected = state.selectedNodes.includes(nodeId);
      if (selected && e.detail === 2) { // if selected how to remove
        // state.selectedNodes = state.selectedNodes.filter(id => id !== nodeId);
      } else if (!state.selectedNodes.includes(nodeId) && !e.shiftKey){
        state.selectedNodes = [nodeId];
      } else if (!state.selectedNodes.includes(nodeId) && e.shiftKey) {
        state.selectedNodes.push(nodeId);
      }
    } else if (!e.shiftKey) {
      state.selectedNodes = [];
    }

    // hacky bug fix, for some reason input views intefere with each other
    const tempSelected = state.selectedNodes;
    state.selectedNodes = [];


    state.selectedNodes = tempSelected;

  })

  listen("mousemove", "", e => {
    if (!nodeClicked) return

    moved = true;

    const scale = state.dataflow.scale()
    state.selectedNodes.forEach(id => {
      move_node(
        id,
        e.movementX/scale,
        e.movementY/scale
      );
    })



  })

  listen("mouseup", "", e => {
    // TODO: if over toolbox then delete node

    document.body.classList.remove("no-select");

    // if (state.selectedNodes.length === 1 && moved) {
    //   state.selectedNodes = [];
    //
    // }

    nodeClicked = false;
    nodeId = "";
    state.dataflow.togglePanZoom(false);
    moved = false;

  })
}

export function addEvents(state) {

  const dataflow = document.querySelector(".dataflow");
  state.dataflow = addPanZoom(dataflow);

  const body = document.querySelector("body");
  const listenBody = createListener(body);

  addNodeDragging(listenBody, state);
  addWireManipulation(listenBody, state);
  addSelectBox(listenBody, state);
  addDropUpload(listenBody, state);
}
