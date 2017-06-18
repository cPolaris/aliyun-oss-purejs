const assert = require('assert');
const describe = require('mocha').describe;
const it = require('mocha').it;

async function foo() {
  return 1234;
}

const fooMixin = Base => class extends Base {
  getFoo() {
    return this.foo;
  }
};

const barMixin = Base => class extends Base {
  getBar() {
    return this.bar;
  }
};

class Base {
  constructor(f, b) {
    this.foo = f;
    this.bar = b;
  }
}

class Ok extends fooMixin(barMixin(Base)) {
}

describe('Try async', () => {
  it('should work', (done) => {
    foo().then(() => done()).catch(err => done(err));
  });
});

describe('Try mix-in', () => {
  it('should work', () => {
    const fp = 'foo property';
    const bp = {bar: true, sleifj: 'fijself'};
    const okTest = new Ok(fp, bp);
    assert.equal(fp, okTest.getFoo());
    assert.deepEqual(bp, okTest.getBar());
  });
});
