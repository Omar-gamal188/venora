import { Truck, Lock, RotateCcw, Clock } from "lucide-react";
const features = [
  { icon: Truck, text: "free shipping", subtext: "on orders over $100" },
  { icon: Lock, text: "Secure payment", subtext: "100% protected payments" },
  { icon: RotateCcw, text: "Easy Returns", subtext: "30-day return police" },
  { icon: Clock, text: "24/7 support", subtext: "Dedicated customer service" },
];
const Features = () => {
  return (
    <div className="bg-gray-100  py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
          {features.map((item, index) => {
            return (
              <div
                key={index}
                className="flex items-center justify-center text-center sm:text-left"
              >
                <item.icon
                  className="flex-shrink-0 h-10 w-10 text-gray-600"
                  aria-hidden="true"
                />
                <div className="ml-4">
                  <p className="text-base font-medium text-amber-900">
                    {item.text}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{item.subtext}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Features;
