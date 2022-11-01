import { global_state as STATE } from "../global_state.js";
import { render } from "./render.js";

export function reset_graph() {
  STATE.nodes = {};
  STATE.connections = [];

  render();
}
