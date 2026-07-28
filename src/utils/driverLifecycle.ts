import type { Driver } from 'driver.js';

const BODY_DRIVER_CLASSES = [
  'driver-active',
  'driver-fade',
  'driver-simple',
  'driver-no-scroll',
];

const DRIVER_ARTIFACT_SELECTORS = [
  '.driver-overlay',
  '.driver-popover',
  '#driver-dummy-element',
];

const DRIVER_ACTIVE_SELECTORS = [
  '.driver-active-element',
  '.driver-active-element-parent',
  '.driver-active-element-parent-no-scroll',
  '.driver-no-interaction',
];

const registeredDriverTours = new Set<Driver>();

function hasRegisteredActiveTour() {
  for (const tour of registeredDriverTours) {
    if (tour.isActive()) return true;
  }

  return false;
}

function cleanupDriverDomState() {
  document.body.classList.remove(...BODY_DRIVER_CLASSES);
  document.body.style.removeProperty('--driver-animation-duration');

  document.querySelectorAll(DRIVER_ARTIFACT_SELECTORS.join(',')).forEach((element) => {
    element.remove();
  });

  document.querySelectorAll(DRIVER_ACTIVE_SELECTORS.join(',')).forEach((element) => {
    element.classList.remove(
      'driver-active-element',
      'driver-active-element-parent',
      'driver-active-element-parent-no-scroll',
      'driver-no-interaction',
    );
    element.removeAttribute('aria-haspopup');
    element.removeAttribute('aria-expanded');
    element.removeAttribute('aria-controls');
  });
}

export function registerDriverTour(tour: Driver) {
  registeredDriverTours.add(tour);

  return () => {
    registeredDriverTours.delete(tour);
  };
}

export function destroyDriverTour(tour: Driver) {
  try {
    tour.destroy();
  } finally {
    registeredDriverTours.delete(tour);
    if (!hasRegisteredActiveTour()) {
      cleanupDriverDomState();
    }
  }
}

export function destroyAllDriverTours() {
  const tours = Array.from(registeredDriverTours);

  tours.forEach((tour) => {
    try {
      tour.destroy();
    } finally {
      registeredDriverTours.delete(tour);
    }
  });

  cleanupDriverDomState();
}
