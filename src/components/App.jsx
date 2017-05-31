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

const rooms = new List(rs);
const connections = new List(cs);

function connectionHasEnd(conn, end) {
  return conn.end === end || (conn.end && typeof conn.end === 'object' && Object.values(conn.end).includes(end));
}

function connectionsWithEnd(end) {
  return connections.filter(conn => connectionHasEnd(conn, end));
}

function connectionHasStart(conn, start) {
  return conn.start === start || (Array.isArray(conn.end) && conn.end.includes(start));
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
      navigateList: [],
      navigate: false,
      navigateTo: null,
    };
  }

  componentDidMount() {
    document.body.addEventListener('keyup', this.handleKeyPress);
    document.body.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    document.body.removeEventListener('keyup', this.handleKeyPress);
  }

  handleChange = (e) => {
    const value = e.target.value;
    const selected = this.state.filteredList.get(this.state.selectedIndex);
    const filteredList = sortedRooms.filter(
      room => room.name.toLowerCase().includes(value.toLowerCase()),
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
        this.setState({ navigateList: [], navigateTo: null, navigate: true, value: '', selectedIndex: 0 });
        break;
      case 'Escape':
        e.preventDefault();
        break;
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
              navigateList: this.fullNavigate(
                this.state.filteredList.get(this.state.selectedIndex).id,
              ),
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
        if (/^\d$/.exec(e.key) || ((this.state.state === 'where-from' || this.state.state === 'where-to') && /^[a-z]$/.exec(e.key))) {
          e.preventDefault();
          const index = hotkeys.indexOf(e.key);
          if (this.state.navigate) {
            if (!this.state.navigateTo) {
              this.setState({
                navigateTo: this.state.filteredList.get(index),
                navigateList: this.fullNavigate(this.state.filteredList.get(index).id),
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

  fullNavigate(to) {
    const paths = [];
    paths.push(...this.navigate(this.state.room.id, to, this.state.currEntrance, [], 20));
    [0, 1, ...warpsongs].forEach(i => {
      if (this.props.connections.has(i)) {
        const conn = connections.get(this.props.connections.get(i));
        paths.push(
          ...this.navigate(
            this.getEnd(conn),
            to,
            null,
            [],
            20,
          ).map(path => [{ type: 'savewarp', exitName: connections.get(i).exitName, end: this.getEnd(conn) }, ...path]),
        );
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
      const conn = this.props.connections.get(entrance.id);
      const end = this.getEnd(conn);
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
    const deathwarp = deathwarpWithRoom(from);
    if (deathwarp && this.props.connections.has(deathwarp.equivalent)) {
      const conn = this.props.connections.get(deathwarp.equivalent);
      const end = this.getEnd(conn);
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
    const savewarp = savewarpWithRoom(from);
    if (savewarp && this.props.connections.has(savewarp.equivalent)) {
      const conn = this.props.connections.get(savewarp.equivalent);
      const end = this.getEnd(conn);
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
    this.setState({
      room,
      state: 'where-from',
      connections: connectionsWithEnd(room.id),
      selectedIndex: 0,
    });
  }

  selectExit(currExit) {
    this.setState({
      currExit,
      state: 'choose-room',
      filteredList: sortedRooms,
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
      <div>
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
        if (this.state.navigateList.length > 0) {
          return (
            <div>
              <div>
                <span>state: room: {this.state.room && this.state.room.name}, entrance: {this.state.currEntrance && this.state.currEntrance.entranceName}, exit: {this.state.currExit && this.state.currExit.exitName}</span>
              </div>
              <span>To get to {this.state.navigateTo.name}:</span>
              <div>
                {this.state.navigateList.map(path => (
                  <div>
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
          <div>
            <div>
              <span>state: room: {this.state.room && this.state.room.name}, entrance: {this.state.currEntrance && this.state.currEntrance.entranceName}, exit: {this.state.currExit && this.state.currExit.exitName}</span>
            </div>
            <span>Cannot navigate to {this.state.navigateTo.name}</span>
          </div>
        );
      }
      return (
        <div>
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
          <div>
            <div>
              <span>state: room: {this.state.room && this.state.room.name}, entrance: {this.state.currEntrance && this.state.currEntrance.entranceName}, exit: {this.state.currExit && this.state.currExit.exitName}</span>
            </div>
            <span>Where are you?</span>
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
      case 'where-from':
        return (
          <div>
            <div>
              <span>state: room: {this.state.room && this.state.room.name}, entrance: {this.state.currEntrance && this.state.currEntrance.entranceName}, exit: {this.state.currExit && this.state.currExit.exitName}</span>
            </div>
            <span>What entrance did you come from?</span>
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
          </div>
        );
      case 'where-to': {
        return (
          <div>
            <div>
              <span>state: room: {this.state.room && this.state.room.name}, entrance: {this.state.currEntrance && this.state.currEntrance.entranceName}, exit: {this.state.currExit && this.state.currExit.exitName}</span>
            </div>
            <span>What exit did you take?</span>
            <div style={{ display: 'flex' }}>
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
          </div>
        );
      }
      default:
        return null;
    }
  }
}

export default connect(
  state => ({
    connections: state,
  }),
)(App);
