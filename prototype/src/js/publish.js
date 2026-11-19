/* One immutable payload across retries: a lost response must not create another version. */
window.OsirisPublish = async function publishProposal(auth, proposal, report = () => {}) {
  const body = JSON.stringify(proposal);
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const token = await auth?.getToken({skipCache:true});
      if (!token) throw Object.assign(new Error('Your session ended. Sign in again before sharing. Your draft is saved in this browser.'), {terminal:true});
      const response = await fetch('/api/publish', {
        method:'POST', headers:{'Content-Type':'application/json', Authorization:'Bearer ' + token},
        body, signal:AbortSignal.timeout(45000), cache:'no-store'
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok && result.url) return result;
      const retryable = response.status === 401 || response.status === 429 || response.status >= 500;
      throw Object.assign(new Error(result.error || (response.status === 413 ? 'This proposal is too large to share. Reduce its content and try again.' : 'The share service did not return a link. Please try again.')), {terminal:!retryable});
    } catch (error) {
      if (error.terminal || attempt === 2) {
        if (error.name === 'TimeoutError' || error.name === 'TypeError') throw new Error('The connection was interrupted. Try Create share link again; the same proposal will not be published twice.');
        throw error;
      }
      report('Reconnecting securely… retrying your share link (' + (attempt + 2) + '/3).');
      await new Promise(resolve => setTimeout(resolve, 800 * (attempt + 1)));
    }
  }
};
