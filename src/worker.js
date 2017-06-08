import { Map, List } from 'immutable';

import cs from './data/connections';
import warpsongs from './data/warpsongs';
import savewarps from './data/savewarps';
import deathwarps from './data/deathwarps';


const connections = new List(cs);

function connectionHasStart(conn, start) {
  return conn.start === start || (Array.isArray(conn.start) && conn.start.includes(start));
}

function deathwarpHasRoom(dw, room) {
  return dw.room === room || (Array.isArray(dw.room) && dw.room.includes(room));
}

function deathwarpWithRoom(room) {
  return deathwarps.find(dw => deathwarpHasRoom(dw, room));
}

function savewarpWithRoom(room) {
  return savewarps.find(dw => deathwarpHasRoom(dw, room));
}

class Navigator {
  constructor(conns, to, age, room, currEntrance) {
    this.connections = conns;
    this.to = to;
    this.age = age;
    this.navigate(room.id, currEntrance, [], 20, []);
    [0, 1, ...warpsongs].forEach(i => {
      if (this.connections.has(i)) {
        const conn = connections.get(this.connections.get(i));
        const end = this.getEnd(conn);
        if (end === to) postMessage([{ type: 'normal', exitName: connections.get(i).exitName, end }]);
        else {
          this.navigate(
            end,
            null,
            [],
            20,
            [{ type: 'normal', exitName: connections.get(i).exitName, end }],
          );
        }
      }
    });
  }

  getEnd(connection) {
    return typeof connection.end === 'object' ? connection.end[this.age] : connection.end;
  }

  navigate(from, entrance, visited, depth, currPath) {
    if (depth === 0) return;
    if (visited.includes(from)) return;
    const conns = this.connections.filter((val, key) => {
      const conn = connections.get(key);
      return connectionHasStart(conn, from) &&
        !conn.unique &&
        (!conn.hard || !conn.hard[this.age]) &&
        (
          !entrance ||
          (!entrance.accessibleRegions && (!conn.exitRegion || conn.exitRegion[this.age] === 0)) ||
          (entrance.accessibleRegions && !conn.exitRegion && entrance.accessibleRegions[this.age].includes(0)) ||
          (entrance.accessibleRegions && conn.exitRegion && entrance.accessibleRegions[this.age].includes(conn.exitRegion[this.age]))
        );
    });
    conns.forEach((val, key) => {
      const conn = connections.get(val);
      const end = this.getEnd(conn);
      if (end === this.to) {
        postMessage([...currPath, { type: 'normal', exitName: connections.get(key).exitName, end }]);
      } else {
        this.navigate(
          end,
          conn,
          [...visited, from],
          depth - 1,
          [...currPath, { type: 'normal', exitName: connections.get(key).exitName, end }],
        );
      }
    });
    if (entrance && this.connections.has(entrance.id)) {
      const conn = connections.get(this.connections.get(entrance.id));
      const end = this.getEnd(conn);
      if (end === this.to) {
        postMessage([...currPath, { type: 'suns', end }]);
      } else {
        this.navigate(
          end,
          conn,
          [...visited, from],
          depth - 1,
          [...currPath, { type: 'suns', end }],
        );
      }
    }
    const deathwarp = deathwarpWithRoom(from);
    if (deathwarp && this.connections.has(deathwarp.equivalent)) {
      const conn = connections.get(this.connections.get(deathwarp.equivalent));
      const end = this.getEnd(conn);
      if (end === this.to) {
        postMessage([...currPath, { type: 'deathwarp', end }]);
      } else {
        this.navigate(
          end,
          conn,
          [...visited, from],
          depth - 1,
          [...currPath, { type: 'deathwarp', end }],
        );
      }
    }
    const savewarp = savewarpWithRoom(from);
    if (savewarp && this.connections.has(savewarp.equivalent)) {
      const conn = connections.get(this.connections.get(savewarp.equivalent));
      const end = this.getEnd(conn);
      if (end === this.to) {
        postMessage([...currPath, { type: 'savewarp', end }]);
      } else {
        this.navigate(
          end,
          conn,
          [...visited, from],
          depth - 1,
          [...currPath, { type: 'savewarp', end }],
        );
      }
    }
  }
}


onmessage = function (e) {
  new Navigator(
    new Map(Object.keys(e.data.connections).map(key => [+key, e.data.connections[key]])),
    e.data.to,
    e.data.age,
    e.data.room,
    e.data.currEntrance,
  );
}
