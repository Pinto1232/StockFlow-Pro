global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: ''
  },
  writable: true
});

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

global.$ = jest.fn(() => ({
  get: jest.fn(),
  post: jest.fn(),
  ajax: jest.fn(),
  modal: jest.fn(),
  click: jest.fn(),
  ready: jest.fn(),
  html: jest.fn(),
  val: jest.fn(),
  find: jest.fn(),
  first: jest.fn(),
  last: jest.fn()
}));

global.bootstrap = {
  Modal: jest.fn().mockImplementation(() => ({
    show: jest.fn(),
    hide: jest.fn(),
    toggle: jest.fn()
  }))
};

global.fetch = jest.fn();

global.document.createDocumentFragment = jest.fn(() => ({
  appendChild: jest.fn()
}));

beforeEach(() => {
  fetch.mockClear();
  console.log.mockClear();
  console.error.mockClear();
  console.warn.mockClear();
});

global.createMockElement = (tagName, attributes = {}) => {
  const element = {
    tagName: tagName.toUpperCase(),
    innerHTML: '',
    textContent: '',
    value: '',
    className: '',
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn(),
      toggle: jest.fn()
    },
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(),
    getAttribute: jest.fn(),
    setAttribute: jest.fn(),
    removeAttribute: jest.fn(),
    ...attributes
  };
  
  return element;
};

global.createMockResponse = (data, status = 200, ok = true) => ({
  ok,
  status,
  statusText: ok ? 'OK' : 'Error',
  json: jest.fn().mockResolvedValue(data),
  text: jest.fn().mockResolvedValue(JSON.stringify(data)),
  headers: new Map()
});

global.createMockUser = (overrides = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  firstName: 'John',
  lastName: 'Doe',
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  phoneNumber: '123-456-7890',
  dateOfBirth: '1990-01-01T00:00:00',
  age: 33,
  role: 2, // User role
  isActive: true,
  createdAt: '2023-01-01T00:00:00',
  updatedAt: null,
  ...overrides
});