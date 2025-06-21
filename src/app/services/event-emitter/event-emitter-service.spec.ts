import {EventEmitter} from '@angular/core';
import {EventEmitterService} from './event-emitter-service';

describe('EventEmitterService', () => {

  beforeEach(() => {
    // Clear emitters before each test to avoid cross-test pollution
    (EventEmitterService as any).emitters = {};
  });

  it('should create a new EventEmitter if not existing', () => {
    const emitter = EventEmitterService.get('testEvent');
    expect(emitter).toBeTruthy();
    expect(emitter instanceof EventEmitter).toBeTrue();
  });

  it('should return the same EventEmitter instance for the same name', () => {
    const emitter1 = EventEmitterService.get('testEvent');
    const emitter2 = EventEmitterService.get('testEvent');

    expect(emitter1).toBe(emitter2);
  });

  it('should emit and listen to events', (done) => {
    const emitter = EventEmitterService.get('customEvent');

    emitter.subscribe(value => {
      expect(value).toBe('Hello World');
      done();  // Mark async test as complete
    });

    emitter.emit('Hello World');
  });

});
