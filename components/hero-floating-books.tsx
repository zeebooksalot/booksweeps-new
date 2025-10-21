import Image from "next/image"

export function HeroFloatingBooks() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Floating book 1 - top left */}
      <div className="absolute top-20 left-[5%] w-32 h-48 opacity-10 animate-float">
        <Image
          src="/placeholder.jpg"
          alt=""
          fill
          className="object-cover rounded-lg shadow-2xl rotate-[-15deg]"
        />
      </div>
      {/* Floating book 2 - top right */}
      <div className="absolute top-32 right-[8%] w-28 h-40 opacity-10 animate-float-delayed">
        <Image
          src="/placeholder.jpg"
          alt=""
          fill
          className="object-cover rounded-lg shadow-2xl rotate-[12deg]"
        />
      </div>
      {/* Floating book 3 - middle left */}
      <div className="absolute top-[45%] left-[2%] w-24 h-36 opacity-10 animate-float-slow">
        <Image
          src="/placeholder.jpg"
          alt=""
          fill
          className="object-cover rounded-lg shadow-2xl rotate-[8deg]"
        />
      </div>
      {/* Floating book 4 - middle right */}
      <div className="absolute top-[50%] right-[5%] w-28 h-40 opacity-10 animate-float">
        <Image
          src="/placeholder.jpg"
          alt=""
          fill
          className="object-cover rounded-lg shadow-2xl rotate-[-10deg]"
        />
      </div>
      {/* Floating book 5 - bottom left */}
      <div className="absolute bottom-20 left-[10%] w-24 h-36 opacity-10 animate-float-delayed">
        <Image
          src="/placeholder.jpg"
          alt=""
          fill
          className="object-cover rounded-lg shadow-2xl rotate-[15deg]"
        />
      </div>
    </div>
  )
}
