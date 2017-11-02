import * as BrowserWebSocket from 'browser-websocket'
import {eventBus} from "../util/EventBus";
import store from "../router/store/store";

class WebSocketHandlerClass {
  ws : any;

  constructor() {

  }

  start() {
    this.ws = new BrowserWebSocket('ws://localhost:9000');

    this.ws.on('open', () => {
      store.dispatch({type:'STATE_UPDATE', data:{connected:true}})

    });

    this.ws.on('message', (e) => {
      let message = e.data;
      eventBus.emit("receivedMessage", message);
    });

    this.ws.on('close', (e) => {
      console.log("connection lost", e);
      store.dispatch({type:'STATE_UPDATE', data:{connected:false}})
    });


    eventBus.on('sendOverWebSocket', (message) => {
      this.ws.emit(message);
    })
  }
}

export const WebSocketHandler = new WebSocketHandlerClass();