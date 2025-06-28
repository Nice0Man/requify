async function initMocks() {
  if (typeof window !== 'undefined') {
    const { worker } = await import('./browser');
    return worker.start({
      onUnhandledRequest: 'bypass',
    });
  }
}

export default initMocks; 