import React from 'react';
import { HeroSlider } from './components/home/HeroSlider';
import { FeaturedProducts } from './components/home/FeaturedProducts';
import { CategorySection } from './components/home/CategorySection';
import { RandomProducts } from './components/home/RandomProducts';

export default function Home () {
  return (
    <div>
      <HeroSlider />
      <FeaturedProducts />
      <CategorySection />
      <RandomProducts />
    </div>
  );
};
