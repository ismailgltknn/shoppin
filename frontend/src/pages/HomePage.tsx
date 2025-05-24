import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="bg-white text-gray-800">
      <section className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Modern ve Güvenilir Alışveriş Deneyimi
        </h1>
        <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto">
          En yeni ürünleri keşfedin, fırsatları kaçırmayın. Kaliteli alışverişin
          adresine hoş geldiniz!
        </p>
        <Link
          to="/products"
          className="inline-block bg-white text-indigo-600 font-semibold py-3 px-6 rounded-full shadow-md hover:bg-gray-100 transition"
        >
          Alışverişe Başla
        </Link>
      </section>

      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-center mb-10">
          Neden Bizi Tercih Etmelisiniz?
        </h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2">Hızlı Teslimat</h3>
            <p>Ürünleriniz kapınıza en kısa sürede ulaşır.</p>
          </div>
          <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2">Geniş Ürün Yelpazesi</h3>
            <p>Elektronikten giyime binlerce ürün çeşidi.</p>
          </div>
          <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2">Güvenli Ödeme</h3>
            <p>256-bit SSL ile korunan ödeme altyapısı.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
