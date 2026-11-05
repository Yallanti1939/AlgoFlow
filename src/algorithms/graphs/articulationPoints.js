import { runLowLinkTraversal } from "./lowLinkTraversal.js";

export class ArticulationPointsAlgorithm {
  constructor(graph) {
    this.graph = graph;
    this.steps = [];
  }

  run() {
    this.steps = runLowLinkTraversal(this.graph, "articulationPoints");
    return this.steps;
  }
}

export function findArticulationPoints(graph) {
  const steps = new ArticulationPointsAlgorithm(graph).run();
  return steps.at(-1)?.result ?? null;
}

export default findArticulationPoints;
