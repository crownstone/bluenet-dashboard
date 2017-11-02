import * as BrowserWebSocket from 'browser-websocket'
import {eventBus} from "../util/EventBus";
import store from "../router/store/store";

class WebSocketHandlerClass {
  ws : any;
  retryInterval;
  retrying = false;

  constructor() {

  }

  start() {
    this.ws = new BrowserWebSocket('ws://localhost:9000');

    this.ws.on('open', () => {
      if (this.retrying === true) {
        this.retrying = false;
        clearInterval(this.retryInterval);
      }
      store.dispatch({type:'STATE_UPDATE', data:{connected:true}})
    });

    this.ws.on('message', (e) => {
      let message = e.data;
      eventBus.emit("receivedMessage", message);
    });

    this.ws.on('close', (e) => {
      console.log("connection lost", e);
      store.dispatch({type:'STATE_UPDATE', data:{connected:false}});
      if (this.retrying === false) {
        this.retrying = true;
        this.retryInterval = setInterval(() => { this.ws.reconnect();}, 1000);
      }
    });


    eventBus.on('sendOverWebSocket', (message) => {
      this.ws.emit(message);
    })
  }
}

export const WebSocketHandler = new WebSocketHandlerClass();