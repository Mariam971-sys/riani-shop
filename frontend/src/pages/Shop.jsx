import { useSearchParams } from "react-router-dom";
import Products from "../components/Products";

function Shop() {
  const [searchParams] = useSearchParams();

  const category =
    searchParams.get("category") || "All";

  const search =
    searchParams.get("search") || "";

  return (
    <main>
      <h1
        style={{
          textAlign: "center",
          marginTop: "40px",
          marginBottom: "30px",
        }}
      >
        Our Shop
      </h1>

      <Products
        selectedCategory={category}
        initialSearch={search}
      />
    </main>
  );
}

export default Shop;