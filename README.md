# ember-rewind-stack
Many applications have code that orchestrates a LOT of API calls. Particularly related to  creation of complex solutions, it is quite reasonable to expect that one user action will result in 5 or more API calls, some of which will result in the creation of ancillary records/entities.

The question is - what happens when some critical path call fails in the middle of one of these giant chains?

Enter the `rewind-stack-service`, which allows you to manage multiple, possibly parallel, operation stacks. In the event of a failure, your `.catch()` block can ask the service for all the completed operations, and then take action to roll-back the changes.

## Installation

`ember install ember-rewind-stack`

# When should I use this?
Only use this when you are orchestrating a lot of calls. If you are just issuing a single save operation, this is massive overkill. Basically, if you can't easily figure out how to clean things up in a `.catch()`, then consider using this.

# API

| method | returns | description |
| --- | --- | --- |
| addOperation (stackName, operationObj) | n/a | add an operation to a named stack. Creates the stack if it does not exist. Sets the `.current` to the passed in operation. If there is a `.current`, it is pushed into the stack's `.completed` array. A `.startedAt` property is added to the operation when pushed in. A `.completedAt` property is set when it's pushed into the `.completed` array.|
| completeOperation (stackName, options) | n/a | Moves the current operation onto the `.completed` array, adding the `.completedAt` property, and clearing the stack's `.current` property. The `options` are merged into the current operation, allowing useful stuff like itemId's to be added after an operation completes.|
| getCompleted (stackName) | array of completed operations, reversed | Used by exception handlers to rewind the completed actions |
| removeStack (stackName) | n/a | clean up a stack |
| getCurrent (stackName) | Current Operation Obj | Returns the current operation |
| getStack (stackName) | stack object | returns the entire stack object |


# Operation Object
The operation object can be whatever you need it to be. The intent here is that you provide enough info in that object to allow you to un-do the operation.

```
{
  "name": "create site item", // some sort of name that makes sense to you
  "type": "create-item",      // something that would make sense in a log
  "cleanup": "remove-item",   // a key for your clean up code to use...
  "inputs": {                 // whatever your cleanup code needs...
    "id": "3ef...",           // in this case, to delete an item we need the id and owner
    "owner": "dcadmin"
  }
}
```
