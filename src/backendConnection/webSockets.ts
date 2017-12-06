import {eventBus} from "../util/EventBus";
import store from "../router/store/store";

class WebSocketHandlerClass {
  ws : any;
  retryTimeout;
  pingInterval;

  constructor() {

  }

  start() {
    this.ws = new WebSocket('ws://localhost:9000');
    this.bindEvents();

    eventBus.on('sendOverWebSocket', (message) => {
      this.ws.emit(message);
    })
  }

  bindEvents() {
    this.ws.addEventListener('open', () => {
      clearTimeout(this.retryTimeout);
      this.pingInterval = setInterval(() => { this.ws.send('ping') }, 1000);
      store.dispatch({type:'STATE_UPDATE', data:{connected:true}})
    });

    this.ws.addEventListener('message', (e) => {
      if (e.data && e.data === 'pong') {
        return;
      }
      let message = e.data;
      eventBus.emit("receivedMessage", message);
    });

    this.ws.addEventListener('close', (e) => {
      store.dispatch({type:'STATE_UPDATE', data:{connected:false}});
      this.retryTimeout = setTimeout(() => { this.start(); }, 1000);
      clearInterval(this.pingInterval);
    });
  }
}

export const WebSocketHandler = new WebSocketHandlerClass();