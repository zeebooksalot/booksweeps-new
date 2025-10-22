import Image from "next/image"

export function HeroFloatingBooks() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Floating book 1 - top left */}
      <div className="absolute top-20 left-[5%] w-32 h-48 opacity-30 animate-float">
        <div className="w-full h-full bg-gray-900/50 rounded-lg shadow-2xl rotate-[-15deg] relative">
          <Image
            src="/placeholder.jpg"
            alt=""
            fill
            className="object-cover rounded-lg opacity-60"
          />
        </div>
      </div>
      {/* Floating book 2 - top right */}
      <div className="absolute top-32 right-[8%] w-28 h-40 opacity-30 animate-float-delayed">
        <div className="w-full h-full bg-gray-900/50 rounded-lg shadow-2xl rotate-[12deg] relative">
          <Image
            src="/placeholder.jpg"
            alt=""
            fill
            className="object-cover rounded-lg opacity-60"
          />
        </div>
      </div>
      {/* Floating book 3 - middle left */}
      <div className="absolute top-[45%] left-[2%] w-24 h-36 opacity-30 animate-float-slow">
        <div className="w-full h-full bg-gray-900/50 rounded-lg shadow-2xl rotate-[8deg] relative">
          <Image
            src="/placeholder.jpg"
            alt=""
            fill
            className="object-cover rounded-lg opacity-60"
          />
        </div>
      </div>
      {/* Floating book 4 - middle right */}
      <div className="absolute top-[50%] right-[5%] w-28 h-40 opacity-30 animate-float">
        <div className="w-full h-full bg-gray-900/50 rounded-lg shadow-2xl rotate-[-10deg] relative">
          <Image
            src="/placeholder.jpg"
            alt=""
            fill
            className="object-cover rounded-lg opacity-60"
          />
        </div>
      </div>
      {/* Floating book 5 - bottom left */}
      <div className="absolute bottom-20 left-[10%] w-24 h-36 opacity-30 animate-float-delayed">
        <div className="w-full h-full bg-gray-900/50 rounded-lg shadow-2xl rotate-[15deg] relative">
          <Image
            src="/placeholder.jpg"
            alt=""
            fill
            className="object-cover rounded-lg opacity-60"
          />
        </div>
      </div>
      
      {/* Additional left side books */}
      <div className="absolute top-40 left-[12%] w-20 h-32 opacity-25 animate-float-slow">
        <div className="w-full h-full bg-gray-900/50 rounded-lg shadow-2xl rotate-[20deg] relative">
          <Image
            src="/placeholder.jpg"
            alt=""
            fill
            className="object-cover rounded-lg opacity-60"
          />
        </div>
      </div>
      
      <div className="absolute top-[60%] left-[3%] w-22 h-34 opacity-80 animate-float">
        <div className="w-full h-full bg-gray-900/50 rounded-lg shadow-2xl rotate-[-10deg] relative">
          <Image
            src="/placeholder.jpg"
            alt=""
            fill
            className="object-cover rounded-lg opacity-60"
          />
        </div>
      </div>
      
      <div className="absolute bottom-32 left-[6%] w-18 h-28 opacity-80 animate-float-delayed">
        <div className="w-full h-full bg-gray-900/50 rounded-lg shadow-2xl rotate-[25deg] relative">
          <Image
            src="/placeholder.jpg"
            alt=""
            fill
            className="object-cover rounded-lg opacity-60"
          />
        </div>
      </div>
      
      {/* Additional right side books */}
      <div className="absolute top-24 right-[2%] w-24 h-36 opacity-25 animate-float">
        <div className="w-full h-full bg-gray-900/50 rounded-lg shadow-2xl rotate-[-18deg] relative">
          <Image
            src="/placeholder.jpg"
            alt=""
            fill
            className="object-cover rounded-lg opacity-60"
          />
        </div>
      </div>
      
      <div className="absolute top-[55%] right-[1%] w-20 h-30 opacity-25 animate-float-slow">
        <div className="w-full h-full bg-gray-900/50 rounded-lg shadow-2xl rotate-[15deg] relative">
          <Image
            src="/placeholder.jpg"
            alt=""
            fill
            className="object-cover rounded-lg opacity-60"
          />
        </div>
      </div>
      
      <div className="absolute bottom-24 right-[3%] w-26 h-38 opacity-25 animate-float-delayed">
        <div className="w-full h-full bg-gray-900/50 rounded-lg shadow-2xl rotate-[-12deg] relative">
          <Image
            src="/placeholder.jpg"
            alt=""
            fill
            className="object-cover rounded-lg opacity-60"
          />
        </div>
      </div>
    </div>
  )
}
