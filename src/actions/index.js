let socket = null;

export function setConnection(from, to) {
  if (socket) {
    socket.send(JSON.stringify({
      type: 'set-connection',
      from,
      to,
    }));
  }
}

export function init(s) {
  socket = s;
}
