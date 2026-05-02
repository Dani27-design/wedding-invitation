import { TwibbonCreator } from '../features/TwibbonCreator';

export const TwibbonSection = () => (
  <section id="twibbon-section" className="relative py-4 md:py-6 max-h-[100dvh] bg-ivory overflow-hidden">
    <div className="w-full h-full relative z-10 flex flex-col items-center">
      <TwibbonCreator />
    </div>
  </section>
);
