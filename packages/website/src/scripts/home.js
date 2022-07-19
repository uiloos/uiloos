import { ActiveList } from '@uiloos/core';

document.addEventListener('DOMContentLoaded', function () {
  const carouselCurrentActive = document.getElementById(
    'carousel-current-active'
  );

  const previousButton = document.getElementById('carousel-prev');
  const nextButton = document.getElementById('carousel-next');

  const slides = [0, 1, 2, 3, 4];

  let previouslyActive = 0;

  const config = {
    contents: slides,
    activeIndexes: 0,
    autoplay: { duration: 5000, stopsOnUserInteraction: true },
    isCircular: true,
    cooldown: 500,
  };

  const carousel = new ActiveList(config, (carousel, event) => {
    if (!carousel.isCircular) {
      if (carousel.lastActivatedContent.isFirst) {
        previousButton.classList.add('opacity-50', 'cursor-not-allowed');
        previousButton.ariaDisabled = 'true';
      } else {
        previousButton.classList.remove('opacity-50', 'cursor-not-allowed');
        previousButton.ariaDisabled = 'false';
      }

      if (carousel.lastActivatedContent.isLast) {
        nextButton.classList.add('opacity-50', 'cursor-not-allowed');
        nextButton.ariaDisabled = 'true';
      } else {
        nextButton.classList.remove('opacity-50', 'cursor-not-allowed');
        nextButton.ariaDisabled = 'false';
      }
    }

    if (event.type === 'INITIALIZED') {
      return;
    }

    carousel.contents.forEach((content) => {
      const slide = document.getElementById(`carousel-slide-${content.value}`);

      const button = document.getElementById(
        `carousel-button-${content.value}`
      );

      slide.className = "absolute";

      if (content.isActive) {;
        slide.classList.add('visible');
        slide.ariaHidden = 'false';

        requestAnimationFrame(() => {
          if (carousel.direction === 'right') {
            slide.classList.add('translate-x-full', 'duration-0');
          } else {
            slide.classList.add('-translate-x-full', 'duration-0');
          }

          requestAnimationFrame(() => {
            slide.classList.remove(
              '-translate-x-full',
              'translate-x-full',
              'duration-0'
            );
            slide.classList.add('duration-500', 'translate-x-0');

            setTimeout(() => {
              slide.classList.remove('translate-x-0', 'duration-500');
            }, 500);
          });
        });

        button.classList.add('bg-purple-800');
        button.classList.remove('bg-gray-600');

        button.lastElementChild.classList.remove('hidden');
      } else if (content.value === previouslyActive) {
        slide.classList.add('visible');
        slide.ariaHidden = 'true';

        setTimeout(() => {
          if (carousel.direction === 'right') {
            slide.classList.add('duration-500', '-translate-x-full');
          } else {
            slide.classList.add('duration-500', 'translate-x-full');
          }

          setTimeout(() => {
            slide.classList.remove(
              '-translate-x-full',
              'translate-x-full',
              'duration-500',
              'visible'
            );
            slide.classList.add('invisible');
          }, 500);
        }, 10);
        button.classList.add('bg-gray-600');
        button.classList.remove('bg-purple-800');
      } else {
        slide.classList.add('invisible');
        slide.ariaHidden = 'true';

        button.classList.add('bg-gray-600');
        button.classList.remove('bg-purple-800');

        button.lastElementChild.classList.add('hidden');
      }
    });

    carouselCurrentActive.textContent = carousel.lastActivatedIndex + 1;

    previouslyActive = carousel.lastActivated;
  });

  nextButton.onclick = () => {
    carousel.activateNext();
  };

  previousButton.onclick = () => {
    carousel.activatePrevious();
  };

  document.getElementById('carousel-stop').onclick = () => {
    carousel.stop();
  };

  slides.forEach((slide) => {
    const link = document.getElementById(`carousel-button-${slide}`);
    link.onclick = () => {
      carousel.activate(slide);
    };
  });

  document.getElementById('carousel').addEventListener('mouseenter', () => {
    carousel.pause();
  });

  document.getElementById('carousel').addEventListener('mouseleave', () => {
    carousel.play();
  });

  document
    .getElementById('carousel-duration')
    .addEventListener('change', (event) => {
      const duration = parseInt(event.target.value, 10);

      config.autoplay.duration = duration;
      config.activeIndexes = [...carousel.activeIndexes];

      carousel.initialize(config);
    });

  document
    .getElementById('carousel-is-circular')
    .addEventListener('change', (event) => {
      config.isCircular = event.target.value === 'true';
      config.activeIndexes = [...carousel.activeIndexes];

      carousel.initialize(config);
    });

  document
    .getElementById('carousel-stops-on-user-interaction')
    .addEventListener('change', (event) => {
      config.autoplay.stopsOnUserInteraction = event.target.value === 'true';
      config.activeIndexes = [...carousel.activeIndexes];

      carousel.initialize(config);
    });
});
