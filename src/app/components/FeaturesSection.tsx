import React from "react";

interface FeaturesSectionProps {
  headline: React.ReactNode;
  description: React.ReactNode;
  benefits: string[];
  backgroundImage?: string;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  headline,
  description,
  benefits,
  backgroundImage = "/tayprobglayout/taypro-semi.png",
}) => {
  return (
    <section
      className="min-h-[650px] bg-white flex justify-center pb-30 items-center"
      style={{
        background: `url('${backgroundImage}') repeat`,
        backgroundSize: "auto",
      }}
    >
      <div className="max-w-7xl w-full flex flex-col md:flex-row items-center justify-between px-6 py-20 gap-10">
        {/* Left side: Headline + Description */}
        <div className="md:w-1/2">
          <div className="text-[#052638] font-semibold text-4xl md:text-5xl mb-7 leading-tight">
            {headline}
          </div>
          <p className="text-[#052638] text-lg md:text-xl leading-relaxed">
            {description}
          </p>
        </div>
        {/* Right side: Benefit box */}
        <div className="md:w-1/2 flex justify-center">
          <div className="bg-[#75AA00] px-12 py-10 w-full max-w-md">
            <div className="text-white text-2xl font-medium mb-8">
              The Benefits
            </div>
            <ul className="space-y-7">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-center text-white text-lg">
                  <span className="w-7 h-7 rounded-full bg-[#39D600] mr-5 inline-flex items-center justify-center"></span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
