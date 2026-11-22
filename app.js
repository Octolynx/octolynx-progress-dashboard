'use strict';

async function loadSnapshot() {
  const response = await fetch('data.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Snapshot request failed');
  const data = await response.json();
  const counts = [data.total, data.todo, data.done, data.ownerReview];
  if (data.schemaVersion !== 1 || counts.some(value => !Number.isSafeInteger(value) || value < 0) ||
      data.todo + data.done + data.ownerReview !== data.total ||
      typeof data.updatedAt !== 'string' || Number.isNaN(Date.parse(data.updatedAt))) {
    throw new Error('Invalid snapshot');
  }
  for (const [id, value] of Object.entries({ total: data.total, todo: data.todo, done: data.done, review: data.ownerReview })) {
    document.getElementById(id).textContent = value.toLocaleString();
  }
  const percentage = data.total === 0 ? 0 : Math.round(100 * data.done / data.total);
  document.getElementById('percentage').textContent = `${percentage}%`;
  document.getElementById('progress').setAttribute('aria-valuenow', String(percentage));
  document.getElementById('progress-fill').style.width = `${percentage}%`;
  document.getElementById('updated').textContent = `Updated ${new Date(data.updatedAt).toLocaleString()}`;
}

loadSnapshot().catch(() => {
  document.getElementById('updated').textContent = 'Snapshot unavailable';
  const error = document.getElementById('error');
  error.textContent = 'The progress snapshot could not be loaded. Please try again later.';
  error.hidden = false;
});
