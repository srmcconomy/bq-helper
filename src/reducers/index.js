import { Map } from 'immutable';

export default function (state = new Map(), action) {
  switch (action.type) {
    case 'set-connection':
      return state.set(action.from, action.to);
    default:
      return state;
  }
}
