import React, { Component } from 'react';
import { connect } from 'react-redux';
import { List } from 'immutable';
import rs from '../data/rooms';
import cs from '../data/connections';
import c from '../util/c';
import styles from './App.css';
import { setConnection } from '../actions';
import warpsongs from '../data/warpsongs';
import deathwarps from '../data/deathwarps';
import savewarps from '../data/savewarps';

const Worker = require('worker-loader?inline!../worker');

const rooms = new List(rs);
const connections = new List(cs);

function connectionHasEnd(conn, end) {
  return conn.end === end || (conn.end && typeof conn.end === 'object' && Object.values(conn.end).includes(end));
}

function connectionsWithEnd(end) {
  return connections.filter(conn => connectionHasEnd(conn, end));
}

function connectionHasStart(conn, start) {
  return conn.start === start || (Array.isArray(conn.start) && conn.start.includes(start));
}

function connectionsWithStart(start) {
  return connections.filter(conn => connectionHasStart(conn, start));
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

const sortedRooms = new List(rs.sort(
  (b, a) => connectionsWithEnd(a.id).size - connectionsWithEnd(b.id).size),
);

// import { connect } from 'react-redux';
const hotkeys = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '0',
  'q',
  'w',
  'e',
  'r',
  't',
  'y',
  'u',
  'i',
  'o',
  'p',
];

const songHotkeys = [
  'F4',
  'F5',
  'F6',
  'F7',
  'F8',
  'F9',
];

class App extends Component {
  constructor() {
    super();
    this.state = {
      value: '',
      selectedIndex: 0,
      filteredList: sortedRooms,
      state: 'choose-room',
      allConnections: connections,
      currExit: connections.get(0),
      currEntrance: null,
      room: null,
      suns: null,
      die: null,
      save: null,
      age: 'child',
      navigateList: new List(),
      navigate: false,
      navigateTo: null,
      stateStack: new List(),
    };
  }

