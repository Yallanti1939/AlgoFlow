import { runLowLinkTraversal } from "./lowLinkTraversal.js";

export class BridgesAlgorithm {
  constructor(graph) {
    this.graph = graph;
    this.steps = [];
  }

  run() {
    this.steps = runLowLinkTraversal(this.graph, "bridges");
    return this.steps;
  }
}

export function findBridges(graph) {
  const steps = new BridgesAlgorithm(graph).run();
  return steps.at(-1)?.result ?? null;
}

export default findBridges;
