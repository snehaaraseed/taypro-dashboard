import Image from "next/image";
import Link from "next/link";

type Robot = {
  model: string;
  description: string;
  imgPath: string;
  href: string;
};

export function RobotCard({ robot }: { robot: Robot }) {
  const getAltText = (model: string) => {
    if (model.toLowerCase().includes("model-a") || model.toLowerCase().includes("automatic")) {
      return "Taypro Automatic Solar Panel Cleaning Robot - AI-enabled autonomous cleaning system for solar farms";
    } else if (model.toLowerCase().includes("model-b") || model.toLowerCase().includes("semi")) {
      return "Taypro Semi-Automatic Solar Panel Cleaning Robot - Cost-effective robotic cleaning solution";
    } else if (model.toLowerCase().includes("model-t") || model.toLowerCase().includes("tracker")) {
      return "Taypro Single-Axis Tracker Solar Panel Cleaning Robot - For tracking solar panel systems";
    }
    return `Taypro ${model} Solar Panel Cleaning Robot - Robotic cleaning system for solar panels`;
  };

  return (
    <div className="bg-gray-50 w-80 shadow hover:shadow-xl transition-all duration-300 overflow-hidden m-4 transform hover:-translate-y-2">
      <div className="relative w-full h-48 overflow-hidden">
        <Image
          src={robot.imgPath}
          alt={getAltText(robot.model)}
          title={`${robot.model} - Solar Panel Cleaning Robot by Taypro`}
          fill
          className="object-cover transition-transform duration-300 hover:scale-110"
          sizes="(max-width: 768px) 100vw, 320px"
          priority
        />
      </div>

      <div className="p-6 bg-[#052638] h-72">
        <h4 className="text-2xl font-semibold mb-2 text-white">
          {robot.model}
        </h4>
        <p className="text-white/90">{robot.description}</p>
        <Link href={robot.href} title={`Learn more about ${robot.model} Solar Panel Cleaning Robot`}>
          <button className="mt-9 px-4 py-1 bg-white rounded-4xl hover:bg-[#39D600] transition-all duration-300 cursor-pointer transform hover:scale-105">
            <span className="text-dark">Learn More</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
