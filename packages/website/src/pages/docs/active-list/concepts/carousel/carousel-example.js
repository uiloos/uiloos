import { ActiveList } from '@uiloos/core';

const carouselEl = document.querySelector('.carousel-example');
const slidesEl = Array.from(
  carouselEl.querySelectorAll('.slide')
);

const config = {
  contents: slidesEl,
  active: slidesEl[0],
  autoplay: {
    duration: 5000
  },
  isCircular: true
};

function subscriber(carousel) {
  carousel.contents.forEach((content) => {
    const slideEl = content.value;

    if (content.isActive) {
      slideEl.classList.add('fade-in');
      slideEl.classList.remove('fade-out');
    } else {
      slideEl.classList.remove('fade-in');
      slideEl.classList.add('fade-out');
    }

    slideEl.ariaHidden = !content.isActive;
  });
}

const carousel = new ActiveList(config, subscriber);

