const { ActiveList, createActiveListSubscriber } = require('@uiloos/core');

const cardEls = document.querySelectorAll('.card-container');

const ANIMATION_DURATION = 300;

const carousel = new ActiveList(
  {
    // The cards will be the contents of the ActiveList
    contents: cardEls,

    // Select the center image as the starting point,
    // this way there will always be a left and right
    // image.
    activeIndexes: Math.ceil(cardEls.length / 2),

    // Make the last slide go to the first slice and vice versa
    isCircular: true,

    // Every 2 seconds to to the next slide automatically,
    // but stop auto playing whenever the user starts manually
    // sliding.
    autoPlay: {
      duration: 2000,
      stopsOnUserInteraction: true,
    },

    // By setting a cooldown we only allow sliding when the animation
    // has finished.
    cooldown: ANIMATION_DURATION,
  },
  createActiveListSubscriber({
    onInitialized(event, carousel) {
      positionCards(carousel);
    },

    onActivated(event, carousel) {
      if (carousel.direction === 'right') {
        // Move first image to last when moving right
        carousel.contents.at(0).moveToLast();
      } else {
        // Move last image to first when moving left
        carousel.contents.at(-1).moveToFirst();
      }

      positionCards(carousel);
    },
  })
);

function positionCards(carousel) {
  carousel.contents.forEach((content) => {
    // Provide all CSS variables needed for the animation.

    // Visible cards from the center, show less on mobile devices
    const visibleCards = window.innerWidth < 500 ? 2 : 3;

    const xPosition = carousel.lastActivatedIndex - content.index;

    const absoluteX = Math.abs(xPosition);

    content.value.style.setProperty(
      '--offset',
      xPosition / visibleCards
    );

    content.value.style.setProperty('--direction', Math.sign(xPosition));
    
    content.value.style.setProperty(
      '--abs-offset',
      absoluteX / visibleCards
    );

    // Hide cards when not visible, by setting they opacity
    content.value.style.opacity =
      absoluteX >= visibleCards ? '0' : '1';
  });
}

// Clicking the card activates it.
carousel.contents.forEach((content) => {
  content.value.onclick = () => {
    // Activate this card and stop the autoplay
    content.activate();

    // Note: above line is the same as calling:
    // content.activate({ isUserInteraction: true });
  };
});
