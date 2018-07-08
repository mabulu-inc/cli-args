/* eslint-disable no-undef */ // jest functions are implicit
/* eslint-disable no-unused-vars */ // we use _ for placeholder vars

const {
  get,
  test: {
    addHelp,
    applyDefaultValueHelp,
    missingArgs,
    missingErrors,
    isNumeric,
    nonNumericArgs,
    notNumericErrors,
    nonRegExMatchingArgs,
    notRegExMatchingErrors,
    getArgs,
    mapFirstElement,
    nonNils,
    getError,
    showErrorAndOrHelp,
  },
} = require('./cli-args');

describe('addHelp', () => {
  const mockHelp = {
    name: 'help',
    alias: '?',
    type: Boolean,
    defaultValue: false,
    description: 'Display this help',
  };

  it('adds help to an empty specs', () => {
    expect(addHelp([])).toEqual([mockHelp]);
  });

  it('adds help to a non-empty specs', () => {
    expect(addHelp([{}, {}, {}]).length).toEqual(4);
  });
});

describe('applyDefaultValueHelp', () => {
  it('applies default value help to a spec that has a default value', () => {
    expect(applyDefaultValueHelp([{ description: 'test', defaultValue: 1 }]))
      .toEqual([{ description: 'test (default 1)', defaultValue: 1 }]);
  });

  it('does not apply default value help to a spec that does not have a default value', () => {
    expect(applyDefaultValueHelp([{ description: 'test' }])).toEqual([{ description: 'test' }]);
  });
});

describe('missingArgs', () => {
  it('returns specs for args that are missing (and do not have a default value)', () => {
    expect(missingArgs({ present: 5 }, [{ name: 'oops' }, { name: 'present' }]))
      .toEqual([{ name: 'oops' }]);
  });

  it('returns an empty array when all args are specified (or have a default value)', () => {
    expect(missingArgs({ present: 5 }, [{ name: 'present' }]))
      .toEqual([]);
  });

  it('returns an empty array even when help is not requested', () => {
    expect(missingArgs({ }, [{ name: 'help' }]))
      .toEqual([]);
  });
});

describe('missingErrors', () => {
  it('returns errors for missing argument specs', () => {
    expect(missingErrors([{ name: 'oops' }]))
      .toEqual([new Error('oops is required')]);
  });

  it('returns an empty array when all args are specified (or have a default value)', () => {
    expect(missingErrors([]))
      .toEqual([]);
  });
});

describe('isNumeric', () => {
  it('returns true when the argument passed is numeric', () => {
    expect(isNumeric('12'))
      .toEqual(true);
  });

  it('returns false when the argument passed is not numeric', () => {
    expect(isNumeric('junk'))
      .toEqual(false);
  });
});

describe('nonNumericArgs', () => {
  it('returns specs for Number args that are not numeric', () => {
    expect(nonNumericArgs({ oops: 'x', other: 'x' }, [{ name: 'oops', type: Number }, { name: 'other' }]))
      .toEqual([{ name: 'oops', type: Number }]);
  });

  it('returns an empty array when all Number args are numeric', () => {
    expect(nonNumericArgs({ ok: '5', other: 'x' }, [{ name: 'ok', type: Number }, { name: 'other' }]))
      .toEqual([]);
  });
});

describe('notNumericErrors', () => {
  it('returns errors for non-numeric Number argument specs', () => {
    expect(notNumericErrors([{ name: 'oops' }]))
      .toEqual([new Error('oops must be a number')]);
  });

  it('returns an empty array when all Number args are numeric', () => {
    expect(notNumericErrors([]))
      .toEqual([]);
  });
});

describe('nonRegExMatchingArgs', () => {
  it('returns specs for RegEx args that do not match', () => {
    expect(nonRegExMatchingArgs({ oops: '2', other: 'x' }, [{ name: 'oops', validationRegularExpression: /5/ }, { name: 'other' }]))
      .toEqual([{ name: 'oops', validationRegularExpression: /5/ }]);
  });

  it('returns an empty array when all RegEx args match', () => {
    expect(nonRegExMatchingArgs({ ok: '5', other: 'x' }, [{ name: 'ok', validationRegularExpression: /5/ }, { name: 'other' }]))
      .toEqual([]);
  });
});

describe('notRegExMatchingErrors', () => {
  it('returns errors for non-matching RegEx argument specs', () => {
    expect(notRegExMatchingErrors([{ name: 'oops' }]))
      .toEqual([new Error('oops must satisfy regular expression')]);
  });

  it('returns custom errors for non-matching RegEx argument specs', () => {
    expect(notRegExMatchingErrors([{ name: 'oops', validationMessage: 'test' }]))
      .toEqual([new Error('test')]);
  });

  it('returns an empty array when all RegEx args match', () => {
    expect(notRegExMatchingErrors([]))
      .toEqual([]);
  });
});

