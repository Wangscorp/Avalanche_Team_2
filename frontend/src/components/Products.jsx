import { useState, useEffect } from "react";
import { getContract, weiToPrice, isWalletConnected } from "../api";
import { useCart } from "./CartContext";
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const initialize = async () => {
      if (await isWalletConnected()) {
        fetchProducts();
      }
    };
    initialize();
  }, []);

  const fetchProducts = async () => {
    try {
      const contract = getContract();
      const rawProducts = await contract.getProducts();
      // Transform products to match frontend expectations
      const transformedProducts = rawProducts.map((product) => ({
        id: product.id.toString(),
        name: product.name,
        description: product.description,
        image: product.image.startsWith("data:image")
          ? product.image
          : `data:image/jpeg;base64,${product.image}`,
        price: parseInt(weiToPrice(product.price.toString())),
        category: "Vegetable", // Add default category
        quantity: product.quantity.toString(),
        farmer: product.farmer,
      }));
      setProducts(transformedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      if (error.message.includes("Contract not initialized")) {
        alert("Please connect your wallet first");
      }
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product);
      alert("Item added to cart!");
    } catch {
      alert("Failed to add item to cart");
    }
  };

  return (
    <div>
      <h2>Available Products</h2>
      <div className="products-list">
        {products.map((product) => (
          <div key={product.id} className="product-item">
            {product.image && (
              <img
                src={`data:image/jpeg;base64,${product.image}`}
                alt={product.name}
                className="product-image"
              />
            )}
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>Price: KSh {product.price.toLocaleString()}</p>
            <p>Category: {product.category}</p>
            <button onClick={() => handleAddToCart(product)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
