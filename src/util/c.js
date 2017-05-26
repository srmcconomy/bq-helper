export default function (classes) {
  return Object.keys(classes).reduce(
    (prev, val) => (classes[val] ? `${prev} ${val}` : prev),
    '',
  );
}
