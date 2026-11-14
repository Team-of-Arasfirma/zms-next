// Process-local coordination only. Every participating mutation shares this queue.
// This does not coordinate cluster workers, other instances, or external writers.
let pendingMutation = Promise.resolve();

export async function withProductCategoryMutation(operation) {
  const previousMutation = pendingMutation;
  let release;
  pendingMutation = new Promise((resolve) => { release = resolve; });
  await previousMutation;
  try {
    return await operation();
  } finally {
    // A failed operation must not block subsequent mutations.
    release();
  }
}
