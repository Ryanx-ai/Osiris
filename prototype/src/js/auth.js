(() => {
'use strict';
const $ = id => document.getElementById(id);
const approved = new Set(['ryanchinqf2@gmail.com', 'mohamedizzatamin@gmail.com']);
let signIn, loadingEditor = false, loadedSession = null;
const message = text => { $('auth-status').textContent = text; };
function clearEditor() { document.getElementById('editor')?.remove(); delete window.OsirisAuth; loadedSession = null; $('login').hidden = false; $('retry-editor').hidden = true; }
async function loadEditor() {
  if (loadingEditor || !window.Clerk.session || loadedSession === window.Clerk.session.id) return;
  loadingEditor = true;
  const session = window.Clerk.session;
  try {
    $('retry-editor').hidden = true; message('Opening your workspace…');
    const token = await session.getToken();
    const response = await fetch('/api/editor', {headers:{Authorization:'Bearer ' + token}, cache:'no-store'});
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not open the workspace.');
    if (window.Clerk.session?.id !== session.id) return;
    window.OsirisAuth = {user:data.user, getToken:() => window.Clerk.session?.getToken(), signOut:() => window.Clerk.signOut()};
    const frame = document.createElement('iframe');
    frame.id = 'editor'; frame.title = 'OSIRIS proposal builder'; frame.srcdoc = data.html;
    document.getElementById('editor')?.remove(); document.body.append(frame);
    loadedSession = session.id; $('login').hidden = true;
  } catch (error) { message(error.message); $('sign-out').hidden = false; $('retry-editor').hidden = false; }
  finally { loadingEditor = false; }
}
$('email-form').addEventListener('submit', async event => {
  event.preventDefault();
  const email = $('email').value.trim().toLowerCase();
  if (!approved.has(email)) { message('This workspace is currently limited to its two founders.'); return; }
  $('send-code').disabled = true;
  try {
    signIn = await window.Clerk.client.signIn.create({identifier:email});
    const factor = signIn.supportedFirstFactors?.find(f => f.strategy === 'email_code');
    if (!factor) throw new Error('Email sign-in is not available. Please contact the workspace owner.');
    await signIn.prepareFirstFactor({strategy:'email_code', emailAddressId:factor.emailAddressId});
    $('email-form').hidden = true; $('code-form').hidden = false; $('code').value = ''; $('code').focus();
    message('Check your email for a six-digit sign-in code.');
  } catch (error) { message(error.errors?.[0]?.longMessage || error.message || 'Unable to send a code. Please try again.'); }
  finally { $('send-code').disabled = false; }
});
$('code-form').addEventListener('submit', async event => {
  event.preventDefault(); $('verify-code').disabled = true;
  try {
    const result = await signIn.attemptFirstFactor({strategy:'email_code', code:$('code').value.trim()});
    if (result.status !== 'complete') throw new Error('Sign-in needs additional verification. Please contact the workspace owner.');
    await window.Clerk.setActive({session:result.createdSessionId});
    await loadEditor();
  } catch (error) { message(error.errors?.[0]?.longMessage || error.message || 'That code could not be verified.'); }
  finally { $('verify-code').disabled = false; }
});
$('start-over').addEventListener('click', () => { signIn = null; $('code-form').hidden = true; $('email-form').hidden = false; message('Enter your email to request a new code.'); $('email').focus(); });
$('retry-editor').addEventListener('click', loadEditor);
$('sign-out').addEventListener('click', () => window.Clerk.signOut());
(async () => {
  try {
    const response = await fetch('/api/config', {cache:'no-store'});
    const config = await response.json();
    if (!response.ok) throw new Error(config.error);
    if (config.signInOrigin && location.origin !== config.signInOrigin) {
      $('canonical-login').href = config.signInOrigin; $('canonical-login').hidden = false;
      message('Continue on osirisdeck.com to access your private workspace.'); return;
    }
    const frontend = atob(config.publishableKey.split('_')[2]).replace(/\$$/, '');
    await new Promise((resolve, reject) => {
      const script = document.createElement('script'); script.async = true;
      script.src = 'https://' + frontend + '/npm/@clerk/clerk-js@6/dist/clerk.browser.js';
      script.setAttribute('data-clerk-publishable-key', config.publishableKey);
      script.onload = resolve; script.onerror = () => reject(new Error('Secure sign-in is not reachable yet. Please retry shortly.'));
      document.head.append(script);
    });
    await window.Clerk.load();
    window.Clerk.addListener(({session}) => {
      if (!session) {
        clearEditor(); $('email-form').hidden = false; $('code-form').hidden = true; $('sign-out').hidden = true; message('');
      } else {
        if (loadedSession && loadedSession !== session.id) clearEditor();
        $('email-form').hidden = true; $('code-form').hidden = true; $('sign-out').hidden = false; loadEditor();
      }
    });
    if (window.Clerk.session) await loadEditor();
    else { $('email-form').hidden = false; message(''); }
  } catch (error) { message(error.message || 'Sign-in is temporarily unavailable. Please refresh to try again.'); }
})();
})();
