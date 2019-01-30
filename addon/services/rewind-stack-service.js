import Ember from 'ember';
/**
 * Internalize deep clone so we can remove Ember.copy
 * while not pulling in more dependencies
 */
function cloneObject(obj) {
 let clone = {};
  // first check array
  if (Array.isArray(obj)) {
    clone = obj.map(cloneObject);
  } else if (typeof obj === "object") {
    for (const i in obj) {
      if (obj[i] != null && typeof obj[i] === "object") {
        clone[i] = cloneObject(obj[i]);
      } else {
        clone[i] = obj[i];
      }
    }
  } else {
    clone = obj;
  }
  return clone;
}
/**
 * Hold a stack of task steps allowing us to rewind when things go boom...
 */

export default Ember.Service.extend({
  stacks: {},

  /**
   * Internalize deep clone so we can remove Ember.copy
   */
  cloneObject (obj) {
    let clone = {};
     // first check array
     if (Array.isArray(obj)) {
       clone = obj.map(cloneObject);
     } else if (typeof obj === "object") {
       for (const i in obj) {
         if (obj[i] != null && typeof obj[i] === "object") {
           clone[i] = cloneObject(obj[i]);
         } else {
           clone[i] = obj[i];
         }
       }
     } else {
       clone = obj;
     }
     return clone;
  },
  /**
   * Add an operation to a named stack
   */
  addOperation (stackName, operation) {
    let stacks = this.get('stacks');
    let opClone = cloneObject(operation, true);
    opClone.startedAt = new Date().getTime();
    // if we don't have a stack with this name, create one
    if (!stacks[stackName]) {
      Ember.set(stacks, stackName, {
        current: opClone,
        completed: []
      });
    } else {
      // use the existint stack
      let activeStack = stacks[stackName];
      if (activeStack.current) {
        activeStack.current.completedAt = new Date().getTime();
        activeStack.completed.push(cloneObject(activeStack.current, true));
      }
      activeStack.current = opClone;
    }
  },
  /**
   * Complete the operation, options are appended to the operation
   */
  completeOperation (stackName, options) {
    let stacks = this.get('stacks');
    let activeStack = stacks[stackName];
    if (activeStack) {
      if (options) {
        Object.assign(activeStack.current, options);
        activeStack.current.completedAt = new Date().getTime();
      }
      activeStack.completed.push(activeStack.current);
      // nuke the current...
      delete activeStack.current;
    }
  },
  /**
   * Return a stack by name. Called in error handlers so they can clean up
   */
  getStack (stackName) {
    let stacks = this.get('stacks');
    if (stacks[stackName]) {
      return stacks[stackName];
    } else {
      throw new Error(`Stack with name ${stackName} not found.`);
    }
  },

  /**
   * Return the current operation
   */
  getCurrent (stackName) {
    let stacks = this.get('stacks');
    if (stacks[stackName]) {
      return stacks[stackName].current;
    } else {
      throw new Error(`Stack with name ${stackName} not found.`);
    }
  },

  /**
   * Clean up
   */
  removeStack (stackName) {
    let stacks = this.get('stacks');
    if (stacks[stackName]) {
      delete stacks[stackName];
    }
  },

  /**
   * Get the array of completed operations, reversed if needed
   */
  getCompleted (stackName) {
    let stacks = this.get('stacks');
    if (stacks[stackName]) {
      return stacks[stackName].completed.reverse();
    } else {
      throw new Error(`Stack with name ${stackName} not found.`);
    }
  }
});
