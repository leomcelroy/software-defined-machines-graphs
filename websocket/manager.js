import { global_state as STATE } from "../global_state.js";
import { add_connection } from "../actions/add_connection.js";
import { delete_connection } from "../actions/delete_connection.js";
import { delete_node } from "../actions/delete_node.js";
import { reset_graph } from "../actions/reset_graph.js";


const x_default = 50;
const y_default = 50;
const y_step = 120;
const y_max = 600;

let x_new = x_default;
let y_new = y_default;

function close() {
  if (STATE.websocket == null) return;

  STATE.websocket.close(1000);
  STATE.websocket = null;
}

function on_message(evt) {
  let data;

  try {
    data = JSON.parse(evt.data);
  } catch (err) {
    console.log(err.message);
  }

  console.log(data);

  if (data.action == undefined) {
    return;
  }

  if (data.action == "add_node") {

    let y_max = y_default;

    Object.values(STATE.nodes).forEach(n => {
      y_max = Math.max(y_max, n.y);
    })

    y_new = y_max + y_step;

    STATE.nodes[data.id] = {
      "name": data.name,
      "x": x_new,
      "y": y_new,
      "inputs": data.inputs,
      "outputs": data.outputs,
    };
  } else if (data.action == "delete_node") {
    delete_node(data.id);
  } else if (data.action == "add_connection") {
    add_connection(data.from, data.to);
  } else if (data.action == "delete_connection") {

  } else if (data.action == "reset") {
    reset_graph();
    y_new = y_default;
  }
}

export function click_connect() {
  if (STATE.websocket == null) {
    let ws = new WebSocket("ws://127.0.0.1:4000", 'echo-protocol');
    STATE.websocket = ws;

    STATE.websocket_msg = "Connecting...";

    ws.onopen = (evt) => {
      // STATE.websocket.send(JSON.stringify({"action": "reset"}));
      //
      // for (var id in STATE.nodes) {
      //   send_add_node(id, STATE.nodes[id]);
      // }
      //
      // STATE.connections.forEach((c) => send_add_connection(c[0], c[1]));

      STATE.websocket_msg = "Disconnect server";
    }

    ws.onmessage = on_message;

    ws.onerror = function(err) {
      STATE.websocket_msg = "Connection failed!"
      close();
    };
  } else {
    STATE.websocket_msg = "Connect server"
    close();
  }
}

export function send_add_node(id, node) {
  console.log(node)
  let msg = {
    "action": "add_node",
    "id": id,
    "name": node.name,
    "inputs": node.inputs,
    "outputs": node.outputs
  }
  STATE.websocket.send(JSON.stringify(msg));
}

export function send_delete_node(id) {
  let msg = {
    "action": "delete_node",
    "id": id
  }

  STATE.websocket.send(JSON.stringify(msg));
}

export function send_add_connection(from, to) {
  let msg = {
    "action": "add_connection",
    "from": from,
    "to": to
  }
  STATE.websocket.send(JSON.stringify(msg));
}

export function send_delete_connection(from, to) {
  let msg = {
    "action": "delete_connection",
    "from": from,
    "to": to
  }
  STATE.websocket.send(JSON.stringify(msg));
}
