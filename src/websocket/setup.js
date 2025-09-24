import WS from '@/websocket/socket';

import listeners from './listeners';
import env from '@/utils/env';

export default class WebSocketSetup {
  THIRTY_SECONDS = 30000;

  constructor({ project, token, endpoint }) {
    this.project = project;
    this.token = token;
    this.endpoint = endpoint;
    this.pingIntervalId = null;
    this.url = `${env('NEXUS_WEBSOCKET_BASE_URL')}/${endpoint}/${this.project}/?Token=${this.token}`;
  }

  connect() {
    const ws = new WS(this.url);

    this.ws = ws;
    listeners({ ws, type: this.endpoint });
    this.setupPingInterval();
  }

  setupPingInterval() {
    this.clearPingInterval();

    this.pingIntervalId = setInterval(() => {
      this.ping();
    }, this.THIRTY_SECONDS);
  }

  clearPingInterval() {
    if (this.pingIntervalId !== null) {
      clearInterval(this.pingIntervalId);
    }
  }

  disconnect() {
    this.clearPingInterval();
    this.ws.ws.close();
  }

  ping() {
    const isWebSocketOpen = this.ws.ws.readyState === this.ws.ws.OPEN;
    if (isWebSocketOpen) {
      this.ws.send({
        type: 'ping',
        message: {},
      });
    } else {
      this.reconnect();
    }
  }

  reconnect() {
    this.ws.ws.close();
    this.connect();
  }
}
