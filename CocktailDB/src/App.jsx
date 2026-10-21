
import { useState, useEffect } from "react";
import "./App.css";

const App = () => {
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    image: "",
    imageFile: "",
    category: "Mocktail",
    description: "",
    rating: "4.5",
  });

  const itemsPerPage = 3;

  useEffect(() => {
    const fetchDrinks = async () => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const response = await fetch(
          "https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch drinks");
        }

        const data = await response.json();

        const apiDrinks = (data.drinks || []).map(
          (drink, index) => ({
            id: drink.idDrink,
            name: drink.strDrink,
            image: drink.strDrinkThumb,
            category: "Mocktail",
            description:
              "A refreshing non-alcoholic drink. Perfect for a refreshing break!",
            rating: (4 + (index % 10) / 10).toFixed(1),
          })
        );

        setDrinks(apiDrinks);
        setSuccess("Drinks loaded successfully!");
      } catch (err) {
        setError(
          !navigator.onLine
            ? "No internet connection. Please check your network."
            : "Unable to load drinks. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDrinks();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    const imageURL = URL.createObjectURL(file);

    setForm((prev) => ({
      ...prev,
      image: "",
      imageFile: imageURL,
    }));
  };

  const addDrink = (e) => {
    e.preventDefault();

    const imageURL = form.imageFile || form.image.trim();

    if (!imageURL) {
      alert("Please upload an image or enter an image URL.");
      return;
    }

    const newDrink = {
      id: Date.now(),
      name: form.name.trim(),
      image: imageURL,
      category: form.category,
      description: form.description.trim(),
      rating: Number(form.rating).toFixed(1),
    };

    setDrinks((prev) => [newDrink, ...prev]);

    setForm({
      name: "",
      image: "",
      imageFile: "",
      category: "Mocktail",
      description: "",
      rating: "4.5",
    });

    setSearch("");
    setCategory("All");
    setCurrentPage(1);
    setShowForm(false);
    setError("");
    setSuccess("Drink added successfully!");
  };

  const filteredDrinks = drinks.filter((drink) => {
    const matchesSearch = drink.name
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    const matchesCategory =
      category === "All" || drink.category === category;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(
    filteredDrinks.length / itemsPerPage
  );

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentDrinks = filteredDrinks.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleCategory = (e) => {
    setCategory(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="container">
      <h1>Mocktail Explorer</h1>

      <p className="subtitle">
        Explore refreshing drinks and discover your favourites!
      </p>

      <button
        className="add-button"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Close Form" : "+ Add Drink"}
      </button>

      {showForm && (
        <form className="drink-form" onSubmit={addDrink}>
          <h2>Add a New Drink</h2>

          <label>Drink Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter drink name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label>Upload Image from Laptop</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />

          <p className="form-note">
            Or paste an image URL below.
          </p>

          <label>Image URL</label>
          <input
            type="text"
            name="image"
            placeholder="Paste direct image link"
            value={form.image}
            onChange={(e) => {
              setForm((prev) => ({
                ...prev,
                image: e.target.value,
                imageFile: "",
              }));
            }}
          />

          {(form.imageFile || form.image) && (
            <div className="image-preview">
              <img
                src={form.imageFile || form.image}
                alt="Drink preview"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                onLoad={(e) => {
                  e.currentTarget.style.display = "block";
                }}
              />
            </div>
          )}

          <label>Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="Mocktail">Mocktail</option>
            <option value="Juice">Juice</option>
            <option value="Smoothie">Smoothie</option>
            <option value="Lemonade">Lemonade</option>
          </select>

          <label>About the Drink</label>
          <textarea
            name="description"
            placeholder="Describe the drink"
            value={form.description}
            onChange={handleChange}
            rows="3"
            required
          />

          <label>Rating (1 to 5)</label>
          <input
            type="number"
            name="rating"
            placeholder="Enter rating"
            min="1"
            max="5"
            step="0.1"
            value={form.rating}
            onChange={handleChange}
            required
          />

          <button type="submit">Save Drink</button>
        </form>
      )}

      <div className="filters">
        <input
          type="text"
          placeholder="Search drinks..."
          value={search}
          onChange={handleSearch}
        />

        <select value={category} onChange={handleCategory}>
          <option value="All">All Categories</option>
          <option value="Mocktail">Mocktail</option>
          <option value="Juice">Juice</option>
          <option value="Smoothie">Smoothie</option>
          <option value="Lemonade">Lemonade</option>
        </select>
      </div>

      {loading && (
        <p className="status loading">Loading drinks...</p>
      )}

      {!loading && error && (
        <div className="error-box">
          <p className="status error">{error}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && success && (
        <p className="status success">{success}</p>
      )}

      {!loading && !error && filteredDrinks.length === 0 && (
        <p className="empty-message">
          No drinks found. Try another search or category.
        </p>
      )}

      {!loading && !error && filteredDrinks.length > 0 && (
        <>
          <h2 className="section-title">
            Available Drinks ({filteredDrinks.length})
          </h2>

          <div className="drink-list">
            {currentDrinks.map((drink) => (
              <div className="drink-card" key={drink.id}>
                <div className="image-box">
                  <img
                    src={drink.image}
                    alt={drink.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://placehold.co/300x220?text=No+Image";
                    }}
                  />

                  <div className="rating-badge">
                    <span>★</span> {drink.rating}
                  </div>
                </div>

                <div className="drink-content">
                  <h2>{drink.name}</h2>

                  <span className="category-label">
                    {drink.category}
                  </span>

                  <p className="description">
                    {drink.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((prev) => prev - 1)
                }
              >
                Previous
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => prev + 1)
                }
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;
