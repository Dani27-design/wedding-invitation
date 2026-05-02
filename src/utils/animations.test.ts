import { describe, it, expect } from 'vitest';
import { transition, stagger, fadeUp } from './animations';

describe('utils/animations', () => {
  // ---------------------------------------------------------------------------
  // transition
  // ---------------------------------------------------------------------------
  describe('transition', () => {
    it('is defined and is an object', () => {
      expect(transition).toBeDefined();
      expect(typeof transition).toBe('object');
      expect(transition).not.toBeNull();
    });

    it('has a duration property', () => {
      expect(transition).toHaveProperty('duration');
    });

    it('has an ease property', () => {
      expect(transition).toHaveProperty('ease');
    });

    it('has duration greater than 0', () => {
      expect(transition.duration).toBeGreaterThan(0);
    });

    it('has duration that is a number', () => {
      expect(typeof transition.duration).toBe('number');
    });

    it('has duration that is not NaN', () => {
      expect(Number.isNaN(transition.duration)).toBe(false);
    });

    it('has duration that is not Infinity', () => {
      expect(Number.isFinite(transition.duration)).toBe(true);
    });

    it('has a reasonable duration between 0.1 and 10 seconds', () => {
      expect(transition.duration).toBeGreaterThanOrEqual(0.1);
      expect(transition.duration).toBeLessThanOrEqual(10);
    });

    it('has ease as an array', () => {
      expect(Array.isArray(transition.ease)).toBe(true);
    });

    it('has ease with exactly 4 values (cubic-bezier)', () => {
      expect(transition.ease).toHaveLength(4);
    });

    it('has ease values that are all numbers', () => {
      transition.ease.forEach((value) => {
        expect(typeof value).toBe('number');
      });
    });

    it('has ease values that are not NaN', () => {
      transition.ease.forEach((value) => {
        expect(Number.isNaN(value)).toBe(false);
      });
    });

    it('has ease values that are finite', () => {
      transition.ease.forEach((value) => {
        expect(Number.isFinite(value)).toBe(true);
      });
    });

    it('has first ease value (x1) in valid cubic-bezier range [0, 1]', () => {
      expect(transition.ease[0]).toBeGreaterThanOrEqual(0);
      expect(transition.ease[0]).toBeLessThanOrEqual(1);
    });

    it('has third ease value (x2) in valid cubic-bezier range [0, 1]', () => {
      expect(transition.ease[2]).toBeGreaterThanOrEqual(0);
      expect(transition.ease[2]).toBeLessThanOrEqual(1);
    });

    it('has second ease value (y1) that is a valid number', () => {
      // y values can go outside 0-1 for overshoot effects
      expect(typeof transition.ease[1]).toBe('number');
      expect(Number.isFinite(transition.ease[1])).toBe(true);
    });

    it('has fourth ease value (y2) that is a valid number', () => {
      expect(typeof transition.ease[3]).toBe('number');
      expect(Number.isFinite(transition.ease[3])).toBe(true);
    });

    it('ease values match expected cubic-bezier [0.16, 1, 0.3, 1]', () => {
      expect(transition.ease[0]).toBe(0.16);
      expect(transition.ease[1]).toBe(1);
      expect(transition.ease[2]).toBe(0.3);
      expect(transition.ease[3]).toBe(1);
    });

    it('duration matches expected value of 1.8', () => {
      expect(transition.duration).toBe(1.8);
    });

    it('has no extra unexpected properties', () => {
      const keys = Object.keys(transition);
      expect(keys).toContain('duration');
      expect(keys).toContain('ease');
      expect(keys.length).toBe(2);
    });

    it('can be spread into a new object without error', () => {
      const spread = { ...transition };
      expect(spread.duration).toBe(transition.duration);
      expect(spread.ease).toEqual(transition.ease);
    });

    it('spreading creates a shallow copy', () => {
      const spread = { ...transition };
      expect(spread).not.toBe(transition);
      expect(spread).toEqual(transition);
    });

    it('can be used as a Motion transition prop shape', () => {
      const motionProps = { transition: { ...transition } };
      expect(motionProps.transition.duration).toBe(1.8);
      expect(motionProps.transition.ease).toHaveLength(4);
    });
  });

  // ---------------------------------------------------------------------------
  // stagger
  // ---------------------------------------------------------------------------
  describe('stagger', () => {
    it('is defined and is an object', () => {
      expect(stagger).toBeDefined();
      expect(typeof stagger).toBe('object');
      expect(stagger).not.toBeNull();
    });

    it('has an animate property', () => {
      expect(stagger).toHaveProperty('animate');
    });

    it('animate is an object', () => {
      expect(typeof stagger.animate).toBe('object');
      expect(stagger.animate).not.toBeNull();
    });

    it('animate has a transition property', () => {
      expect(stagger.animate).toHaveProperty('transition');
    });

    it('animate.transition is an object', () => {
      expect(typeof stagger.animate.transition).toBe('object');
      expect(stagger.animate.transition).not.toBeNull();
    });

    it('has staggerChildren property', () => {
      expect(stagger.animate.transition).toHaveProperty('staggerChildren');
    });

    it('has delayChildren property', () => {
      expect(stagger.animate.transition).toHaveProperty('delayChildren');
    });

    it('staggerChildren is greater than 0', () => {
      expect(stagger.animate.transition.staggerChildren).toBeGreaterThan(0);
    });

    it('staggerChildren is a number', () => {
      expect(typeof stagger.animate.transition.staggerChildren).toBe('number');
    });

    it('staggerChildren is finite', () => {
      expect(Number.isFinite(stagger.animate.transition.staggerChildren)).toBe(true);
    });

    it('delayChildren is greater than or equal to 0', () => {
      expect(stagger.animate.transition.delayChildren).toBeGreaterThanOrEqual(0);
    });

    it('delayChildren is a number', () => {
      expect(typeof stagger.animate.transition.delayChildren).toBe('number');
    });

    it('delayChildren is finite', () => {
      expect(Number.isFinite(stagger.animate.transition.delayChildren)).toBe(true);
    });

    it('staggerChildren matches expected value of 0.1', () => {
      expect(stagger.animate.transition.staggerChildren).toBe(0.1);
    });

    it('delayChildren matches expected value of 0.3', () => {
      expect(stagger.animate.transition.delayChildren).toBe(0.3);
    });

    it('staggerChildren is a reasonable delay (under 5 seconds)', () => {
      expect(stagger.animate.transition.staggerChildren).toBeLessThan(5);
    });

    it('delayChildren is a reasonable delay (under 5 seconds)', () => {
      expect(stagger.animate.transition.delayChildren).toBeLessThan(5);
    });

    it('structure matches Motion variants format with animate key', () => {
      expect(Object.keys(stagger)).toContain('animate');
      expect(Object.keys(stagger.animate)).toContain('transition');
      expect(Object.keys(stagger.animate.transition)).toContain('staggerChildren');
      expect(Object.keys(stagger.animate.transition)).toContain('delayChildren');
    });

    it('animate.transition has exactly 2 properties', () => {
      expect(Object.keys(stagger.animate.transition).length).toBe(2);
    });

    it('can be spread into a new object without error', () => {
      const spread = { ...stagger };
      expect(spread.animate).toEqual(stagger.animate);
    });

    it('nested spreading preserves transition values', () => {
      const spread = {
        animate: {
          ...stagger.animate,
          transition: { ...stagger.animate.transition },
        },
      };
      expect(spread.animate.transition.staggerChildren).toBe(0.1);
      expect(spread.animate.transition.delayChildren).toBe(0.3);
    });

    it('can be used as Motion variants prop', () => {
      const variants = { ...stagger };
      expect(variants.animate.transition.staggerChildren).toBeGreaterThan(0);
    });

    it('does not have an initial property', () => {
      expect(stagger).not.toHaveProperty('initial');
    });
  });

  // ---------------------------------------------------------------------------
  // fadeUp
  // ---------------------------------------------------------------------------
  describe('fadeUp', () => {
    describe('initial state', () => {
      it('is defined and is an object', () => {
        expect(fadeUp.initial).toBeDefined();
        expect(typeof fadeUp.initial).toBe('object');
      });

      it('has opacity of 0', () => {
        expect(fadeUp.initial.opacity).toBe(0);
      });

      it('has a y offset greater than 0', () => {
        expect(fadeUp.initial.y).toBeGreaterThan(0);
      });

      it('has y offset that is a number', () => {
        expect(typeof fadeUp.initial.y).toBe('number');
      });

      it('has y offset of exactly 20', () => {
        expect(fadeUp.initial.y).toBe(20);
      });

      it('has a blur filter', () => {
        expect(fadeUp.initial.filter).toContain('blur');
      });

      it('has a non-zero blur filter', () => {
        expect(fadeUp.initial.filter).not.toBe('blur(0px)');
      });

      it('blur filter matches expected value', () => {
        expect(fadeUp.initial.filter).toBe('blur(10px)');
      });

      it('opacity is exactly 0 (not falsy)', () => {
        expect(fadeUp.initial.opacity).toStrictEqual(0);
      });

      it('has exactly 3 properties: opacity, y, filter', () => {
        const keys = Object.keys(fadeUp.initial);
        expect(keys).toHaveLength(3);
        expect(keys).toContain('opacity');
        expect(keys).toContain('y');
        expect(keys).toContain('filter');
      });

      it('does not have undefined properties', () => {
        expect(fadeUp.initial.opacity).not.toBeUndefined();
        expect(fadeUp.initial.y).not.toBeUndefined();
        expect(fadeUp.initial.filter).not.toBeUndefined();
      });
    });

    describe('animate state', () => {
      it('is defined and is an object', () => {
        expect(fadeUp.animate).toBeDefined();
        expect(typeof fadeUp.animate).toBe('object');
      });

      it('has opacity of 1', () => {
        expect(fadeUp.animate.opacity).toBe(1);
      });

      it('has y of 0 (no offset)', () => {
        expect(fadeUp.animate.y).toBe(0);
      });

      it('removes blur (blur is 0px)', () => {
        expect(fadeUp.animate.filter).toBe('blur(0px)');
      });

      it('includes a transition property', () => {
        expect(fadeUp.animate).toHaveProperty('transition');
        expect(fadeUp.animate.transition).toBeDefined();
      });

      it('transition has a duration', () => {
        expect(fadeUp.animate.transition.duration).toBeGreaterThan(0);
      });

      it('transition has an ease array', () => {
        expect(Array.isArray(fadeUp.animate.transition.ease)).toBe(true);
      });

      it('transition reference matches the transition constant', () => {
        expect(fadeUp.animate.transition).toBe(transition);
      });

      it('transition values match the transition constant values', () => {
        expect(fadeUp.animate.transition.duration).toBe(transition.duration);
        expect(fadeUp.animate.transition.ease).toEqual(transition.ease);
      });

      it('has exactly 4 properties: opacity, y, filter, transition', () => {
        const keys = Object.keys(fadeUp.animate);
        expect(keys).toHaveLength(4);
        expect(keys).toContain('opacity');
        expect(keys).toContain('y');
        expect(keys).toContain('filter');
        expect(keys).toContain('transition');
      });

      it('opacity is exactly 1', () => {
        expect(fadeUp.animate.opacity).toStrictEqual(1);
      });

      it('y is exactly 0', () => {
        expect(fadeUp.animate.y).toStrictEqual(0);
      });

      it('does not have undefined properties', () => {
        expect(fadeUp.animate.opacity).not.toBeUndefined();
        expect(fadeUp.animate.y).not.toBeUndefined();
        expect(fadeUp.animate.filter).not.toBeUndefined();
        expect(fadeUp.animate.transition).not.toBeUndefined();
      });
    });

    describe('structure', () => {
      it('has both initial and animate keys', () => {
        expect(fadeUp).toHaveProperty('initial');
        expect(fadeUp).toHaveProperty('animate');
      });

      it('has exactly 2 top-level keys', () => {
        expect(Object.keys(fadeUp)).toHaveLength(2);
      });

      it('does not have an exit key', () => {
        expect(fadeUp).not.toHaveProperty('exit');
      });

      it('initial opacity and animate opacity are inverse', () => {
        expect(fadeUp.initial.opacity).toBe(0);
        expect(fadeUp.animate.opacity).toBe(1);
      });

      it('initial y is positive and animate y is zero (upward fade)', () => {
        expect(fadeUp.initial.y).toBeGreaterThan(0);
        expect(fadeUp.animate.y).toBe(0);
      });

      it('initial has blur and animate removes blur', () => {
        expect(fadeUp.initial.filter).toContain('blur');
        expect(fadeUp.initial.filter).not.toBe('blur(0px)');
        expect(fadeUp.animate.filter).toBe('blur(0px)');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Immutability & spreading safety
  // ---------------------------------------------------------------------------
  describe('immutability and spreading', () => {
    it('transition can be spread without breaking', () => {
      expect(() => ({ ...transition })).not.toThrow();
    });

    it('stagger can be spread without breaking', () => {
      expect(() => ({ ...stagger })).not.toThrow();
    });

    it('fadeUp can be spread without breaking', () => {
      expect(() => ({ ...fadeUp })).not.toThrow();
    });

    it('fadeUp.initial can be spread without breaking', () => {
      expect(() => ({ ...fadeUp.initial })).not.toThrow();
    });

    it('fadeUp.animate can be spread without breaking', () => {
      expect(() => ({ ...fadeUp.animate })).not.toThrow();
    });

    it('stagger.animate.transition can be spread without breaking', () => {
      expect(() => ({ ...stagger.animate.transition })).not.toThrow();
    });

    it('spreading transition preserves all values', () => {
      const copy = { ...transition };
      expect(copy.duration).toBe(transition.duration);
      expect(copy.ease[0]).toBe(transition.ease[0]);
      expect(copy.ease[1]).toBe(transition.ease[1]);
      expect(copy.ease[2]).toBe(transition.ease[2]);
      expect(copy.ease[3]).toBe(transition.ease[3]);
    });

    it('spreading fadeUp preserves nested structure', () => {
      const copy = { ...fadeUp };
      expect(copy.initial.opacity).toBe(0);
      expect(copy.animate.opacity).toBe(1);
      expect(copy.animate.transition).toBe(transition);
    });
  });

  // ---------------------------------------------------------------------------
  // Stress: using objects as Motion props
  // ---------------------------------------------------------------------------
  describe('stress: Motion-compatible usage', () => {
    it('fadeUp can serve as variants for Motion component', () => {
      const variants = { ...fadeUp };
      expect(variants.initial).toBeDefined();
      expect(variants.animate).toBeDefined();
      expect(variants.animate.transition).toBeDefined();
    });

    it('stagger can serve as container variants', () => {
      const containerVariants = { ...stagger };
      expect(containerVariants.animate.transition.staggerChildren).toBeGreaterThan(0);
    });

    it('combining stagger and fadeUp does not cause property conflicts', () => {
      const container = { ...stagger };
      const child = { ...fadeUp };
      expect(container.animate).toBeDefined();
      expect(child.initial).toBeDefined();
      expect(child.animate).toBeDefined();
    });

    it('transition can be merged with custom transition properties', () => {
      const custom = { ...transition, delay: 0.5 };
      expect(custom.duration).toBe(1.8);
      expect(custom.ease).toHaveLength(4);
      expect(custom.delay).toBe(0.5);
    });

    it('spreading fadeUp.animate and overriding transition works', () => {
      const customAnimate = {
        ...fadeUp.animate,
        transition: { ...transition, duration: 0.5 },
      };
      expect(customAnimate.opacity).toBe(1);
      expect(customAnimate.transition.duration).toBe(0.5);
    });

    it('spreading 100 times does not error', () => {
      for (let i = 0; i < 100; i++) {
        const copy = { ...fadeUp };
        expect(copy.animate.opacity).toBe(1);
      }
    });

    it('nested stagger spread 100 times does not error', () => {
      for (let i = 0; i < 100; i++) {
        const copy = {
          animate: {
            transition: { ...stagger.animate.transition },
          },
        };
        expect(copy.animate.transition.staggerChildren).toBe(0.1);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Type correctness
  // ---------------------------------------------------------------------------
  describe('type correctness', () => {
    it('transition.duration is a number, not a string', () => {
      expect(typeof transition.duration).not.toBe('string');
      expect(typeof transition.duration).toBe('number');
    });

    it('transition.ease elements are numbers, not strings', () => {
      for (const val of transition.ease) {
        expect(typeof val).not.toBe('string');
        expect(typeof val).toBe('number');
      }
    });

    it('fadeUp.initial.opacity is a number', () => {
      expect(typeof fadeUp.initial.opacity).toBe('number');
    });

    it('fadeUp.initial.y is a number', () => {
      expect(typeof fadeUp.initial.y).toBe('number');
    });

    it('fadeUp.initial.filter is a string', () => {
      expect(typeof fadeUp.initial.filter).toBe('string');
    });

    it('fadeUp.animate.opacity is a number', () => {
      expect(typeof fadeUp.animate.opacity).toBe('number');
    });

    it('fadeUp.animate.y is a number', () => {
      expect(typeof fadeUp.animate.y).toBe('number');
    });

    it('fadeUp.animate.filter is a string', () => {
      expect(typeof fadeUp.animate.filter).toBe('string');
    });

    it('stagger.animate.transition.staggerChildren is a number', () => {
      expect(typeof stagger.animate.transition.staggerChildren).toBe('number');
    });

    it('stagger.animate.transition.delayChildren is a number', () => {
      expect(typeof stagger.animate.transition.delayChildren).toBe('number');
    });
  });
});
