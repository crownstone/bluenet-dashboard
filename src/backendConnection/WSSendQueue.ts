import {eventBus} from "../util/EventBus";


class WSSendQueueClass {
  queue = []
  pending = false;


  constructor() {}

  add(message) {
    this.queue.push(message);
    if (this.pending === false) {
      this._send();
    }
  }

  _send() {
    if (this.queue.length > 0) {
      eventBus.emit('sendOverWebSocket', JSON.stringify(this.queue[0]));
      this.queue.shift()
    }
    if (this.queue.length > 0) {
      setTimeout(() => {this._send()}, 500);
      this.pending = true;
    }
  }
}

const WSSendQueue = new WSSendQueueClass();

export { WSSendQueue }