import Image from "next/image";
import Link from "next/link";

type Robot = {
  model: string;
  description: string;
  imgPath: string;
  href: string;
};

export function RobotCard({ robot }: { robot: Robot }) {
  return (
    <div className="bg-gray-50 w-80 shadow hover:shadow-lg transition overflow-hidden m-4">
      <div className="relative w-full h-48">
        <Image
          src={robot.imgPath}
          alt={robot.model}
          title="Robot"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 320px"
          priority
        />
      </div>

      <div className="p-6 bg-[#052638] h-72">
        <h4 className="text-2xl font-semibold mb-2 text-white">
          {robot.model}
        </h4>
        <p className="text-white/90">{robot.description}</p>
        <Link href={robot.href} title="Taypro Robot">
          <button className="mt-9 px-4 py-1 bg-white rounded-4xl hover:bg-[#32b500] transition cursor-pointer">
            <span className="text-dark">Learn More</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
