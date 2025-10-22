import Image from "next/image"

export function HeroFloatingBooks() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Floating book 1 - top left */}
      <div className="absolute top-[30%] left-[5%] w-32 h-48 opacity-30 animate-float">
        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg shadow-2xl rotate-[-15deg] flex items-center justify-center">
          <span className="text-white font-bold text-sm">Romance</span>
        </div>
      </div>
      {/* Floating book 2 - top right */}
      <div className="absolute top-[35%] right-[8%] w-28 h-40 opacity-30 animate-float-delayed">
        <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg shadow-2xl rotate-[12deg] flex items-center justify-center">
          <span className="text-white font-bold text-sm">Fantasy</span>
        </div>
      </div>
      {/* Floating book 3 - middle left */}
      <div className="absolute top-[50%] left-[2%] w-24 h-36 opacity-30 animate-float-slow">
        <div className="w-full h-full bg-gradient-to-br from-pink-400 to-rose-600 rounded-lg shadow-2xl rotate-[8deg] flex items-center justify-center">
          <span className="text-white font-bold text-sm">Sci-Fi</span>
        </div>
      </div>
      {/* Floating book 4 - middle right */}
      <div className="absolute top-[55%] right-[5%] w-28 h-40 opacity-30 animate-float">
        <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg shadow-2xl rotate-[-10deg] flex items-center justify-center">
          <span className="text-white font-bold text-sm">Mystery</span>
        </div>
      </div>
      {/* Floating book 5 - bottom left */}
      <div className="absolute top-[70%] left-[10%] w-24 h-36 opacity-30 animate-float-delayed">
        <div className="w-full h-full bg-gradient-to-br from-red-400 to-pink-600 rounded-lg shadow-2xl rotate-[15deg] flex items-center justify-center">
          <span className="text-white font-bold text-sm">Thriller</span>
        </div>
      </div>
      {/* Floating book 6 - middle center */}
      <div className="absolute top-[65%] left-[45%] w-22 h-34 opacity-30 animate-float">
        <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-800 rounded-lg shadow-2xl rotate-[-8deg] flex items-center justify-center">
          <span className="text-white font-bold text-sm">Drama</span>
        </div>
      </div>
    </div>
  )
}
