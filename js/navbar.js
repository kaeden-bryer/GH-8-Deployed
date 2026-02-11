const toggleNav = document.querySelector('.toggle-nav');
const navLinks = document.querySelector('.nav-links');

toggleNav.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});