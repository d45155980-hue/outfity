const EventEmitter = require('events');
const crypto = require('crypto');

class SSEManager extends EventEmitter {
  constructor() {
    super();
    this.clients = new Map();
  }

  addClient(res, userId = null) {
    const id = crypto.randomUUID();
    const client = { id, res, userId };
    this.clients.set(id, client);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
    });
    res.write(':\n\n');

    res.on('close', () => {
      this.clients.delete(id);
    });
  }

  broadcast(event, data) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.clients.values()) {
      client.res.write(message);
    }
    this.emit(event, data);
  }

  sendToUser(userId, event, data) {
    if (!userId) return;
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.clients.values()) {
      if (client.userId && client.userId.toString() === userId.toString()) {
        client.res.write(message);
      }
    }
  }
}

module.exports = new SSEManager();
