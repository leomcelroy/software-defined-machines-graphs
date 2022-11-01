
export const global_state = {
  nodes: {
    "fds": { name:"jerry", x: 150, y: 0, inputs: ["x"], outputs: ["x"] },
    "fsa": { name: "number", x: 30, y: 0, inputs: ["y"], outputs: ["y"] },
    "dsf": { name: "adder", x: 100, y: 100, inputs: ["x", "y"], outputs: ["sum"] },
  },
  connections: [
    ["fsa:out:0", "dsf:in:0"],
    ["fsa:out:0", "fds:in:0"],
    ["fds:out:0", "dsf:in:1"]
  ],
  selectedNodes: [],
  tempEdge: ["", [0 ,0]],
  dataflow: null,
  websocket: null,
  websocket_msg: "Connect server"
}
/*
nodes: {
  "fds": { name:"jerry", x: 150, y: 0, inputs: ["x"], outputs: ["x"] },
  "fsa": { name: "number", x: 30, y: 0, inputs: ["y"], outputs: ["y"] },
  "dsf": { name: "adder", x: 100, y: 100, inputs: ["x", "y"], outputs: ["sum"] },
},
connections: [
  ["fsa:out:0", "dsf:in:0"],
  ["fsa:out:0", "fds:in:0"],
  ["fds:out:0", "dsf:in:1"]
],
*/
