import Hero from "../components/Hero";
import Features from "../components/Features";
import Categories from "../components/Categories";
import Products from "../components/Products";
import SaleBanner from "../components/SaleBanner";
import BestSellers from "../components/BestSellers";
import About from "../components/About";
import Newsletter from "../components/Newsletter";

function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Categories />
      <Products />
      <SaleBanner />
      <BestSellers />
      <About />
      <Newsletter />
    </>
  );
}

export default Home;