import { v4 as uuidv4 } from "uuid";
import { animationFrameListenersTree } from "./animation-frame-listeners-tree";

/**
 * Generates unique uuid for a listener tree
 */
export const generateListenerTreeId = () => {
  let id: string | null = null;

  const existingKeys = Object.keys(animationFrameListenersTree);

  do {
    id = uuidv4();
  } while (existingKeys.includes(id));

  return id;
};

/**
 * Generates unique uuid for a listener within a tree
 * @param treeId - uuid of a listener tree to add listener to
 */
export const generateListenerId = (treeId: string) => {
  let id: string | null = null;

  const existingKeys = Object.keys(
    animationFrameListenersTree[treeId].listeners
  );

  do {
    id = uuidv4();
  } while (existingKeys.includes(id));

  return id;
};
