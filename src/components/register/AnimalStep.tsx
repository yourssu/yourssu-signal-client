import { Button } from "@/components/ui/button";
import { AnimalType, Gender } from "@/types/profile";
import React, { useState, useRef, useEffect, useCallback } from "react"; // Import hooks

// Import downloaded animal images
import dogImg from "@/assets/animals/dog.png";
import bearImg from "@/assets/animals/bear.png";
import dinosaurImg from "@/assets/animals/dinosaur.png";
import hamsterImg from "@/assets/animals/hamster.png";
import deerImg from "@/assets/animals/deer.png";
import catImg from "@/assets/animals/cat.png";
import foxImg from "@/assets/animals/fox.png";
import rabbitImg from "@/assets/animals/rabbit.png";
import turtleImg from "@/assets/animals/turtle.png";

interface AnimalStepProps {
  gender: Gender;
  animal?: AnimalType;
  onSelect: (animal: AnimalType) => void;
}

const animals: Record<
  Gender,
  { type: AnimalType; name: string; img: string }[]
> = {
  MALE: [
    { type: "DOG", name: "강아지", img: dogImg },
    { type: "BEAR", name: "곰", img: bearImg },
    { type: "DEER", name: "사슴", img: deerImg },
    { type: "CAT", name: "고양이", img: catImg },
    { type: "DINOSAUR", name: "공룡", img: dinosaurImg },
    { type: "HAMSTER", name: "햄스터", img: hamsterImg },
  ],
  FEMALE: [
    { type: "CAT", name: "고양이", img: catImg },
    { type: "DOG", name: "강아지", img: dogImg },
    { type: "HAMSTER", name: "햄스터", img: hamsterImg },
    { type: "FOX", name: "여우", img: foxImg },
    { type: "TURTLE", name: "거북이", img: turtleImg },
    { type: "RABBIT", name: "토끼", img: rabbitImg },
  ],
};

const animalIndexes = {
  MALE: Object.fromEntries(
    animals.MALE.map((animal, index) => [animal.type, index]),
  ),
  FEMALE: Object.fromEntries(
    animals.FEMALE.map((animal, index) => [animal.type, index]),
  ),
};

const IMAGE_WIDTH = 160; // Based on Figma Rectangles
const GAP = 20; // Approximate gap from Figma

const AnimalStep: React.FC<AnimalStepProps> = ({
  gender,
  animal,
  onSelect,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(
    animal ? animalIndexes[gender][animal] : 0,
  ); // State for selected animal index
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSelectAnimal = (index: number) => {
    // Scroll the selected item to the center
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollLeft =
        (index + 1) * (IMAGE_WIDTH + GAP) -
        container.offsetWidth / 2 +
        IMAGE_WIDTH / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  };

  useEffect(() => {
    handleSelectAnimal(animal ? animalIndexes[gender][animal] : 0);
  }, [animal, gender]);

  // Function to determine which animal is in the center of the view
  const determineSelectedAnimal = useCallback(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;

      // Get all animal elements
      const animalElements = Array.from(container.children);

      // Get container's bounding rectangle
      const containerRect = container.getBoundingClientRect();

      // Calculate the center of the container
      const containerCenter = containerRect.left + containerRect.width / 2;

      // Find which animal is closest to the center
      let closestIndex = 0;
      let minDistance = Number.MAX_VALUE;

      animalElements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const elementCenter = rect.left + rect.width / 2;
        const distance = Math.abs(elementCenter - containerCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      // Only update if the selected index has changed
      if (closestIndex !== selectedIndex) {
        setSelectedIndex(closestIndex);
      }
    }
  }, [selectedIndex]);

  // Add scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const handleScroll = () => {
        determineSelectedAnimal();
      };

      container.addEventListener("scroll", handleScroll);

      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, [determineSelectedAnimal]);

  const handleConfirmSelection = () => {
    onSelect(animals[gender][selectedIndex].type);
  };

  return (
    // Main container - Adjusted layout based on Figma Frame 1000011952
    <div className="flex flex-col items-center pt-2 gap-6 w-full overflow-visible">
      {/* Top section: Progress and Title - Based on Frame 1426 */}
      <div className="flex flex-col items-start gap-2 w-full">
        <p className="text-xs text-muted-foreground animate-in slide-in-from-bottom fade-in ease-in-out duration-300">
          2 / 8
        </p>
        <h2 className="text-2xl font-semibold text-stone-700 whitespace-pre-line animate-in slide-in-from-bottom-8 fade-in ease-in-out duration-400">
          자신을 닮은
          <br />
          <span className="text-primary">동물을 골라주세요</span>
        </h2>
      </div>

      {/* Animal Carousel Section - Based on Frame 1000011950 */}
      <div className="-mx-6 self-stretch flex flex-col items-center gap-5 animate-in slide-in-from-bottom-8 fade-in ease-in-out duration-500">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory items-center h-fit w-full no-scrollbar"
          style={{
            paddingLeft: `calc(50% - ${IMAGE_WIDTH / 2}px)`,
            paddingRight: `calc(50% - ${IMAGE_WIDTH / 2}px)`,
            gap: `${GAP}px`,
          }} // Padding for centering
        >
          {animals[gender].map((animal, index) => (
            <div
              key={animal.type}
              onClick={() => handleSelectAnimal(index)}
              className={`flex-shrink-0 snap-center transition-transform duration-300 ease-in-out cursor-pointer animal-item`}
              style={{ width: `${IMAGE_WIDTH}px`, height: "auto" }} // Fixed size for images
            >
              <img
                src={animal.img}
                alt={animal.name}
                className={`w-full h-full object-cover transition-all duration-300 ease-in-out ${
                  selectedIndex === index
                    ? "scale-100 opacity-100"
                    : "scale-90 opacity-70" // Adjusted scale effect
                }`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center h-10 px-4 rounded-full bg-white/50 backdrop-blur-md">
          <p className="text-lg font-medium text-primary">
            {animals[gender][selectedIndex].name}상
          </p>
        </div>
        {/* Pagination Dots - Based on Frame 1000011897 */}
        <div className="flex justify-center items-center gap-2">
          {animals[gender].map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                selectedIndex === index ? "bg-primary" : "bg-white" // Using primary for #EE518A, white for #FFFFFF
              }`}
            />
          ))}
        </div>
      </div>

      {/* Confirmation Button - Based on 1421:4439 */}
      <div className="w-full grow flex items-end">
        <Button
          onClick={handleConfirmSelection}
          className="w-full h-14 bg-primary text-primary-foreground rounded-2xl text-lg font-medium hover:bg-primary/90" // Adjusted styles
        >
          선택 완료
        </Button>
      </div>
    </div>
  );
};

// Add CSS for hiding scrollbar if 'no-scrollbar' utility doesn't exist
/*
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
*/

export default AnimalStep;
