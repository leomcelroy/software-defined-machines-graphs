import { addEvents } from "./addEvents.js";
import { render } from "./actions/render.js";
import { global_state as STATE } from "./global_state.js";

window.LOG_STATE = () => console.log(STATE);

window.addEventListener("load", () => {
  let last = 0;
  const r = (time) => {
    render();
    requestAnimationFrame(r);
  };

  render();
  addEvents(STATE);

  requestAnimationFrame(r);
});
