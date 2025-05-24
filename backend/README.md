# Shoppin - E-Ticaret Uygulaması

Bu proje, modern bir e-ticaret platformunun temel işlevlerini sunan bir web uygulamasıdır. Backend için **Laravel** ve frontend için **React.js** kullanılarak geliştirilmiştir. Kullanıcıların ürünleri gezmesine, sepete eklemesine, sepeti yönetmesine ve sipariş oluşturmasına olanak tanır.

---

## 🚀 Uygulamanın Özellikleri

-   **Kolay Ürün Keşfi:** Geniş ürün yelpazesini kolayca gezinebilir, ürün detaylarını inceleyebilir ve aradığınızı rahatça bulabilirsiniz.
-   **Akıllı Sepet Yönetimi:** Beğendiğiniz ürünleri sepete ekleyebilir, adetlerini istediğiniz gibi güncelleyebilir veya sepetinizden çıkarabilirsiniz. Sepetinizdeki ürünlerin stok durumu anlık olarak kontrol edilir.
-   **Hızlı ve Güvenli Sipariş:** Sepetinizdeki ürünlerle birlikte kolayca sipariş oluşturabilirsiniz. Gönderim ve fatura adresinizi belirterek siparişinizi tamamlayın.
-   **Sipariş Takibi:** Oluşturduğunuz siparişlerin tüm detaylarını (içindeki ürünler, toplam tutar, gönderim durumu) görüntüleyebilir ve siparişinizin güncel durumunu takip edebilirsiniz.
-   **Kullanıcı Dostu Arayüz:** Sade ve modern arayüzü sayesinde alışveriş deneyiminiz keyifli ve sorunsuz olacaktır.

---

## 🛠️ Teknik Detaylar

Bu bölüm, projenin mimarisi, kullanılan teknolojiler ve kurulum süreçleri gibi teknik konuları içerir.

### Mimari

Proje, iki ana bileşenden oluşan bir **monolitik** yapıya sahiptir:

-   **Backend (API):** Laravel framework kullanılarak geliştirilmiş bir RESTful API'dir. Veritabanı işlemleri, kimlik doğrulama, sepet ve sipariş mantığı bu katmanda yürütülür.
-   **Frontend (UI):** React.js ile geliştirilmiş, backend API'yi kullanan tek sayfalık (SPA) bir kullanıcı arayüzüdür.

### Özellik Seti

Uygulama, temel e-ticaret işlevlerini sağlamak üzere tasarlanmıştır:

-   **Ürün Yönetimi (Backend):** Ürünlerin CRUD (Oluşturma, Okuma, Güncelleme, Silme) işlemleri için API endpoint'leri mevcuttur. Bu işlemler **Admin Paneli** üzerinden yönetilebilir. Ürün stok takibi yapılmaktadır.
-   **Kimlik Doğrulama ve Yetkilendirme:**
    -   Kullanıcı kaydı ve giriş süreçleri.
    -   **Laravel Sanctum** kullanılarak API tabanlı token kimlik doğrulaması (`Bearer Token`) sağlanmaktadır.
    -   Oturum yönetimi backend'de **Redis** kullanılarak optimize edilmiştir.
-   **Sepet Yönetimi:**
    -   Kullanıcının aktif sepeti (pending order) veritabanında yönetilir.
    -   Ürün ekleme, adet artırma/azaltma ve sepetten ürün çıkarma işlemleri API üzerinden yapılır.
    -   Her sepet işlemi sırasında anlık stok kontrolü gerçekleştirilir.
-   **Sipariş Akışı:**
    -   Sepet içeriği ve adres bilgileriyle sipariş oluşturma.
    -   Oluşturulan siparişin detaylarını ve durumunu (örn. `pending`, `processing`, `completed`) API üzerinden sorgulama.

### Teknolojiler

#### Backend

-   **Laravel Framework** `^12.0`
-   **PHP** `^8.2`
-   **PostgreSQL** `^17`
-   **Laravel Eloquent ORM**
-   **Laravel Sanctum**
-   **Redis**

#### Frontend

