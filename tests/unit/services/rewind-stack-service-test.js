import { moduleFor, test } from 'ember-qunit';

moduleFor('service:rewind-stack-service', 'Unit | Service | rewind stack service', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
});

// Replace this with your real tests.
test('it exists', function (assert) {
  let service = this.subject();
  assert.ok(service);
});

test('addOperation creates a new stack with current', function (assert) {
  let service = this.subject();
  let op = {name: 'I did a thing'};
  service.addOperation('testOne', op);
  let current = service.getCurrent('testOne');
  assert.equal(current.name, op.name, 'current should be be op');
  assert.equal(service.getStack('testOne').completed.length, 0, 'completed stack should be empty');
});

test('it adds an operation to an existing stack', function (assert) {
  let service = this.subject();
  let op1 = {name: '2 I did a thing'};
  let op2 = {name: '2 I did another thing'};
  service.addOperation('testTwo', op1);
  service.addOperation('testTwo', op2);
  let current = service.getCurrent('testTwo');
  assert.equal(current.name, op2.name, 'current should be be op');
  assert.equal(service.getStack('testTwo').completed.length, 1, 'stack should have one entry');
  assert.equal(service.getStack('testTwo').completed[0].name, op1.name, 'stack should have one entry');
});

test('it keeps separate stacks', function (assert) {
  let service = this.subject();
  let s1op1 = {name: 's1op1 I did a thing'};
  let s1op2 = {name: 's1op2 I did another thing'};
  let s2op1 = {name: 's2op1 I did a thing'};
  let s2op2 = {name: 's2op2 I did another thing'};
  service.addOperation('someStack1', s1op1);
  service.addOperation('someStack2', s2op1);
  service.addOperation('someStack2', s2op2);
  service.addOperation('someStack1', s1op2);
  let s2current = service.getCurrent('someStack2');
  let s1current = service.getCurrent('someStack1');
  assert.equal(s2current.name, s2op2.name, 'current should be be op');
  assert.equal(s1current.name, s1op2.name, 'current should be be op');
  assert.equal(service.getStack('someStack1').completed.length, 1, 'stack should have one entry');
  assert.equal(service.getStack('someStack1').completed[0].name, s1op1.name, 'stack should have one entry');
  assert.equal(service.getStack('someStack2').completed[0].name, s2op1.name, 'stack should have one entry');
});

test('it clears a stack', function (assert) {
  let service = this.subject();
  let op1 = {name: '2 I did a thing'};
  let op2 = {name: '2 I did another thing'};
  service.addOperation('testFour', op1);
  service.addOperation('testFour', op2);
  let current = service.getCurrent('testFour');
  assert.equal(current.name, op2.name, 'current should be be op');
  assert.equal(service.getStack('testFour').completed.length, 1, 'stack should have one entry');
  assert.equal(service.getStack('testFour').completed[0].name, op1.name, 'stack should have one entry');
  service.removeStack('testFour');
  assert.throws(
    function () {
      service.getStack('testFour');
    },
    /testFour/,
    'error contains the name of the stack'
  );
});

test('operations can be completed', function (assert) {
  let service = this.subject();
  let t5op1 = {name: 't5op1 I did a thing'};
  let t5op2 = {name: 't5op2 I did another thing'};
  service.addOperation('testFive', t5op1);
  assert.equal(service.getCurrent('testFive').name, t5op1.name, 'current should be be op');
  service.completeOperation('testFive', {inputs: {id: '3ef'}});
  assert.equal(service.getCurrent('testFive'), undefined, 'current should undefined');
  assert.equal(service.getStack('testFive').completed.length, 1, 'stack should have one entry');
  assert.equal(service.getStack('testFive').completed[0].inputs.id, '3ef', 'options should be merged to current');
  service.addOperation('testFive', t5op2);
  assert.equal(service.getCurrent('testFive').name, t5op2.name, 'current should be be op2');
  service.removeStack('testFive');
});
