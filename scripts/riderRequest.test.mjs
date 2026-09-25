import test from 'node:test';
import assert from 'node:assert/strict';
import { riderRequest } from '../src/riderRequest.js';

test('transient server errors recover without consuming an error payload as rider data', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => ++calls === 1
    ? new Response('{"detail":"unavailable"}', { status: 503 })
    : Response.json({ rider: { full_name: 'Test Rider' } });
  try {
    assert.equal((await riderRequest('/profile')).rider.full_name, 'Test Rider');
    assert.equal(calls, 2);
  } finally { globalThis.fetch = original; }
});

test('permanent failures are surfaced without repeated requests', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls++; return new Response('', { status: 404 }); };
  try {
    await assert.rejects(riderRequest('/missing'), { status: 404 });
    assert.equal(calls, 1);
  } finally { globalThis.fetch = original; }
});

test('hung requests time out after two bounded attempts', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async (_url, { signal }) => {
    calls++;
    return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason)));
  };
  try {
    await assert.rejects(riderRequest('/slow', { timeoutMs: 5 }));
    assert.equal(calls, 2);
  } finally { globalThis.fetch = original; }
});

test('navigation cancellation aborts the request without retry', async () => {
  const original = globalThis.fetch;
  const controller = new AbortController();
  let calls = 0;
  globalThis.fetch = async (_url, { signal }) => {
    calls++;
    return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason)));
  };
  try {
    const request = riderRequest('/profile', { signal: controller.signal });
    controller.abort();
    await assert.rejects(request);
    assert.equal(calls, 1);
  } finally { globalThis.fetch = original; }
});
