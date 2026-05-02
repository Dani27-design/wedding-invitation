import { TwibbonCreator } from '../features/TwibbonCreator';

export const TwibbonSection = () => (
  <section id="twibbon-section" className="relative py-6 bg-ivory overflow-hidden">
    <div className="w-full h-full relative z-10 flex flex-col items-center">
      <TwibbonCreator />
    </div>
  </section>
);