-   **React.js**: `^19.1.0`
-   **TypeScript**: `~5.8.3`
-   **Tailwind CSS**: `^4.1.7`
-   **Vite**: `^6.3.5`
-   **React Router DOM**: `^7.6.0`
-   **Axios**: `^1.9.0`
-   **React Context API**
-   **react-toastify**: `^10.0.5`
-   **JS-Cookie**: `^3.0.5`
-   **Heroicons / Lucide React**

---

### Unit Test

Projenin backend kısmı için **Unit Testler** yazılmıştır. Bu testler, temel işlevselliğin (örneğin sepet yönetimi, stok kontrolleri) beklenen şekilde çalıştığını doğrular.

APP_KEY üretmek ve Testleri çalıştırmak için `backend` klasöründe aşağıdaki komutu kullanabilirsiniz:

```bash
php artisan key:generate --env=testing
php artisan test
```

Uygulamanın şifreleme anahtarı (`APP_KEY`) ve test veritabanı ayarlarının (`.env.testing`) doğru yapıldığından emin olun.

---

### Kurulum ve Çalıştırma

Bu projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin.

#### Gereksinimler

-   **PHP**: 8.2 veya üzeri
-   **Composer**: Laravel bağımlılıkları için
-   **Node.js**: 14 veya üzeri
-   **npm** veya **Yarn**: Frontend bağımlılıkları için
-   **PostgreSQL**: Veritabanı sunucusu
-   **Redis**: Oturum yönetimi için Redis sunucusu

#### Backend Kurulumu

1.  Projeyi klonlayın:
    ```bash
    git clone https://github.com/ismailgltknn/shoppin.git backend
    ```
2.  Backend klasörüne gidin:
    ```bash
    cd backend
    ```
3.  Composer bağımlılıklarını yükleyin:
    ```bash
    composer install
    ```
4.  `.env` dosyasını kopyalayın:
    ```bash
    cp .env.example .env
    ```
5.  `.env` dosyasını **PostgreSQL** ve **Redis** veritabanı bilgilerinizle güncelleyin. Özellikle aşağıdaki anahtarları kontrol edin:

    ```env
    DB_CONNECTION=pgsql
    DB_HOST=127.0.0.1
    DB_PORT=5432
    DB_DATABASE=your_database_name
    DB_USERNAME=your_username
    DB_PASSWORD=your_password

    REDIS_HOST=127.0.0.1
    REDIS_PASSWORD=null
    REDIS_PORT=6379

    SESSION_DRIVER=redis
    SANCTUM_STATEFUL_DOMAINS=localhost:5173 #frontend url(örnek: example.com)
    CORS_ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173,https://example.com" #frontend url(örnek: example.com)
    ```

6.  Uygulama anahtarını oluşturun:
    ```bash
    php artisan key:generate
    ```
7.  Veritabanı tablolarını oluşturun ve başlangıç verilerini ekleyin (seed isteğe bağlı):
    ```bash
    php artisan migrate --seed
    ```
8.  Backend sunucusunu başlatın:
    ```bash
    php artisan serve
    ```

#### Frontend Kurulumu

1.  Projenin ana dizinine geri dönün (backend klasöründen çıktıktan sonra):
    ```bash
    cd ..
    ```
2.  Frontend klasörüne gidin:
    ```bash
    cd frontend
    ```
3.  Node.js bağımlılıklarını yükleyin:
    ```bash
    npm install
    ```
4.  `.env` dosyasındaki `VITE_API_URL` değişkenini backend sunucunuzun adresiyle (örneğin `http://localhost:8000/api`) güncelleyin. Vite kullanıldığında `REACT_APP_API_URL` yerine `VITE_API_URL` kullanılır.
    ```env
    VITE_API_URL=http://localhost:8000/api
    ```
5.  Frontend geliştirme sunucusunu başlatın:
    ```bash
    npm run dev
    ```

Her iki sunucu da çalışır durumda olduğunda, tarayıcınızda `http://localhost:5173` (veya Vite'ın çalıştırdığı port) adresine giderek uygulamayı görüntüleyebilirsiniz.
