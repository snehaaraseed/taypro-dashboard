/** Lock page scroll while a modal/slide-in is open (works with zoom + mobile Safari). */
let lockCount = 0;
let savedScrollY = 0;
let savedStyles: {
  htmlOverflow: string;
  bodyOverflow: string;
  bodyPosition: string;
  bodyTop: string;
  bodyWidth: string;
  bodyPaddingRight: string;
} | null = null;

export function lockPageScroll(): () => void {
  const html = document.documentElement;
  const body = document.body;

  if (lockCount === 0) {
    savedScrollY = window.scrollY;
    savedStyles = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      bodyPaddingRight: body.style.paddingRight,
    };

    const scrollbarWidth = window.innerWidth - html.clientWidth;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${savedScrollY}px`;
    body.style.width = "100%";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  lockCount += 1;

  return () => {
    if (lockCount <= 0) return;
    lockCount -= 1;
    if (lockCount !== 0 || !savedStyles) return;

    html.style.overflow = savedStyles.htmlOverflow;
    body.style.overflow = savedStyles.bodyOverflow;
    body.style.position = savedStyles.bodyPosition;
    body.style.top = savedStyles.bodyTop;
    body.style.width = savedStyles.bodyWidth;
    body.style.paddingRight = savedStyles.bodyPaddingRight;
    window.scrollTo(0, savedScrollY);
    savedStyles = null;
  };
}