  componentDidMount() {
    document.body.addEventListener('keyup', this.handleKeyPress);
    document.body.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    document.body.removeEventListener('keyup', this.handleKeyPress);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.worker && !this.state.navigate && prevState.navigate) {
      this.worker.terminate();
    }
  }

  handleChange = (e) => {
    const value = e.target.value;
    const selected = this.state.filteredList.get(this.state.selectedIndex);
    const filteredList = sortedRooms.filter(
      room => room.name.toLowerCase().includes(value.toLowerCase()) ||
        room.description.toLowerCase().includes(value.toLowerCase()),
    );
    let selectedIndex = filteredList.indexOf(selected);
    if (selectedIndex === -1) {
      selectedIndex = 0;
    }
    this.setState({ value, selectedIndex, filteredList });
  }

  handleKeyDown = (e) => {
    console.log(e);
    switch (e.code) {
      case 'ArrowUp': {
        e.preventDefault();
        let selectedIndex = this.state.selectedIndex - 1;
        if (selectedIndex < 0) selectedIndex = 0;
        this.setState({ selectedIndex });
        break;
      }
      case 'ArrowDown': {
        e.preventDefault();
        let selectedIndex = this.state.selectedIndex + 1;
        switch (this.state.state) {
          case 'choose-room':
            if (selectedIndex >= this.state.filteredList.length) {
              selectedIndex = this.state.filteredList.length - 1;
            }
            break;
          default:
            if (selectedIndex >= this.state.connections.length) {
              selectedIndex = this.state.connections.length - 1;
            }
            break;
        }
        this.setState({ selectedIndex });
        break;
      }
      case 'Tab':
        e.preventDefault();
        this.setState({ currExit: null, filteredList: sortedRooms, selectedIndex: 0, state: 'choose-room', value: '', navigate: false });
        break;
      case 'Backquote':
        e.preventDefault();
        this.setState({ navigateList: new List(), filteredList: sortedRooms, navigateTo: null, navigate: true, value: '', selectedIndex: 0 });
        break;
      case 'Escape': {
        e.preventDefault();
        const newState = this.state.stateStack.first();
        switch (newState.state) {
          case 'choose-room': {
            let filteredList = sortedRooms;
            if (this.props.connections.has(newState.currExit.id)) {
              const nextRoom = this.getEndRoom(connections.get(this.props.connections.get(newState.currExit.id)));
              filteredList = sortedRooms.filter(room => room.id !== nextRoom.id).unshift(nextRoom);
            }
            newState.filteredList = filteredList;
            break;
          }
          case 'where-to': {
            newState.suns = newState.currEntrance.id;
            let die = deathwarpWithRoom(newState.room.id);
            let save = savewarpWithRoom(newState.room.id);
            die = die ? die.equivalent : newState.suns;
            save = save ? save.equivalent : (this.state.age === 'child' ? connections.get(0).id : connections.get(1).id);
            newState.die = die;
            newState.save = save;
            newState.connections = connectionsWithStart(newState.room.id);
            break;
          }
          case 'where-from': {
            let conns = connectionsWithEnd(newState.room.id);
            if (this.props.connections.has(newState.currExit.id)) {
              const nextEntrance = connections.get(this.props.connections.get(newState.currExit.id));
              conns = conns.filter(conn => conn.id !== nextEntrance.id).unshift(nextEntrance);
            }
            newState.connections = conns;
            break;
          }
          default:
            break;
        }
        this.setState({
          stateStack: this.state.stateStack.shift(),
          ...newState,
        });
        break;
      }
      case 'F10':
        e.preventDefault();
        this.setState({ age: this.state.age === 'child' ? 'adult' : 'child' });
        break;
      case 'Enter':
        e.preventDefault();
        if (this.state.navigate) {
          if (!this.state.navigateTo) {
            this.setState({
              navigateTo: this.state.filteredList.get(this.state.selectedIndex),
            }, () => {
              this.fullNavigate2(
                this.state.filteredList.get(this.state.selectedIndex).id,
              );
            });
          }
        } else {
          switch (this.state.state) {
            case 'choose-room': {
              const room = this.state.filteredList.get(this.state.selectedIndex);
              this.selectRoom(room);
              break;
            }
            case 'where-to': {
              const currExit = this.state.connections.get(this.state.selectedIndex);
              this.selectExit(currExit);
              break;
            }
            case 'where-from': {
              const currEntrance = this.state.connections.get(this.state.selectedIndex);
              this.selectEntrance(currEntrance);
              break;
            }
            default:
              break;
          }
        }
        break;
      default:
        if (/^F[1-9]$/.exec(e.key)) {
          e.preventDefault();
          if (this.state.state === 'where-to') {
            const index = +e.key[1];
            switch (index) {
              case 1:
                this.selectExit(connections.find(conn => conn.id === this.state.suns));
                break;
              case 2:
                this.selectExit(connections.find(conn => conn.id === this.state.die));
                break;
              case 3:
                this.selectExit(connections.find(conn => conn.id === this.state.save));
                break;
              default:
                this.selectExit(connections.find(conn => conn.id === warpsongs[index - 4]));
                break;
            }
          }
        }
        if (/^\d$/.exec(e.key) || ((this.state.state === 'where-from' || this.state.state === 'where-to') && /^[a-z]$/.exec(e.key) && !this.state.navigate)) {
          e.preventDefault();
          const index = hotkeys.indexOf(e.key);
          if (this.state.navigate) {
            if (!this.state.navigateTo) {
              this.setState({
                navigateTo: this.state.filteredList.get(index),
              }, () => {
                this.fullNavigate2(this.state.filteredList.get(index).id);
              });
            }
          } else {
            switch (this.state.state) {
              case 'choose-room': {
                if (index < this.state.filteredList.length) {
                  const room = this.state.filteredList.get(index);
                  this.selectRoom(room);
                }
                break;
              }
              case 'where-to': {
                if (index < this.state.connections.length) {
                  const currExit = this.state.connections.get(index);
                  this.selectExit(currExit);
                }
                break;
              }
              case 'where-from': {
                if (index < this.state.connections.length) {
                  const currEntrance = this.state.connections.get(index);
                  this.selectEntrance(currEntrance);
                }
                break;
              }
              default:
                break;
            }
          }
        }
        break;
    }
  }

  fullNavigate2(to) {
    if (this.worker) this.worker.terminate();
    this.worker = new Worker();
    this.worker.postMessage({
      connections: this.props.connections.toJS(),
      to,
      age: this.state.age,
      room: this.state.room,
      currEntrance: this.state.currEntrance,
    });
    this.worker.onmessage = e => {
      const i = this.state.navigateList.findLastIndex(path => path.length <= e.data.length);
      this.setState({
        navigateList: i === -1 ? this.state.navigateList.unshift(e.data).take(20) : this.state.navigateList.insert(i + 1, e.data).take(20),
      });
    };
  }

  navigate2(from, to, entrance, visited, depth) {
    if (depth === 0) return [];
    if (visited.includes(from)) return [];
    const conns = this.props.connections.filter(
      (val, key) => connectionHasStart(connections.get(key), from),
    );
    const paths = [];
    conns.forEach((val, key) => {
      const conn = connections.get(val);
      const end = this.getEnd(conn);
      if (end === to) {
        paths.push([{ type: 'normal', exitName: connections.get(key).exitName, end }]);
      } else {
        paths.push(
          ...this.navigate(
            end,
            to,
            conn,
            [...visited, from],
            depth - 1,
          ).map(path => [{ type: 'normal', exitName: connections.get(key).exitName, end }, ...path]),
        );
      }
    });
    if (entrance && this.props.connections.has(entrance.id)) {
      const conn = connections.get(this.props.connections.get(entrance.id));
      const end = this.getEnd(conn);
      if (end === to) {
        paths.push([{ type: 'suns', end }]);
      } else {
        paths.push(
          ...this.navigate(
            end,
            to,
            conn,
            [...visited, from],
            depth - 1,
          ).map(path => [{ type: 'suns', end }, ...path]),
        );
      }
    }
    const deathwarp = deathwarpWithRoom(from);
    if (deathwarp && this.props.connections.has(deathwarp.equivalent)) {
      const conn = connections.get(this.props.connections.get(deathwarp.equivalent));
      const end = this.getEnd(conn);
      if (end === to) {
        paths.push([{ type: 'deathwarp', end }]);
      } else {
        paths.push(
          ...this.navigate(
            end,
            to,
            conn,
            [...visited, from],
            depth - 1,
          ).map(path => [{ type: 'deathwarp', end }, ...path]),
        );
      }
    }
    const savewarp = savewarpWithRoom(from);
    if (savewarp && this.props.connections.has(savewarp.equivalent)) {
      const conn = connections.get(this.props.connections.get(savewarp.equivalent));
      const end = this.getEnd(conn);
      if (end === to) {
        paths.push([{ type: 'savewarp', end }]);
      } else {
        paths.push(
          ...this.navigate(
            end,
            to,
            conn,
            [...visited, from],
            depth - 1,
          ).map(path => [{ type: 'savewarp', end }, ...path]),
        );
      }
    }
    return paths;
  }

  fullNavigate(to) {
    const paths = [];
    paths.push(...this.navigate(this.state.room.id, to, this.state.currEntrance, [], 20));
    [0, 1, ...warpsongs].forEach(i => {
      if (this.props.connections.has(i)) {
        const conn = connections.get(this.props.connections.get(i));
        const end = this.getEnd(conn);
        if (end === to) paths.push([{ type: 'normal', exitName: connections.get(i).exitName, end }]);
        else {
          paths.push(
            ...this.navigate(
              end,
              to,
              null,
              [],
              5,
            ).map(path => [{ type: 'normal', exitName: connections.get(i).exitName, end }, ...path]),
          );
        }
      }
    });
    return paths.sort((a, b) => a.length - b.length);
  }

  navigate(from, to, entrance, visited, depth) {
    if (depth === 0) return [];
    if (visited.includes(from)) return [];
    const conns = this.props.connections.filter(
      (val, key) => connectionHasStart(connections.get(key), from),
    );
    const paths = [];
    conns.forEach((val, key) => {
      const conn = connections.get(val);
      const end = this.getEnd(conn);
      if (end === to) {
        paths.push([{ type: 'normal', exitName: connections.get(key).exitName, end }]);
      } else {
        paths.push(
          ...this.navigate(
            end,
            to,
            conn,
            [...visited, from],
            depth - 1,
          ).map(path => [{ type: 'normal', exitName: connections.get(key).exitName, end }, ...path]),
        );
      }
    });
    if (entrance && this.props.connections.has(entrance.id)) {
      const conn = connections.get(this.props.connections.get(entrance.id));
      const end = this.getEnd(conn);
      if (end === to) {
        paths.push([{ type: 'suns', end }]);
      } else {
        paths.push(
          ...this.navigate(
            end,
            to,
            conn,
            [...visited, from],
            depth - 1,
          ).map(path => [{ type: 'suns', end }, ...path]),
        );
      }
    }
    const deathwarp = deathwarpWithRoom(from);
    if (deathwarp && this.props.connections.has(deathwarp.equivalent)) {
      const conn = connections.get(this.props.connections.get(deathwarp.equivalent));
      const end = this.getEnd(conn);
      if (end === to) {
        paths.push([{ type: 'deathwarp', end }]);
      } else {
        paths.push(
          ...this.navigate(
            end,
            to,
            conn,
            [...visited, from],
            depth - 1,
          ).map(path => [{ type: 'deathwarp', end }, ...path]),
        );
      }
    }
    const savewarp = savewarpWithRoom(from);
    if (savewarp && this.props.connections.has(savewarp.equivalent)) {
      const conn = connections.get(this.props.connections.get(savewarp.equivalent));
      const end = this.getEnd(conn);
      if (end === to) {
        paths.push([{ type: 'savewarp', end }]);
      } else {
        paths.push(
          ...this.navigate(
            end,
            to,
            conn,
            [...visited, from],
            depth - 1,
          ).map(path => [{ type: 'savewarp', end }, ...path]),
        );
      }
    }
    return paths;
  }

  handleBlur = () => {
    if (this.input) this.input.focus();
  }

  getEnd(connection) {
    return typeof connection.end === 'object' ? connection.end[this.state.age] : connection.end;
  }

  getEndRoom(connection) {
    return rooms.get(this.getEnd(connection));
  }

  selectRoom(room) {
    let conns = connectionsWithEnd(room.id);
    if (this.state.currExit && this.props.connections.has(this.state.currExit.id)) {
      const nextEntrance = connections.get(this.props.connections.get(this.state.currExit.id));
      conns = conns.filter(conn => conn.id !== nextEntrance.id).unshift(nextEntrance);
    }
    this.setState({
      stateStack: this.state.stateStack.setSize(9).unshift({
        currEntrance: this.state.currEntrance,
        room: this.state.room,
        currExit: this.state.currExit,
        state: this.state.state,
      }),
      room,
      state: 'where-from',
      connections: conns,
      selectedIndex: 0,
    });
  }

  selectExit(currExit) {
    let filteredList = sortedRooms;
    if (this.props.connections.has(currExit.id)) {
      const nextRoom = this.getEndRoom(connections.get(this.props.connections.get(currExit.id)));
      filteredList = sortedRooms.filter(room => room.id !== nextRoom.id).unshift(nextRoom);
    }
    this.setState({
      stateStack: this.state.stateStack.setSize(9).unshift({
        currEntrance: this.state.currEntrance,
        room: this.state.room,
        currExit: this.state.currExit,
        state: this.state.state,
      }),
      currExit,
      state: 'choose-room',
      filteredList,
      selectedIndex: 0,
      value: '',
    });
  }

  selectEntrance(currEntrance) {
    if (this.state.currExit) {
      setConnection(this.state.currExit.id, currEntrance.id);
    }
    const suns = currEntrance.id;
    let die = deathwarpWithRoom(this.state.room.id);
    let save = savewarpWithRoom(this.state.room.id);
    die = die ? die.equivalent : suns;
    save = save ? save.equivalent : (this.state.age === 'child' ? connections.get(0).id : connections.get(1).id);

    this.setState({
      stateStack: this.state.stateStack.setSize(9).unshift({
        currEntrance: this.state.currEntrance,
        room: this.state.room,
        currExit: this.state.currExit,
        state: this.state.state,
      }),
      currEntrance,
      state: 'where-to',
      connections: connectionsWithStart(this.state.room.id),
      selectedIndex: 0,
      save,
      die,
      suns,
    });
  }

  render() {
    return (
      <div style={{ display: 'flex' }}>
        {this.renderLeft()}
        {/* {this.renderMiddle()} */}
        {this.renderRight()}
      </div>
    );
  }

  renderRight() {
    return (
      <div style={{ width: '181px' }}>
        <div className={styles.option}>
          <span className={styles.hotkey}>Esc</span>
          Go back
        </div>
        <div className={styles.option}>
          <span className={styles.hotkey}>`</span>
          Navigate
        </div>
        <div className={styles.option}>
          <span className={styles.hotkey}>Tab</span>
          Jump
        </div>
        <div className={styles.option}>
          <span className={styles.hotkey}>F10</span>
          Switch age to {this.state.age === 'child' ? 'adult' : 'child'}
        </div>
      </div>
    );
  }

  renderLeft() {
    const { value } = this.state;
    if (this.state.navigate) {
      if (this.state.navigateTo) {
        if (this.state.navigateList.size > 0) {
          return (
            <div className={styles.left}>
              <div>
                <span>state: room: {this.state.room && this.state.room.name}, entrance: {this.state.currEntrance && this.state.currEntrance.entranceName}, exit: {this.state.currExit && this.state.currExit.exitName}</span>
              </div>
              <span>To get to {this.state.navigateTo.name}:</span>
              <div>
                {this.state.navigateList.map(path => (
                  <div style={{margin: '5px' }}>
                    {path.map(conn => {
                      const end = this.getEndRoom(conn);
                      switch (conn.type) {
                        case 'suns':
                          return <span>Sun's/Void => {end.name}, </span>;
                        case 'savewarp':
                          return <span>Save => {end.name}, </span>;
                        case 'deathwarp':
                          return <span>Die => {end.name}, </span>;
                        default:
                          return <span>{conn.exitName} => {end.name}, </span>;
                      }
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return (
          <div className={styles.left}>
            <div>
              <span>state: room: {this.state.room && this.state.room.name}, entrance: {this.state.currEntrance && this.state.currEntrance.entranceName}, exit: {this.state.currExit && this.state.currExit.exitName}</span>
            </div>
            <span>Cannot navigate to {this.state.navigateTo.name}</span>
          </div>
        );
      }
      return (
        <div className={styles.left}>
          <div>
            <span>state: room: {this.state.room && this.state.room.name}, entrance: {this.state.currEntrance && this.state.currEntrance.entranceName}, exit: {this.state.currExit && this.state.currExit.exitName}</span>
          </div>
          <span>Where do you want to go?</span>
          <input
            autoFocus
            value={value}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
            ref={el => { this.input = el; }}
          />
          <div>
            {this.state.filteredList.map((room, index) => (
              <div
                key={room.name}
                className={c({
                  [styles.option]: true,
                  [styles.selected]: index === this.state.selectedIndex,
                })}
              >
                <span
                  className={c({
                    [styles.hotkey]: index <= 9,
                    [styles.emptyHotkey]: index > 9,
                  })}
                >
                  {index <= 9 && hotkeys[index]}
                </span>
                <span className={styles.optionName}>{room.name} {room.description ? ` (${room.description})` : ''}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    switch (this.state.state) {
      case 'choose-room':
        return (
          <div className={styles.left}>
            <div>
              <span>state: room: {this.state.room && this.state.room.name}, entrance: {this.state.currEntrance && this.state.currEntrance.entranceName}, exit: {this.state.currExit && this.state.currExit.exitName}</span>
            </div>
            <span>Where are you?</span>
            <div style={{ display: 'flex', flex: 1 }}>
              <div>
                <input
                  autoFocus
                  value={value}
                  onChange={this.handleChange}
                  onBlur={this.handleBlur}
                  ref={el => { this.input = el; }}
                />
                <div>
                  {this.state.filteredList.map((room, index) => (
                    <div
                      key={room.name}
                      className={c({
                        [styles.option]: true,
                        [styles.selected]: index === this.state.selectedIndex,
                      })}
                    >
                      <span
                        className={c({
                          [styles.hotkey]: index <= 9,
                          [styles.emptyHotkey]: index > 9,
                        })}
                      >
                        {index <= 9 && hotkeys[index]}
                      </span>
                      <span className={styles.optionName}>{room.name} {room.description ? ` (${room.description})` : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
                {[1, 2, 3, 4, 5, 6].map(i => <div style={{ flex: 1, backgroundImage: `url(/assets/images/fort${i}.png)`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }} />)}
              </div>
            </div>
          </div>
        );
      case 'where-from':
        return (
          <div className={styles.left}>
            <div>
              <span>state: room: {this.state.room && this.state.room.name}, entrance: {this.state.currEntrance && this.state.currEntrance.entranceName}, exit: {this.state.currExit && this.state.currExit.exitName}</span>
            </div>
            <span>What entrance did you come from?</span>
            <div style={{ display: 'flex', flex: 1 }}>
              <div>
                {this.state.connections.map((conn, index) => (
                  <div
                    className={c({
                      [styles.option]: true,
                      [styles.selected]: index === this.state.selectedIndex,
                    })}
                  >
                    <span className={styles.hotkey}>{hotkeys[index]}</span>
                    <span className={styles.optionName}>{conn.entranceName}</span>
                  </div>
                ))}
              </div>
              {
                this.state.room.images ?
                  <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                    {this.state.room.images.map(image => (
                      <div
                        style={{
                          backgroundSize: 'contain',
                          backgroundImage: `url(/assets/images/${image})`,
                          flex: 1,
                          backgroundRepeat: 'no-repeat',
                        }}
                      />
                    ))}
                  </div> :
                  ''
              }
            </div>
          </div>
        );
      case 'where-to': {
        return (
          <div className={styles.left}>
            <div>
              <span>state: room: {this.state.room && this.state.room.name}, entrance: {this.state.currEntrance && this.state.currEntrance.entranceName}, exit: {this.state.currExit && this.state.currExit.exitName}</span>
            </div>
            <span>What exit did you take?</span>
            <div style={{ display: 'flex', flex: 1 }}>
              <div>
                {this.state.connections.map((conn, index) => (
                  <div
                    className={c({
                      [styles.option]: true,
                      [styles.selected]: index === this.state.selectedIndex,
                    })}
                  >
                    <span className={styles.hotkey}>{hotkeys[index]}</span>
                    <span className={styles.optionName} style={{ width: '300px' }}>{conn.exitName}</span>
                    <span className={styles.dest}>
                      {
                        this.props.connections.has(conn.id) ?
                          this.getEndRoom(connections.get(this.props.connections.get(conn.id))).name
                          : '?'
                      }
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex' }}>
                  <div>
                    <div className={styles.option}>
                      <span className={styles.hotkey}>F1</span>
                      <span className={styles.optionName} style={{ width: '150px' }}>Void/Sun's Song</span>
                      <span className={styles.dest}>
                        {
                          this.props.connections.has(this.state.suns) ?
                            this.getEndRoom(
                              connections.get(
                                this.props.connections.get(this.state.suns),
                              ),
                            ).name
                            : '?'
                        }
                      </span>
                    </div>
                    <div className={styles.option}>
                      <span className={styles.hotkey}>F2</span>
                      <span className={styles.optionName} style={{ width: '150px' }}>Die</span>
                      <span className={styles.dest}>
                        {
                          this.props.connections.has(this.state.die) ?
                            this.getEndRoom(
                              connections.get(
                                this.props.connections.get(this.state.die),
                              ),
                            ).name :
                            '?'
                        }
                      </span>
                    </div>
                    <div className={styles.option}>
                      <span className={styles.hotkey}>F3</span>
                      <span className={styles.optionName} style={{ width: '150px' }}>Save</span>
                      <span className={styles.dest}>
                        {
                          this.props.connections.has(this.state.save) ?
                            this.getEndRoom(
                              connections.get(
                                this.props.connections.get(this.state.save),
                              ),
                            ).name :
                            '?'
                        }
                      </span>
                    </div>
                  </div>
                  <div>
                    {warpsongs.map((song, index) => (
                      <div className={styles.option}>
                        <span className={styles.hotkey}>{songHotkeys[index]}</span>
                        <span className={styles.optionName} style={{ width: '100px' }}>{connections.get(song).exitName}</span>
                        <span className={styles.dest}>
                          {
                            this.props.connections.has(song) ?
                              this.getEndRoom(
                                connections.get(this.props.connections.get(song)),
                              ).name :
                              '?'
                          }

                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {
                  this.state.room.images ?
                    <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                      {this.state.room.images.map(image => (
                        <div
                          style={{
                            backgroundSize: 'contain',
                            backgroundImage: `url(/assets/images/${image})`,
                            flex: 1,
                            backgroundRepeat: 'no-repeat',
                          }}
                        />
                      ))}
                    </div> :
                    ''
                }
              </div>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  }
}

export default connect(
  state => ({ connections: state }),
)(App);
