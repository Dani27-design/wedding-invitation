export const BackgroundLayers = () => (
  <>
    <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.025] animate-grain bg-repeat bg-[url('/textures/p6.png')]" />
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mix-blend-multiply opacity-30">
      <div className="absolute top-0 -left-20 w-[600px] h-[600px] bg-[url('/textures/stardust.png')] blur-[80px] rounded-full animate-shadow-drift" />
      <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-gold/10 blur-[100px] rounded-full animate-shadow-drift [animation-delay:5s]" />
    </div>
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent w-[200%] -translate-x-full animate-light-sweep" />
    </div>
  </>
);