describe('getArgs', () => {
  it('returns what commandLineArgs returns when it works', () => {
    expect(getArgs(jest.fn(specs => specs), []))
      .toEqual({ err: undefined, args: [] });
  });

  it('returns an err = exception when commandLinsArgs throws', () => {
    expect(getArgs(jest.fn((specs) => {
      throw new Error(specs);
    }, [])))
      .toEqual({ err: new Error([]), args: undefined });
  });
});

describe('mapFirstElement', () => {
  it('maps an array of arrays into an array of first elements of each array element', () => {
    expect(mapFirstElement([[1], [2, 3], [4, 5, 6], [undefined]]))
      .toEqual([1, 2, 4, undefined]);
  });
});

describe('nonNils', () => {
  it('filters the non-nil elements of an array', () => {
    expect(nonNils([1, undefined, null, 5]))
      .toEqual([1, 5]);
  });
});

describe('getError', () => {
  const mockSpecs = [
    { name: 'number', type: Number },
    { name: 'regEx', validationRegularExpression: /5/ },
    { name: 'missing' },
  ];

  it('returns err when an err is passed', () => {
    expect(getError('test error', { number: 'x', regEx: '2' }, mockSpecs))
      .toEqual('test error');
  });

  it('returns a number-type err when falls through', () => {
    expect(getError(undefined, { number: 'x', regEx: '2' }, mockSpecs))
      .toEqual(new Error('number must be a number'));
  });

  it('returns a regEx-type err when falls through', () => {
    expect(getError(undefined, { number: '5', regEx: '2' }, mockSpecs))
      .toEqual(new Error('regEx must satisfy regular expression'));
  });

  it('returns missing error when falls through', () => {
    expect(getError(undefined, { number: '5', regEx: '5' }, mockSpecs))
      .toEqual(new Error('missing is required'));
  });
});

describe('showErrorAndOrHelp', () => {
  const mockError = new Error('test error');
  const mockLog = {
    error: jest.fn(),
  };
  const mockHeader = 'a';
  const mockContent = 'b';
  const mockSpecs = [];
  const mockCommandLineUsageReturn = '5';
  const mockCommandLineUsage = jest.fn(_ => '5');
  const mockConsole = {
    log: jest.fn(),
  };

  showErrorAndOrHelp(
    mockError, mockLog, mockHeader, mockContent,
    mockSpecs, mockCommandLineUsage, mockConsole,
  );

  it('logs an error when an error is passed', () => {
    expect(mockLog.error)
      .toHaveBeenCalledWith(mockError.message);
  });

  it('calls commandLineUsage with an appropriate argument', () => {
    expect(mockCommandLineUsage)
      .toHaveBeenCalledWith([
        {
          header: mockHeader,
          content: mockContent,
        },
        {
          header: 'Options',
          optionList: mockSpecs,
        },
      ]);
  });

  it('logs to console whatever commandLineUsage returns', () => {
    expect(mockConsole.log).toHaveBeenCalledWith(mockCommandLineUsageReturn);
  });

  it('does not log an error when an error is not passed', () => {
    mockLog.error.mockClear();

    showErrorAndOrHelp(
      undefined, mockLog, mockHeader, mockContent,
      mockSpecs, mockCommandLineUsage, mockConsole,
    );

    expect(mockLog.error)
      .not.toHaveBeenCalled();
  });
});

describe('get', () => {
  const mockHeader = 'a';
  const mockContent = 'b';
  const mockArgSpecs = [
    { name: 'x' },
  ];
  const mockLog = {
    error: jest.fn(),
  };
  const mockArgs = { x: 5 };
  const mockCommandLineArgs = jest.fn(_ => mockArgs);
  const mockCommandLineUsage = jest.fn(_ => _);
  const mockConsole = {
    log: jest.fn(),
  };

  it('returns whatever commandLineArgs returns when all goes well', () => {
    expect(get(
      mockHeader, mockContent, mockArgSpecs, mockLog,
      mockCommandLineArgs, mockCommandLineUsage, mockConsole,
    )).toEqual(mockArgs);
  });

  it('returns false when all does not go well', () => {
    expect(get(
      mockHeader, mockContent, [{ name: 'missing' }], mockLog,
      mockCommandLineArgs, mockCommandLineUsage, mockConsole,
    )).toEqual(false);
  });
});
