import { global_state as STATE } from "../global_state.js";
import { render } from "./render.js";

export function delete_connection(index) {
  STATE.connections = STATE.connections.filter((x, i) => i !== index);

  render();
}
