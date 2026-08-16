import {
  FaTruck,
  FaCreditCard,
  FaRotateLeft,
  FaHeadset,
} from "react-icons/fa6";

import FeatureCard from "./FeatureCard";
import "../styles/Features.css";

function Features() {
  return (
    <section className="features-section">
      <FeatureCard
        icon={<FaTruck />}
        title="Free Shipping"
        description="Free delivery in Sweden on orders over 599 kr"
      />

      <FeatureCard
        icon={<FaCreditCard />}
        title="Secure Payment"
        description="Pay securely with Stripe. Card payments."
      />

      <FeatureCard
        icon={<FaRotateLeft />}
        title="Easy Returns"
        description="Return products within 30 days"
      />

      <FeatureCard
        icon={<FaHeadset />}
        title="24/7 Support"
        description="Our support team is ready to help"
      />
    </section>
  );
}

export default Features;