import { TwibbonCreator } from '../features/TwibbonCreator';

export const TwibbonSection = () => (
  <section id="twibbon-section" className="relative py-[2vh] h-fit bg-ivory overflow-hidden flex flex-col items-center">
    <TwibbonCreator />
    
    {/* Gradient Bridge to RSVP Section */}
    <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-b from-transparent to-paper pointer-events-none" />
  </section>
);
