export const setupScrollBasedButtonVisibility = () => {
  const header = document.querySelector('.header');
  const [fixedButton, originalButton] = document.querySelectorAll(
    '.button-download-all'
  );

  if (!header || !fixedButton || !originalButton) return;

  const headerHeight = header.offsetHeight;
  let isFixed = false;

  const toggleFixedButton = () => {
    const shouldBeFixed =
      originalButton.getBoundingClientRect().top < headerHeight;
    if (shouldBeFixed !== isFixed) {
      fixedButton.classList.toggle(
        'button-download-all-hidden',
        !shouldBeFixed
      );
      isFixed = shouldBeFixed;
    }
  };

  window.addEventListener('scroll', toggleFixedButton, { passive: true });
};
