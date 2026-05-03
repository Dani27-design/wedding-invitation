export const BackgroundLayers = () => (
  <>
    <div className="fixed inset-0 pointer-events-none z-[15] opacity-[0.025] animate-grain bg-repeat bg-[url('/textures/p6.png')]" />
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden will-change-transform">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent w-[200%] -translate-x-full animate-light-sweep transform-gpu" />
    </div>
  </>
);
