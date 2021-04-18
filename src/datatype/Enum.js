function* zip(xs, ys) {
  let x, y, done;

  while(
    ({ value: x, done } = xs.next()) && !done
    && ({ value: y, done } = ys.next()) && !done
    ) yield [x, y];
}

export class Enum {
  constructor(...terms) {
    this._terms = terms;

    for (const [term, representation] of terms) {
      this[term] = representation;
    }
  }

  * [Symbol.iterator]() {
    yield* this._terms.entries();
  }
}

export class SimpleEnum extends Enum {
  constructor(...termNames) {
    super(...zip(termNames.values(), termNames.values()));
  }
}
