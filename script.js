// Tab switching logic
const tabs = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.tab-panel');

tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    // remove active state from all
    tabs.forEach(b => b.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));

    // activate the clicked one
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});
