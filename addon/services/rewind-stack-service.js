import Ember from 'ember';
/**
 * Hold a stack of task steps allowing us to rewind when things go boom...
 */
export default Ember.Service.extend({
  stacks: {},
  /**
   * Add an operation to a named stack
   */
  addOperation (stackName, operation) {
    let stacks = this.get('stacks');
    let opClone = Ember.copy(operation, true);
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
        activeStack.completed.push(Ember.copy(activeStack.current, true));
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
      return stacks[stackName].completed.reverse;
    } else {
      throw new Error(`Stack with name ${stackName} not found.`);
    }
  }
});
