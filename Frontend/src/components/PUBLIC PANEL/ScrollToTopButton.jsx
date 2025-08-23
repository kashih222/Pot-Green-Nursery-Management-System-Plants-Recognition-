const ScrollToTopButton = () => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  
    return (
      <button
        onClick={scrollToTop}
        className="fixed bottom-5 right-5 bg-yellow-500 text-white p-3 rounded-full shadow-lg z-10"
      >
        ↑ Top
      </button>
    );
  };
  
  export default ScrollToTopButton;
  